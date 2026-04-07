import React from 'react'
import { Link } from 'react-router-dom'

export default function Documentation() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-neutral-200 font-sans transition-colors duration-300">
      
      {/* Header */}
      <div className="border-b border-slate-100 dark:border-neutral-800 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <span className="text-xl font-bold tracking-tight">HireFlow Docs</span>
           </div>
           <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-neutral-400 hover:text-sky-600 dark:hover:text-white transition-colors">
              &larr; Back to Login
           </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        
        {/* Intro */}
        <section>
          <div className="inline-block px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-xs font-semibold mb-4">
             Platform Overview
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
            Comprehensive Onboarding Automation
          </h1>
          <p className="text-lg text-slate-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
            HireFlow streamlines the journey from job offer to the first day of work. It automates document collection, signature verification, and task tracking, providing a unified experience for HR teams, Admins, and new hires.
          </p>
        </section>

        {/* Features Grid */}
        <section className="grid md:grid-cols-3 gap-8">
           <FeatureCard 
             title="For Employees" 
             icon={<svg className="w-6 h-6 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
             features={[
               "Secure Login & Profile Management",
               "Digital Document Upload & Signing",
               "Real-time Onboarding Progress Tracker",
               "In-app Chat with HR Support"
             ]}
           />
           <FeatureCard 
             title="For HR Managers" 
             icon={<svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
             features={[
               "Create & Manage Employee Accounts",
               "Review & Verify Documents",
               "Monitor Department-wide Progress",
               "Direct Messaging & Notifications"
             ]}
           />
           <FeatureCard 
             title="For Admins" 
             icon={<svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
             features={[
               "User Role Management",
               "System-wide Analytics",
               "Security & Compliance Controls",
               "Platform Configuration"
             ]}
           />
        </section>

        {/* Dataflow Diagrams */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">System Architecture & Data Flow</h2>
            <div className="h-px flex-1 bg-slate-200 dark:bg-neutral-800"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
             {/* Flow 1: Document Upload */}
             <div className="bg-slate-50 dark:bg-neutral-900/50 p-8 rounded-2xl border border-slate-100 dark:border-neutral-800">
               <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-sky-500"></span> Document Upload Flow
               </h3>
               
               <div className="relative">
                  {/* Visual Steps */}
                  <div className="space-y-8 relative z-10">
                    <FlowStep 
                      step="1" 
                      title="User Action" 
                      desc="Employee selects file (PDF/Img) via Frontend Dashboard" 
                      color="bg-blue-500"
                    />
                    <div className="h-8 w-0.5 bg-slate-200 dark:bg-neutral-700 mx-6"></div>
                    <FlowStep 
                      step="2" 
                      title="API Request" 
                      desc="POST /api/upload with Multipart Form Data" 
                      color="bg-indigo-500"
                    />
                    <div className="h-8 w-0.5 bg-slate-200 dark:bg-neutral-700 mx-6"></div>
                    <FlowStep 
                      step="3" 
                      title="Processing" 
                      desc="Multer Middleware processes file, stream to Cloudinary" 
                      color="bg-purple-500"
                    />
                     <div className="h-8 w-0.5 bg-slate-200 dark:bg-neutral-700 mx-6"></div>
                    <FlowStep 
                      step="4" 
                      title="Database Update" 
                      desc="MongoDB stores URL; Status updated to 'Review Pending'" 
                      color="bg-green-500"
                    />
                  </div>
               </div>
             </div>

             {/* Flow 2: Real-time Communication */}
             <div className="bg-slate-50 dark:bg-neutral-900/50 p-8 rounded-2xl border border-slate-100 dark:border-neutral-800">
               <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-purple-500"></span> Real-time Chat Flow
               </h3>
               
               <div className="flex flex-col gap-6">
                 {/* Diagram */}
                 <div className="flex items-center justify-between bg-white dark:bg-black p-4 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm text-center text-xs font-mono">
                    <div className="flex flex-col items-center">
                       <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 text-sky-600 rounded-lg flex items-center justify-center mb-2">Editor</div>
                       <span>Client A</span>
                    </div>
                    <div className="flex-1 px-4 relative">
                       <div className="h-0.5 bg-slate-200 dark:bg-neutral-800 absolute top-1/2 left-0 right-0"></div>
                       <div className="relative z-10 bg-slate-100 dark:bg-neutral-800 rounded px-2 py-1 text-[10px]">Socket.io Event</div>
                    </div>
                    <div className="flex flex-col items-center">
                       <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg flex items-center justify-center mb-2">Server</div>
                       <span>Node.js</span>
                    </div>
                    <div className="flex-1 px-4 relative">
                       <div className="h-0.5 bg-slate-200 dark:bg-neutral-800 absolute top-1/2 left-0 right-0"></div>
                       <div className="relative z-10 bg-slate-100 dark:bg-neutral-800 rounded px-2 py-1 text-[10px]">Broadcast</div>
                    </div>
                    <div className="flex flex-col items-center">
                       <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg flex items-center justify-center mb-2">Viewer</div>
                       <span>Client B</span>
                    </div>
                 </div>

                 <div className="space-y-4 text-sm text-slate-600 dark:text-neutral-400 mt-4">
                    <p><strong className="text-slate-900 dark:text-white">1. Connection:</strong> Clients establish persistent WebSocket connection on login.</p>
                    <p><strong className="text-slate-900 dark:text-white">2. Room Allocation:</strong> Users join specific "rooms" based on UserID or Role (HR Room).</p>
                    <p><strong className="text-slate-900 dark:text-white">3. Event Emission:</strong> Messages sent trigger `send_message` events.</p>
                    <p><strong className="text-slate-900 dark:text-white">4. Persistence:</strong> Messages asynchronously saved to MongoDB via Mongoose.</p>
                 </div>
               </div>
             </div>
          </div>
        </section>

        {/* How it Works - Steps */}
        <section>
          <div className="flex items-center gap-3 mb-8">
             <h2 className="text-3xl font-bold text-slate-900 dark:text-white">How It Works</h2>
             <div className="h-px flex-1 bg-slate-200 dark:bg-neutral-800"></div>
          </div>

          <div className="space-y-4">
             <StepRow num="01" title="Account Activation" desc="HR creates your account and shares credentials via secure email." />
             <StepRow num="02" title="First Login" desc="Access the portal using provided credentials. You will be prompted to complete your profile." />
             <StepRow num="03" title="Document Submission" desc="Upload required documents (ID, Tax forms, etc.) and perform digital signatures." />
             <StepRow num="04" title="Verification" desc="HR reviews your submissions. You receive real-time updates if changes are needed." />
             <StepRow num="05" title="Onboarding Complete" desc="Once all tasks are approved, your dashboard updates to 'Ready to Join' status." />
          </div>
        </section>

      </div>
    </div>
  )
}

function FeatureCard({ title, features, icon }) {
  return (
    <div className="p-6 bg-slate-50 dark:bg-neutral-900/30 rounded-2xl border border-slate-100 dark:border-neutral-800 hover:border-sky-500/30 transition-colors">
       <div className="w-12 h-12 bg-white dark:bg-neutral-800 rounded-xl flex items-center justify-center shadow-sm mb-4 border border-slate-100 dark:border-neutral-700">
         {icon}
       </div>
       <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{title}</h3>
       <ul className="space-y-2">
         {features.map((f,i) => (
           <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-neutral-400">
             <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
             {f}
           </li>
         ))}
       </ul>
    </div>
  )
}

function FlowStep({ step, title, desc, color }) {
  return (
    <div className="flex items-start gap-4">
       <div className={`w-12 h-12 rounded-full ${color} text-white flex items-center justify-center font-bold text-lg shadow-lg shrink-0`}>
         {step}
       </div>
       <div>
         <h4 className="font-bold text-slate-900 dark:text-white text-lg">{title}</h4>
         <p className="text-sm text-slate-500 dark:text-neutral-400">{desc}</p>
       </div>
    </div>
  )
}

function StepRow({ num, title, desc }) {
  return (
    <div className="flex items-center gap-6 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-neutral-800">
       <div className="text-3xl font-black text-slate-200 dark:text-neutral-800">{num}</div>
       <div>
         <h4 className="font-bold text-slate-900 dark:text-white text-lg">{title}</h4>
         <p className="text-slate-600 dark:text-neutral-400">{desc}</p>
       </div>
    </div>
  )
}
