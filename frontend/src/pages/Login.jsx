import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(email, password)
      if (user.role === 'admin') navigate('/admin')
      if (user.role === 'hr') navigate('/hr')
      if (user.role === 'employee') navigate('/employee')
    } catch (err) {
      alert('Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { title: 'Offer Accepted', status: 'completed', date: 'Done' },
    { title: 'Account Created', status: 'completed', date: 'Done' },
    { title: 'Portal Login', status: 'current', date: 'Now' },
    { title: 'Profile & Docs', status: 'pending', date: 'Next' },
    { title: 'Join the Team', status: 'pending', date: 'Goal' },
  ]

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-black font-sans transition-colors duration-300">
      
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-24 order-1 lg:order-1 relative z-10 bg-white dark:bg-black">
        <div className="max-w-md w-full mx-auto">
          
<div className="block">
             <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">HireFlow</h2>
                <div className="nav-sub"></div>
              </div>          <p className="text-slate-500 dark:text-neutral-400 mb-8 text-lg">
            Sign in to continue your onboarding journey.
          </p>

          <form onSubmit={submit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">Email Address</label>
              <input 
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                type="email" 
                required
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all outline-none text-slate-900 dark:text-white font-medium placeholder-slate-400"
                placeholder="name@company.com" 
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300">Password</label>
              </div>
              <input 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                type="password" 
                required
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all outline-none text-slate-900 dark:text-white font-medium placeholder-slate-400"
                placeholder="••••••••" 
              />
            </div>
            
            {/* Demo Buttons */}
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={() => { setEmail('hr@example.com'); setPassword('password123'); }}
                className="flex-1 py-2 px-4 rounded-lg bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 text-sm font-semibold border border-sky-100 dark:border-sky-900/50 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors"
              >
                Demo HR
              </button>
              <button 
                type="button"
                onClick={() => { setEmail('employee@example.com'); setPassword('password123'); }}
                className="flex-1 py-2 px-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-sm font-semibold border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
              >
                Demo Employee
              </button>
            </div>

            <button 
              disabled={loading}
              className={`w-full py-4 px-6 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-lg shadow-sky-500/25 transition-all transform active:scale-[0.98] flex items-center justify-center ${loading ? 'opacity-80 cursor-wait' : ''}`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Signing in...</span>
                </div>
              ) : 'Sign in to Dashboard'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-neutral-800 text-center">
            <p className="text-slate-500 dark:text-neutral-500 text-sm">
              New to the team? <Link to="/documentation" className="font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 transition-colors">Read Documentation</Link>
            </p>
          </div>
        </div>
        
        <div className="mt-auto pt-8 text-center lg:text-left text-xs text-slate-400 dark:text-neutral-600">
          Depending on your role, you will be redirected to the appropriate dashboard.
        </div>
      </div>

      {/* Right Side - Roadmap / Visuals */}
      <div className="w-full lg:w-1/2 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 order-2 lg:order-2 min-h-[500px] lg:min-h-screen border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/10 transition-colors duration-300">
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-200/40 dark:bg-sky-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-200/40 dark:bg-indigo-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-white/40 dark:bg-white/5 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-md">
           <div className="text-center lg:text-left mb-12">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-sky-700 dark:text-sky-300 text-xs font-medium mb-4 backdrop-blur-sm shadow-sm dark:shadow-none">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
                Onboarding Tracker
             </div>
             <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">Your journey starts here.</h2>
             <p className="text-slate-600 dark:text-slate-400 text-lg">Follow your progress from offer acceptance to your first day at the office.</p>
           </div>

           {/* Interactive Roadmap */}
           <div className="relative space-y-6">
              {/* Connector Line */}
              <div className="absolute left-[24px] top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-800"></div>

              {steps.map((step, idx) => {
                const isCompleted = step.status === 'completed';
                const isCurrent = step.status === 'current';
                
                return (
                  <div key={idx} className="relative flex items-center gap-6 group">
                   {/* Status Dot */}
                    <div className={`
                       relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-xl
                       ${isCompleted 
                          ? 'bg-sky-500 border-sky-500 text-white shadow-sky-500/20' 
                          : isCurrent 
                            ? 'bg-white dark:bg-slate-900 border-sky-500 text-sky-600 dark:text-sky-400 shadow-sky-500/20 scale-110' 
                            : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-600'}
                    `}>
                       {isCompleted ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                       ) : isCurrent ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       ) : (
                          <span className="text-xs font-bold">{idx + 1}</span>
                       )}
                    </div>

                    {/* Step Details */}
                    <div className={`flex-1 p-4 rounded-xl border transition-all duration-300 backdrop-blur-md 
                      ${isCurrent 
                        ? 'bg-white/80 dark:bg-white/10 border-sky-200 dark:border-white/20 translate-x-2 shadow-lg shadow-sky-500/5' 
                        : 'border-transparent opacity-60 group-hover:opacity-100'
                      }`}>
                        <div className="flex flex-col">
                           <h4 className={`text-base font-bold ${isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-300'}`}>{step.title}</h4>
                           <div className="flex items-center justify-between mt-1">
                             <span className={`text-xs ${isCurrent ? 'text-sky-600 dark:text-sky-300' : 'text-slate-500'}`}>{step.status === 'current' ? 'In Progress' : step.status}</span>
                             <span className="text-[10px] font-mono tracking-wider uppercase text-slate-500 bg-slate-100 dark:bg-black/30 px-2 py-0.5 rounded">{step.date}</span>
                           </div>
                        </div>
                    </div>
                  </div>
                )
              })}
           </div>
        </div>
      </div>
    </div>
  )
}
