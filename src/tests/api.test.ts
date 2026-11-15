import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiLandSourcingService, toAssignment, type ApiRequest } from '../services/apiLandSourcingService'
import { advance, LocalLandSourcingService } from '../services/landSourcingService'
import { users } from '../data'

const API = 'http://localhost:8000/api/v1'
const e = (code: string, label: string) => ({ code, label })

const apiRequest: ApiRequest = {
  id: 'KX-LS-2026-000250', journeyId: 'KX-2026-000250', customerName: 'Jayant Kumar', mobileNumber: '+91 98140 22050',
  preferredLocations: [{ name: 'Mohali', pincode: '160055' }], propertyType: e('individual_house', 'Individual House (1 Floor / Villa)'),
  receivedAt: '2026-11-01T05:30:00Z', assignedTo: { id: 'u-neha', name: 'Neha Sharma', initials: 'NS' },
  priority: e('high', 'High'), status: e('options_found', 'Options Found'), selectedAgentIds: ['AG-0001'],
  outreach: [{ id: 'o1', agentId: 'AG-0001', contactedAt: '2026-11-02T05:30:00Z', outcome: e('options_received', 'Options received'), notes: 'Shared two plots.', actor: 'Neha Sharma' }],
  landOptions: [{ id: '7d3c4b8e-0000-4000-8000-000000000001', agentId: 'AG-0001', title: 'Corner plot', location: 'Aerocity', city: 'Mohali', pincode: '160055', state: 'Punjab', area: '2,000 sq ft', askingPrice: '₹1.1 Cr', ownership: 'Individual owner', status: e('shortlisted', 'Shortlisted'), notes: 'Title to verify.', addedAt: '2026-11-03T05:30:00Z' }],
  notes: 'Sourcing in progress.', completedAt: null, sharedAt: null,
}

const apiAgent = {
  id: 'AG-0001', companyName: 'Northfield Realty', agentName: 'Aman Khurana', mobile: '+91 98150 12001',
  email: 'aman@northfield.example.com', location: 'Aerocity', city: 'Mohali', pincode: '160055', state: 'Punjab',
  dealsIn: [e('plots', 'Plots'), e('lands', 'Lands')], active: true, createdAt: '2026-10-01T05:30:00Z',
}

const session = {
  access: 'access-1', refresh: 'refresh-1',
  user: { id: 'u-neha', email: 'neha.sharma@kennix.in', name: 'Neha Sharma', initials: 'NS' },
  memberships: [{ department: e('land_sourcing', 'Land Sourcing'), role: e('executive', 'Executive'), title: 'Land Sourcing Executive' }],
}

type Handler = (url: string, init: RequestInit) => { status: number; body?: unknown }
let handler: Handler
const calls: { url: string; init: RequestInit }[] = []

beforeEach(() => {
  localStorage.clear()
  calls.length = 0
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit = {}) => {
    calls.push({ url, init })
    const { status, body } = handler(url, init)
    return new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
  }))
})
afterEach(() => vi.unstubAllGlobals())

const service = new ApiLandSourcingService()
const signIn = async () => {
  handler = () => ({ status: 200, body: session })
  return service.login('neha.sharma@kennix.in', 'Preview@123')
}

