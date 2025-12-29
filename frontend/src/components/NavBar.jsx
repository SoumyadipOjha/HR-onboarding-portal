import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NavBar(){
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const doLogout = () => { logout(); navigate('/login'); };

  // profile dropdown
  const [open, setOpen] = useState(false);
  const profileRef = useRef();
  useEffect(()=>{
    const onDoc = (ev) => { if (profileRef.current && !profileRef.current.contains(ev.target)) setOpen(false); };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  },[]);

  return (
    <header className="w-full sticky top-0 z-30 bg-white/60 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Left: logo + title */}
        <div className="flex items-center gap-4 flex-0">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-[var(--brand-300)] to-[var(--brand-500)] flex items-center justify-center text-white font-bold shadow-accent">HR</div>
            <div className="hidden sm:block">
              <div className="nav-title">HR Onboarding</div>
              <div className="nav-sub">People-first onboarding</div>
            </div>
          </Link>
        </div>

        {/* Center: spacer (search removed) */}
        <div className="flex-1" />

        {/* Right: actions */}
        <div className="flex items-center gap-3 flex-0">
          {user ? (
            <>
              <Link to="/dashboard" className="hidden md:inline-block btn-ghost">Dashboard</Link>
              {(user.role === 'hr' || user.role === 'employee') && <Link to="/chat" className="btn-ghost">Chat</Link>}
              <div className="ml-2 relative" ref={profileRef}>
                <button type="button" className="profile-avatar-btn" onClick={()=>setOpen(prev=>!prev)} aria-haspopup="true" aria-expanded={open}>
                  {user.avatarURL ? (
                    <img src={user.avatarURL} alt="avatar" />
                  ) : (
                    <div className="text-slate-600 font-medium">{user.name ? user.name.charAt(0) : 'U'}</div>
                  )}
                </button>
                {open && (
                  <div className="profile-menu">
                    <div className="px-3 py-2 border-b">
                      <div className="font-medium">{user.name}</div>
                      <div className="muted text-xs">{user.email}</div>
                    </div>
                    <Link to="/profile">Profile</Link>
                    <a href="#" onClick={(e)=>{ e.preventDefault(); /* future settings */ }}>Settings</a>
                    <a href="#" onClick={(e)=>{ e.preventDefault(); doLogout(); }}>Logout</a>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn-primary">Sign in</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
