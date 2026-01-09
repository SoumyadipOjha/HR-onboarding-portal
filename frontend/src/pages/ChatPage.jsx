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
        const contactsList = res.data?.contacts || [];
        setContacts(contactsList);
        
        let foundId = null;
        if (userIdParam) {
           // If userIdParam is present, use it. Try to find in contacts to get details.
           const found = contactsList.find(c => c._id === userIdParam);
           if (found) {
             setSelected(found._id);
             foundId = found._id;
           } else {
             // Not in contacts list? Force select it anyway so we can chat.
             setSelected(userIdParam);
             foundId = userIdParam;
             // We could fetch user details diff way, but likely getContacts covers it.
             // If getContacts missed it, we might have no name/avatar in UI, but chat works.
           }
        } else if (contactsList.length) {
          setSelected(contactsList[0]._id);
          foundId = contactsList[0]._id;
        }
      }catch(err){ console.error(err); }
    }
    load();
  },[]);

  // Update selected when URL parameter changes
  useEffect(() => {
    if (userIdParam) {
      setSelected(userIdParam);
    }
  }, [userIdParam]);

  const [counts, setCounts] = useState({});

  useEffect(()=>{ async function loadCounts(){
    try{ const r = await api.get('/chat/unread-counts'); setCounts(r.data.counts || {}); }catch(e){}
  } loadCounts(); }, []);

  const selectedContact = contacts.find(c => c._id === selected) || (selected === userIdParam ? { _id: selected, name: 'User', email: '' } : null);

  return (
    <div className="flex-1 flex flex-col md:p-6 p-0 overflow-hidden bg-slate-50 dark:bg-black md:bg-transparent min-h-0">
      <div className="flex-1 md:grid md:grid-cols-3 md:gap-6 min-h-0 relative flex flex-col md:flex-row">
        
        {/* Contact List: Shown on Desktop, or on Mobile when no chat selected */}
        <div className={`
           md:col-span-1 card flex flex-col overflow-hidden absolute inset-0 md:relative z-10 bg-white dark:bg-neutral-900
           ${selected ? 'hidden md:flex' : 'flex'}
        `}>
          <h3 className="font-semibold mb-4 px-2 pt-2 text-lg bg-white dark:bg-neutral-900 z-10 py-2 border-b dark:border-neutral-800 shrink-0">Messages</h3>
          <div className="flex-1 overflow-y-auto min-h-0">
            <ul className="space-y-1 pb-4 px-2">
            {contacts.map(c=> (
              <li key={c._id} className={`py-3 px-3 rounded-xl cursor-pointer transition-all border border-transparent ${selected===c._id? 'bg-sky-50 dark:bg-sky-900/20 border-sky-100 dark:border-sky-500/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`} onClick={()=>setSelected(c._id)}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center flex-shrink-0 text-sm font-bold overflow-hidden shadow-sm">
                      {c.avatarURL ? <img src={c.avatarURL} className="w-full h-full object-cover"/> : (c.name||'U').charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-800 dark:text-neutral-100 truncate">{c.name}</div>
                      <div className="text-xs text-slate-500 dark:text-neutral-400 truncate">{c.email}</div>
                    </div>
                  </div>
                  {counts[c._id] && <div className="text-[10px] font-bold bg-sky-500 text-white min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center rounded-full shadow-sm">{counts[c._id]}</div>}
                </div>
              </li>
            ))}
            {contacts.length === 0 && (
               <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                  <span className="text-4xl mb-2">📭</span>
                  <p>No contacts found</p>
               </div>
            )}
          </ul>
          </div>
        </div>

        {/* Chat Area: Shown on Desktop, or on Mobile when chat selected */}
        <div className={`
           md:col-span-2 flex flex-col overflow-hidden absolute inset-0 md:relative z-20 
           ${selected ? 'flex' : 'hidden md:flex'}
        `}>
          {selected ? (
             <div className="flex flex-col h-full bg-white dark:bg-neutral-900 md:rounded-2xl md:shadow-sm md:border md:border-slate-100 md:dark:border-neutral-800 overflow-hidden">
                {/* Unified Header (Mobile & Desktop) */}
                <div className="px-4 py-3 bg-white dark:bg-neutral-900 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between shrink-0 z-30">
                  <div className="flex items-center gap-3">
                     <button onClick={()=>setSelected(null)} className="md:hidden p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-neutral-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                     </button>
                     <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold overflow-hidden border-2 border-white dark:border-neutral-800 shadow-sm">
                        {selectedContact?.avatarURL ? <img src={selectedContact?.avatarURL} className="w-full h-full object-cover"/> : (selectedContact?.name||'U').charAt(0)}
                     </div>
                     <div>
                        <div className="font-bold text-slate-900 dark:text-white leading-tight">{selectedContact?.name || 'Chat'}</div>
                        {/* <div className="text-xs text-sky-500 font-medium flex items-center gap-1">
                           <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse"></span> Online
                        </div> */}
                     </div>
                  </div>
                  {/* Optional actions */}
                  <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                  </button>
                </div>
                
                {/* ChatBox Wrapper */}
                <div className="flex-1 overflow-hidden relative bg-slate-50 dark:bg-black">
                   <ChatBox withUserId={selected} userObj={selectedContact} compact={true} />
                </div>
             </div>
          ) : (
            <div className="hidden md:flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 card bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border-dashed">
                <div className="w-20 h-20 bg-slate-100 dark:bg-neutral-900 rounded-full flex items-center justify-center mb-4 text-4xl">💬</div>
                <div className="text-lg font-medium">Select a contact</div>
                <p className="text-sm opacity-75">Choose a person from the list to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
