export type Role = 'executive' | 'team_lead' | 'manager'
export type DealType = 'Plots' | 'Lands' | 'Houses'
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
  mobileNumber: string
  preferredLocations: { name: string; pincode: string }[]
  propertyType: string
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
