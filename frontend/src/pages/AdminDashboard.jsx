import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import PieChart from '../components/PieChart'

export default function AdminDashboard(){
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    async function load(){
      setLoading(true);
      try{
        const res = await api.get('/admin/users');
        setUsers(res.data.users || []);
      }catch(err){ console.error(err); }
      setLoading(false);
    }
    load();
  },[]);

  const hrs = users.filter(u=>u.role==='hr');
  const employees = users.filter(u=>u.role==='employee');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <div className="muted">Overview of HRs and Employees</div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/create-user" className="btn-primary">Create User</Link>
          <Link to="/profile" className="btn-ghost">Profile</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="stat-card">
          <div className="text-sm muted">Total HRs</div>
          <div className="text-2xl font-bold">{hrs.length}</div>
        </div>
        <div className="stat-card">
          <div className="text-sm muted">Total Employees</div>
          <div className="text-2xl font-bold">{employees.length}</div>
        </div>
        <div className="stat-card">
          <div className="text-sm muted">This Month</div>
          <div className="text-2xl font-bold">--</div>
        </div>
        <div className="stat-card">
          <div className="text-sm muted">Onboarding Progress</div>
          <div className="text-2xl font-bold">--</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h3 className="font-semibold mb-3">People</h3>
          {loading ? <div>Loading...</div> : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">HRs</h4>
                <ul className="space-y-2">
                  {hrs.map(h=> (
                    <li key={h._id} className="py-2 border-b last:border-b-0 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{h.name}</div>
                        <div className="text-sm muted">{h.email}</div>
                      </div>
                      <div className="text-sm muted">{h.createdAt ? new Date(h.createdAt).toLocaleDateString() : ''}</div>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Employees</h4>
                <ul className="space-y-2">
                  {employees.map(e=> (
                    <li key={e._id} className="py-2 border-b last:border-b-0">
                      <div className="font-medium">{e.name}</div>
                      <div className="text-sm muted">{e.email}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Composition</h3>
          <PieChart data={[{label:'HRs', value: hrs.length}, {label:'Employees', value: employees.length}]} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">
        <div className="card">
          <h3 className="font-semibold mb-3">Composition</h3>
          <PieChart data={[{label:'HRs', value: hrs.length}, {label:'Employees', value: employees.length}]} />
        </div>
        <div className="card">
          <h3 className="font-semibold mb-3">Onboarding Progress</h3>
          <div className="muted">Overall progress visualization placeholder</div>
        </div>
      </div>
    </div>
  )
}
