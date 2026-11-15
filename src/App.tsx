import { useEffect, useMemo, useState, type Dispatch, type FormEvent, type ReactNode, type SetStateAction } from 'react'
import { AlertCircle, ArrowRight, CheckCircle2, ChevronRight, ClipboardList, Database, Eye, EyeOff, Filter, Home, LockKeyhole, LogOut, MapPin, Menu, Phone, Plus, Search, Send, UserRound, Users, X } from 'lucide-react'
import { Link, Navigate, NavLink, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { matchesAgent, matchingAgents, PASSWORD, users as landSourcingTeam } from './data'
import { DATA_MODE, isLocked, landSourcingService as service, type NewAgent, type NewLandOption } from './services/landSourcingService'
import { DEAL_TYPES, type Agent, type AppState, type Assignment, type AssignmentStatus, type DealType, type Outreach, type User } from './types'

type Notify = (message: string, tone?: 'success' | 'error') => void
type SetAppState = Dispatch<SetStateAction<AppState>>

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Try again.'
}

function formatDate(value?: string) {
  if (!value) return 'Not scheduled'
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function initials(name: string) {
  return name.split(' ').map(part => part[0]).slice(0, 2).join('')
}

function canManageAgents(user: User) {
  return user.role === 'team_lead' || user.role === 'manager'
}

function statusTone(status: AssignmentStatus) {
  return status === 'New' ? 'blue' : status === 'Agent Search' ? 'amber' : status === 'Options Found' ? 'violet' : status === 'Land Identified' ? 'green' : 'teal'
}

const assignmentStatuses: AssignmentStatus[] = ['New', 'Agent Search', 'Options Found', 'Land Identified', 'Sent to Sales']

function Button({ children, variant = 'primary', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold' }) {
  return <button className={`btn btn-${variant} ${className}`} {...props}>{children}</button>
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>
}

function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: string }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

function Field({ label, children, required, hint }: { label: string; children: ReactNode; required?: boolean; hint?: string }) {
  return <label className="field"><span>{label}{required && <b> *</b>}</span>{children}{hint && <small>{hint}</small>}</label>
}

function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return <div className="page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{actions && <div className="flex flex-wrap gap-2">{actions}</div>}</div>
}

function Stat({ label, value, detail, icon, tone }: { label: string; value: number; detail: string; icon: ReactNode; tone: string }) {
  return <Card className="stat-card"><div className={`stat-icon stat-${tone}`}>{icon}</div><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div></Card>
}

function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const users = service.previewUsers()
  const [email, setEmail] = useState(users[0]?.email ?? '')
  const [password, setPassword] = useState(users.length ? PASSWORD : '')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const user = await service.login(email, password)
      if (!user) {
        setError(DATA_MODE === 'api' ? 'Email or password is incorrect, or this account is not in the Land Sourcing team.' : 'Use a preview account and the shared preview password.')
        return
      }
      onLogin(user)
    } catch {
      setError('The KENNIX server could not be reached. Try again in a moment.')
    } finally {
      setBusy(false)
    }
  }
  const choose = (user: User) => {
    setEmail(user.email)
    setPassword(PASSWORD)
    setError('')
  }
  return <main className="min-h-screen bg-[#eef3f6] lg:grid lg:grid-cols-[1.05fr_.95fr]"><section className="relative hidden overflow-hidden bg-[#10243e] p-12 text-white lg:flex lg:flex-col lg:justify-between"><div className="absolute -right-36 top-20 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl"/><div className="absolute -bottom-20 left-20 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl"/><div className="relative"><div className="flex items-center gap-3"><div className="brand-mark h-11 w-11">K</div><div><strong className="block tracking-[.2em]">KENNIX</strong><span className="text-xs text-slate-400">Homes built on clarity</span></div></div></div><div className="relative max-w-xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-300">Land sourcing workspace</p><h1 className="mt-5 text-5xl font-semibold leading-[1.08] tracking-tight">The right land option,<br/><span className="text-teal-300">sourced with clarity.</span></h1><p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">Work on requirements received from Telesales, coordinate with trusted local agents, and prepare verified options for the Kennix Sales team.</p><div className="mt-10 grid grid-cols-3 gap-4"><LoginBenefit icon={<ClipboardList/>} value="Clear intake" label="from Telesales"/><LoginBenefit icon={<Users/>} value="Agent network" label="for local sourcing"/><LoginBenefit icon={<CheckCircle2/>} value="Verified options" label="for Sales handoff"/></div></div><p className="relative text-xs text-slate-500">Kennix internal system · Authorised team members only</p></section><section className="flex min-h-screen items-center justify-center p-5 sm:p-10"><div className="w-full max-w-lg"><div className="mb-8 flex items-center gap-3 lg:hidden"><div className="brand-mark">K</div><div><strong className="block tracking-[.18em] text-[#10243e]">KENNIX</strong><span className="text-xs text-slate-500">Land Sourcing</span></div></div><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,36,62,.09)] sm:p-8"><div className="mb-7"><div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700"><LockKeyhole size={22}/></div><h2 className="text-2xl font-bold tracking-tight text-slate-950">Welcome back</h2><p className="mt-2 text-sm text-slate-600">Sign in to your Kennix land sourcing workspace.</p></div><form onSubmit={submit} className="space-y-4"><Field label="Work email" required><input autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} type="email"/></Field><Field label="Password" required><div className="relative"><input autoComplete="current-password" className="pr-11" value={password} onChange={event => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'}/><button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></Field>{error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}<Button type="submit" className="w-full" disabled={busy}>{busy ? 'Signing in…' : <>Sign in <ArrowRight size={16}/></>}</Button></form>{users.length > 0 && <><div className="my-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-400"><span className="h-px flex-1 bg-slate-200"/>Preview accounts<span className="h-px flex-1 bg-slate-200"/></div><div className="grid gap-2 sm:grid-cols-2">{users.map(user => <button type="button" key={user.id} onClick={() => choose(user)} className="rounded-lg border border-slate-200 p-3 text-left transition hover:border-teal-300 hover:bg-teal-50/50"><strong className="block text-xs text-slate-800">{user.name}</strong><span className="mt-1 block text-[10px] text-slate-500">{user.title}</span></button>)}</div><p className="mt-5 rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-500">Common password: <strong className="font-mono text-slate-700">{PASSWORD}</strong></p></>}</div></div></section></main>
}

