import React, { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import api from '../services/api'

const socket = io('http://localhost:5000');

export default function ChatBox({ withUserId, compact = false, userObj = null }){
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [targetUser, setTargetUser] = useState(userObj);
  const bottom = useRef();
  const containerRef = useRef();
  const fileInputRef = useRef();

  useEffect(() => {
    setTargetUser(userObj);
  }, [userObj]);

  useEffect(() => {
    if (!withUserId) return;
    if (userObj && userObj._id === withUserId) return;
    
    // fetch target user details if not provided or if mismatch
    async function loadUser() {
      try {
        // Optimistically check if we can get user details
        // We might need an endpoint for public profile or just rely on contacts
        // For now, if no userObj, we might just show "Chat" or try to fetch
        // Assuming we have a way to get user by ID, or just use ID.
        // Let's try to get it from a general user endpoint if available, but we don't have one user-by-id easily accessible for all roles?
        // Actually, let's just use what we have.
      } catch (e) {}
    }
    loadUser();
  }, [withUserId, userObj]);

  useEffect(()=>{
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) socket.emit('join', { userId: user.id || user._id });
    socket.on('chat-message', (m)=>{
      setMsgs(prev=>[...prev, m]);
    });
    return ()=>{ socket.off('chat-message'); }
  },[]);

  useEffect(()=>{ async function load(){
    try{ const res = await api.get('/chat', { params: { withUserId } }); setMsgs(res.data?.msgs || []); }catch(e){ console.error(e); }
  } load(); }, [withUserId]);

  // mark messages as read when switching to a contact
  useEffect(()=>{
    if (!withUserId) return;
    (async ()=>{
      try{ await api.post('/chat/mark-read', { withUserId }); await api.get('/chat/unread-counts'); }catch(e){}
    })();
  },[withUserId]);

  // auto-scroll when messages change
  useEffect(()=>{
    if (bottom.current) bottom.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  },[msgs]);

  const send = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    const payload = { senderId: user.id || user._id, receiverId: withUserId, message: text };
    socket.emit('chat-message', payload);
    setText('');
  }

  const handleFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  }

  const handleFileChange = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setUploading(true);
    try{
      const form = new FormData();
      // backend accepts any field name; use 'other' for generic files
      form.append('other', f);
      const res = await api.post('/employee/upload-file', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const uploaded = res.data?.docs?.uploadedDocs || [];
      let url = '';
      const otherEntry = uploaded.find(u => u.key === 'other');
      if (otherEntry) url = otherEntry.url;
      else if (uploaded.length) url = uploaded[0].url;
      if (url){
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;
        const payload = { senderId: user.id || user._id, receiverId: withUserId, message: url };
        socket.emit('chat-message', payload);
      }
    }catch(err){
      console.error('File upload failed', err);
      alert('File upload failed');
    }finally{
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  }

  return (
    <div className={`flex flex-col h-full bg-slate-50 dark:bg-black ${compact ? '' : 'rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800'}`} ref={containerRef}>
      {!compact && (
        <div className="p-4 border-b border-slate-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-t-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold overflow-hidden">
            {targetUser?.avatarURL ? <img src={targetUser.avatarURL} className="w-full h-full object-cover"/> : (targetUser?.name || 'U').charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-slate-800 dark:text-white">{targetUser?.name || 'Chat'}</div>
            <div className="text-xs text-sky-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-sky-500 rounded-full"></span> Online
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {msgs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center h-full text-slate-400 dark:text-slate-500">
            <div className="w-16 h-16 bg-slate-100 dark:bg-neutral-900 rounded-full flex items-center justify-center mb-3">
               <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <p className="text-sm">No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          <>
            {msgs.map(m=> {
              const u = JSON.parse(localStorage.getItem('user'));
              const isMe = m.senderId === (u?.id || u?._id);
              return (
                <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] sm:max-w-[75%] group relative flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`
                      px-4 py-3 text-sm shadow-sm
                      ${isMe
                        ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-2xl rounded-tr-sm'
                        : 'bg-white dark:bg-neutral-900 text-slate-800 dark:text-neutral-200 border border-slate-100 dark:border-neutral-800 rounded-2xl rounded-tl-sm'
                      }
                    `}>
                      {(() => {
                        const msg = m.message || '';
                        if (/^https?:\/\//.test(msg)){
                          const lower = msg.toLowerCase();
                          if (lower.match(/\.(png|jpe?g|gif|webp|svg)(\?|$)/)){
                            return (
                               <a href={msg} target="_blank" rel="noreferrer" className="block max-w-xs overflow-hidden rounded-lg mt-1 mb-1">
                                 <img src={msg} alt="file" className="max-w-full h-auto object-cover hover:scale-105 transition-transform duration-300"/>
                               </a>
                            );
                          }
                          return (<a href={msg} target="_blank" rel="noreferrer" className="underline break-all hover:text-sky-100">{msg}</a>);
                        }
                        return <span className="whitespace-pre-wrap leading-relaxed">{msg}</span>;
                      })()}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={bottom} />
          </>
        )}
      </div>
      
      <div className="p-3 bg-white dark:bg-neutral-900 border-t border-slate-100 dark:border-neutral-800 shrink-0">
        <div className="relative flex items-center bg-slate-50 dark:bg-black/50 rounded-xl border border-slate-200 dark:border-neutral-800 focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500 transition-all">
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
          
          {/* File Button */}
          <button
            onClick={handleFileSelect}
            className={`p-2 ml-1 text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors ${uploading ? 'animate-pulse' : ''}`}
            title="Upload file"
            disabled={uploading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          
          {/* Input Field */}
          <input 
            value={text} 
            onChange={e=>setText(e.target.value)} 
            onKeyDown={(e)=>{ if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); if(text.trim()) send(); } }} 
            placeholder="Type your message..." 
            className="flex-1 bg-transparent py-3 pl-2 pr-12 text-sm focus:outline-none text-slate-700 dark:text-neutral-200 placeholder:text-slate-400"
          />
          
          {/* Send Button (Absolute Positioned) */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2">
            <button 
              onClick={send} 
              disabled={!text.trim()} 
              className={`
                p-2 rounded-lg transition-all flex items-center justify-center
                ${text.trim() 
                  ? 'bg-sky-600 text-white shadow-md hover:bg-sky-700 hover:scale-105 active:scale-95' 
                  : 'bg-slate-200 dark:bg-neutral-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }
              `}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-90" viewBox="0 0 24 24" fill="currentColor">
                 <path d="M12 2L2 22l10-3 10 3L12 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
