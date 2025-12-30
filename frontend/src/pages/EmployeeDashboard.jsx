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

  useEffect(()=>{
    async function loadStatus(){
      try{
        const res = await api.get('/employee/status');
        setDocsStatus(res.data.docs);
        const map = {};
        (res.data.docs?.uploadedDocs || []).forEach(d => map[d.key] = d.url);
        setFileURLs(map);
      }catch(e){ console.error(e); }
    }
    loadStatus();
  },[]);

  const completionPercent = docsStatus?.completionPercent || 0;
  const requiredDocs = docsStatus?.requiredDocs || [];
  const uploadedDocs = docsStatus?.uploadedDocs || [];

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
      {/* Header */}
      <div className="mb-3 sm:mb-4 md:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-0.5 sm:mb-1">Employee Dashboard</h1>
        <p className="text-slate-600 text-xs sm:text-sm">Manage your documents and communicate with HR</p>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4 md:p-6 border border-slate-100 mb-3 sm:mb-4 md:mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 mb-0.5 sm:mb-1">Onboarding Progress</h2>
            <p className="text-xs sm:text-sm text-slate-600 truncate">{completionPercent}% Complete</p>
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-600 flex-shrink-0">{completionPercent}%</div>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 sm:h-2.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 sm:h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${completionPercent}%` }} 
          />
        </div>
        <div className="mt-3 sm:mt-4 flex items-start sm:items-center gap-1.5 sm:gap-2 text-xs text-slate-600">
          <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 sm:mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="break-words leading-relaxed">{uploadedDocs.length} of {requiredDocs.length + 1} documents uploaded</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {/* Left Column - Documents */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {/* Quick Help Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4 md:p-6 border border-slate-100 bg-blue-50 border-blue-100">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm md:text-base font-semibold text-slate-900 mb-0.5 sm:mb-1">Need Help?</h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-2 sm:mb-3 leading-relaxed">Follow our step-by-step guide for uploading documents and chatting with HR.</p>
                <a href="/guide" className="inline-flex items-center gap-1 sm:gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 active:text-blue-800 touch-manipulation">
                  Open Guide
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4 md:p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4 gap-2">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 truncate">Required Documents</h3>
              <span className="text-xs text-slate-500 bg-slate-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0">
                {uploadedDocs.length}/{requiredDocs.length + 1}
              </span>
            </div>
            <div className="space-y-2.5 sm:space-y-3">
              {requiredDocs.map(rd => {
                const uploaded = uploadedDocs.find(d => d.key === rd.key);
                return (
                  <div 
                    key={rd.key} 
                    className={`p-2.5 sm:p-3 md:p-4 rounded-lg border-2 transition-all ${
                      uploaded 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2 sm:mb-2.5 md:mb-3 gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                          <h4 className="text-xs sm:text-sm md:text-base font-medium text-slate-900 break-words">{rd.label}</h4>
                          {uploaded && (
                            <span className="inline-flex items-center gap-0.5 sm:gap-1 text-xs text-green-700 bg-green-100 px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="hidden xs:inline">Uploaded</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{uploaded ? 'Document verified' : 'Pending upload'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <label className="flex-1 cursor-pointer min-w-0">
                        <input 
                          type="file" 
                          onChange={e => upload(e, rd.key)} 
                          className="hidden"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        <span className="inline-flex items-center justify-center gap-1.5 sm:gap-2 w-full px-3 sm:px-4 py-3 sm:py-2.5 md:py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg active:bg-slate-50 transition-colors touch-manipulation min-h-[44px] sm:min-h-0">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="truncate text-center sm:text-left">{uploaded ? 'Replace File' : 'Upload File'}</span>
                        </span>
                      </label>
                      {uploaded && (
                        <div className="flex gap-2 sm:gap-1.5 sm:gap-1 flex-shrink-0 justify-center sm:justify-start">
                          <a 
                            href={uploaded.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="p-3 sm:p-2.5 md:p-2 text-slate-600 active:text-slate-900 active:bg-white rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                            title="View document"
                          >
                            <svg className="w-5 h-5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </a>
                          <button 
                            onClick={async () => {
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
                            }}
                            className="p-3 sm:p-2.5 md:p-2 text-slate-600 active:text-slate-900 active:bg-white rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                            title="Download document"
                          >
                            <svg className="w-5 h-5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* Signature */}
              <div className={`p-2.5 sm:p-3 md:p-4 rounded-lg border-2 transition-all ${
                docsStatus?.signatureURL 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-start justify-between mb-2 sm:mb-2.5 md:mb-3 gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                      <h4 className="text-xs sm:text-sm md:text-base font-medium text-slate-900">Signature</h4>
                      {docsStatus?.signatureURL && (
                        <span className="inline-flex items-center gap-0.5 sm:gap-1 text-xs text-green-700 bg-green-100 px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="hidden xs:inline">Uploaded</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Digital signature required</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <label className="flex-1 cursor-pointer min-w-0">
                    <input 
                      type="file" 
                      onChange={e => upload(e, 'signature')} 
                      className="hidden"
                      accept=".jpg,.jpeg,.png"
                    />
                    <span className="inline-flex items-center justify-center gap-1.5 sm:gap-2 w-full px-3 sm:px-4 py-3 sm:py-2.5 md:py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg active:bg-slate-50 transition-colors touch-manipulation min-h-[44px] sm:min-h-0">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="truncate text-center sm:text-left">{docsStatus?.signatureURL ? 'Replace Signature' : 'Upload Signature'}</span>
                    </span>
                  </label>
                  {docsStatus?.signatureURL && (
                    <a 
                      href={docsStatus.signatureURL} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="p-3 sm:p-2.5 md:p-2 text-slate-600 active:text-slate-900 active:bg-white rounded-lg transition-colors touch-manipulation flex-shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
                      title="View signature"
                    >
                      <svg className="w-5 h-5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Chat */}
        <div className="lg:col-span-1 order-first lg:order-last">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4 md:p-6 border border-slate-100 h-full flex flex-col min-h-[350px] sm:min-h-[450px] md:min-h-[500px] lg:min-h-0">
            <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4 pb-2 sm:pb-3 md:pb-4 border-b">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900">Messages</h3>
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
            </div>
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {contacts.length > 0 ? (
                <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-hidden">
                  <div className="flex-shrink-0 border-b pb-2 sm:pb-2.5 md:pb-3 mb-2 sm:mb-2.5 md:mb-3">
                    <div className="space-y-1 max-h-20 sm:max-h-24 md:max-h-32 overflow-y-auto -mx-1 px-1">
                      {contacts.map(c => (
                        <button
                          key={c._id}
                          onClick={() => setSelected(c._id)}
                          className={`w-full text-left p-2 sm:p-2.5 md:p-3 rounded-lg transition-all touch-manipulation min-h-[44px] sm:min-h-0 ${
                            selected === c._id
                              ? 'bg-indigo-50 border-2 border-indigo-200'
                              : 'active:bg-slate-50 border-2 border-transparent'
                          }`}
                        >
                          <div className="font-medium text-slate-900 text-xs sm:text-sm truncate">{c.name}</div>
                          <div className="text-xs text-slate-500 truncate">{c.email}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    {selected ? (
                      <ChatBox withUserId={selected} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-center p-3 sm:p-4 md:p-6">
                        <div>
                          <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-slate-300 mx-auto mb-2 sm:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <p className="text-xs sm:text-sm text-slate-500">Select a contact to start chatting</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center p-3 sm:p-4 md:p-6">
                  <div>
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-slate-300 mx-auto mb-2 sm:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-xs sm:text-sm text-slate-500">No contacts available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
