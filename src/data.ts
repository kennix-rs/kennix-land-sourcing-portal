import { DEAL_TYPES, type Agent, type AppState, type Assignment, type AssignmentStatus, type DealType, type User } from './types'

export const PASSWORD = 'Preview@123'

export const users: User[] = [
  { id: 'ls-neha', name: 'Neha Sharma', email: 'neha.sharma@kennix.in', role: 'executive', title: 'Land Sourcing Executive', initials: 'NS' },
  { id: 'ls-vikram', name: 'Vikram Bedi', email: 'vikram.bedi@kennix.in', role: 'team_lead', title: 'Land Sourcing Team Lead', initials: 'VB' },
  { id: 'ls-meera', name: 'Meera Kapoor', email: 'meera.kapoor@kennix.in', role: 'manager', title: 'Land Sourcing Manager', initials: 'MK' },
]

/** The demo rows were written with the old Plots / Lands / Houses types; `landTypes` maps them. */
type LegacyDeal = 'Plots' | 'Lands' | 'Houses'

const agentRows: [string, string, string, string, string, string, string, string, LegacyDeal[]][] = [
  ['Northfield Realty', 'Aman Khurana', '+91 98150 12001', 'aman@northfield.example.com', 'Aerocity', 'Mohali', '160055', 'Punjab', ['Plots', 'Lands']],
  ['Tricity Land Bank', 'Gurpreet Sandhu', '+91 98150 12002', 'gurpreet@tricityland.example.com', 'New Chandigarh', 'New Chandigarh', '140901', 'Punjab', ['Plots', 'Lands']],
  ['Capital Estates', 'Rohit Malhotra', '+91 98150 12003', 'rohit@capitalestates.example.com', 'Sector 17', 'Chandigarh', '160017', 'Chandigarh', ['Plots', 'Houses']],
  ['Zirakpur Property Hub', 'Nitin Arora', '+91 98150 12004', 'nitin@zph.example.com', 'VIP Road', 'Zirakpur', '140603', 'Punjab', ['Plots', 'Houses']],
  ['Shivalik Realtors', 'Kavita Saini', '+91 98150 12005', 'kavita@shivalik.example.com', 'MDC Sector 5', 'Panchkula', '134109', 'Haryana', ['Plots', 'Houses']],
  ['Ludhiana Land Links', 'Harpreet Gill', '+91 98150 12006', 'harpreet@landlinks.example.com', 'Ferozepur Road', 'Ludhiana', '141001', 'Punjab', ['Lands', 'Plots']],
  ['Kharar Estate Network', 'Sahil Bansal', '+91 98150 12007', 'sahil@ken.example.com', 'Sunny Enclave', 'Kharar', '140301', 'Punjab', ['Plots', 'Houses']],
  ['NCR Land Advisory', 'Rajeev Chauhan', '+91 98150 12008', 'rajeev@ncrland.example.com', 'South Delhi', 'Delhi NCR', '110001', 'Delhi', ['Lands', 'Plots']],
  ['Noida Realty Desk', 'Priyanka Tyagi', '+91 98150 12009', 'priyanka@nrd.example.com', 'Sector 150', 'Noida', '201301', 'Uttar Pradesh', ['Plots', 'Houses']],
  ['Millennium Property Co.', 'Ankit Yadav', '+91 98150 12010', 'ankit@millennium.example.com', 'Golf Course Extension', 'Gurugram', '122001', 'Haryana', ['Lands', 'Plots', 'Houses']],
  ['Green Acres Punjab', 'Manpreet Brar', '+91 98150 12011', 'manpreet@greenacres.example.com', 'Airport Road', 'Mohali', '160055', 'Punjab', ['Lands']],
  ['Eco Habitat Realty', 'Ritika Anand', '+91 98150 12012', 'ritika@ecohabitat.example.com', 'Mullanpur', 'New Chandigarh', '140901', 'Punjab', ['Plots', 'Houses']],
  ['City Square Consultants', 'Deepak Sood', '+91 98150 12013', 'deepak@citysquare.example.com', 'Industrial Area', 'Chandigarh', '160002', 'Chandigarh', ['Lands', 'Plots']],
  ['Prime Land Associates', 'Sumeet Walia', '+91 98150 12014', 'sumeet@primeland.example.com', 'Patiala Road', 'Zirakpur', '140603', 'Punjab', ['Lands', 'Plots']],
  ['Hillside Property Services', 'Meenal Khanna', '+91 98150 12015', 'meenal@hillside.example.com', 'Pinjore Road', 'Panchkula', '134102', 'Haryana', ['Lands', 'Houses']],
  ['Grand Trunk Realty', 'Jasmeet Singh', '+91 98150 12016', 'jasmeet@gtrealty.example.com', 'South City', 'Ludhiana', '141013', 'Punjab', ['Plots', 'Houses']],
  ['Westend Land Solutions', 'Pankaj Goyal', '+91 98150 12017', 'pankaj@westend.example.com', 'Landran Road', 'Kharar', '140307', 'Punjab', ['Lands', 'Plots']],
  ['Urban Edge NCR', 'Shalini Mehta', '+91 98150 12018', 'shalini@urbanedge.example.com', 'Dwarka Expressway', 'Delhi NCR', '110075', 'Delhi', ['Plots', 'Houses']],
  ['Expressway Estates', 'Mohit Saxena', '+91 98150 12019', 'mohit@expressway.example.com', 'Yamuna Expressway', 'Noida', '201310', 'Uttar Pradesh', ['Lands', 'Plots']],
  ['Aravali Realty Partners', 'Naveen Dahiya', '+91 98150 12020', 'naveen@aravali.example.com', 'Sohna Road', 'Gurugram', '122103', 'Haryana', ['Lands', 'Plots', 'Houses']],
]