function LoginBenefit({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return <div className="border-l border-white/15 pl-4"><span className="text-teal-300">{icon}</span><strong className="mt-3 block text-sm">{value}</strong><span className="mt-1 block text-xs leading-5 text-slate-400">{label}</span></div>
}

function Shell({ user, state, setState, onLogout, notify }: { user: User; state: AppState; setState: SetAppState; onLogout: () => void; notify: Notify }) {
  const [mobile, setMobile] = useState(false)
  const nav = <><NavLink to="/" end><Home size={17}/>Dashboard</NavLink><NavLink to="/requirements"><ClipboardList size={17}/>Land requirements</NavLink><NavLink to="/agents"><Database size={17}/>Agent pool</NavLink><p className="nav-label">Account</p><NavLink to="/profile"><UserRound size={17}/>Profile & settings</NavLink></>
  return <div className="app-shell"><aside className="sidebar"><div className="brand"><span className="brand-mark">K</span><div><strong>KENNIX</strong><span>Land Sourcing</span></div></div><nav className="side-nav">{nav}</nav><div className="sidebar-help"><MapPin size={17}/><div><strong>Sourcing workflow</strong><span>Telesales → Land Sourcing → Sales</span></div></div></aside>{mobile && <aside className="mobile-nav"><button className="mobile-nav-close" onClick={() => setMobile(false)}><X/></button><div className="brand"><span className="brand-mark">K</span><div><strong>KENNIX</strong><span>Land Sourcing</span></div></div><nav className="side-nav" onClick={() => setMobile(false)}>{nav}</nav></aside>}<main className="app-main"><header className="topbar"><button className="btn btn-ghost btn-icon lg:hidden" onClick={() => setMobile(true)}><Menu size={19}/></button><div className="global-search"><Search size={16}/><input placeholder="Search requirement, customer, agent, location…"/><kbd>⌘ K</kbd></div><div className="top-actions"><div className="user-trigger"><span className="avatar avatar-sm">{user.initials}</span><span className="user-meta"><strong>{user.name}</strong><small>{user.title}</small></span></div><button className="btn btn-ghost btn-icon" title="Sign out" onClick={onLogout}><LogOut size={17}/></button></div></header><div className="content"><Routes><Route index element={<Dashboard user={user} state={state}/>}/><Route path="requirements" element={<Requirements user={user} state={state}/>}/><Route path="requirements/:id" element={<RequirementDetail user={user} state={state} setState={setState} notify={notify}/>}/><Route path="agents" element={<AgentPool user={user} state={state} setState={setState} notify={notify}/>}/><Route path="profile" element={<Profile user={user}/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></div></main></div>
}

function visibleAssignments(user: User, assignments: Assignment[]) {
  return user.role === 'executive' ? assignments.filter(item => item.assignedTo === user.id) : assignments
}

function Dashboard({ user, state }: { user: User; state: AppState }) {
  const assignments = visibleAssignments(user, state.assignments)
  const counts = (status: AssignmentStatus) => assignments.filter(item => item.status === status).length
  const active = assignments.filter(item => !['Land Identified', 'Sent to Sales'].includes(item.status))
  return <><PageHeader eyebrow={user.role === 'executive' ? `Good evening, ${user.name.split(' ')[0]}` : 'Sourcing command centre'} title={user.role === 'executive' ? 'Your land sourcing work' : 'Land sourcing overview'} description="Review incoming requirements, connect with the right local agents, and return verified land details to Sales." actions={<Link className="btn btn-primary" to="/requirements">Open assignments <ChevronRight size={15}/></Link>}/><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Link className="stat-link" to="/requirements?status=New"><Stat label="New assignments" value={counts('New')} detail="Received from Telesales" icon={<ClipboardList size={20}/>} tone="navy"/></Link><Link className="stat-link" to="/requirements?status=Agent Search"><Stat label="Agent search" value={counts('Agent Search')} detail="Local agents being contacted" icon={<Users size={20}/>} tone="gold"/></Link><Link className="stat-link" to="/requirements?status=Options Found"><Stat label="Options found" value={counts('Options Found')} detail="Land details under review" icon={<MapPin size={20}/>} tone="teal"/></Link><Link className="stat-link" to="/requirements?status=Land Identified"><Stat label="Land identified" value={counts('Land Identified')} detail="Ready for Sales workflow" icon={<CheckCircle2 size={20}/>} tone="teal"/></Link></div><div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]"><Card><div className="section-title"><div><h2>Priority assignments</h2><p>Active requirements ordered by urgency</p></div><Link to="/requirements" className="text-xs font-bold text-teal-700">View all</Link></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Customer</th><th>Requirement</th><th>Location</th><th>Status</th><th>Priority</th><th></th></tr></thead><tbody>{active.slice(0, 6).map(item => <tr key={item.id}><td><strong className="block text-slate-800">{item.customerName}</strong><span className="text-[10px] text-slate-500">{item.journeyId}</span></td><td>{item.propertyType}</td><td>{item.preferredLocations.map(location => location.name).join(', ')}</td><td><Badge tone={statusTone(item.status)}>{item.status}</Badge></td><td><Badge tone={item.priority === 'High' ? 'red' : item.priority === 'Medium' ? 'amber' : 'slate'}>{item.priority}</Badge></td><td><Link to={`/requirements/${item.id}`}><ChevronRight size={16}/></Link></td></tr>)}</tbody></table></div></Card><Card><div className="section-title"><div><h2>Agent coverage</h2><p>Active pool by deal type</p></div></div><div className="space-y-4 p-5">{DEAL_TYPES.map(deal => <div key={deal} className="flex items-center justify-between rounded-lg bg-slate-50 p-3"><span className="text-xs font-semibold text-slate-700">{deal}</span><Badge tone="teal">{state.agents.filter(agent => agent.active && agent.dealsIn.includes(deal)).length} agents</Badge></div>)}<Link to="/agents" className="btn btn-secondary w-full">Search agent pool</Link></div></Card></div></>
}

function Requirements({ user, state }: { user: User; state: AppState }) {
  const [search, setSearch] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedStatus = searchParams.get('status')
  const status: AssignmentStatus | 'All' = requestedStatus && assignmentStatuses.includes(requestedStatus as AssignmentStatus) ? requestedStatus as AssignmentStatus : 'All'
  const changeStatus = (nextStatus: AssignmentStatus | 'All') => {
    const nextParams = new URLSearchParams(searchParams)
    if (nextStatus === 'All') nextParams.delete('status')
    else nextParams.set('status', nextStatus)
    setSearchParams(nextParams, { replace: true })
  }
  const assignments = visibleAssignments(user, state.assignments).filter(item => {
    const text = [item.id, item.journeyId, item.customerName, item.mobileNumber, item.propertyType, ...item.preferredLocations.flatMap(location => [location.name, location.pincode])].join(' ').toLowerCase()
    return (!search || text.includes(search.toLowerCase())) && (status === 'All' || item.status === status)
  })
  return <><PageHeader eyebrow="Telesales intake" title="Land requirements" description="Every assignment contains only the customer and property details approved for Land Sourcing."/><Card className="mb-5 p-4"><div className="grid gap-3 md:grid-cols-[1fr_260px]"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><input className="input input-with-icon" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search customer, Journey ID, mobile, location or pincode…"/></div><select aria-label="Assignment status" className="input" value={status} onChange={event => changeStatus(event.target.value as AssignmentStatus | 'All')}><option>All</option><option>New</option><option>Agent Search</option><option>Options Found</option><option>Land Identified</option><option>Sent to Sales</option></select></div></Card><Card><div className="table-wrap"><table className="data-table"><thead><tr><th>Customer</th><th>Reference</th><th>Preferred location</th><th>Property type</th><th>Status</th><th>Agents</th><th>Options</th><th></th></tr></thead><tbody>{assignments.map(item => <tr key={item.id}><td><strong className="block text-slate-800">{item.customerName}</strong><span className="text-[10px] text-slate-500">{item.mobileNumber}</span></td><td><Link to={`/requirements/${item.id}`}>{item.id}</Link><span className="mt-1 block text-[10px] text-slate-500">{item.journeyId}</span></td><td>{item.preferredLocations.map(location => <span key={location.pincode} className="block">{location.name} · {location.pincode}</span>)}</td><td>{item.propertyType}</td><td><Badge tone={statusTone(item.status)}>{item.status}</Badge></td><td>{item.selectedAgentIds.length}</td><td>{item.landOptions.length}</td><td><Link to={`/requirements/${item.id}`} className="btn btn-ghost btn-icon"><ChevronRight size={16}/></Link></td></tr>)}</tbody></table></div>{assignments.length === 0 && <div className="empty-state"><Filter className="empty-icon p-3"/><h3>No matching requirements</h3><p>Clear one or more filters to return to the assignment list.</p></div>}</Card></>
}

function RequirementDetail({ user, state, setState, notify }: { user: User; state: AppState; setState: SetAppState; notify: Notify }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const assignment = state.assignments.find(item => item.id === id)
  const [outreachAgent, setOutreachAgent] = useState('')
  const [outcome, setOutcome] = useState<Outreach['outcome']>('Will share options')
  const [outreachNotes, setOutreachNotes] = useState('')
  const [showOption, setShowOption] = useState(false)
  const [busy, setBusy] = useState(false)
  if (!assignment) return <Navigate to="/requirements" replace/>
  if (user.role === 'executive' && assignment.assignedTo !== user.id) return <Navigate to="/requirements" replace/>
  const recommended = matchingAgents(state.agents, assignment)
  const selectedOption = assignment.landOptions.find(option => option.status === 'Selected')
  const locked = isLocked(assignment)
  /** Runs one action through the service, then shows its result or the reason it was refused. */
  const run = async (work: () => Promise<Assignment>, message: string, after?: () => void) => {
    if (busy) return
    setBusy(true)
    try {
      const next = await work()
      setState(current => ({ ...current, assignments: current.assignments.map(item => item.id === next.id ? next : item) }))
      after?.()
      notify(message)
    } catch (error) {
      notify(errorMessage(error), 'error')
      // The screen may be out of date (someone else changed the requirement), so catch up.
      service.load().then(next => setState(next)).catch(() => undefined)
    } finally {
      setBusy(false)
    }
  }
  const toggleAgent = (agentId: string) => {
    const selected = assignment.selectedAgentIds.includes(agentId)
    void run(() => service.toggleAgent(assignment, agentId), selected ? 'Agent removed from assignment' : 'Agent added to assignment')
  }
  const logOutreach = (event: FormEvent) => {
    event.preventDefault()
    if (!outreachAgent || outreachNotes.trim().length < 5) return
    void run(() => service.logOutreach(assignment, { agentId: outreachAgent, outcome, notes: outreachNotes }, user), 'Agent outreach recorded', () => setOutreachNotes(''))
  }
  const addOption = (option: NewLandOption) => {
    void run(() => service.addOption(assignment, option), 'Land option added', () => setShowOption(false))
  }
  const selectOption = (optionId: string) => {
    void run(() => service.selectOption(assignment, optionId), 'Land option selected')
  }
  const identifyLand = () => {
    if (!selectedOption) return
    void run(() => service.markLandIdentified(assignment), 'Land identified and ready for Sales')
  }
  const sendToSales = () => {
    if (assignment.status !== 'Land Identified') return
    void run(() => service.sendToSales(assignment), 'Requirement sent to Sales')
  }
  return <><button onClick={() => navigate(-1)} className="mb-4 text-xs font-bold text-slate-500">← Back to requirements</button><Card className="overflow-hidden"><div className="bg-gradient-to-r from-[#10243e] to-[#17395f] p-6 text-white"><div className="flex flex-col justify-between gap-5 lg:flex-row"><div><div className="flex flex-wrap gap-2"><Badge tone="teal">{assignment.id}</Badge><Badge tone={statusTone(assignment.status)}>{assignment.status}</Badge><Badge tone={assignment.priority === 'High' ? 'red' : 'amber'}>{assignment.priority}</Badge></div><h1 className="mt-4 text-2xl font-bold">{assignment.customerName}</h1><p className="mt-1 text-sm text-slate-300">{assignment.propertyType} · {assignment.preferredLocations.map(location => location.name).join(', ')}</p></div><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => setShowOption(true)} disabled={locked}><Plus size={15}/> Add land option</Button>{assignment.status === 'Land Identified' && <Button onClick={sendToSales} disabled={busy}><Send size={15}/> Send to Sales</Button>}</div></div><div className="mt-5 grid gap-4 border-t border-white/10 pt-4 text-xs sm:grid-cols-2 lg:grid-cols-5"><Fact label="Journey ID" value={assignment.journeyId}/><Fact label="Mobile" value={assignment.mobileNumber}/><Fact label="Received" value={formatDate(assignment.receivedAt)}/><Fact label="Agents engaged" value={String(assignment.selectedAgentIds.length)}/><Fact label="Land options" value={String(assignment.landOptions.length)}/></div></div><div className="grid gap-5 p-5 xl:grid-cols-[1.15fr_.85fr]"><div className="space-y-5"><Card><div className="section-title"><div><h2>Recommended agents</h2><p>Matched by preferred city, pincode and deal type</p></div><Link to="/agents" className="text-xs font-bold text-teal-700">Open full pool</Link></div><div className="grid gap-3 p-4 md:grid-cols-2">{recommended.slice(0, 6).map(({ agent, score }) => <button key={agent.id} onClick={() => toggleAgent(agent.id)} disabled={locked || busy} aria-pressed={assignment.selectedAgentIds.includes(agent.id)} className={`rounded-xl border p-4 text-left transition disabled:cursor-not-allowed ${assignment.selectedAgentIds.includes(agent.id) ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:border-teal-300'}`}><div className="flex justify-between gap-2"><div><strong className="text-xs text-slate-900">{agent.agentName}</strong><p className="mt-1 text-[10px] text-slate-500">{agent.companyName}</p></div><Badge tone="teal">{score} match</Badge></div><p className="mt-3 text-[11px] text-slate-600">{agent.location}, {agent.city} · {agent.pincode}</p><p className="mt-1 text-[10px] text-slate-500">{agent.dealsIn.join(', ')}</p></button>)}</div></Card><Card><div className="section-title"><div><h2>Land options</h2><p>Compare sourced properties and select the best fit</p></div><Button variant="secondary" onClick={() => setShowOption(true)} disabled={locked}><Plus size={14}/> Add option</Button></div><div className="space-y-3 p-4">{assignment.landOptions.map(option => { const agent = state.agents.find(item => item.id === option.agentId); return <div key={option.id} className={`rounded-xl border p-4 ${option.status === 'Selected' ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><strong className="text-sm text-slate-900">{option.title}</strong><Badge tone={option.status === 'Selected' ? 'green' : option.status === 'Shortlisted' ? 'teal' : 'slate'}>{option.status}</Badge></div><p className="mt-1 text-xs text-slate-500">{option.location}, {option.city} · {option.pincode}</p></div><Button variant={option.status === 'Selected' ? 'secondary' : 'primary'} onClick={() => selectOption(option.id)} disabled={locked || busy || option.status === 'Selected'}>{option.status === 'Selected' ? 'Selected' : 'Select option'}</Button></div><div className="mt-4 grid gap-3 text-xs sm:grid-cols-3"><Fact light label="Area" value={option.area}/><Fact light label="Asking price" value={option.askingPrice}/><Fact light label="Agent" value={agent?.agentName ?? 'Unknown'}/></div><p className="mt-3 text-xs leading-5 text-slate-600">{option.notes}</p></div>})}{assignment.landOptions.length === 0 && <p className="py-8 text-center text-xs text-slate-500">No land options have been added yet.</p>}{selectedOption && assignment.status !== 'Land Identified' && assignment.status !== 'Sent to Sales' && <Button className="w-full" onClick={identifyLand} disabled={busy}><CheckCircle2 size={15}/> Mark selected option as Land Identified</Button>}</div></Card></div><div className="space-y-5"><Card className="p-5"><h2 className="text-sm font-bold text-slate-900">Telesales requirement</h2><dl className="mt-4 space-y-3 text-xs"><Summary label="Customer" value={assignment.customerName}/><Summary label="Mobile" value={assignment.mobileNumber}/><Summary label="Property type" value={assignment.propertyType}/><Summary label="Preferred location" value={assignment.preferredLocations.map(location => `${location.name} (${location.pincode})`).join(', ')}/></dl><p className="mt-4 rounded-lg bg-slate-50 p-3 text-[11px] leading-5 text-slate-600">{assignment.notes}</p></Card><Card><div className="section-title"><div><h2>Record agent outreach</h2><p>Keep sourcing conversations in the project history</p></div></div><form onSubmit={logOutreach} className="space-y-4 p-5"><fieldset disabled={locked} className="min-w-0 space-y-4">{locked && <p className="rounded-lg bg-slate-50 p-3 text-[11px] text-slate-600">Land is identified, so agents, outreach and options are locked.</p>}<Field label="Agent" required><select value={outreachAgent} onChange={event => setOutreachAgent(event.target.value)}><option value="">Select agent</option>{state.agents.filter(agent => assignment.selectedAgentIds.includes(agent.id)).map(agent => <option key={agent.id} value={agent.id}>{agent.agentName} · {agent.companyName}</option>)}</select></Field><Field label="Outcome" required><select value={outcome} onChange={event => setOutcome(event.target.value as Outreach['outcome'])}><option>No response</option><option>Will share options</option><option>Options received</option><option>Not available</option></select></Field><Field label="Notes" required><textarea value={outreachNotes} onChange={event => setOutreachNotes(event.target.value)} placeholder="What did the agent commit to share?"/></Field><Button type="submit" className="w-full" disabled={busy}><Phone size={15}/> Save outreach</Button></fieldset></form></Card><Card><div className="section-title"><div><h2>Outreach history</h2><p>{assignment.outreach.length} conversations recorded</p></div></div><div>{assignment.outreach.map(item => { const agent = state.agents.find(value => value.id === item.agentId); return <div key={item.id} className="metric-row"><span className="avatar avatar-sm">{initials(agent?.agentName ?? 'Agent')}</span><div><strong className="block text-xs text-slate-800">{agent?.agentName}</strong><p className="mt-1 text-[10px] text-slate-500">{item.outcome} · {formatDate(item.contactedAt)}</p><p className="mt-2 text-xs text-slate-600">{item.notes}</p></div></div>})}{assignment.outreach.length === 0 && <p className="p-6 text-center text-xs text-slate-500">No agent outreach recorded.</p>}</div></Card></div></div></Card>{showOption && <LandOptionDialog agents={state.agents} assignment={assignment} busy={busy} onClose={() => setShowOption(false)} onAdd={addOption}/>}</>
}

function LandOptionDialog({ agents, assignment, busy, onClose, onAdd }: { agents: Agent[]; assignment: Assignment; busy: boolean; onClose: () => void; onAdd: (option: NewLandOption) => void }) {
  const selectedAgents = agents.filter(agent => assignment.selectedAgentIds.includes(agent.id))
  const first = selectedAgents[0]
  const [form, setForm] = useState({ agentId: first?.id ?? '', title: '', location: first?.location ?? '', city: first?.city ?? '', pincode: first?.pincode ?? '', state: first?.state ?? '', area: '', askingPrice: '', ownership: 'Individual owner', notes: '' })
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!form.agentId || !form.title || !form.location || !form.area || !form.askingPrice || !form.notes) return
    onAdd(form)
  }
  const changeAgent = (agentId: string) => {
    const agent = agents.find(item => item.id === agentId)
    setForm(value => ({ ...value, agentId, location: agent?.location ?? '', city: agent?.city ?? '', pincode: agent?.pincode ?? '', state: agent?.state ?? '' }))
  }
  return <div className="dialog-overlay"><div className="dialog-content max-w-2xl"><button className="dialog-close" onClick={onClose}><X size={18}/></button><h2 className="text-xl font-bold text-slate-950">Add land option</h2><p className="mt-1 text-sm text-slate-500">Record the property details received from an engaged agent.</p><form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Source agent" required><select value={form.agentId} onChange={event => changeAgent(event.target.value)}><option value="">Select engaged agent</option>{selectedAgents.map(agent => <option key={agent.id} value={agent.id}>{agent.agentName} · {agent.companyName}</option>)}</select></Field><Field label="Option title" required><input value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="Example: 2,400 sq ft corner plot"/></Field><Field label="Location" required><input value={form.location} onChange={event => setForm({ ...form, location: event.target.value })}/></Field><Field label="City"><input value={form.city} onChange={event => setForm({ ...form, city: event.target.value })}/></Field><Field label="Pincode"><input value={form.pincode} onChange={event => setForm({ ...form, pincode: event.target.value })}/></Field><Field label="State"><input value={form.state} onChange={event => setForm({ ...form, state: event.target.value })}/></Field><Field label="Area" required><input value={form.area} onChange={event => setForm({ ...form, area: event.target.value })} placeholder="2,400 sq ft"/></Field><Field label="Asking price" required><input value={form.askingPrice} onChange={event => setForm({ ...form, askingPrice: event.target.value })} placeholder="₹1.45 Cr"/></Field><Field label="Ownership"><input value={form.ownership} onChange={event => setForm({ ...form, ownership: event.target.value })}/></Field><Field label="Verification notes" required><textarea value={form.notes} onChange={event => setForm({ ...form, notes: event.target.value })}/></Field><div className="dialog-footer sm:col-span-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" disabled={busy}><Plus size={15}/> Add option</Button></div></form></div></div>
}

function AgentPool({ user, state, setState, notify }: { user: User; state: AppState; setState: SetAppState; notify: Notify }) {
  const [search, setSearch] = useState('')
  const [deal, setDeal] = useState<DealType | 'All'>('All')
  const [showAdd, setShowAdd] = useState(false)
  const agents = useMemo(() => state.agents.filter(agent => matchesAgent(agent, search, deal)), [state.agents, search, deal])
  const [busy, setBusy] = useState(false)
  const addAgent = async (agent: NewAgent) => {
    setBusy(true)
    try {
      const next = await service.addAgent(agent)
      setState(current => ({ ...current, agents: [next, ...current.agents] }))
      setShowAdd(false)
      notify('Agent added to the pool')
    } catch (error) {
      notify(errorMessage(error), 'error')
    } finally {
      setBusy(false)
    }
  }
  return <><PageHeader eyebrow="Real-estate network" title="Agent pool" description="Search agents by agency, name, mobile, work area, city, pincode, state, or the land types they deal in. Agents can also register themselves through the agent registration form." actions={canManageAgents(user) && <Button onClick={() => setShowAdd(true)}><Plus size={15}/> Add agent</Button>}/><Card className="mb-5 p-4"><div className="grid gap-3 md:grid-cols-[1fr_220px]"><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input className="input input-with-icon" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name, company, area, city, pincode, mobile…"/></div><select className="input" value={deal} onChange={event => setDeal(event.target.value as DealType | 'All')}><option>All</option>{DEAL_TYPES.map(type => <option key={type}>{type}</option>)}</select></div></Card><Card><div className="table-wrap"><table className="data-table"><thead><tr><th>Agent</th><th>Agency</th><th>Contact</th><th>Work areas</th><th>City / state</th><th>Pincode</th><th>Land types</th><th>Brokerage</th><th>KENNIX manager</th><th>Status</th></tr></thead><tbody>{agents.map(agent => <tr key={agent.id}><td><div className="person"><span className="avatar avatar-sm">{initials(agent.agentName)}</span><div><strong>{agent.agentName}</strong><span>{agent.id}{agent.source === 'Self-registration' ? ' · self-registered' : ''}</span></div></div></td><td>{agent.companyName}</td><td><strong className="block text-slate-700">{agent.mobile}</strong>{agent.alternateMobile && <span className="block text-[10px] text-slate-500">WhatsApp {agent.alternateMobile}</span>}<span className="text-[10px] text-slate-500">{agent.email}</span></td><td>{agent.primaryWorkArea || agent.location}{agent.otherAreas.length > 0 && <span className="block text-[10px] text-slate-500">+ {agent.otherAreas.join(', ')}</span>}</td><td>{agent.city}<span className="block text-[10px] text-slate-500">{agent.state}</span></td><td>{agent.pincode}</td><td><div className="flex flex-wrap gap-1">{agent.dealsIn.map(item => <Badge key={item} tone="teal">{item}</Badge>)}{agent.dealsIn.length === 0 && <span className="text-slate-400">—</span>}</div></td><td>{agent.brokeragePercent}%</td><td>{agent.kennixManager || '—'}</td><td><Badge tone={agent.active ? 'green' : 'slate'}>{agent.active ? 'Active' : 'Inactive'}</Badge></td></tr>)}</tbody></table></div>{agents.length === 0 && <div className="empty-state"><Search className="empty-icon p-3"/><h3>No agents found</h3><p>Try a different name, area, city, pincode, or deal type.</p></div>}</Card>{showAdd && <AgentDialog busy={busy} onClose={() => setShowAdd(false)} onAdd={addAgent}/>}</>
}

function AgentDialog({ busy, onClose, onAdd }: { busy: boolean; onClose: () => void; onAdd: (agent: NewAgent) => void }) {
  // The same fields as the public agent registration form; bold (required) fields are marked *.
  const [form, setForm] = useState({ companyName: '', agentName: '', mobile: '', alternateMobile: '', email: '', address: '', location: '', city: '', pincode: '', state: '', primaryWorkArea: '', otherAreas: '', dealsIn: [] as DealType[], brokeragePercent: '', kennixManager: '', active: true })
  const [error, setError] = useState('')
  const set = (key: keyof typeof form) => (event: { target: { value: string } }) => setForm(value => ({ ...value, [key]: event.target.value }))
  const toggleDeal = (deal: DealType) => setForm(value => ({ ...value, dealsIn: value.dealsIn.includes(deal) ? value.dealsIn.filter(item => item !== deal) : [...value.dealsIn, deal] }))
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const required = [form.agentName, form.companyName, form.mobile, form.address, form.location, form.city, form.state, form.pincode, form.primaryWorkArea, form.brokeragePercent]
    if (required.some(value => !value.trim())) { setError('Fill in every field marked *'); return }
    if (!/^[1-9]\d{5}$/.test(form.pincode.trim())) { setError('Enter a 6-digit pincode'); return }
    const brokerage = Number(form.brokeragePercent)
    if (!(brokerage > 0 && brokerage <= 10)) { setError('Brokerage must be more than 0% and at most 10%'); return }
    onAdd({ ...form, brokeragePercent: brokerage, otherAreas: form.otherAreas.split(',').map(area => area.trim()).filter(Boolean) })
  }
  return <div className="dialog-overlay"><div className="dialog-content max-w-2xl"><button className="dialog-close" onClick={onClose}><X size={18}/></button><h2 className="text-xl font-bold text-slate-950">Add real-estate agent</h2><p className="mt-1 text-sm text-slate-500">This record becomes discoverable across all Land Sourcing assignments.</p><form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
    <Field label="Agent name" required><input value={form.agentName} onChange={set('agentName')}/></Field>
    <Field label="Agency name" required><input value={form.companyName} onChange={set('companyName')}/></Field>
    <Field label="Mobile no" required><input value={form.mobile} onChange={set('mobile')}/></Field>
    <Field label="Alternate / WhatsApp no"><input value={form.alternateMobile} onChange={set('alternateMobile')}/></Field>
    <Field label="Email id"><input type="email" value={form.email} onChange={set('email')}/></Field>
    <Field label="Address" required><input value={form.address} onChange={set('address')}/></Field>
    <Field label="Location" required><input value={form.location} onChange={set('location')}/></Field>
    <Field label="City" required><input value={form.city} onChange={set('city')}/></Field>
    <Field label="State" required><input value={form.state} onChange={set('state')}/></Field>
    <Field label="Pincode" required><input value={form.pincode} onChange={set('pincode')} inputMode="numeric" maxLength={6}/></Field>
    <Field label="Primary work area" required><input value={form.primaryWorkArea} onChange={set('primaryWorkArea')}/></Field>
    <Field label="Other areas" hint="Separate with commas"><input value={form.otherAreas} onChange={set('otherAreas')}/></Field>
    <div className="sm:col-span-2"><p className="mb-2 text-xs font-semibold text-slate-700">Land type</p><div className="grid gap-2 sm:grid-cols-2">{DEAL_TYPES.map(deal => <label key={deal} className="checkbox-row"><input type="checkbox" checked={form.dealsIn.includes(deal)} onChange={() => toggleDeal(deal)}/><span className="text-xs font-semibold">{deal}</span></label>)}</div></div>
    <Field label="Brokerage %" required><input value={form.brokeragePercent} onChange={set('brokeragePercent')} inputMode="decimal"/></Field>
    <Field label="KENNIX manager name"><select value={form.kennixManager} onChange={set('kennixManager')}><option value="">None</option>{landSourcingTeam.map(member => <option key={member.id}>{member.name}</option>)}</select></Field>
    <Field label="Agent status"><select value={form.active ? 'Active' : 'Inactive'} onChange={event => setForm(value => ({ ...value, active: event.target.value === 'Active' }))}><option>Active</option><option>Inactive</option></select></Field>
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">{error}</p>}
    <div className="dialog-footer sm:col-span-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" disabled={busy}><Plus size={15}/> Add agent</Button></div></form></div></div>
}

function Profile({ user }: { user: User }) {
  return <><PageHeader eyebrow="Account" title="Profile & settings" description="Preview identity and Land Sourcing access level."/><div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]"><Card className="p-6 text-center"><span className="avatar avatar-lg">{user.initials}</span><h2 className="mt-4 text-lg font-bold text-slate-900">{user.name}</h2><p className="mt-1 text-xs text-slate-500">{user.title}</p><Badge tone="teal">{user.role.replace('_', ' ')}</Badge></Card><Card className="p-6"><h2 className="text-sm font-bold text-slate-900">Access summary</h2><div className="mt-5 grid gap-3 sm:grid-cols-2"><Summary label="Email" value={user.email}/><Summary label="Assignment scope" value={user.role === 'executive' ? 'Assigned requirements only' : user.role === 'team_lead' ? 'Your team\'s requirements' : 'All Land Sourcing requirements'}/><Summary label="Agent pool" value="Search and view"/><Summary label="Agent maintenance" value={canManageAgents(user) ? 'Add and maintain agents' : 'Team Lead / Manager only'}/></div></Card></div></>
}

function Fact({ label, value, light = false }: { label: string; value: string; light?: boolean }) {
  return <div><span className={`block text-[10px] uppercase tracking-wide ${light ? 'text-slate-400' : 'text-slate-400'}`}>{label}</span><strong className={`mt-1 block ${light ? 'text-slate-800' : 'text-slate-100'}`}>{value}</strong></div>
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0"><dt className="text-slate-500">{label}</dt><dd className="text-right font-semibold text-slate-800">{value}</dd></div>
}

export default function App() {
  const [user, setUser] = useState<User | null>(() => service.currentUser())
  // Local mode has its data straight away; API mode loads it after sign-in.
  const [state, setState] = useState<AppState | null>(() => user ? service.cachedState() : null)
  const [loadError, setLoadError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null)
  useEffect(() => {
    if (!user) return
    let cancelled = false
    service.load()
      .then(next => { if (!cancelled) { setState(next); setLoadError('') } })
      .catch(error => { if (!cancelled) setLoadError(errorMessage(error)) })
    return () => { cancelled = true }
  }, [user, attempt])
  const notify: Notify = (message, tone = 'success') => {
    setToast({ message, tone })
    window.setTimeout(() => setToast(null), tone === 'error' ? 4500 : 2600)
  }
  const login = (next: User) => setUser(next)
  const logout = async () => {
    await service.logout()
    setUser(null)
    setState(null)
  }
  const setAppState: SetAppState = update => setState(current => current && (typeof update === 'function' ? update(current) : update))
  const page = !user
    ? <Login onLogin={login}/>
    : state
      ? <Shell user={user} state={state} setState={setAppState} onLogout={logout} notify={notify}/>
      : <main className="grid min-h-screen place-items-center bg-[#eef3f6] p-6 text-center"><div>{loadError ? <><p role="alert" className="text-sm font-semibold text-red-700">{loadError}</p><div className="mt-4 flex justify-center gap-2"><Button onClick={() => setAttempt(value => value + 1)}>Try again</Button><Button variant="secondary" onClick={logout}>Sign out</Button></div></> : <p className="text-sm text-slate-500">Loading land requirements…</p>}</div></main>
  return <>{page} {toast && <div role="status" className={`fixed bottom-5 right-5 z-[100] max-w-sm rounded-xl border bg-white px-4 py-3 text-xs font-semibold text-slate-800 shadow-xl ${toast.tone === 'error' ? 'border-red-200' : 'border-teal-200'}`}>{toast.tone === 'error' ? <AlertCircle className="mr-2 inline text-red-600" size={16}/> : <CheckCircle2 className="mr-2 inline text-teal-600" size={16}/>}{toast.message}</div>}</>
}
