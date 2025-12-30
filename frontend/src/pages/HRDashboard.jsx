import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import PieChart from '../components/PieChart'

export default function HRDashboard(){
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', experienceLevel: 'fresher' });
  const [msg, setMsg] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [viewDocs, setViewDocs] = useState(null);

  const load = async () => {
    setLoading(true);
    try{
      const res = await api.get('/hr/employees');
      setEmployees(res.data.employees || []);
    }catch(err){ console.error(err); }
    setLoading(false);
  }

  useEffect(()=>{ load(); },[]);

  const change = e => setForm(prev=>({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault(); 
    setMsg(null);
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

  const avgCompletion = employees.length > 0 
    ? Math.round((employees.reduce((s,e)=>s+(e.onboarding?.completionPercent||0),0)) / employees.length)
    : 0;
  const completed = employees.filter(e => (e.onboarding?.completionPercent || 0) >= 100).length;
  const pending = employees.length - completed;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">HR Dashboard</h1>
        <p className="text-slate-600 text-sm">Manage your team and onboarding tasks</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card shadow-accent">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500 mb-1">Total Employees</div>
              <div className="text-3xl font-bold text-indigo-700">{employees.length}</div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="stat-card shadow-accent">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500 mb-1">Average Progress</div>
              <div className="text-3xl font-bold text-indigo-700">{avgCompletion}%</div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="stat-card shadow-accent">
          <div className="text-sm text-slate-500 mb-3">Onboarding Status</div>
          <div className="flex items-center justify-center">
            <PieChart 
              data={[
                { label: 'Completed', value: completed }, 
                { label: 'Pending', value: pending }
              ]} 
              size={100} 
              innerRadius={35} 
              colors={['#10B981', '#F59E0B']} 
            />
          </div>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-slate-600">{completed} Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-slate-600">{pending} Pending</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employees List */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <h3 className="text-lg font-semibold text-slate-900">My Employees</h3>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{employees.length} total</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-slate-500">Loading...</div>
            </div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-slate-500">No employees yet. Create your first employee to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {employees.map(emp => {
                const completionPercent = emp.onboarding?.completionPercent || 0;
                return (
                  <div 
                    key={emp._id} 
                    className="p-4 rounded-lg border-2 border-slate-200 hover:border-indigo-300 transition-all bg-white"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                          {(emp.name||'').slice(0,1).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-slate-900 truncate">{emp.name}</div>
                          <div className="text-sm text-slate-500 truncate">{emp.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="w-32">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                              {emp.onboarding?.experienceLevel || 'fresher'}
                            </span>
                            <span className="text-sm font-semibold text-slate-900">{completionPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                completionPercent === 100 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                  : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                              }`}
                              style={{ width: `${completionPercent}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={()=>openView(emp)}
                            className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => navigate(`/chat?userId=${emp._id}`)}
                            className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                            title="Chat with employee"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Chat
                          </button>
                          <button 
                            onClick={()=>sendRemind(emp._id)}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg hover:shadow-md transition-all"
                          >
                            Remind
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Employee Form */}
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Create Employee</h3>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Name</label>
              <input 
                name="name" 
                placeholder="Full name" 
                value={form.name} 
                onChange={change} 
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
              <input 
                name="email" 
                type="email"
                placeholder="email@example.com" 
                value={form.email} 
                onChange={change} 
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Experience</label>
                <select 
                  name="experienceLevel" 
                  value={form.experienceLevel || 'fresher'} 
                  onChange={change} 
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="fresher">Fresher</option>
                  <option value="experienced">Experienced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
                <input 
                  name="phone" 
                  placeholder="Phone" 
                  value={form.phone} 
                  onChange={change} 
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password (optional)</label>
              <input 
                name="password" 
                type="password"
                placeholder="Leave empty for auto-generate" 
                value={form.password} 
                onChange={change} 
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button 
                type="submit"
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg hover:shadow-md transition-all"
              >
                Create
              </button>
              <button 
                type="button" 
                onClick={()=>{ setForm({ name:'', email:'', phone:'', password:'', experienceLevel: 'fresher' }); setMsg(null); }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </form>
          {msg && (
            <div className="mt-4 p-3 rounded-lg text-sm">
              {msg.error && <div className="text-red-700 bg-red-50 border border-red-200 p-2 rounded">{msg.error}</div>}
              {msg.success && <div className="text-green-700 bg-green-50 border border-green-200 p-2 rounded">{msg.success}</div>}
            </div>
          )}
        </div>
      </div>
      
      {/* View Modal */}
      {viewingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeView}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-start justify-between z-10">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{viewingEmployee.name}</h2>
                <p className="text-sm text-slate-500 mt-1">{viewingEmployee.email}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={()=>sendRemind(viewingEmployee._id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg hover:shadow-md transition-all"
                >
                  Remind
                </button>
                <button 
                  onClick={closeView}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">Experience Level</div>
                  <div className="text-lg font-semibold text-slate-900 capitalize">
                    {viewDocs?.experienceLevel || viewingEmployee.onboarding?.experienceLevel || 'fresher'}
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                  <div className="text-xs text-slate-500 mb-2">Completion Progress</div>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-bold text-indigo-700">
                      {viewDocs?.completionPercent ?? viewingEmployee.onboarding?.completionPercent ?? 0}%
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all"
                          style={{ width: `${viewDocs?.completionPercent ?? viewingEmployee.onboarding?.completionPercent ?? 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Required Documents</h3>
                <div className="space-y-3">
                  {(viewDocs?.requiredDocs || []).map(r => {
                    const uploaded = (viewDocs?.uploadedDocs || []).find(u => u.key === r.key);
                    return (
                      <div 
                        key={r.key} 
                        className={`p-4 rounded-lg border-2 ${
                          uploaded ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-slate-900">{r.label}</span>
                              {uploaded && (
                                <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Uploaded
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">
                              {uploaded ? `Uploaded ${new Date(uploaded.uploadedAt).toLocaleString()}` : 'Not uploaded'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {uploaded ? (
                              <>
                                <a 
                                  href={uploaded.url} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
                                  title="View document"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </a>
                                <button 
                                  onClick={async ()=>{
                                    try{
                                      const res = await fetch(uploaded.url);
                                      const blob = await res.blob();
                                      const url = URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = `${viewingEmployee.name || 'document'}-${r.key}`;
                                      document.body.appendChild(a);
                                      a.click();
                                      a.remove();
                                      URL.revokeObjectURL(url);
                                    }catch(e){ console.error(e); alert('Download failed'); }
                                  }}
                                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
                                  title="Download document"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={()=>sendRemind(viewingEmployee._id)}
                                className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg hover:shadow-md transition-all"
                              >
                                Remind
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
