import React, { useState, useEffect } from 'react'
import api from '../services/api'
import ChatBox from '../components/ChatBox'


export default function EmployeeDashboard(){
  const [fileURLs, setFileURLs] = useState({});
  const [docsStatus, setDocsStatus] = useState(null);

  const upload = async (e, key) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append(key, file);
    try{
      const res = await api.post('/employee/upload-file', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      // refresh status from API
      const st = await api.get('/employee/status');
      setDocsStatus(st.data.docs);
      setFileURLs(prev=>({ ...prev, [key]: res.data.docs?.uploadedDocs?.find(d=>d.key===key)?.url || '' }));
      alert('Uploaded successfully');
    }catch(err){
      console.error(err);
      alert('Upload failed');
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

  // load document status
  useEffect(()=>{
    async function loadStatus(){
      try{
        const res = await api.get('/employee/status');
        setDocsStatus(res.data.docs);
        // populate fileURLs from uploadedDocs
        const map = {};
        (res.data.docs?.uploadedDocs || []).forEach(d => map[d.key] = d.url);
        setFileURLs(map);
      }catch(e){ console.error(e); }
    }
    loadStatus();
  },[]);

  return (
    <div className="p-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employee Dashboard</h1>
          <div className="muted">Upload your documents and chat with HR</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <div className="mb-2 font-medium">Onboarding Progress</div>
            <div className="text-sm">{docsStatus ? `${docsStatus.completionPercent || 0}% complete` : 'Loading...'}</div>
            <div className="bg-slate-200 h-3 mt-2 rounded">
              <div className="bg-green-500 h-3 rounded" style={{ width: `${docsStatus?.completionPercent || 0}%` }} />
            </div>
          </div>
          <div className="card">
            <div className="font-medium mb-2">Need help with onboarding?</div>
            <div className="text-sm muted">Open the guide for step-by-step instructions about uploading documents and chatting with HR.</div>
            <div className="mt-4">
              <a href="/guide" className="btn-primary">Open Guide</a>
            </div>
          </div>
          <div className="card">
            <h4 className="font-semibold mb-2">Required Documents</h4>
            <div className="space-y-3">
              {(docsStatus?.requiredDocs || []).map(rd => {
                const uploaded = (docsStatus.uploadedDocs || []).find(d=>d.key===rd.key);
                return (
                  <div key={rd.key} className="p-2 border rounded">
                    <div className="font-medium">{rd.label}</div>
                    <div className="text-sm text-slate-600">{uploaded ? 'Uploaded' : 'Not uploaded'}</div>
                    <div className="mt-2"><input type="file" onChange={e=>upload(e, rd.key)} /></div>
                    {uploaded && <div className="mt-2 text-xs flex items-center gap-2">
                      <a href={uploaded.url} target="_blank" rel="noreferrer" className="text-sm btn-ghost" aria-label="View document" title="View">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </a>
                      <button className="text-sm btn-ghost" aria-label="Download document" title="Download" onClick={async ()=>{
                        try{
                          const res = await fetch(uploaded.url);
                          const blob = await res.blob();
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${rd.label || rd.key}`;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          URL.revokeObjectURL(url);
                        }catch(e){ console.error(e); alert('Download failed'); }
                      }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l4-4m-4 4-4-4" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 20H4" />
                        </svg>
                      </button>
                    </div>}
                  </div>
                );
              })}
              <div className="p-2 border rounded">
                <div className="font-medium">Signature (Sign here)</div>
                <div className="text-sm text-slate-600">Required</div>
                <div className="mt-2"><input type="file" onChange={e=>upload(e, 'signature')} /></div>
                {docsStatus?.signatureURL && <div className="mt-2 text-xs"><a href={docsStatus.signatureURL} target="_blank" rel="noreferrer">View Signature</a></div>}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="font-semibold mb-3">Chats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <ul>
                  {contacts.map(c=> (
                    <li key={c._id} className={`py-2 cursor-pointer ${selected===c._id? 'bg-slate-100':''}`} onClick={()=>setSelected(c._id)}>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-sm text-slate-600">{c.email}</div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-span-2">
                {selected ? <ChatBox withUserId={selected} /> : <div className="p-4">Select a contact to start chat</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
