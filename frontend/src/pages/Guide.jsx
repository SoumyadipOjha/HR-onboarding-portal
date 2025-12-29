import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const steps = [
  { title: 'Welcome & Account', desc: 'Sign in with the credentials HR provides. Complete your profile with name, email and upload a profile photo.' },
  { title: 'Documents Checklist', desc: 'Open the Documents area and upload required documents. Freshers and experienced users will see different required lists. Be sure to upload a signature image or PDF when asked.' },
  { title: 'Track Progress', desc: 'Your onboarding progress is calculated automatically and visible on your dashboard as a percent complete. HR can also view the progress.' },
  { title: 'Chat & Notifications', desc: 'Use Chat to communicate with HR. Reminders from HR will appear in notifications and chat.' },
  { title: 'Need Help?', desc: 'If something fails (upload, login), take a screenshot and contact HR or open a support ticket with the details.' }
];

export default function Guide(){
  const [open, setOpen] = useState(-1);
  return (
    <div className="p-6">
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Employee Guide</h1>
            <div className="muted">Step-by-step onboarding instructions and tips</div>
          </div>
          <div>
            <Link to="/dashboard" className="btn-ghost">Back to Dashboard</Link>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {steps.map((s, idx) => (
            <div key={idx} className="border rounded-md overflow-hidden">
              <button className="w-full text-left px-4 py-3 flex items-center justify-between" onClick={() => setOpen(open === idx ? -1 : idx)}>
                <div>
                  <div className="font-medium">{s.title}</div>
                  <div className="text-xs muted">Step {idx + 1} of {steps.length}</div>
                </div>
                <div className="text-slate-500">{open === idx ? '−' : '+'}</div>
              </button>
              {open === idx && <div className="px-4 py-3 bg-gray-50 text-sm text-slate-700">{s.desc}</div>}
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm muted">Tip: Complete your documents early to speed up onboarding.</div>
          <div>
            <Link to="/employee" className="btn-primary">Start Uploading Documents</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
