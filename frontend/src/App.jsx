import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import AdminCreateUser from './pages/AdminCreateUser'
import ChatPage from './pages/ChatPage'
import Profile from './pages/Profile'
import HRDashboard from './pages/HRDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import Guide from './pages/Guide'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import Documentation from './pages/Documentation'

const Private = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <div>Access Denied</div>;
  return children;
};

import { useLocation } from 'react-router-dom'

export default function App(){
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

function AppContent() {
  const location = useLocation();
  const hideNavbarRoutes = ['/login', '/documentation'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);
  
  // Routes where we want specific layout handling (no default container/padding)
  const isFullScreen = location.pathname.startsWith('/chat');

  // Routes where Footer should be hidden
  const hideFooterRoutes = ['/login', '/documentation'];
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname) || location.pathname.startsWith('/chat');

  return (
    <div className={`${isFullScreen ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'} flex flex-col bg-slate-50 dark:bg-black transition-colors duration-300`}>
      {!shouldHideNavbar && <NavBar />}
      <main className={`flex-1 flex flex-col ${isFullScreen ? 'overflow-hidden relative' : ''} ${shouldHideNavbar || isFullScreen ? '' : "max-w-6xl mx-auto px-6 py-6 w-full"}`}>
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/documentation" element={<Documentation/>} />
          <Route path="/admin" element={<Private roles={["admin"]}><AdminDashboard/></Private>} />
          <Route path="/admin/create-user" element={<Private roles={["admin"]}><AdminCreateUser/></Private>} />
          <Route path="/chat" element={<Private><ChatPage/></Private>} />
          <Route path="/profile" element={<Private><Profile/></Private>} />
          <Route path="/dashboard" element={<Private><DashboardWrapper/></Private>} />
          <Route path="/guide" element={<Private roles={["employee"]}><Guide/></Private>} />
          <Route path="/hr" element={<Private roles={["hr"]}><HRDashboard/></Private>} />
          <Route path="/employee" element={<Private roles={["employee"]}><EmployeeDashboard/></Private>} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </main>
      {!shouldHideFooter && <Footer />}
    </div>
  )
}

function DashboardWrapper(){
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (user.role === 'hr') return <Navigate to="/hr" />;
  if (user.role === 'employee') return <Navigate to="/employee" />;
  return <div className="p-4">Dashboard</div>;
}
