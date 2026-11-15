export type Role = 'executive' | 'team_lead' | 'manager'
/** Land types an agent deals in (shared with the agent registration form; replaced Plots / Lands / Houses on 2026-11-15). */
export type DealType = 'Open Plots' | 'Commercial Plots' | 'Independent Houses' | 'Commercial Lands'
export const DEAL_TYPES: DealType[] = ['Open Plots', 'Commercial Plots', 'Independent Houses', 'Commercial Lands']
export type AssignmentStatus = 'New' | 'Agent Search' | 'Options Found' | 'Land Identified' | 'Sent to Sales'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  title: string
  initials: string
}

export interface Agent {
  id: string
  companyName: string
  agentName: string
  mobile: string
  email: string
  location: string
  city: string
  pincode: string
  state: string
  dealsIn: DealType[]
  active: boolean
  createdAt: string
  alternateMobile: string
  address: string
  primaryWorkArea: string
  otherAreas: string[]
  brokeragePercent: number
  /** KENNIX relationship manager (a Land Sourcing team member), if any. */
  kennixManager: string
  /** Added by the KENNIX team, or by the agent through the registration form. */
  source: 'KENNIX' | 'Self-registration'
}

export interface Outreach {
  id: string
  agentId: string
  contactedAt: string
  outcome: 'No response' | 'Will share options' | 'Options received' | 'Not available'
  notes: string
  actor: string
}

export interface LandOption {
  id: string
  agentId: string
  title: string
  location: string
  city: string
  pincode: string
  state: string
  area: string
  askingPrice: string
  ownership: string
  status: 'Under Review' | 'Shortlisted' | 'Rejected' | 'Selected'
  notes: string
  addedAt: string
}

export interface Assignment {
  id: string
  journeyId: string
  customerName: string
  /** Land Sourcing never sees the customer's number, only a masked one, so leads can't leak to agents (DOMAIN.md §7). */
  maskedMobile: string
  preferredLocations: { name: string; pincode: string }[]
  propertyType: string
  size: string
  budget: string
  city: string
  state: string
  receivedAt: string
  assignedTo: string
  priority: 'High' | 'Medium' | 'Low'
  status: AssignmentStatus
  selectedAgentIds: string[]
  outreach: Outreach[]
  landOptions: LandOption[]
  notes: string
  completedAt?: string
}

export interface AppState {
  agents: Agent[]
  assignments: Assignment[]
}
