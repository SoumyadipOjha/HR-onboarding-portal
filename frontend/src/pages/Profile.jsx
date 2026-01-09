import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Profile(){
  const { user, logout, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name:'', phone:'', email:'' });

  useEffect(()=>{
    async function load(){
      try{
        const res = await api.get('/user/me');
        setProfile(res.data.user);
        setForm({ name: res.data.user.name || '', phone: res.data.user.phone || '', email: res.data.user.email || '' });
      }catch(err){ console.error(err); }
    }
    load();
  },[]);

  const change = e => setForm(prev=>({ ...prev, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    try{
      const res = await api.put('/user/me', form);
      setProfile(res.data.user);
      updateUser(res.data.user);
      alert('Profile updated');
    }catch(err){ alert(err?.response?.data?.message || err.message); }
  }

  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('avatar', file);
    try{
      const res = await api.post('/user/me/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfile(res.data.user);
      updateUser(res.data.user);
    }catch(err){ console.error(err); alert('Upload failed'); }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      {profile ? (
        <form className="card space-y-3" onSubmit={submit}>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
              {profile.avatarURL ? <img src={profile.avatarURL} alt="avatar" className="w-full h-full object-cover" onError={(e)=>{e.target.style.display='none'; e.target.nextSibling.style.display='block'}} /> : null}
              <div className={`text-xl muted ${profile.avatarURL ? 'hidden' : 'block'}`}>{profile.name?.split(' ').map(n=>n[0]).join('')}</div>
            </div>
            <div>
              <label className="block text-sm">Change photo</label>
              <input type="file" onChange={uploadAvatar} />
            </div>
          </div>
          <div>
            <label className="block text-sm">Name</label>
            <input name="name" value={form.name} onChange={change} className="w-full p-2 border rounded bg-slate-50 dark:bg-neutral-800 border-slate-300 dark:border-slate-600 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm">Phone</label>
            <input name="phone" value={form.phone} onChange={change} className="w-full p-2 border rounded bg-slate-50 dark:bg-neutral-800 border-slate-300 dark:border-slate-600 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm">Email</label>
            <input name="email" value={form.email} onChange={change} className="w-full p-2 border rounded bg-slate-50 dark:bg-neutral-800 border-slate-300 dark:border-slate-600 dark:text-white" />
          </div>
          <div className="flex gap-2">
            <button className="btn-primary">Save</button>
            <button type="button" onClick={logout} className="btn-ghost">Logout</button>
          </div>
        </form>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  )
}
