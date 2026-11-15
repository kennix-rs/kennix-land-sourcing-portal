/**
 * ApiLandSourcingService: the same methods as LocalLandSourcingService, backed by the KENNIX
 * backend's `/land-sourcing/` endpoints. Screens keep the portal's `Assignment`, `Agent` and `User`
 * shapes, and refused actions carry the backend's messages.
 *
 * The API returns enums as `{code, label}`; the labels are the strings these screens already use
 * and the API accepts labels on writes, so mapping is mostly `.label`.
 */
import { users } from '../data'
import type { Agent, AppState, Assignment, DealType, LandOption, Outreach, Role, User } from '../types'
import type { LandSourcingService, NewAgent, NewLandOption, NewOutreach } from './landSourcingService'

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:8000/api/v1'
const TOKEN_KEY = 'kennix.land-sourcing.tokens.v1'
const SESSION_KEY = 'kennix.land-sourcing.session.v1'
const SHOW_PREVIEW_LOGINS = import.meta.env.VITE_PREVIEW_LOGINS !== 'false'

interface Tokens { access: string; refresh: string }
interface EnumValue { code: string; label: string }

// --- Wire types (camelCase JSON from the API) ---------------------------------------------

interface ApiAgent {
  id: string; companyName: string; agentName: string; mobile: string; email: string; location: string
  city: string; pincode: string; state: string; dealsIn: EnumValue[]; active: boolean; createdAt: string
}
interface ApiOutreach { id: string; agentId: string; contactedAt: string; outcome: EnumValue; notes: string; actor: string }
interface ApiLandOption {
  id: string; agentId: string; title: string; location: string; city: string; pincode: string; state: string
  area: string; askingPrice: string; ownership: string; status: EnumValue; notes: string; addedAt: string
}
export interface ApiRequest {
  id: string; journeyId: string; customerName: string; mobileNumber: string
  preferredLocations: { name: string; pincode: string }[]; propertyType: EnumValue; receivedAt: string
  assignedTo: { id: string; name: string; initials: string }; priority: EnumValue; status: EnumValue
  selectedAgentIds: string[]; outreach: ApiOutreach[]; landOptions: ApiLandOption[]; notes: string
  completedAt: string | null; sharedAt: string | null
}
interface ApiMembership { department: EnumValue; role: EnumValue; title: string }
interface ApiPerson { id: string; email: string; name: string; initials: string }

// --- Mapping -----------------------------------------------------------------------------

/** Backend role → the portal's role strings. */
function portalRole(role: string): Role {
  if (role === 'team_lead') return 'team_lead'
  if (role === 'manager' || role === 'admin') return 'manager'
  return 'executive'
}

export function toUser(person: ApiPerson, memberships: ApiMembership[]): User | null {
  const membership = memberships.find(item => item.department.code === 'land_sourcing')
  if (!membership) return null
  return { id: person.id, name: person.name, email: person.email, initials: person.initials, role: portalRole(membership.role.code), title: membership.title }
}

export function toAgent(agent: ApiAgent): Agent {
  return { ...agent, dealsIn: agent.dealsIn.map(item => item.label as DealType) }
}

export function toAssignment(item: ApiRequest): Assignment {
  return {
    id: item.id, journeyId: item.journeyId, customerName: item.customerName, mobileNumber: item.mobileNumber,
    preferredLocations: item.preferredLocations.map(location => ({ name: location.name, pincode: location.pincode })),
    propertyType: item.propertyType.label, receivedAt: item.receivedAt, assignedTo: item.assignedTo.id,
    priority: item.priority.label as Assignment['priority'], status: item.status.label as Assignment['status'],
    selectedAgentIds: item.selectedAgentIds,
    outreach: item.outreach.map((entry): Outreach => ({ ...entry, outcome: entry.outcome.label as Outreach['outcome'] })),
    landOptions: item.landOptions.map((option): LandOption => ({ ...option, status: option.status.label as LandOption['status'] })),
    notes: item.notes,
    ...(item.completedAt ? { completedAt: item.completedAt } : {}),
  }
}

// --- HTTP ----------------------------------------------------------------------------------

export class ApiError extends Error {
  status: number; code: string
  constructor(status: number, code: string, message: string) {
    super(message); this.status = status; this.code = code
  }
}

function readTokens(): Tokens | null {
  try { return JSON.parse(localStorage.getItem(TOKEN_KEY) || 'null') as Tokens | null } catch { return null }
}

