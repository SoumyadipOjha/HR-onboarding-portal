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
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
      <div className="bg-white dark:bg-neutral-900 rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4 md:p-6 border border-slate-100 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white mb-1">Employee Guide</h1>
            <div className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400">Step-by-step onboarding instructions and tips</div>
          </div>
          <div className="flex-shrink-0">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-medium text-slate-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 active:bg-slate-100 dark:active:bg-slate-500 transition-colors touch-manipulation min-h-[44px] sm:min-h-0"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 space-y-2.5 sm:space-y-3 md:space-y-4">
          {steps.map((s, idx) => (
            <div key={idx} className="border-2 border-slate-200 dark:border-neutral-800 rounded-lg overflow-hidden">
              <button 
                className="w-full text-left px-3 sm:px-4 py-3 sm:py-3.5 md:py-4 flex items-center justify-between gap-3 touch-manipulation min-h-[44px] active:bg-slate-50 dark:active:bg-slate-700/50 transition-colors" 
                onClick={() => setOpen(open === idx ? -1 : idx)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm sm:text-base text-slate-900 dark:text-neutral-200 mb-0.5">{s.title}</div>
                  <div className="text-xs text-slate-500 dark:text-neutral-400">Step {idx + 1} of {steps.length}</div>
                </div>
                <div className="text-xl sm:text-2xl text-slate-500 dark:text-neutral-400 font-light flex-shrink-0 w-6 sm:w-8 flex items-center justify-center">{open === idx ? '−' : '+'}</div>
              </button>
              {open === idx && (
                <div className="px-3 sm:px-4 py-3 sm:py-3.5 md:py-4 bg-slate-50 dark:bg-black/30 text-xs sm:text-sm text-slate-700 dark:text-neutral-300 leading-relaxed border-t border-slate-200 dark:border-neutral-800">
                  {s.desc}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-200 dark:border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 flex-1 min-w-0">
              <span className="font-medium text-slate-700 dark:text-neutral-300">Tip:</span> Complete your documents early to speed up onboarding.
            </div>
            <div className="flex-shrink-0 w-full sm:w-auto">
              <Link 
                to="/employee" 
                className="inline-flex items-center justify-center w-full sm:w-auto px-4 sm:px-5 py-3 sm:py-2.5 md:py-2 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all touch-manipulation min-h-[44px] sm:min-h-0"
              >
                Start Uploading Documents
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
