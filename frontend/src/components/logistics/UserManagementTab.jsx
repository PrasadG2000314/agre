import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  X, 
  Check, 
  UserCheck 
} from 'lucide-react';
import { api } from '../../services/api';

const ROLES = ['All', 'Admin', 'Driver', 'Seller', 'Buyer'];

export default function UserManagementTab({ users, onReloadUsers }) {
  const [roleFilter, setRoleFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit User State
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState('Buyer');
  const [editStatus, setEditStatus] = useState('Active');
  const [editLocation, setEditLocation] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // New User State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Driver');
  const [newPhone, setNewPhone] = useState('');
  const [newLocation, setNewLocation] = useState('Central Logistics Depot');
  const [creatingUser, setCreatingUser] = useState(false);

  const safeUsers = Array.isArray(users) ? users : [];
  const filteredUsers = safeUsers.filter(u => {
    if (!u) return false;
    const matchesRole = roleFilter === 'All' || (u.role && u.role.toLowerCase() === roleFilter.toLowerCase());
    const matchesSearch = !searchQuery || 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.location && u.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditStatus(user.status || 'Active');
    setEditLocation(user.location || '');
    setEditPhone(user.phone || '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingEdit(true);
    try {
      const res = await api.updateUser(editingUser.id || editingUser._id, {
        role: editRole,
        status: editStatus,
        location: editLocation,
        phone: editPhone
      });
      if (res.success) {
        setEditingUser(null);
        onReloadUsers();
      }
    } catch (err) {
      alert('Error updating user: ' + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      const res = await api.createUser({
        name: newName,
        email: newEmail,
        password: 'pass123',
        role: newRole,
        phone: newPhone,
        location: newLocation,
        status: 'Active'
      });
      if (res.success) {
        setShowAddModal(false);
        setNewName('');
        setNewEmail('');
        onReloadUsers();
      }
    } catch (err) {
      alert('Error creating user: ' + err.message);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user from the system?')) return;
    try {
      await api.deleteUser(userId);
      onReloadUsers();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  return (
    <div>
      <div className="data-table-container">
        {/* Table Top Header & Controls */}
        <div className="table-header-bar">
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#064e3b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} />
              <span>User & Role Access Management</span>
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
              Manage system permissions, account roles (Admin, Driver, Seller, Buyer), and user credentials.
            </p>
          </div>

          <button 
            className="btn-primary" 
            onClick={() => setShowAddModal(true)}
            id="btn-add-new-user"
          >
            <UserPlus size={16} />
            <span>Add New User / Partner</span>
          </button>
        </div>

        {/* Filters Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {ROLES.map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  background: roleFilter === r ? '#064e3b' : '#ffffff',
                  color: roleFilter === r ? '#ffffff' : '#475569',
                  border: '1px solid #cbd5e1'
                }}
              >
                {r === 'All' ? 'All Roles' : r}
              </button>
            ))}
          </div>

          <div className="table-search-box">
            <Search size={16} className="table-search-icon" />
            <input 
              type="text" 
              placeholder="Filter by name, email, or hub..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Users Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>User / Profile</th>
                <th>Assigned Role</th>
                <th>Contact Phone</th>
                <th>Assigned Hub / Farm</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    No users found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id || u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img 
                          src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`} 
                          alt={u.name} 
                          style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                        />
                        <div>
                          <strong style={{ color: '#0f172a' }}>{u.name}</strong>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`role-badge role-${u.role.toLowerCase()}`}>
                        {u.role}
                      </span>
                    </td>

                    <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                      {u.phone || 'N/A'}
                    </td>

                    <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={13} color="#059669" />
                        <span>{u.location || 'Central Depot'}</span>
                      </div>
                    </td>

                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        background: u.status === 'Active' ? '#ecfdf5' : '#fef2f2',
                        color: u.status === 'Active' ? '#047857' : '#b91c1c'
                      }}>
                        {u.status || 'Active'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.45rem' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                          onClick={() => handleOpenEdit(u)}
                          title="Edit User Role & Permissions"
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </button>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '0.4rem', color: '#ef4444' }}
                          onClick={() => handleDeleteUser(u.id || u._id)}
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-backdrop" onClick={() => setEditingUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Edit User Access: {editingUser.name}</h3>
              <button onClick={() => setEditingUser(null)} style={{ color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Role & Permission Level:</label>
                  <select value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                    <option value="Admin">Admin (Full Control)</option>
                    <option value="Driver">Driver / Logistics Partner</option>
                    <option value="Seller">Seller (Agri Producer)</option>
                    <option value="Buyer">Buyer (Consumer / Grocer)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Account Status:</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                    <option value="Active">Active (Permitted)</option>
                    <option value="Suspended">Suspended (Blocked)</option>
                    <option value="Pending Verification">Pending Verification</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Contact Phone Number:</label>
                  <input 
                    type="text" 
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Assigned Hub / Farm Location:</label>
                  <input 
                    type="text" 
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={savingEdit}>
                  {savingEdit ? 'Saving...' : 'Save Role Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New User Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Add New User / Logistics Partner</h3>
              <button onClick={() => setShowAddModal(false)} style={{ color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name / Company Name:</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Maria Gonzalez"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Official Email Address:</label>
                  <input 
                    type="email" 
                    placeholder="e.g. maria@agrilog.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Assigned Role:</label>
                  <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                    <option value="Admin">Admin (Operations Manager)</option>
                    <option value="Driver">Driver / Logistics Partner</option>
                    <option value="Seller">Seller (Farm Producer)</option>
                    <option value="Buyer">Buyer (Wholesale / Retail)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Contact Phone:</label>
                  <input 
                    type="text" 
                    placeholder="+1 (555) 000-0000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Hub / Terminal Location:</label>
                  <input 
                    type="text" 
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creatingUser}>
                  {creatingUser ? 'Creating...' : 'Register User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