describe('API mode', () => {
  it('signs in Land Sourcing members and keeps the session', async () => {
    const user = await signIn()
    expect(user).toEqual({ id: 'u-neha', name: 'Neha Sharma', email: 'neha.sharma@kennix.in', initials: 'NS', role: 'executive', title: 'Land Sourcing Executive' })
    expect(service.currentUser()).toEqual(user)
  })

  it('refuses people outside Land Sourcing', async () => {
    handler = () => ({ status: 200, body: { ...session, memberships: [{ department: e('telesales', 'Telesales'), role: e('executive', 'Executive'), title: 'Telesales Executive' }] } })
    expect(await service.login('priya.singh@kennix.in', 'Preview@123')).toBeNull()
    expect(service.currentUser()).toBeNull()
  })

  it('loads requirements and agents in the portal shapes', async () => {
    await signIn()
    handler = url => url.includes('/requests/')
      ? { status: 200, body: { results: [apiRequest], next: null, previous: null } }
      : { status: 200, body: [apiAgent] }
    const state = await service.load()
    expect(state.agents[0].dealsIn).toEqual(['Plots', 'Lands'])
    const [assignment] = state.assignments
    expect(assignment).toMatchObject({ id: 'KX-LS-2026-000250', status: 'Options Found', priority: 'High', assignedTo: 'u-neha', propertyType: 'Individual House (1 Floor / Villa)' })
    expect(assignment.outreach[0].outcome).toBe('Options received')
    expect(assignment.landOptions[0].status).toBe('Shortlisted')
    expect(assignment.completedAt).toBeUndefined()
    expect(calls[1].init.headers).toMatchObject({ Authorization: 'Bearer access-1' })
  })

  it('sends actions to the matching endpoints', async () => {
    await signIn()
    handler = () => ({ status: 200, body: apiRequest })
    const assignment = await service.selectOption(toAssignment(apiRequest), apiRequest.landOptions[0].id)
    await service.toggleAgent(assignment, 'AG-0001')
    await service.toggleAgent(assignment, 'AG-0002')
    await service.logOutreach(assignment, { agentId: 'AG-0001', outcome: 'Will share options', notes: 'Will send plots' }, users[0])
    await service.markLandIdentified(assignment)
    await service.sendToSales(assignment)
    const base = `${API}/land-sourcing/requests/KX-LS-2026-000250`
    expect(calls.slice(1).map(call => `${call.init.method} ${call.url}`)).toEqual([
      `POST ${base}/options/${apiRequest.landOptions[0].id}/select/`,
      `DELETE ${base}/agents/AG-0001/`,
      `POST ${base}/agents/`,
      `POST ${base}/outreach/`,
      `POST ${base}/land-identified/`,
      `POST ${base}/send-to-sales/`,
    ])
    expect(JSON.parse(calls[3].init.body as string)).toEqual({ agentId: 'AG-0002' })
    expect(JSON.parse(calls[4].init.body as string)).toEqual({ agentId: 'AG-0001', outcome: 'Will share options', notes: 'Will send plots' })
  })

  it("shows the backend's reason when an action is refused", async () => {
    await signIn()
    handler = () => ({ status: 409, body: { code: 'land_already_identified', message: 'Land is already identified for this requirement' } })
    await expect(service.markLandIdentified(toAssignment(apiRequest))).rejects.toThrow('Land is already identified for this requirement')
  })

  it('refreshes an expired access token once and retries', async () => {
    await signIn()
    let first = true
    handler = url => {
      if (url.endsWith('/auth/token/refresh/')) return { status: 200, body: { access: 'access-2', refresh: 'refresh-2' } }
      if (first) { first = false; return { status: 401, body: { code: 'token_not_valid', message: 'Token expired' } } }
      return { status: 201, body: apiAgent }
    }
    const agent = await service.addAgent({ companyName: 'X', agentName: 'Y', mobile: '1', email: 'a@b.co', location: 'L', city: 'C', pincode: '160055', state: 'S', dealsIn: ['Plots'] })
    expect(agent.dealsIn).toEqual(['Plots', 'Lands'])
    expect(calls.at(-1)?.init.headers).toMatchObject({ Authorization: 'Bearer access-2' })
  })
})

describe('local mode follows the backend rules', () => {
  it('never moves the status backwards', () => {
    expect(advance('Options Found', 'Agent Search')).toBe('Options Found')
    expect(advance('New', 'Agent Search')).toBe('Agent Search')
  })

  it('locks a requirement once land is identified', async () => {
    const local = new LocalLandSourcingService()
    const identified = (await local.load()).assignments.find(item => item.status === 'Land Identified')!
    await expect(local.toggleAgent(identified, 'AG-0001')).rejects.toThrow('Land is already identified for this requirement')
    await expect(local.addOption(identified, { ...identified.landOptions[0] })).rejects.toThrow('Land is already identified')
    const fresh = (await local.load()).assignments.find(item => item.status === 'New')!
    await expect(local.markLandIdentified(fresh)).rejects.toThrow('Select one land option before marking the land as identified')
    await expect(local.sendToSales(fresh)).rejects.toThrow('Mark the land as identified before sending it to Sales')
  })
})
