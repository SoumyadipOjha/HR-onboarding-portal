import React, { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import api from '../services/api'

const socket = io('http://localhost:5000');

export default function ChatBox({ withUserId }){
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const bottom = useRef();
  const containerRef = useRef();

  useEffect(()=>{
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) socket.emit('join', { userId: user.id });
    socket.on('chat-message', (m)=>{
      setMsgs(prev=>[...prev, m]);
    });
    return ()=>{ socket.off('chat-message'); }
  },[]);

  useEffect(()=>{ async function load(){
    try{ const res = await api.get('/chat', { params: { withUserId } }); setMsgs(res.data.msgs || []); }catch(e){ console.error(e); }
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
    const payload = { senderId: user.id, receiverId: withUserId, message: text };
    socket.emit('chat-message', payload);
    setText('');
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-0 border border-slate-100 w-full flex flex-col min-h-[250px] sm:min-h-[280px] md:min-h-[320px] h-full" ref={containerRef}>
      <div className="flex-1 overflow-y-auto mb-0 p-2 sm:p-3 flex flex-col gap-2" style={{minHeight: 0}}>
        {msgs.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center p-4">
            <p className="text-xs sm:text-sm text-slate-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {msgs.map(m=> (
              <div key={m._id} className={`flex ${m.senderId===JSON.parse(localStorage.getItem('user'))?.id? 'justify-end': 'justify-start'}`}>
                <div className={`max-w-[80%] sm:max-w-[75%] md:max-w-[70%] ${
                  m.senderId===JSON.parse(localStorage.getItem('user'))?.id? 'text-right': 'text-left'
                }`}>
                  <div className={`inline-block p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm md:text-base break-words ${
                    m.senderId===JSON.parse(localStorage.getItem('user'))?.id
                      ? 'bg-indigo-500 text-white rounded-br-sm'
                      : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                  }`}>
                    {m.message}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottom} />
          </>
        )}
      </div>
      <div className="flex gap-2 mt-auto items-center border-t border-slate-200 p-2 sm:p-3 bg-slate-50 sm:bg-white">
        <input 
          value={text} 
          onChange={e=>setText(e.target.value)} 
          onKeyDown={(e)=>{ if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); if(text.trim()) send(); } }} 
          placeholder="Type a message" 
          className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2.5 md:py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent touch-manipulation min-h-[44px] sm:min-h-0" 
          aria-label="Message input" 
        />
        <button 
          onClick={send} 
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 sm:px-4 py-2.5 sm:py-2.5 md:py-2 rounded-lg shadow-md transition hover:shadow-lg active:scale-95 flex-shrink-0 touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={!text.trim()} 
          aria-label="Send message" 
          title="Send message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 16 16" fill="currentColor">
            <path d="M15.964.686a.5.5 0 0 0-.64-.495L.5 6.541a.5.5 0 0 0 .019.93l4.694 1.82 1.82 4.694a.5.5 0 0 0 .93.019l6.35-14.824a.5.5 0 0 0-.349-.032z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