function writeTokens(tokens: Tokens | null) {
  if (tokens) localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))
  else localStorage.removeItem(TOKEN_KEY)
}

function endSession() {
  writeTokens(null)
  localStorage.removeItem(SESSION_KEY)
  // The sign-in page shows whenever nobody is signed in, so reload the app at its start.
  if (typeof window !== 'undefined') window.location.assign('/')
}

async function refreshTokens(): Promise<boolean> {
  const tokens = readTokens()
  if (!tokens) return false
  const response = await fetch(`${API_URL}/auth/token/refresh/`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh: tokens.refresh }),
  })
  if (!response.ok) return false
  const body = await response.json() as { access: string; refresh?: string }
  writeTokens({ access: body.access, refresh: body.refresh ?? tokens.refresh })
  return true
}

async function request<T>(method: string, path: string, body?: unknown, retry = true): Promise<T> {
  const tokens = readTokens()
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(tokens ? { Authorization: `Bearer ${tokens.access}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (response.status === 401) {
    if (retry && tokens && await refreshTokens()) return request<T>(method, path, body, false)
    endSession()
    throw new ApiError(401, 'session_ended', 'Your session has ended. Sign in again.')
  }
  if (response.status === 204) return undefined as T
  const data = await response.json().catch(() => ({})) as Record<string, unknown>
  if (!response.ok) {
    throw new ApiError(response.status, String(data.code ?? 'error'), String(data.message ?? 'Something went wrong. Try again.'))
  }
  return data as T
}

async function listAll<T>(path: string): Promise<T[]> {
  const items: T[] = []
  let next: string | null = path
  while (next) {
    const page: { results: T[]; next: string | null } = await request('GET', next)
    items.push(...page.results)
    next = page.next ? page.next.slice(page.next.indexOf('/api/v1') + '/api/v1'.length) : null
  }
  return items
}

// --- Service --------------------------------------------------------------------------------

export class ApiLandSourcingService implements LandSourcingService {
  previewUsers() { return SHOW_PREVIEW_LOGINS ? users : [] }

  currentUser(): User | null {
    if (!readTokens()) return null
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') as User | null } catch { return null }
  }

  cachedState() { return null }

  async load(): Promise<AppState> {
    const [assignments, agents] = await Promise.all([
      listAll<ApiRequest>('/land-sourcing/requests/?page_size=200'),
      request<ApiAgent[]>('GET', '/land-sourcing/agents/'),
    ])
    return {
      assignments: assignments.map(toAssignment).sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)),
      agents: agents.map(toAgent),
    }
  }

  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/token/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim(), password }),
    })
    if (!response.ok) return null
    const body = await response.json() as Tokens & { user: ApiPerson; memberships: ApiMembership[] }
    // Only Land Sourcing members can use this portal.
    const user = toUser(body.user, body.memberships)
    if (!user) return null
    writeTokens({ access: body.access, refresh: body.refresh })
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
  }

  async logout() {
    const tokens = readTokens()
    if (tokens) await request('POST', '/auth/logout/', { refresh: tokens.refresh }, false).catch(() => undefined)
    writeTokens(null)
    localStorage.removeItem(SESSION_KEY)
  }

  private async act(method: string, assignment: Assignment, action: string, body?: unknown) {
    return toAssignment(await request<ApiRequest>(method, `/land-sourcing/requests/${assignment.id}/${action}`, body))
  }

  async toggleAgent(assignment: Assignment, agentId: string) {
    return assignment.selectedAgentIds.includes(agentId)
      ? this.act('DELETE', assignment, `agents/${agentId}/`)
      : this.act('POST', assignment, 'agents/', { agentId })
  }

  async logOutreach(assignment: Assignment, entry: NewOutreach, actor: User) {
    void actor // the API records the signed-in user
    return this.act('POST', assignment, 'outreach/', entry)
  }

  async addOption(assignment: Assignment, option: NewLandOption) {
    return this.act('POST', assignment, 'options/', option)
  }

  async selectOption(assignment: Assignment, optionId: string) {
    return this.act('POST', assignment, `options/${optionId}/select/`)
  }

  async markLandIdentified(assignment: Assignment) {
    return this.act('POST', assignment, 'land-identified/')
  }

  async sendToSales(assignment: Assignment) {
    return this.act('POST', assignment, 'send-to-sales/')
  }

  async addAgent(agent: NewAgent) {
    return toAgent(await request<ApiAgent>('POST', '/land-sourcing/agents/', agent))
  }
}