/** Plots → Open Plots, Lands → Commercial Lands, Houses → Independent Houses; agents in both plots and lands also handle commercial plots. */
export function landTypes(legacy: LegacyDeal[]): DealType[] {
  const mapped: DealType[] = legacy.map(deal => (deal === 'Plots' ? 'Open Plots' : deal === 'Lands' ? 'Commercial Lands' : 'Independent Houses'))
  if (legacy.includes('Plots') && legacy.includes('Lands')) mapped.push('Commercial Plots')
  return DEAL_TYPES.filter(type => mapped.includes(type))
}

const MANAGERS = ['Neha Sharma', 'Vikram Bedi', 'Meera Kapoor']

export const initialAgents: Agent[] = agentRows.map((row, index) => ({
  id: `AG-${String(index + 1).padStart(4, '0')}`,
  companyName: row[0],
  agentName: row[1],
  mobile: row[2],
  email: row[3],
  location: row[4],
  city: row[5],
  pincode: row[6],
  state: row[7],
  dealsIn: landTypes(row[8]),
  active: true,
  createdAt: `2026-10-${String(8 + (index % 20)).padStart(2, '0')}T10:00:00+05:30`,
  alternateMobile: '',
  address: `${row[4]}, ${row[5]}, ${row[7]} ${row[6]}`,
  primaryWorkArea: row[4],
  otherAreas: [],
  brokeragePercent: [1, 1.5, 2][index % 3],
  kennixManager: MANAGERS[index % 3],
  source: 'KENNIX',
}))

// The journeys Telesales sent to Land Sourcing in its demo (kennix-telesales-portal fixtures):
// same customers, mobiles, locations, property types and handoff times. Statuses line up too:
// Telesales shows "Land Identified" for 257, 260 and 266.
type AssignmentRow = [journeyId: string, customerName: string, mobileNumber: string, location: string, pincode: string,
  propertyType: string, priority: Assignment['priority'], status: AssignmentStatus, receivedAt: string, completedAt: string | undefined]

const assignmentRows: AssignmentRow[] = [
  ['KX-2026-000244', 'Neha Kapoor', '+91 9810052173', 'Zirakpur', '140603', 'Commercial Building', 'Medium', 'New', '2026-10-27T10:30:00.000Z', undefined],
  ['KX-2026-000248', 'Rohan Khanna', '+91 9810121737', 'Delhi NCR', '110001', 'Individual House (1 Floor / Villa)', 'Low', 'New', '2026-10-31T10:30:00.000Z', undefined],
  ['KX-2026-000250', 'Amanpreet Singh', '+91 9810156519', 'Gurugram', '122001', 'Commercial Building', 'Medium', 'Agent Search', '2026-11-02T10:30:00.000Z', undefined],
  ['KX-2026-000256', 'Aditya Rao', '+91 9810260865', 'Ludhiana', '141001', 'Commercial Building', 'Medium', 'Options Found', '2026-11-08T10:30:00.000Z', undefined],
  ['KX-2026-000257', 'Pooja Malhotra', '+91 9810278256', 'Kharar', '140301', 'Individual House (1 Floor / Villa)', 'Low', 'Sent to Sales', '2026-11-09T10:30:00.000Z', '2026-11-12T09:30:00.000Z'],
  ['KX-2026-000260', 'Deepak Yadav', '+91 9810330429', 'Gurugram', '122001', 'Individual House (1 Floor / Villa)', 'Low', 'Land Identified', '2026-10-25T10:30:00.000Z', '2026-10-28T09:30:00.000Z'],
  ['KX-2026-000264', 'Varun Sehgal', '+91 9810399993', 'Zirakpur', '140603', 'Individual House (1 Floor / Villa)', 'High', 'Agent Search', '2026-10-29T10:30:00.000Z', undefined],
  ['KX-2026-000266', 'Rajiv Khurana', '+91 9810434775', 'Ludhiana', '141001', 'Individual House (1 Floor / Villa)', 'Low', 'Land Identified', '2026-10-31T10:30:00.000Z', '2026-11-03T09:30:00.000Z'],
  ['KX-2026-000272', 'Jayant Kumar', '+91 9810539121', 'New Chandigarh', '140901', 'Individual House (1 Floor / Villa)', 'Low', 'Options Found', '2026-11-06T10:30:00.000Z', undefined],
  ['KX-2026-000278', 'Lakshay Gupta', '+91 9810643467', 'Delhi NCR', '110001', 'Individual House (1 Floor / Villa)', 'Low', 'New', '2026-10-25T10:30:00.000Z', undefined],
]

