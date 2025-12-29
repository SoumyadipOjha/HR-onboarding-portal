import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try{
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin');
      if (user.role === 'hr') navigate('/hr');
      if (user.role === 'employee') navigate('/employee');
    }catch(err){
      alert('Login failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="card w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Sign in</h2>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="mb-2 w-full p-2 border rounded" />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="mb-4 w-full p-2 border rounded" />
        <button className="btn-primary">Login</button>
      </form>
    </div>
  )
}
