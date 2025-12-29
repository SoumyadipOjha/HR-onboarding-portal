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
    <div className="card w-full flex flex-col" style={{minHeight: '320px'}} ref={containerRef}>
      <div className="flex-1 overflow-auto mb-2 p-2" style={{display:'flex', flexDirection:'column', gap: '8px'}}>
        {msgs.map(m=> (
          <div key={m._id} className={`${m.senderId===JSON.parse(localStorage.getItem('user'))?.id? 'self-end text-right':''}`}>
            <div className="inline-block p-2 bg-slate-100 rounded-md">{m.message}</div>
          </div>
        ))}
        <div ref={bottom} />
      </div>
      <div className="flex gap-2 mt-auto">
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message" className="flex-1 p-2 border rounded" />
        <button onClick={send} className="btn-primary">Send</button>
      </div>
    </div>
  )
}
