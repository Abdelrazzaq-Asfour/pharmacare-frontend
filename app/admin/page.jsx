// // Admin Control Center - Full User Data & RBAC Management
'use client';
import { useState, useEffect } from 'react';
import { MOCK_RETURN_REQUESTS, MOCK_INVOICES, MOCK_PRODUCTS } from '../utils/mockData';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '../services/api';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [returns, setReturns] = useState(MOCK_RETURN_REQUESTS);
  const [activeTab, setActiveTab] = useState('users');
  const [message, setMessage] = useState('');

  // نموذج إضافة مستخدم جديد
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'ROLE_INVENTORY_CLERK'
  });

  // حالة لتعديل بيانات المستخدم الكاملة
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'ROLE_INVENTORY_CLERK'
  });

  useEffect(() => {
    if (!user || !user.roles.includes('ROLE_ADMIN')) {
      router.push('/unauthorized');
    }
  }, [user]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const sessionData = localStorage.getItem('pharmacare_session');
      let token = sessionData ? JSON.parse(sessionData)?.token : '';
      const headers = { 'Authorization': `Bearer ${token}` };
      const data = await api.admin.getUsers({ headers });
      setUsers(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error('Failed to load users from backend:', err);
      setMessage('Could not load users from server.');
    }
  };

  const startEditUser = (u) => {
    setEditingUser(u.userId || u.id);
    setEditForm({
      username: u.username || '',
      email: u.email || '',
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      role: (u.roles && (u.roles[0]?.roleName || u.roles[0])) || 'ROLE_INVENTORY_CLERK'
    });
  };

  const handleUpdateUser = async (userId) => {
    setMessage('');
    try {
      const sessionData = localStorage.getItem('pharmacare_session');
      let token = sessionData ? JSON.parse(sessionData)?.token : '';
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

      await api.admin.updateUser(userId, {
        username: editForm.username,
        email: editForm.email,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        roles: [editForm.role]
      }, { headers });

      setMessage(`User #${userId} updated successfully!`);
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      console.error('Failed to update user:', err);
      setMessage(err.response?.data?.message || 'Failed to update user.');
    }
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const sessionData = localStorage.getItem('pharmacare_session');
      let token = sessionData ? JSON.parse(sessionData)?.token : '';
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

      await api.admin.registerUser({
        username: userForm.username,
        email: userForm.email,
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        password: userForm.password,
        roles: [userForm.role]
      }, { headers });
      
      setMessage(`Operator ${userForm.username} successfully provisioned.`);
      setUserForm({ username: '', email: '', firstName: '', lastName: '', password: '', role: 'ROLE_INVENTORY_CLERK' });
      loadUsers();
    } catch (err) {
      console.error('User registration failed:', err);
      setMessage(`Error: ${err?.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const sessionData = localStorage.getItem('pharmacare_session');
      let token = sessionData ? JSON.parse(sessionData)?.token : '';
      const headers = { 'Authorization': `Bearer ${token}` };

      await api.admin.deleteUser(userId, { headers });
      setMessage('User deleted successfully.');
      loadUsers();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Control Center</h1>
          <p className="text-xs text-slate-400 mt-1">Full User & RBAC Data Management</p>
        </div>
        <div className="flex flex-wrap space-x-2 gap-y-2">
          <button onClick={() => setActiveTab('users')} className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'users' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-300 border border-slate-800'}`}>Users</button>
          <button onClick={() => setActiveTab('registerUser')} className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'registerUser' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-300 border border-slate-800'}`}>+ Register User</button>
          {/* <button onClick={() => setActiveTab('reports')} className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'reports' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-300 border border-slate-800'}`}>Reports</button> */}
        </div>
      </div>

      {message && (
        <div className="my-4 p-4 bg-emerald-950/40 border border-emerald-800 text-emerald-200 text-xs rounded-lg">
          {message}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800"><h2 className="text-sm font-bold text-white">System Users Directory</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead><tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase"><th className="p-4">ID</th><th className="p-4">Username</th><th className="p-4">Full Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {users.map(u => {
                  const uId = u.userId || u.id;
                  const currentRole = (u.roles && (u.roles[0]?.roleName || u.roles[0])) || 'ROLE_INVENTORY_CLERK';
                  const isEditing = editingUser === uId;

                  return (
                    <tr key={uId} className="hover:bg-slate-850 transition-colors">
                      <td className="p-4 font-mono text-emerald-400">#{uId}</td>
                      <td className="p-4 font-medium text-white">
                        {isEditing ? (
                          <input type="text" value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs w-full" />
                        ) : (
                          u.username
                        )}
                      </td>
                      <td className="p-4 text-slate-300">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <input type="text" placeholder="First Name" value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs w-1/2" />
                            <input type="text" placeholder="Last Name" value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs w-1/2" />
                          </div>
                        ) : (
                          `${u.firstName || ''} ${u.lastName || ''}`
                        )}
                      </td>
                      <td className="p-4 text-slate-400">
                        {isEditing ? (
                          <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs w-full" />
                        ) : (
                          u.email
                        )}
                      </td>
                      <td className="p-4 font-mono text-emerald-400">
                        {isEditing ? (
                          <select value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})} className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-[11px] w-full">
                            <option value="ROLE_INVENTORY_CLERK">Inventory Clerk</option>
                            <option value="ROLE_PHARMACIST">Pharmacist (POS)</option>
                            <option value="ROLE_ADMIN">Administrator</option>
                          </select>
                        ) : (
                          currentRole
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {isEditing ? (
                          <>
                            <button onClick={() => handleUpdateUser(uId)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded text-[11px]">Save</button>
                            <button onClick={() => setEditingUser(null)} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded text-[11px]">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEditUser(u)} className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded text-[11px]">Edit</button>
                            <button onClick={() => handleDeleteUser(uId)} className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded text-[11px]">Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'registerUser' && (
        <div className="mt-6 max-w-xl bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-sm font-bold text-white mb-4">Register New System User</h2>
          <form onSubmit={handleRegisterUser} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 uppercase mb-1">Username</label>
              <input type="text" required placeholder="e.g. clerk_ahmad" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 uppercase mb-1">First Name</label>
                <input type="text" required placeholder="Ahmad" value={userForm.firstName} onChange={e => setUserForm({...userForm, firstName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 uppercase mb-1">Last Name</label>
                <input type="text" required placeholder="Ali" value={userForm.lastName} onChange={e => setUserForm({...userForm, lastName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white" />
              </div>
            </div>
            <div>
              <label className="block text-slate-300 uppercase mb-1">Email Address</label>
              <input type="email" required placeholder="user@pharmacare.com" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white" />
            </div>
            <div>
              <label className="block text-slate-300 uppercase mb-1">Password</label>
              <input type="password" required placeholder="••••••••" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white" />
            </div>
            <div>
              <label className="block text-slate-300 uppercase mb-1">Assign RBAC Role</label>
              <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white">
                <option value="ROLE_INVENTORY_CLERK">Inventory Clerk</option>
                <option value="ROLE_PHARMACIST">Pharmacist (POS)</option>
                <option value="ROLE_ADMIN">Administrator</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded transition-colors">Create User Account</button>
          </form>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-xs uppercase font-semibold text-slate-400">Total Completed Invoices</h3>
            <p className="text-3xl font-bold text-white mt-2">{MOCK_INVOICES.length}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-xs uppercase font-semibold text-slate-400">Total Sales Revenue</h3>
            <p className="text-3xl font-bold text-emerald-400 mt-2">${MOCK_INVOICES.reduce((acc, i) => acc + i.totalAmount, 0).toFixed(2)}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-xs uppercase font-semibold text-slate-400">Active Catalog Products</h3>
            <p className="text-3xl font-bold text-white mt-2">{MOCK_PRODUCTS.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}