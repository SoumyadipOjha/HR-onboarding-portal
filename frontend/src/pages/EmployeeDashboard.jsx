import React, { useState, useEffect } from 'react'
import api from '../services/api'
import ChatBox from '../components/ChatBox'

import { useAuth } from '../context/AuthContext'

export default function EmployeeDashboard(){
  const { user, updateUser } = useAuth();
  const [fileURLs, setFileURLs] = useState({});
  const [docsStatus, setDocsStatus] = useState(null);
  const [uploading, setUploading] = useState({});

  if (!user) return <div className="p-8 text-center">Loading user profile...</div>;

  const handleHeaderAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('avatar', file);
    try {
      const res = await api.post('/user/me/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(res.data.user);
    } catch (err) {
      console.error(err);
      alert('Failed to upload profile photo');
    }
  };

  const upload = async (e, key) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append(key, file);
    setUploading(prev => ({ ...prev, [key]: true }));
    try{
      const res = await api.post('/employee/upload-file', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const st = await api.get('/employee/status');
      setDocsStatus(st.data.docs);
      setFileURLs(prev=>({ ...prev, [key]: res.data.docs?.uploadedDocs?.find(d=>d.key===key)?.url || '' }));
      // alert('Uploaded successfully'); // Replaced with console log for now, could add toast
      // Log removed
    }catch(err){
      console.error(err);
      alert('Upload failed');
    }finally{
      setUploading(prev => ({ ...prev, [key]: false }));
    }
  }

  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(()=>{
    async function load(){
      try{
        const res = await api.get('/chat/contacts');
        setContacts(res.data.contacts || []);
        if (res.data.contacts && res.data.contacts.length) setSelected(res.data.contacts[0]._id);
      }catch(err){ console.error(err); }
    }
    load();
  },[]);

  useEffect(()=>{
    async function loadStatus(){
      try{
        const res = await api.get('/employee/status');
        setDocsStatus(res.data?.docs);
        const map = {};
        (res.data?.docs?.uploadedDocs || []).forEach(d => map[d.key] = d.url);
        setFileURLs(map);
      }catch(e){ console.error(e); }
    }
    loadStatus();
  },[]);

  const completionPercent = docsStatus?.completionPercent || 0;
  const requiredDocs = docsStatus?.requiredDocs || [];
  const uploadedDocs = docsStatus?.uploadedDocs || [];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-black p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        
        {/* Left Panel: Main Content */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          
          {/* Header & Progress */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-neutral-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl opacity-50 transition-opacity group-hover:opacity-75"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="relative group/avatar cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-neutral-800 shadow-lg flex items-center justify-center overflow-hidden border-2 border-sky-100 dark:border-sky-500/30">
              {user.avatarURL ? (
                <img src={user.avatarURL} alt={user.name} className="w-full h-full object-cover" onError={(e)=>{e.target.style.display='none'; e.target.nextSibling.style.display='block'}} />
              ) : null}
              <span className={`text-2xl font-bold text-sky-600 dark:text-sky-400 ${user.avatarURL ? 'hidden' : 'block'}`}>{(user.name || 'U').charAt(0).toUpperCase()}</span>
            </div>
            
            {/* Camera Overlay */}
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity" onClick={()=>document.getElementById('header-avatar-input').click()}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input 
              type="file" 
              id="header-avatar-input" 
              className="hidden" 
              accept="image/*"
              onChange={handleHeaderAvatarUpload} 
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Welcome  <span className="text-sky-600 dark:text-sky-400">{user.name}</span>
            </h1>
            <p className="text-slate-600 dark:text-neutral-400 mt-1">Ready to continue your onboarding journey?</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl font-bold text-sky-600 dark:text-sky-400">{completionPercent}%</span>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Completed</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-neutral-400">
                 <div className="px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 font-medium text-xs">
                    {uploadedDocs.length} / {requiredDocs.length + 1}
                 </div>
                 <span>Documents Uploaded</span>
              </div>
            </div>
          </div>

          {/* Required Documents Grid */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Required Documents
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requiredDocs.map(rd => {
                const uploaded = uploadedDocs.find(d => d.key === rd.key);
                return (
                  <DocumentCard 
                    key={rd.key}
                    label={rd.label}
                    uploaded={uploaded}
                    uploading={uploading[rd.key]}
                    onUpload={(e) => upload(e, rd.key)}
                    required={true}
                  />
                );
              })}

              {/* Signature Card */}
              <DocumentCard 
                label="Digital Signature"
                uploaded={docsStatus?.signatureURL ? { url: docsStatus.signatureURL } : null}
                uploading={uploading['signature']}
                onUpload={(e) => upload(e, 'signature')}
                required={true}
                isSignature={true}
              />
            </div>
          </div>
        </div>

        {/* Right Panel: Chat - Sticky on Desktop */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-[500px] lg:h-[calc(100vh-100px)] lg:sticky lg:top-8">
           <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-slate-100 dark:border-neutral-800 flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex justify-between items-center">
                 <div>
                    <h2 className="font-semibold text-slate-900 dark:text-white">HR Support</h2>
                    <p className="text-xs text-slate-500 dark:text-neutral-400">Ask us anything about your onboarding</p>
                 </div>
                 {contacts.length > 0 && selected && (
                    <div className="flex -space-x-2">
                      {contacts.map(c => (
                        <div key={c._id} className="w-8 h-8 rounded-full bg-sky-100 border-2 border-white flex items-center justify-center text-xs text-sky-700 font-bold overflow-hidden" title={c.name}>
                          {c.avatarURL ? <img src={c.avatarURL} alt={c.name} className="w-full h-full object-cover" /> : (c.name || 'U').charAt(0).toUpperCase()}
                        </div>
                      )).slice(0,3)}
                    </div>
                 )}
              </div>
              
              <div className="flex-1 overflow-hidden relative bg-slate-50 dark:bg-black">
                 {selected ? (
                   <ChatBox withUserId={selected} compact={true} />
                 ) : (
                   <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                     Select a contact to start
                   </div>
                 )}
              </div>
           </div>
        </div>

      </div>
    </div>
  )
}

function DocumentCard({ label, uploaded, uploading, onUpload, required, isSignature }) {
  // Check if uploaded file is likely an image based on URL extension or if it's a signature (which is always an image)
  const isImage = isSignature || (uploaded && uploaded.url && /\.(jpg|jpeg|png|gif|webp)$/i.test(uploaded.url));

  return (
    <div className={`
      relative group p-4 rounded-xl border transition-all duration-300
      ${uploaded 
        ? 'bg-sky-50/50 dark:bg-neutral-900 border-sky-200 dark:border-sky-500/30 shadow-[0_2px_8px_rgba(14,165,233,0.05)]' 
        : 'bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 shadow-sm hover:shadow-md hover:border-sky-200 dark:hover:border-sky-700'
      }
    `}>
      <div className="flex justify-between items-start mb-3">
        <div className="bg-slate-50 dark:bg-neutral-800 p-2 rounded-lg">
          {isSignature ? (
             <svg className="w-5 h-5 text-slate-600 dark:text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
             </svg>
          ) : (
            <svg className="w-5 h-5 text-slate-600 dark:text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
        </div>
        {uploaded ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
            Done
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
            Pending
          </span>
        )}
      </div>
      
      <h3 className="font-medium text-slate-800 dark:text-white mb-1">{label}</h3>
      <p className="text-xs text-slate-500 dark:text-neutral-400 mb-4">{uploaded ? 'Successfully uploaded' : 'Upload required'}</p>
      
      {/* Image Preview Area */}
      {uploaded && isImage && (
        <div className="mb-4 w-full h-32 bg-slate-100 dark:bg-black rounded-lg overflow-hidden border border-slate-200 dark:border-neutral-800 flex items-center justify-center">
            <img src={uploaded.url} alt="Uploaded" className="max-w-full max-h-full object-contain" />
        </div>
      )}

      <div className="flex gap-2">
         <label className={`
            flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
            ${uploaded ? 'bg-white dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600' : 'bg-sky-600 text-white hover:bg-sky-700 shadow-sm shadow-sky-200 dark:shadow-none'}
            ${uploading ? 'opacity-70 cursor-wait' : ''}
         `}>
            <input type="file" className="hidden" onChange={onUpload} disabled={uploading} accept={isSignature ? ".jpg,.jpeg,.png" : ".pdf,.doc,.docx,.jpg,.jpeg,.png"} />
            {uploading ? (
               <>
                 <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 <span>Uploading...</span>
               </>
            ) : (
               <>
                 {uploaded ? 'Update' : 'Select File'}
               </>
            )}
         </label>
         
         {uploaded && (
            <a 
              href={uploaded.url} 
              target="_blank" 
              rel="noreferrer"
              className="p-2 rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
              title="View File"
            >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </a>
         )}
      </div>
    </div>
  )
}
