import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import PieChart from '../components/PieChart'

export default function AdminDashboard(){
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeeProgress, setEmployeeProgress] = useState({});

  useEffect(()=>{
    async function load(){
      setLoading(true);
      try{
        const res = await api.get('/admin/users');
        const usersData = res.data.users || [];
        setUsers(usersData);
        
        // Extract progress from user data directly
        const progressMap = {};
        usersData.forEach(user => {
          if (user.role === 'employee' && user.onboarding) {
            progressMap[user._id] = user.onboarding.completionPercent || 0;
          }
        });
        setEmployeeProgress(progressMap);
      }catch(err){ console.error(err); }
      setLoading(false);
    }
    load();
  },[]);

  const handleDeleteUser = async (userId, userName) => {
    if(!window.confirm(`Are you sure you want to remove ${userName}? This action cannot be undone.`)) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      // Optimistic update or refetch
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete user');
    }
  };

  const hrs = users.filter(u=>u.role==='hr');
  const employees = users.filter(u=>u.role==='employee');
  
  // Calculate onboarding stats
  const totalEmployees = employees.length;
  const completedEmployees = employees.filter(e => (employeeProgress[e._id] || 0) >= 100).length;
  const avgOnboarding = totalEmployees > 0 
    ? Math.round(employees.reduce((sum, e) => sum + (employeeProgress[e._id] || 0), 0) / totalEmployees)
    : 0;
  
  // Calculate this month's new users
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const thisMonthUsers = users.filter(u => {
    if (!u.createdAt) return false;
    const created = new Date(u.createdAt);
    return created.getMonth() === thisMonth && created.getFullYear() === thisYear;
  }).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Admin Dashboard</h1>
          <p className="text-slate-600 dark:text-neutral-400 text-sm">Overview of HRs and Employees</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/create-user" 
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-sky-600 rounded-lg hover:shadow-md transition-all"
          >
            Create User
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500 dark:text-neutral-400 mb-1">Total HRs</div>
              <div className="text-3xl font-bold text-sky-700 dark:text-sky-400">{hrs.length}</div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500 dark:text-neutral-400 mb-1">Total Employees</div>
              <div className="text-3xl font-bold text-sky-700 dark:text-sky-400">{totalEmployees}</div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500 dark:text-neutral-400 mb-1">New This Month</div>
              <div className="text-3xl font-bold text-sky-700 dark:text-sky-400">{thisMonthUsers}</div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500 dark:text-neutral-400 mb-1">Avg Onboarding</div>
              <div className="text-3xl font-bold text-sky-700 dark:text-sky-400">{avgOnboarding}%</div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* People List */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">People</h3>
            <span className="text-xs text-slate-500 dark:text-neutral-400 bg-slate-100 dark:bg-neutral-800 px-2 py-1 rounded-full">{users.length} total</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-slate-500">Loading...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* HRs Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900 dark:text-white">HRs</h4>
                  <span className="text-xs text-slate-500 dark:text-neutral-400 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 px-2 py-1 rounded-full">{hrs.length}</span>
                </div>
                {hrs.length === 0 ? (
                  <div className="text-sm text-slate-500 py-4 text-center">No HRs found</div>
                ) : (
                  <div className="space-y-2">
                    {hrs.map(h=> (
                      <div 
                        key={h._id} 
                        className="p-3 rounded-lg border border-slate-200 dark:border-neutral-800 hover:border-sky-300 dark:hover:border-sky-500 transition-all bg-white dark:bg-neutral-900 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-white flex items-center justify-center font-semibold text-xs flex-shrink-0 overflow-hidden">
                            {h.avatarURL ? (
                              <img src={h.avatarURL} alt={h.name} className="w-full h-full object-cover" />
                            ) : (
                              (h.name||'').slice(0,1).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-900 dark:text-white truncate">{h.name}</div>
                            <div className="text-xs text-slate-500 dark:text-neutral-400 truncate">{h.email}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-slate-400 flex-shrink-0">
                              {h.createdAt ? new Date(h.createdAt).toLocaleDateString() : ''}
                            </div>
                            <button
                              onClick={() => handleDeleteUser(h._id, h.name)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                              title="Remove User"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Employees Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900 dark:text-white">Employees</h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 px-2 py-1 rounded-full">{employees.length}</span>
                </div>
                {employees.length === 0 ? (
                  <div className="text-sm text-slate-500 py-4 text-center">No employees found</div>
                ) : (
                  <div className="space-y-2">
                    {employees.map(e=> {
                      const completionPercent = employeeProgress[e._id] || 0;
                      return (
                        <div 
                          key={e._id} 
                          className="p-3 rounded-lg border border-slate-200 dark:border-neutral-800 hover:border-sky-300 dark:hover:border-sky-500 transition-all bg-white dark:bg-neutral-900 group"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-white flex items-center justify-center font-semibold text-xs flex-shrink-0 overflow-hidden">
                              {e.avatarURL ? (
                                <img src={e.avatarURL} alt={e.name} className="w-full h-full object-cover" />
                              ) : (
                                (e.name||'').slice(0,1).toUpperCase()
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-slate-900 dark:text-white truncate">{e.name}</div>
                              <div className="text-xs text-slate-500 dark:text-neutral-400 truncate">{e.email}</div>
                              {e.createdBy && (
                                <div className="text-xs text-sky-600 dark:text-sky-400 mt-0.5 truncate flex items-center gap-1">
                                  <span>HR: {e.createdBy.name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-500 dark:text-neutral-400">Progress</span>
                                <span className="text-xs font-semibold text-slate-900 dark:text-white">{completionPercent}%</span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-neutral-700 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-1.5 rounded-full transition-all ${
                                    completionPercent === 100 
                                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' 
                                      : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                  }`}
                                  style={{ width: `${completionPercent}%` }}
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteUser(e._id, e.name)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                              title="Remove User"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Charts Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">User Composition</h3>
            <div className="flex items-center justify-center mb-4">
              <PieChart 
                data={[
                  {label:'HRs', value: hrs.length}, 
                  {label:'Employees', value: employees.length}
                ]} 
                size={180}
                innerRadius={60}
                colors={['#0ea5e9', '#7dd3fc']}
              />
            </div>
            <div className="flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-sky-500"></div>
                <span className="text-slate-600 dark:text-neutral-300">{hrs.length} HRs</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-sky-300"></div>
                <span className="text-slate-600 dark:text-neutral-300">{employees.length} Employees</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Onboarding Status</h3>
            <div className="flex items-center justify-center mb-4">
              <PieChart 
                data={[
                  {label:'Completed', value: completedEmployees}, 
                  {label:'In Progress', value: totalEmployees - completedEmployees}
                ]} 
                size={180}
                innerRadius={60}
                colors={['#0ea5e9', '#7dd3fc']}
              />
            </div>
            <div className="flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-sky-500"></div>
                <span className="text-slate-600 dark:text-neutral-300">{completedEmployees} Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-sky-300"></div>
                <span className="text-slate-600 dark:text-neutral-300">{totalEmployees - completedEmployees} In Progress</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
