import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try{
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin');
      if (user.role === 'hr') navigate('/hr');
      if (user.role === 'employee') navigate('/employee');
    }catch(err){
      alert('Login failed');
    }
  }

  const [roleTab, setRoleTab] = useState('employee');

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Login form */}
        <form onSubmit={submit} className="card w-full">
          <h2 className="text-2xl font-bold mb-4">Sign in</h2>
          <div className="text-sm muted mb-4">Enter the email and password provided by your HR or admin.</div>
          <label className="text-xs mb-1 block">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="mb-2 w-full p-2 border rounded" />
          <label className="text-xs mb-1 block">Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="mb-4 w-full p-2 border rounded" />
          <div className="flex items-center justify-between gap-3">
            <button className="btn-primary">Login</button>
            <div className="text-sm muted">New user? Contact HR to create your account.</div>
          </div>

          <div className="mt-6 border-t pt-4 text-sm muted">
            <div className="font-medium mb-2">Quick Tips</div>
            <ul className="list-disc list-inside text-sm">
              <li>Use a modern browser (Chrome/Edge/Firefox).</li>
              <li>If uploads fail, try a smaller file or contact HR.</li>
              <li>Keep your profile details up to date for faster onboarding.</li>
            </ul>
          </div>
        </form>

        {/* Guide / illustration area */}
        <div className="card w-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">How it works</h3>
              <div className="text-sm muted">Select your role to view the quick walkthrough</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex gap-2">
              {['employee','hr','admin'].map(r => (
                <button key={r} onClick={()=>setRoleTab(r)} className={`px-3 py-1 rounded ${roleTab===r? 'bg-[color:var(--brand-300)] text-white':'btn-ghost'}`}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            {roleTab === 'employee' && (
              <div>
                <div className="flex items-start gap-4">
                  <div className="w-28 h-28 bg-slate-100 rounded-md flex items-center justify-center">
                    {/* simple SVG illustration */}
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12a3 3 0 100-6 3 3 0 000 6z" stroke="#6d28d9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 21a9 9 0 10-18 0" stroke="#6d28d9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <div className="font-medium">Employee Flow</div>
                    <div className="text-sm muted mt-1">Sign in, complete your profile, upload required documents and signature, and track your onboarding progress. Use chat to communicate with HR.</div>
                    <ol className="list-decimal list-inside text-sm mt-2">
                      <li>Sign in using credentials from HR.</li>
                      <li>Upload documents (PDF/JPG/PNG) and a signature.</li>
                      <li>Monitor completion percentage on your dashboard.</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {roleTab === 'hr' && (
              <div>
                <div className="flex items-start gap-4">
                  <div className="w-28 h-28 bg-slate-100 rounded-md flex items-center justify-center">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18" stroke="#6d28d9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 11v6" stroke="#6d28d9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 11v6" stroke="#6d28d9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <div className="font-medium">HR Flow</div>
                    <div className="text-sm muted mt-1">Create employee accounts, assign required documents based on experience level, review uploads, and send reminders. Use the HR dashboard to track everyone.</div>
                    <ol className="list-decimal list-inside text-sm mt-2">
                      <li>Create employee and initialize document checklist.</li>
                      <li>Monitor uploaded documents and completion percent.</li>
                      <li>Send reminders via the Remind action; notifications appear in chat.</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {roleTab === 'admin' && (
              <div>
                <div className="flex items-start gap-4">
                  <div className="w-28 h-28 bg-slate-100 rounded-md flex items-center justify-center">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="16" rx="2" stroke="#6d28d9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 8h8" stroke="#6d28d9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <div className="font-medium">Admin Flow</div>
                    <div className="text-sm muted mt-1">Manage system settings and user roles. Admins can create HR users and review platform-wide statistics from the Admin dashboard.</div>
                    <ol className="list-decimal list-inside text-sm mt-2">
                      <li>Manage users and roles.</li>
                      <li>View system-level onboarding metrics and reports.</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
