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
import NavBar from './components/NavBar'

const Private = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <div>Access Denied</div>;
  return children;
};

export default function App(){
  return (
    <AuthProvider>
      <NavBar />
      <main className="max-w-6xl mx-auto px-6 py-6">
      <Routes>
        <Route path="/login" element={<Login/>} />
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
    </AuthProvider>
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
