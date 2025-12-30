import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import ChatBox from '../components/ChatBox'

export default function ChatPage(){
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchParams] = useSearchParams();
  const userIdParam = searchParams.get('userId');

  useEffect(()=>{
    async function load(){
      try{
        const res = await api.get('/chat/contacts');
        setContacts(res.data.contacts || []);
        // Auto-select user from URL parameter if provided
        if (userIdParam && res.data.contacts) {
          const found = res.data.contacts.find(c => c._id === userIdParam);
          if (found) {
            setSelected(found._id);
          } else if (res.data.contacts.length) {
            setSelected(res.data.contacts[0]._id);
          }
        } else if (res.data.contacts && res.data.contacts.length) {
          setSelected(res.data.contacts[0]._id);
        }
      }catch(err){ console.error(err); }
    }
    load();
  },[]);

  // Update selected when URL parameter changes
  useEffect(() => {
    if (userIdParam && contacts.length) {
      const found = contacts.find(c => c._id === userIdParam);
      if (found) setSelected(found._id);
    }
  }, [userIdParam, contacts]);

  const [counts, setCounts] = useState({});

  useEffect(()=>{ async function loadCounts(){
    try{ const r = await api.get('/chat/unread-counts'); setCounts(r.data.counts || {}); }catch(e){}
  } loadCounts(); }, []);

  return (
    <div className="p-6 grid grid-cols-3 gap-6">
      <div className="col-span-1 card">
        <h3 className="font-semibold mb-2">Contacts</h3>
        <ul>
          {contacts.map(c=> (
            <li key={c._id} className={`py-2 cursor-pointer ${selected===c._id? 'bg-slate-100':''}`} onClick={()=>setSelected(c._id)}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-slate-600">{c.email}</div>
                </div>
                {counts[c._id] && <div className="text-xs bg-red-500 text-white px-2 py-1 rounded">{counts[c._id]}</div>}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="col-span-2">
        {selected ? <ChatBox withUserId={selected} /> : <div className="card">Select a contact to start chat</div>}
      </div>
    </div>
  )
}
