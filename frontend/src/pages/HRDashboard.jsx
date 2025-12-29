import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import PieChart from '../components/PieChart'

export default function HRDashboard(){
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', experienceLevel: 'fresher' });
  const [msg, setMsg] = useState(null);

  const load = async () => {
    setLoading(true);
    try{
      const res = await api.get('/hr/employees');
      setEmployees(res.data.employees || []);
    }catch(err){ console.error(err); }
    setLoading(false);
  }

  useEffect(()=>{ load(); },[]);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [viewDocs, setViewDocs] = useState(null);

  const change = e => setForm(prev=>({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault(); setMsg(null);
    try{
      const res = await api.post('/hr/employee', form);
      setMsg({ success: `Employee created. Temp password: ${res.data.tempPassword}` });
      setForm({ name:'', email:'', phone:'', password:'', experienceLevel: 'fresher' });
      load();
    }catch(err){ setMsg({ error: err?.response?.data?.message || err.message }); }
  }

  const openView = async (emp) => {
    setViewingEmployee(emp);
    try{
      const res = await api.get(`/hr/employee/${emp._id}/status`);
      setViewDocs(res.data.docs || null);
    }catch(e){ console.error(e); setViewDocs(null); }
  }

  const closeView = () => { setViewingEmployee(null); setViewDocs(null); }

  const sendRemind = async (employeeId) => {
    try{
      await api.post(`/hr/employee/${employeeId}/remind`, { message: 'Reminder: please complete your onboarding documents.' });
      alert('Reminder sent');
    }catch(e){ console.error(e); alert('Failed to send reminder'); }
  }

  const filtered = employees;

  return (
    <div className="p-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">HR Dashboard</h1>
          <div className="muted">Manage your team and onboarding tasks</div>
        </div>
        <div className="flex items-center gap-3">
          {/* profile link removed from header per request */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card shadow-accent">
          <div className="text-sm text-slate-500">Employees</div>
          <div className="text-2xl font-bold">{employees.length}</div>
        </div>
        <div className="stat-card shadow-accent">
          <div className="text-sm text-slate-500">Average Onboarding</div>
          <div className="text-2xl font-bold">{Math.round((employees.reduce((s,e)=>s+(e.onboarding?.completionPercent||0),0) || 0) / (employees.length||1))}%</div>
        </div>
        <div className="stat-card shadow-accent">
          <div className="text-sm text-slate-500">Onboarding Status</div>
          <div className="mt-3">
            {/* calculate completed vs pending counts */}
            {(() => {
              const completed = employees.filter(e => (e.onboarding?.completionPercent || 0) >= 100).length;
              const pending = employees.length - completed;
              return (
                <PieChart data={[{ label: 'Completed', value: completed }, { label: 'Pending', value: pending }]} size={120} innerRadius={40} colors={[ '#10B981', '#F59E0B' ]} />
              )
            })()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">My Employees</h3>
            <div className="text-sm muted">{filtered.length} results</div>
          </div>

          {loading ? <div>Loading...</div> : (
            <div className="grid grid-cols-1 gap-3">
              {filtered.map(emp => (
                <div key={emp._id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[color:var(--brand-300)] to-[color:var(--brand-500)] text-white flex items-center justify-center font-semibold text-lg">{(emp.name||'').slice(0,1).toUpperCase()}</div>
                    <div>
                      <div className="font-medium">{emp.name}</div>
                      <div className="text-sm text-slate-500">{emp.email}</div>
                    </div>
                  </div>
                  <div className="w-56">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <div className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">{emp.onboarding?.experienceLevel || 'fresher'}</div>
                      <div className="font-semibold">{emp.onboarding?.completionPercent || 0}%</div>
                    </div>
                    <div className="bg-slate-100 h-2 mt-2 rounded">
                      <div className="bg-[linear-gradient(90deg,#a78bfa,#6d28d9)] h-2 rounded" style={{ width: `${emp.onboarding?.completionPercent || 0}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn-ghost" onClick={()=>openView(emp)}>View</button>
                    <button className="btn-primary" onClick={()=>sendRemind(emp._id)}>Remind</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Create Employee</h3>
          <form onSubmit={submit} className="space-y-3">
            <input name="name" placeholder="Name" value={form.name} onChange={change} className="w-full p-3 border rounded-md" required />
            <input name="email" placeholder="Email" value={form.email} onChange={change} className="w-full p-3 border rounded-md" required />
            <div className="grid grid-cols-2 gap-3">
              <select name="experienceLevel" value={form.experienceLevel || 'fresher'} onChange={change} className="w-full p-3 border rounded-md">
                <option value="fresher">Fresher</option>
                <option value="experienced">Experienced</option>
              </select>
              <input name="phone" placeholder="Phone" value={form.phone} onChange={change} className="w-full p-3 border rounded-md" />
            </div>
            <input name="password" placeholder="Password (optional)" value={form.password} onChange={change} className="w-full p-3 border rounded-md" />
            <div className="flex gap-2">
              <button className="btn-primary">Create</button>
              <button type="button" className="btn-ghost" onClick={()=>{ setForm({ name:'', email:'', phone:'', password:'', experienceLevel: 'fresher' }); setMsg(null); }}>Reset</button>
            </div>
          </form>
          {msg && (
            <div className="mt-3">
              {msg.error && <div className="text-red-600">{msg.error}</div>}
              {msg.success && <div className="text-green-600">{msg.success}</div>}
            </div>
          )}

          {/* Chat section removed from HR dashboard */}
        </div>
      </div>
      
      {/* View modal for employee details */}
      {viewingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeView}></div>
          <div className="relative w-full max-w-3xl mx-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold">{viewingEmployee.name}</div>
                  <div className="text-sm text-slate-500">{viewingEmployee.email}</div>
                </div>
                <div className="flex gap-2">
                  <button className="btn-ghost" onClick={closeView}>Close</button>
                  <button className="btn-primary" onClick={()=>sendRemind(viewingEmployee._id)}>Remind</button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-500">Experience</div>
                  <div className="font-medium">{viewDocs?.experienceLevel || viewingEmployee.onboarding?.experienceLevel || 'fresher'}</div>
                  <div className="text-sm text-slate-500 mt-3">Completion</div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="text-2xl font-bold">{viewDocs?.completionPercent ?? viewingEmployee.onboarding?.completionPercent ?? 0}%</div>
                    <div className="flex-1">
                      <div className="bg-slate-100 h-2 rounded overflow-hidden">
                        <div className="bg-[linear-gradient(90deg,#a78bfa,#6d28d9)] h-2" style={{ width: `${viewDocs?.completionPercent ?? viewingEmployee.onboarding?.completionPercent ?? 0}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Required Documents</div>
                  <ul className="mt-2 space-y-2">
                    {(viewDocs?.requiredDocs || []).map(r => {
                      const uploaded = (viewDocs?.uploadedDocs || []).find(u => u.key === r.key);
                      return (
                        <li key={r.key} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="font-medium">{r.label}</div>
                            <div className="text-xs text-slate-500">{uploaded ? `Uploaded ${new Date(uploaded.uploadedAt).toLocaleString()}` : 'Missing'}</div>
                          </div>
                          <div>
                            {uploaded ? <a className="text-sm text-indigo-600" href={uploaded.url} target="_blank" rel="noreferrer">View</a> : <button className="btn-primary" onClick={()=>sendRemind(viewingEmployee._id)}>Remind</button>}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
