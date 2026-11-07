import type { Agent, AppState, Assignment, DealType, User } from './types'

export const PASSWORD = 'Preview@123'

export const users: User[] = [
  { id: 'ls-neha', name: 'Neha Sharma', email: 'neha.sharma@kennix.in', role: 'executive', title: 'Land Sourcing Executive', initials: 'NS' },
  { id: 'ls-vikram', name: 'Vikram Bedi', email: 'vikram.bedi@kennix.in', role: 'team_lead', title: 'Land Sourcing Team Lead', initials: 'VB' },
  { id: 'ls-meera', name: 'Meera Kapoor', email: 'meera.kapoor@kennix.in', role: 'manager', title: 'Land Sourcing Manager', initials: 'MK' },
]

const agentRows: [string, string, string, string, string, string, string, string, DealType[]][] = [
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
  dealsIn: row[8],
  active: true,
  createdAt: `2026-10-${String(8 + (index % 20)).padStart(2, '0')}T10:00:00+05:30`,
}))

const assignmentRows = [
  ['KX-LS-000248', 'KX-2026-000248', 'Rohan Khanna', '+91 98100 22048', 'New Chandigarh', '140901', 'Individual House (1 Floor / Villa)', 'High'],
  ['KX-LS-000272', 'KX-2026-000272', 'Jayant Kumar', '+91 98100 22072', 'New Chandigarh', '140901', 'Standalone Apartment', 'Medium'],
  ['KX-LS-000256', 'KX-2026-000256', 'Aditya Rao', '+91 98100 22056', 'Ludhiana', '141001', 'Individual House (1 Floor / Villa)', 'High'],
  ['KX-LS-000266', 'KX-2026-000266', 'Rajiv Khurana', '+91 98100 22066', 'Ludhiana', '141001', 'Commercial Building', 'Medium'],
  ['KX-LS-000244', 'KX-2026-000244', 'Neha Kapoor', '+91 98100 22044', 'Zirakpur', '140603', 'Standalone Apartment', 'Low'],
  ['KX-LS-000278', 'KX-2026-000278', 'Lakshay Gupta', '+91 98100 22078', 'Delhi NCR', '110001', 'Commercial Building', 'High'],
  ['KX-LS-000264', 'KX-2026-000264', 'Varun Sehgal', '+91 98100 22064', 'Zirakpur', '140603', 'Individual House (1 Floor / Villa)', 'Medium'],
  ['KX-LS-000274', 'KX-2026-000274', 'Abhishek Dutta', '+91 98100 22074', 'Zirakpur', '140603', 'Standalone Apartment', 'Low'],
  ['KX-LS-000258', 'KX-2026-000258', 'Kunal Sood', '+91 98100 22058', 'Delhi NCR', '110001', 'Individual House (1 Floor / Villa)', 'High'],
  ['KX-LS-000280', 'KX-2026-000280', 'Yash Malhotra', '+91 98100 22080', 'Gurugram', '122001', 'Commercial Building', 'Medium'],
  ['KX-LS-000250', 'KX-2026-000250', 'Amanpreet Singh', '+91 98100 22050', 'Gurugram', '122001', 'Individual House (1 Floor / Villa)', 'Medium'],
  ['KX-LS-000260', 'KX-2026-000260', 'Deepak Yadav', '+91 98100 22060', 'Gurugram', '122001', 'Standalone Apartment', 'Low'],
] as const

export const initialAssignments: Assignment[] = assignmentRows.map((row, index) => {
  const status = (['New', 'Agent Search', 'Options Found', 'Land Identified'] as const)[index % 4]
  const assignedTo = index % 3 === 0 ? 'ls-vikram' : 'ls-neha'
  const agent = initialAgents.find(item => item.city === row[4]) ?? initialAgents[index]
  const hasOutreach = status !== 'New'
  const hasOption = status === 'Options Found' || status === 'Land Identified'
  return {
    id: row[0],
    journeyId: row[1],
    customerName: row[2],
    mobileNumber: row[3],
    preferredLocations: [{ name: row[4], pincode: row[5] }],
    propertyType: row[6],
    receivedAt: `2026-11-${String(1 + (index % 6)).padStart(2, '0')}T${String(9 + (index % 7)).padStart(2, '0')}:30:00+05:30`,
    assignedTo,
    priority: row[7],
    status,
    selectedAgentIds: hasOutreach ? [agent.id] : [],
    outreach: hasOutreach ? [{
      id: `OUT-${index + 1}`,
      agentId: agent.id,
      contactedAt: `2026-11-${String(3 + (index % 4)).padStart(2, '0')}T11:00:00+05:30`,
      outcome: hasOption ? 'Options received' : 'Will share options',
      notes: hasOption ? 'Agent shared an option matching the preferred micro-market.' : 'Agent will verify available inventory and revert.',
      actor: assignedTo === 'ls-vikram' ? 'Vikram Bedi' : 'Neha Sharma',
    }] : [],
    landOptions: hasOption ? [{
      id: `LAND-${String(index + 1).padStart(4, '0')}`,
      agentId: agent.id,
      title: `${row[4]} ${index % 2 ? 'residential plot' : 'land parcel'}`,
      location: agent.location,
      city: row[4],
      pincode: row[5],
      state: agent.state,
      area: `${1800 + index * 125} sq ft`,
      askingPrice: `₹${95 + index * 8} lakh`,
      ownership: 'Individual owner',
      status: status === 'Land Identified' ? 'Selected' : 'Shortlisted',
      notes: 'Title documents and site access to be verified before Sales meeting.',
      addedAt: `2026-11-${String(4 + (index % 3)).padStart(2, '0')}T15:00:00+05:30`,
    }] : [],
    notes: status === 'New' ? 'Review preferred location and identify suitable agents.' : 'Sourcing in progress with the selected local agent.',
    ...(status === 'Land Identified' ? { completedAt: `2026-11-07T16:30:00+05:30` } : {}),
  }
})

export function createInitialState(): AppState {
  return { agents: structuredClone(initialAgents), assignments: structuredClone(initialAssignments) }
}

export function matchesAgent(agent: Agent, search: string, deal: DealType | 'All') {
  const query = search.trim().toLowerCase()
  const text = [agent.companyName, agent.agentName, agent.mobile, agent.email, agent.location, agent.city, agent.pincode, agent.state].join(' ').toLowerCase()
  return (!query || text.includes(query)) && (deal === 'All' || agent.dealsIn.includes(deal))
}

export function matchingAgents(agents: Agent[], assignment: Assignment) {
  const locations = assignment.preferredLocations
  const targetDeal: DealType = assignment.propertyType === 'Commercial Building' ? 'Lands' : 'Plots'
  return agents
    .filter(agent => agent.active && agent.dealsIn.includes(targetDeal))
    .map(agent => ({
      agent,
      score: Math.max(...locations.map(location =>
        (agent.pincode === location.pincode ? 4 : 0) +
        (agent.city.toLowerCase() === location.name.toLowerCase() ? 3 : 0) +
        (agent.location.toLowerCase().includes(location.name.toLowerCase()) ? 2 : 0))),
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.agent.agentName.localeCompare(b.agent.agentName))
}
