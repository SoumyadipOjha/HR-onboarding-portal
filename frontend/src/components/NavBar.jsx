import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function NavBar(){
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
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
    <header className="w-full sticky top-0 z-30 bg-white/60 dark:bg-black/60 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4 text-slate-900 dark:text-neutral-100">
        {/* Left: logo + title */}
        <div className="flex items-center gap-4 flex-0">
          <Link to="/" className="flex items-center gap-3">
            {user && (
              <div className="block">
                <div className="nav-title">HireFlow</div>
                <div className="nav-sub">From offer to office</div>
              </div>
            )}
          </Link>
        </div>

        {/* Center: spacer (search removed) */}
        <div className="flex-1" />

        {/* Right: actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-0">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-neutral-400"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>

          {user ? (
            <>
              {(user.role === 'hr' || user.role === 'employee') && (
                <Link 
                  to={location.pathname === '/chat' ? (user.role === 'hr' ? '/hr' : '/employee') : '/chat'} 
                  className="flex items-center gap-2 px-3 py-2 sm:px-4 rounded-lg font-medium text-sm transition-all bg-sky-50 text-sky-600 hover:bg-sky-100 dark:bg-sky-900/20 dark:text-sky-400 dark:hover:bg-sky-900/30 border border-sky-100 dark:border-sky-900/50"
                >
                  {location.pathname === '/chat' ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                      Dashboard
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      Chat
                    </>
                  )}
                </Link>
              )}
              {/* {user.role === 'employee' && <Link to="/employee" className="btn-ghost text-xs sm:text-sm">Home</Link>} */}
              {/* {user.role === 'employee' && <Link to="/guide" className="btn-ghost text-xs sm:text-sm">Guide</Link>} */}
              <div className="ml-2 relative" ref={profileRef}>
                <button type="button" className="profile-avatar-btn" onClick={()=>setOpen(prev=>!prev)} aria-haspopup="true" aria-expanded={open}>
                  <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-full">
                    {user.avatarURL ? (
                      <img src={user.avatarURL} alt="avatar" className="w-full h-full object-cover" onError={(e)=>{e.target.style.display='none'; e.target.nextSibling.style.display='block'}} />
                    ) : null}
                    <div className={`text-slate-600 dark:text-neutral-300 font-medium ${user.avatarURL ? 'hidden' : 'block'}`}>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
                  </div>
                </button>
                {open && (
                  <div className="profile-menu">
                    <div className="px-3 py-2 border-b dark:border-neutral-800">
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
