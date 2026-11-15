import { describe, expect, it } from 'vitest'
import { createInitialState, dealTypesFor, landTypes, matchesAgent, matchingAgents } from '../data'
import { DEAL_TYPES } from '../types'

describe('Land Sourcing fixtures', () => {
  const state = createInitialState()

  it('contains complete agent directory records', () => {
    expect(state.agents).toHaveLength(20)
    expect(state.agents.every(agent =>
      agent.companyName &&
      agent.agentName &&
      agent.mobile &&
      agent.email &&
      agent.location &&
      agent.city &&
      /^\d{6}$/.test(agent.pincode) &&
      agent.state &&
      agent.dealsIn.length > 0
    )).toBe(true)
  })

  it('keeps assignment agent and land-option references valid', () => {
    const agentIds = new Set(state.agents.map(agent => agent.id))
    expect(state.assignments).toHaveLength(10)
    for (const assignment of state.assignments) {
      expect(assignment.preferredLocations.every(location => location.name && /^\d{6}$/.test(location.pincode))).toBe(true)
      expect(assignment.selectedAgentIds.every(id => agentIds.has(id))).toBe(true)
      expect(assignment.outreach.every(item => agentIds.has(item.agentId))).toBe(true)
      expect(assignment.landOptions.every(item => agentIds.has(item.agentId))).toBe(true)
      if (assignment.status === 'Land Identified') {
        expect(assignment.landOptions.some(option => option.status === 'Selected')).toBe(true)
        expect(assignment.completedAt).toBeTruthy()
      }
    }
  })

  it('uses the Telesales reference format, with the journey year included', () => {
    for (const assignment of state.assignments) {
      expect(assignment.journeyId).toMatch(/^KX-\d{4}-\d{6}$/)
      expect(assignment.id).toBe(assignment.journeyId.replace('KX-', 'KX-LS-'))
    }
  })

  it('searches agents by name, area, pincode and deal type', () => {
    expect(state.agents.filter(agent => matchesAgent(agent, 'Aman Khurana', 'All'))).toHaveLength(1)
    expect(state.agents.filter(agent => matchesAgent(agent, 'Aerocity', 'All'))).toHaveLength(1)
    expect(state.agents.filter(agent => matchesAgent(agent, '160055', 'Open Plots')).length).toBeGreaterThan(0)
    expect(state.agents.filter(agent => matchesAgent(agent, '', 'Independent Houses')).length).toBeGreaterThan(0)
  })

  it('maps the old Plots / Lands / Houses types to the four land types', () => {
    expect(landTypes(['Plots', 'Lands'])).toEqual(['Open Plots', 'Commercial Plots', 'Commercial Lands'])
    expect(landTypes(['Plots', 'Houses'])).toEqual(['Open Plots', 'Independent Houses'])
    expect(landTypes(['Lands'])).toEqual(['Commercial Lands'])
    expect(state.agents.every(agent => agent.dealsIn.every(type => DEAL_TYPES.includes(type)) && agent.brokeragePercent > 0 && agent.primaryWorkArea)).toBe(true)
  })

  it('matches commercial requirements to commercial land and homes to open plots', () => {
    expect(dealTypesFor('Commercial Building')).toEqual(['Commercial Plots', 'Commercial Lands'])
    expect(dealTypesFor('Individual House (1 Floor / Villa)')).toEqual(['Open Plots'])
    // The selected options keep the titles the Sales demo shows (e.g. "Kharar residential plot").
    const titles = state.assignments.flatMap(item => item.landOptions.map(option => option.title))
    expect(titles).toContain('Kharar residential plot')
    expect(titles).toContain('Ludhiana land parcel')
  })

  it('recommends local agents for assignment locations', () => {
    const assignment = state.assignments[0]
    const matches = matchingAgents(state.agents, assignment)
    expect(matches.length).toBeGreaterThan(0)
    expect(matches[0].agent.city).toBe(assignment.preferredLocations[0].name)
    expect(matches[0].score).toBeGreaterThan(0)
  })
})
