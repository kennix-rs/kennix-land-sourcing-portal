/**
 * The seam between the screens and where the data lives. `LocalLandSourcingService` keeps the
 * preview data in localStorage; `ApiLandSourcingService` uses the KENNIX backend
 * (kennix-rs/kennix-backend). `VITE_DATA_MODE=api` picks the API.
 *
 * Both follow the backend's rules (BACKEND_PLAN.md §17, Phase 2): the status only moves forward,
 * and agents, outreach and options are locked once land is identified.
 */
import { createInitialState, PASSWORD, users } from '../data'
import type { Agent, AppState, Assignment, AssignmentStatus, LandOption, Outreach, User } from '../types'
import { ApiLandSourcingService } from './apiLandSourcingService'

export type NewOutreach = Pick<Outreach, 'agentId' | 'outcome' | 'notes'>
export type NewLandOption = Omit<LandOption, 'id' | 'addedAt' | 'status'>
/** What the team fills in; the ID, creation time and source ("KENNIX") are set by the service. */
export type NewAgent = Omit<Agent, 'id' | 'createdAt' | 'source'>

export interface LandSourcingService {
  /** Accounts offered on the sign-in page. */
  previewUsers(): User[]
  /** The signed-in user saved from an earlier visit, if any. */
  currentUser(): User | null
  /** Saved data that can be shown straight away (local mode only). */
  cachedState(): AppState | null
  load(): Promise<AppState>
  login(email: string, password: string): Promise<User | null>
  logout(): Promise<void>
  toggleAgent(assignment: Assignment, agentId: string): Promise<Assignment>
  logOutreach(assignment: Assignment, entry: NewOutreach, actor: User): Promise<Assignment>
  addOption(assignment: Assignment, option: NewLandOption): Promise<Assignment>
  selectOption(assignment: Assignment, optionId: string): Promise<Assignment>
  markLandIdentified(assignment: Assignment): Promise<Assignment>
  sendToSales(assignment: Assignment): Promise<Assignment>
  addAgent(agent: NewAgent): Promise<Agent>
}

export const STATE_KEY = 'kennix.land-sourcing.state.v4'
export const USER_KEY = 'kennix.land-sourcing.user.v1'

const ORDER: AssignmentStatus[] = ['New', 'Agent Search', 'Options Found', 'Land Identified', 'Sent to Sales']

/** The status never moves backwards (adding an agent to an Options Found requirement keeps it there). */
export function advance(current: AssignmentStatus, next: AssignmentStatus): AssignmentStatus {
  return ORDER.indexOf(next) > ORDER.indexOf(current) ? next : current
}

/** Agents, outreach and options can change only until land is identified. */
export function isLocked(assignment: Assignment) {
  return assignment.status === 'Land Identified' || assignment.status === 'Sent to Sales'
}

function assertWorking(assignment: Assignment) {
  if (assignment.status === 'Sent to Sales') throw new Error('This requirement has been sent to Sales and is read-only')
  if (assignment.status === 'Land Identified') throw new Error('Land is already identified for this requirement')
}

function withAgent(assignment: Assignment, agentId: string) {
  return assignment.selectedAgentIds.includes(agentId) ? assignment.selectedAgentIds : [...assignment.selectedAgentIds, agentId]
}

export class LocalLandSourcingService implements LandSourcingService {
  private read(): AppState {
    const saved = localStorage.getItem(STATE_KEY)
    if (saved) return JSON.parse(saved) as AppState
    const state = createInitialState()
    localStorage.setItem(STATE_KEY, JSON.stringify(state))
    return state
  }

  private write(state: AppState) {
    localStorage.setItem(STATE_KEY, JSON.stringify(state))
  }

  private save(next: Assignment): Assignment {
    const state = this.read()
    this.write({ ...state, assignments: state.assignments.map(item => item.id === next.id ? next : item) })
    return next
  }

  previewUsers() { return users }

  currentUser() {
    const id = localStorage.getItem(USER_KEY)
    return users.find(item => item.id === id) ?? null
  }

  cachedState() { return this.read() }

  async load() { return this.read() }

  async login(email: string, password: string) {
    const user = users.find(item => item.email.toLowerCase() === email.trim().toLowerCase())
    if (!user || password !== PASSWORD) return null
    localStorage.setItem(USER_KEY, user.id)
    return user
  }

  async logout() { localStorage.removeItem(USER_KEY) }

  async toggleAgent(assignment: Assignment, agentId: string) {
    assertWorking(assignment)
    const selected = assignment.selectedAgentIds.includes(agentId)
    return this.save(selected
      ? { ...assignment, selectedAgentIds: assignment.selectedAgentIds.filter(value => value !== agentId) }
      : { ...assignment, status: advance(assignment.status, 'Agent Search'), selectedAgentIds: [...assignment.selectedAgentIds, agentId] })
  }

  async logOutreach(assignment: Assignment, entry: NewOutreach, actor: User) {
    assertWorking(assignment)
    if (entry.notes.trim().length < 5) throw new Error('Add a short note about the conversation with the agent')
    const outreach: Outreach = { ...entry, id: `OUT-${Date.now()}`, notes: entry.notes.trim(), contactedAt: new Date().toISOString(), actor: actor.name }
    return this.save({
      ...assignment,
      status: advance(assignment.status, entry.outcome === 'Options received' ? 'Options Found' : 'Agent Search'),
      selectedAgentIds: withAgent(assignment, entry.agentId),
      outreach: [outreach, ...assignment.outreach],
    })
  }

  async addOption(assignment: Assignment, option: NewLandOption) {
    assertWorking(assignment)
    return this.save({
      ...assignment,
      status: advance(assignment.status, 'Options Found'),
      selectedAgentIds: withAgent(assignment, option.agentId),
      landOptions: [{ ...option, id: `LAND-${Date.now()}`, addedAt: new Date().toISOString(), status: 'Under Review' }, ...assignment.landOptions],
    })
  }

  async selectOption(assignment: Assignment, optionId: string) {
    assertWorking(assignment)
    return this.save({
      ...assignment,
      landOptions: assignment.landOptions.map(option => ({ ...option, status: option.id === optionId ? 'Selected' : option.status === 'Selected' ? 'Shortlisted' : option.status })),
    })
  }

  async markLandIdentified(assignment: Assignment) {
    assertWorking(assignment)
    if (!assignment.landOptions.some(option => option.status === 'Selected')) throw new Error('Select one land option before marking the land as identified')
    return this.save({ ...assignment, status: 'Land Identified', completedAt: new Date().toISOString() })
  }

  async sendToSales(assignment: Assignment) {
    if (assignment.status === 'Sent to Sales') throw new Error('This requirement has been sent to Sales and is read-only')
    if (assignment.status !== 'Land Identified') throw new Error('Mark the land as identified before sending it to Sales')
    return this.save({ ...assignment, status: 'Sent to Sales' })
  }

  async addAgent(agent: NewAgent) {
    const state = this.read()
    const next: Agent = { ...agent, id: `AG-${String(state.agents.length + 1).padStart(4, '0')}`, createdAt: new Date().toISOString(), source: 'KENNIX' }
    this.write({ ...state, agents: [next, ...state.agents] })
    return next
  }
}

export const DATA_MODE: 'local' | 'api' = import.meta.env.VITE_DATA_MODE === 'api' ? 'api' : 'local'

export const landSourcingService: LandSourcingService = DATA_MODE === 'api' ? new ApiLandSourcingService() : new LocalLandSourcingService()