export const initialAssignments: Assignment[] = assignmentRows.map(([journeyId, customerName, mobileNumber, city, pincode, propertyType, priority, status, receivedAt, completedAt], index) => {
  const assignedTo = index % 3 === 0 ? 'ls-vikram' : 'ls-neha'
  const deal: DealType = propertyType === 'Commercial Building' ? 'Commercial Lands' : 'Open Plots'
  const agent = initialAgents.find(item => item.city === city && item.dealsIn.includes(deal)) ?? initialAgents.find(item => item.city === city) ?? initialAgents[index]
  const hasOutreach = status !== 'New'
  const hasOption = status === 'Options Found' || status === 'Land Identified' || status === 'Sent to Sales'
  const landDone = status === 'Land Identified' || status === 'Sent to Sales'
  const contactedAt = new Date(new Date(receivedAt).getTime() + 26 * 3600_000).toISOString()
  return {
    id: journeyId.replace('KX-', 'KX-LS-'),
    journeyId,
    customerName,
    mobileNumber,
    preferredLocations: [{ name: city, pincode }],
    propertyType,
    receivedAt,
    assignedTo,
    priority,
    status,
    selectedAgentIds: hasOutreach ? [agent.id] : [],
    outreach: hasOutreach ? [{
      id: `OUT-${index + 1}`,
      agentId: agent.id,
      contactedAt,
      outcome: hasOption ? 'Options received' : 'Will share options',
      notes: hasOption ? 'Agent shared an option matching the preferred micro-market.' : 'Agent will verify available inventory and revert.',
      actor: assignedTo === 'ls-vikram' ? 'Vikram Bedi' : 'Neha Sharma',
    }] : [],
    landOptions: hasOption ? [{
      id: `LAND-${String(index + 1).padStart(4, '0')}`,
      agentId: agent.id,
      title: `${city} ${deal === 'Commercial Lands' ? 'land parcel' : 'residential plot'}`,
      location: agent.location,
      city,
      pincode,
      state: agent.state,
      area: `${1800 + index * 125} sq ft`,
      askingPrice: `₹${95 + index * 8} lakh`,
      ownership: 'Individual owner',
      status: landDone ? 'Selected' : 'Shortlisted',
      notes: 'Title documents and site access to be verified before Sales meeting.',
      addedAt: new Date(new Date(contactedAt).getTime() + 24 * 3600_000).toISOString(),
    }] : [],
    notes: status === 'New' ? 'Review preferred location and identify suitable agents.' : 'Sourcing in progress with the selected local agent.',
    ...(completedAt ? { completedAt } : {}),
  }
})

export function createInitialState(): AppState {
  return { agents: structuredClone(initialAgents), assignments: structuredClone(initialAssignments) }
}

export function matchesAgent(agent: Agent, search: string, deal: DealType | 'All') {
  const query = search.trim().toLowerCase()
  const text = [agent.companyName, agent.agentName, agent.mobile, agent.alternateMobile, agent.email, agent.location, agent.primaryWorkArea, ...agent.otherAreas, agent.city, agent.pincode, agent.state].join(' ').toLowerCase()
  return (!query || text.includes(query)) && (deal === 'All' || agent.dealsIn.includes(deal))
}

/** Land types that can serve a requirement: commercial buildings need commercial plots or land, homes need open plots. */
export function dealTypesFor(propertyType: string): DealType[] {
  return propertyType === 'Commercial Building' ? ['Commercial Plots', 'Commercial Lands'] : ['Open Plots']
}

export function matchingAgents(agents: Agent[], assignment: Assignment) {
  const locations = assignment.preferredLocations
  const wanted = dealTypesFor(assignment.propertyType)
  return agents
    .filter(agent => agent.active && agent.dealsIn.some(type => wanted.includes(type)))
    .map(agent => {
      const areas = [agent.location, agent.primaryWorkArea, ...agent.otherAreas].map(area => area.toLowerCase())
      return {
        agent,
        score: Math.max(...locations.map(location =>
          (agent.pincode === location.pincode ? 4 : 0) +
          (agent.city.toLowerCase() === location.name.toLowerCase() ? 3 : 0) +
          (areas.some(area => area.includes(location.name.toLowerCase())) ? 2 : 0))),
      }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.agent.agentName.localeCompare(b.agent.agentName))
}
