import { describe, expect, it } from 'vitest'
import { createInitialState, matchesAgent, matchingAgents } from '../data'

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
    expect(state.assignments).toHaveLength(12)
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
    expect(state.agents.filter(agent => matchesAgent(agent, '160055', 'Plots')).length).toBeGreaterThan(0)
    expect(state.agents.filter(agent => matchesAgent(agent, '', 'Houses')).length).toBeGreaterThan(0)
  })

  it('recommends local agents for assignment locations', () => {
    const assignment = state.assignments[0]
    const matches = matchingAgents(state.agents, assignment)
    expect(matches.length).toBeGreaterThan(0)
    expect(matches[0].agent.city).toBe(assignment.preferredLocations[0].name)
    expect(matches[0].score).toBeGreaterThan(0)
  })
})
