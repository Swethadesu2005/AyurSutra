import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, CalendarDays, ClipboardList, CreditCard, LayoutDashboard, LogOut, Package, Plus, Search, Stethoscope, Trash2, Users, X, CheckCircle2, AlertCircle, Menu } from 'lucide-react';
import { request } from './api';

const nav = [
  { id: 'Dashboard', icon: LayoutDashboard },
  { id: 'Patients', icon: Users },
  { id: 'Appointments', icon: CalendarDays },
  { id: 'Billing', icon: CreditCard },
  { id: 'Inventory', icon: Package },
];
const blank = {
  Patients: { name:'', age:'', gender:'Prefer not to say', phone:'', email:'', notes:'' },
  Appointments: { patient:'', date:'', reason:'', status:'Scheduled' },
  Billing: { patient:'', description:'Consultation', amount:'', status:'Pending', billDate:new Date().toISOString().slice(0,10) },
  Inventory: { name:'', category:'Medicine', quantity:'0', unit:'units', reorderLevel:'5', unitPrice:'0' }
};
const endpoints = { Patients:'/patients', Appointments:'/appointments', Billing:'/bills', Inventory:'/inventory' };
const dateFmt = v => v ? new Date(v).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}) : '—';
const money = v => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(Number(v||0));

export default function App() {
  const [token,setToken] = useState(() => localStorage.getItem('ayursutra_token') || '');
  const [user,setUser] = useState(() => JSON.parse(localStorage.getItem('ayursutra_user') || 'null'));
  const [authMode,setAuthMode] = useState('login');
  const [authForm,setAuthForm] = useState({name:'',email:'',password:''});
  const [section,setSection] = useState('Dashboard');
  const [data,setData] = useState({Patients:[],Appointments:[],Billing:[],Inventory:[]});
  const [form,setForm] = useState(null);
  const [search,setSearch] = useState('');
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [mobileNav,setMobileNav] = useState(false);

  const flash = (message, isError=false) => { setNotice(isError?'':message); setError(isError?message:''); };
  const load = useCallback(async () => {
    if (!token) return;
    try {
      const pairs = await Promise.all(Object.entries(endpoints).map(async ([key,path]) => [key, await request(path,{token})]));
      setData(Object.fromEntries(pairs));
    } catch(e) { flash(e.message,true); }
  }, [token]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!notice && !error) return; const id=setTimeout(()=>{setNotice('');setError('');},4500); return ()=>clearTimeout(id); }, [notice,error]);

  const logout = () => { localStorage.removeItem('ayursutra_token'); localStorage.removeItem('ayursutra_user'); setToken(''); setUser(null); setData({Patients:[],Appointments:[],Billing:[],Inventory:[]}); };
  const authSubmit = async e => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const result = await request(`/auth/${authMode}`,{method:'POST',body:JSON.stringify(authForm)});
      localStorage.setItem('ayursutra_token',result.token); localStorage.setItem('ayursutra_user',JSON.stringify(result.user));
      setToken(result.token); setUser(result.user); setAuthForm({name:'',email:'',password:''}); flash(`Welcome${result.user.name ? ', '+result.user.name.split(' ')[0] : ''}!`);
    } catch(e) { flash(e.message,true); } finally { setBusy(false); }
  };

  const counts = useMemo(() => ({
    Patients:data.Patients.length,
    Appointments:data.Appointments.filter(x=>x.status==='Scheduled').length,
    Billing:data.Billing.filter(x=>x.status==='Pending').reduce((sum,x)=>sum+Number(x.amount||0),0),
    Inventory:data.Inventory.filter(x=>Number(x.quantity)<=Number(x.reorderLevel)).length
  }),[data]);

  const openForm = () => { setError(''); setForm({...blank[section]}); };
  const saveRecord = async e => {
    e.preventDefault(); setBusy(true);
    try {
      await request(endpoints[section],{method:'POST',token,body:JSON.stringify(form)});
      setForm(null); flash(`${section.slice(0,-1)} saved successfully.`); await load();
    } catch(e) { flash(e.message,true); } finally { setBusy(false); }
  };
  const removeRecord = async (sectionName,id) => {
    if (!window.confirm('Delete this record? This cannot be undone.')) return;
    try { await request(`${endpoints[sectionName]}/${id}`,{method:'DELETE',token}); flash('Record deleted.'); await load(); }
    catch(e) { flash(e.message,true); }
  };

  if (!token) return <div className="auth-page"><div className="auth-decoration"><div className="brand-mark"><Stethoscope size={26}/></div><p className="eyebrow">CARE, ORGANIZED</p><h1>Better care starts with a <em>clearer picture.</em></h1><p className="auth-copy">One calm workspace for your clinic's patients, appointments, billing, and supplies.</p><div className="auth-mini"><span><CheckCircle2 size={16}/> Patient records</span><span><CheckCircle2 size={16}/> Appointment planning</span><span><CheckCircle2 size={16}/> Stock visibility</span></div><div className="leaf leaf-one"/><div className="leaf leaf-two"/></div><div className="auth-panel"><form className="auth-form" onSubmit={authSubmit}><div className="brand-inline"><span className="brand-mark small"><Stethoscope size={20}/></span><span>AyurSutra</span></div><p className="eyebrow">{authMode==='login'?'WELCOME BACK':'GET STARTED'}</p><h2>{authMode==='login'?'Sign in to your clinic':'Create your workspace'}</h2><p className="muted">{authMode==='login'?'Pick up where your team left off.':'Set up a secure account for your clinic.'}</p>{authMode==='register'&&<label>Full name<input required maxLength="80" value={authForm.name} onChange={e=>setAuthForm({...authForm,name:e.target.value})} placeholder="Dr. Ananya Rao"/></label>}<label>Email address<input type="email" required value={authForm.email} onChange={e=>setAuthForm({...authForm,email:e.target.value})} placeholder="you@clinic.com"/></label><label>Password<input type="password" required minLength={authMode==='register'?8:1} value={authForm.password} onChange={e=>setAuthForm({...authForm,password:e.target.value})} placeholder={authMode==='register'?'At least 8 characters':'Enter your password'}/></label>{error&&<div className="alert error"><AlertCircle size={16}/>{error}</div>}<button className="primary full" disabled={busy}>{busy?'Please wait…':authMode==='login'?'Sign in':'Create account'}</button><p className="switch-auth">{authMode==='login'?"New to AyurSutra?":"Already have an account?"} <button type="button" className="text-button" onClick={()=>{setAuthMode(authMode==='login'?'register':'login');setError('');}}>{authMode==='login'?'Create an account':'Sign in'}</button></p><p className="tiny-note">Demo project · Use synthetic patient information only.</p></form></div></div>;

  const visible = (data[section]||[]).filter(item => JSON.stringify(item).toLowerCase().includes(search.toLowerCase()));
  const patientName = p => typeof p==='object' ? p?.name || 'Unknown patient' : data.Patients.find(x=>x._id===p)?.name || 'Unknown patient';
  const titleMap = {Dashboard:'Your clinic at a glance',Patients:'Patient directory',Appointments:'Appointment calendar',Billing:'Billing & payments',Inventory:'Medicine & supplies'};
  const subtitleMap = {Dashboard:'A thoughtful overview of today’s clinic operations.',Patients:'Keep patient details organized and easy to find.',Appointments:'Plan visits and keep track of appointment status.',Billing:'Track consultation charges and outstanding payments.',Inventory:'Know what you have before you run out.'};

  const renderTable = () => {
    if (!visible.length) return <div className="empty"><div className="empty-icon"><ClipboardList size={25}/></div><h3>{search?'No matching records':'Nothing here yet'}</h3><p>{search?'Try another search term.':'Add your first record to get started.'}</p>{!search&&<button className="primary" onClick={openForm}><Plus size={16}/> Add {section.slice(0,-1)}</button>}</div>;
    if(section==='Patients') return <div className="table-wrap"><table><thead><tr><th>Patient</th><th>Contact</th><th>Age / gender</th><th>Added</th><th></th></tr></thead><tbody>{visible.map(p=><tr key={p._id}><td><div className="person"><span className="avatar">{p.name?.slice(0,1).toUpperCase()}</span><div><strong>{p.name}</strong><small>{p.email||'No email added'}</small></div></div></td><td>{p.phone||'—'}</td><td>{p.age??'—'} / {p.gender||'—'}</td><td>{dateFmt(p.createdAt)}</td><td><button className="icon-button danger-hover" aria-label="Delete patient" onClick={()=>removeRecord('Patients',p._id)}><Trash2 size={16}/></button></td></tr>)}</tbody></table></div>;
    if(section==='Appointments') return <div className="table-wrap"><table><thead><tr><th>Patient</th><th>Date & time</th><th>Reason</th><th>Status</th><th></th></tr></thead><tbody>{visible.map(a=><tr key={a._id}><td><strong>{patientName(a.patient)}</strong></td><td>{new Date(a.date).toLocaleString()}</td><td>{a.reason||'Consultation'}</td><td><span className={`status ${a.status?.toLowerCase()}`}>{a.status}</span></td><td><button className="icon-button danger-hover" aria-label="Delete appointment" onClick={()=>removeRecord('Appointments',a._id)}><Trash2 size={16}/></button></td></tr>)}</tbody></table></div>;
    if(section==='Billing') return <div className="table-wrap"><table><thead><tr><th>Bill</th><th>Patient</th><th>Date</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>{visible.map(b=><tr key={b._id}><td><strong>{b.description||'Consultation'}</strong><small className="cell-sub">{b._id.slice(-6).toUpperCase()}</small></td><td>{patientName(b.patient)}</td><td>{dateFmt(b.billDate)}</td><td><strong>{money(b.amount)}</strong></td><td><span className={`status ${b.status?.toLowerCase()}`}>{b.status}</span></td><td><button className="icon-button danger-hover" aria-label="Delete bill" onClick={()=>removeRecord('Billing',b._id)}><Trash2 size={16}/></button></td></tr>)}</tbody></table></div>;
    return <div className="table-wrap"><table><thead><tr><th>Item</th><th>Category</th><th>Quantity</th><th>Unit price</th><th>Stock status</th><th></th></tr></thead><tbody>{visible.map(i=><tr key={i._id}><td><strong>{i.name}</strong></td><td>{i.category}</td><td>{i.quantity} {i.unit}</td><td>{money(i.unitPrice)}</td><td><span className={`status ${Number(i.quantity)<=Number(i.reorderLevel)?'pending':'paid'}`}>{Number(i.quantity)<=Number(i.reorderLevel)?'Low stock':'In stock'}</span></td><td><button className="icon-button danger-hover" aria-label="Delete item" onClick={()=>removeRecord('Inventory',i._id)}><Trash2 size={16}/></button></td></tr>)}</tbody></table></div>;
  };

  const field = (key,label,type='text',opts=null) => <label key={key}>{label}{opts?<select required={['patient','status','gender'].includes(key)} value={form[key]??''} onChange={e=>setForm({...form,[key]:e.target.value})}>{opts.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>:<input required={['name','date','amount','quantity'].includes(key)} type={type} min={type==='number'?'0':undefined} value={form[key]??''} onChange={e=>setForm({...form,[key]:e.target.value})} />}</label>;
  const patientOptions = [{value:'',label:'Select a patient'},...data.Patients.map(p=>({value:p._id,label:p.name}))];
  const renderForm = () => {
    if(section==='Patients') return <>{field('name','Full name')}{field('age','Age','number')}{field('gender','Gender','text',[{value:'Prefer not to say',label:'Prefer not to say'},{value:'Female',label:'Female'},{value:'Male',label:'Male'},{value:'Other',label:'Other'}])}{field('phone','Phone number','tel')}{field('email','Email','email')}<label className="span-two">Notes<textarea rows="3" maxLength="2000" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label></>;
    if(section==='Appointments') return <>{field('patient','Patient','text',patientOptions)}{field('date','Date and time','datetime-local')}{field('reason','Reason')}{field('status','Status','text',[{value:'Scheduled',label:'Scheduled'},{value:'Completed',label:'Completed'},{value:'Cancelled',label:'Cancelled'}])}</>;
    if(section==='Billing') return <>{field('patient','Patient','text',patientOptions)}{field('description','Description')}{field('amount','Amount (INR)','number')}{field('billDate','Bill date','date')}{field('status','Payment status','text',[{value:'Pending',label:'Pending'},{value:'Paid',label:'Paid'}])}</>;
    return <>{field('name','Item name')}{field('category','Category')}{field('quantity','Quantity','number')}{field('unit','Unit')}{field('reorderLevel','Low-stock threshold','number')}{field('unitPrice','Unit price (INR)','number')}</>;
  };

  return <div className="app-shell">
    {mobileNav&&<button className="mobile-scrim" onClick={()=>setMobileNav(false)} aria-label="Close menu"/>}
    <aside className={`sidebar ${mobileNav?'show-mobile':''}`}><div className="brand"><span className="brand-mark"><Stethoscope size={23}/></span><div><strong>AyurSutra</strong><small>CLINIC WORKSPACE</small></div><button className="close-nav" onClick={()=>setMobileNav(false)}><X size={18}/></button></div><div className="workspace-label">WORKSPACE</div><nav>{nav.map(item=>{const Icon=item.icon;return <button key={item.id} className={`nav-item ${section===item.id?'active':''}`} onClick={()=>{setSection(item.id);setSearch('');setMobileNav(false);}}><Icon size={18}/><span>{item.id}</span>{item.id==='Appointments'&&counts.Appointments>0&&<span className="nav-count">{counts.Appointments}</span>}</button>})}</nav><div className="sidebar-bottom"><div className="help-card"><span className="help-icon"><Activity size={17}/></span><strong>Care, in sync.</strong><p>Your clinic essentials, all in one place.</p></div><div className="user-card"><span className="avatar user-avatar">{user?.name?.slice(0,1).toUpperCase()||'U'}</span><div className="user-details"><strong>{user?.name||'Clinic user'}</strong><small>{user?.email}</small></div><button className="icon-button" onClick={logout} title="Sign out" aria-label="Sign out"><LogOut size={17}/></button></div></div></aside>
    <main className="main-area"><header className="topbar"><button className="menu-button icon-button" onClick={()=>setMobileNav(true)} aria-label="Open menu"><Menu size={20}/></button><div className="breadcrumb">Workspace <span>/</span> <strong>{section}</strong></div><div className="topbar-right"><span className="online-dot"/><span>Workspace active</span><span className="top-avatar">{user?.name?.slice(0,1).toUpperCase()||'U'}</span></div></header>
    <div className="content"><div className="page-heading"><div><p className="eyebrow">{section==='Dashboard'?'OVERVIEW':'CLINIC MANAGEMENT'}</p><h1>{titleMap[section]}</h1><p className="muted">{subtitleMap[section]}</p></div>{section!=='Dashboard'&&<button className="primary" onClick={openForm}><Plus size={17}/> Add {section.slice(0,-1)}</button>}</div>
      {notice&&<div className="alert success"><CheckCircle2 size={17}/>{notice}</div>}{error&&<div className="alert error"><AlertCircle size={17}/>{error}</div>}
      {section==='Dashboard'?<><div className="welcome-banner"><div><span className="welcome-tag"><Activity size={14}/> YOUR DAILY OVERVIEW</span><h2>Good to see you, {user?.name?.split(' ')[0]||'there'}.</h2><p>Small details make a healthier, smoother day. Here's how your clinic is doing.</p></div><div className="banner-art"><div className="art-circle"><Stethoscope size={54}/></div><span className="art-leaf leaf-a"/><span className="art-leaf leaf-b"/></div></div><div className="stats-grid"><Stat icon={Users} label="Total patients" value={counts.Patients} note="Registered in your workspace" tone="teal"/><Stat icon={CalendarDays} label="Upcoming appointments" value={counts.Appointments} note="Currently scheduled" tone="blue"/><Stat icon={CreditCard} label="Pending payments" value={money(counts.Billing)} note="Outstanding bill total" tone="amber"/><Stat icon={Package} label="Low-stock items" value={counts.Inventory} note="At or below reorder level" tone="rose"/></div><div className="dashboard-grid"><section className="panel"><div className="panel-heading"><div><h3>Recent patients</h3><p>Your latest registrations</p></div><button className="subtle-button" onClick={()=>setSection('Patients')}>View all <span>→</span></button></div>{data.Patients.length===0?<MiniEmpty text="Your patient list will appear here."/>:<div className="recent-list">{data.Patients.slice(0,5).map(p=><div className="recent-row" key={p._id}><span className="avatar">{p.name?.slice(0,1).toUpperCase()}</span><div className="recent-person"><strong>{p.name}</strong><small>{p.phone||p.email||'No contact details'}</small></div><span className="recent-date">{dateFmt(p.createdAt)}</span></div>)}</div>}</section><section className="panel"><div className="panel-heading"><div><h3>Next appointments</h3><p>Keep the day on track</p></div><button className="subtle-button" onClick={()=>setSection('Appointments')}>View all <span>→</span></button></div>{data.Appointments.filter(a=>a.status==='Scheduled').length===0?<MiniEmpty text="Scheduled appointments will appear here."/>:<div className="recent-list">{data.Appointments.filter(a=>a.status==='Scheduled').slice(0,5).map(a=><div className="recent-row" key={a._id}><span className="date-tile"><CalendarDays size={17}/></span><div className="recent-person"><strong>{patientName(a.patient)}</strong><small>{a.reason||'Consultation'}</small></div><span className="recent-date">{dateFmt(a.date)}</span></div>)}</div>}</section></div><div className="bottom-note"><span><CheckCircle2 size={16}/></span><p><strong>A little note on privacy</strong> — This portfolio demo is intended for synthetic data. Never enter real patient medical information into an unreviewed demo application.</p></div></>:<section className="panel records-panel"><div className="records-toolbar"><div><h3>{section}</h3><p>{visible.length} {visible.length===1?'record':'records'} found</p></div><div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${section.toLowerCase()}…`}/>{search&&<button className="icon-button" onClick={()=>setSearch('')} aria-label="Clear search"><X size={15}/></button>}</div></div>{renderTable()}</section>}
    </div><footer className="footer"><span>© {new Date().getFullYear()} AyurSutra</span><span>Made for more mindful clinic management <span className="footer-heart">♥</span></span></footer></main>
    {form&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setForm(null);}}><form className="modal" onSubmit={saveRecord}><div className="modal-heading"><div><p className="eyebrow">NEW RECORD</p><h2>Add {section.slice(0,-1).toLowerCase()}</h2><p className="muted">Fill in the details below to save this record.</p></div><button type="button" className="icon-button" onClick={()=>setForm(null)} aria-label="Close"><X size={20}/></button></div>{['Appointments','Billing'].includes(section)&&data.Patients.length===0?<div className="alert error">Add a patient first before creating this record.</div>:<div className="form-grid">{renderForm()}</div>}<div className="modal-actions"><button type="button" className="secondary" onClick={()=>setForm(null)}>Cancel</button><button className="primary" disabled={busy||(['Appointments','Billing'].includes(section)&&data.Patients.length===0)}>{busy?'Saving…':'Save record'}</button></div></form></div>}
  </div>;
}
function Stat({icon:Icon,label,value,note,tone}) { return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={20}/></div><p className="stat-label">{label}</p><div className="stat-value">{value}</div><p className="stat-note">{note}</p></div>; }
function MiniEmpty({text}) { return <div className="mini-empty"><span><ClipboardList size={20}/></span><p>{text}</p></div>; }
