import React, { useState, useEffect } from 'react';
import { useSidebar } from '../../context/SidebarContext';
import Sidebar from '../../components/Layout/Sidebar';

const UserManager = () => {
  const { isCollapsed } = useSidebar();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'customer',
    isActive: true
  });

  // Sample data
  useEffect(() => {
    setTimeout(() => {
      setUsers([
        { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin', isActive: true, createdAt: '2024-01-15' },
        { id: 2, username: 'john_agent', email: 'john@example.com', role: 'agent', isActive: true, createdAt: '2024-02-10' },
        { id: 3, username: 'sarah_customer', email: 'sarah@example.com', role: 'customer', isActive: true, createdAt: '2024-03-05' },
        { id: 4, username: 'mike_agent', email: 'mike@example.com', role: 'agent', isActive: false, createdAt: '2024-03-15' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateUser = () => {
    setSelectedUser(null);
    setFormData({
      username: '',
      email: '',
      role: 'customer',
      isActive: true
    });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
    setShowModal(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedUser) {
      // Update user
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, ...formData }
          : user
      ));
    } else {
      // Create new user
      const newUser = {
        id: users.length + 1,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, newUser]);
    }
    setShowModal(false);
  };

  const toggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));
  };

  return (
    <div className="admin-dashboard">
      <Sidebar />
      <div className={`main-content ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>User Management</h1>
            <button 
              className="create-btn"
              onClick={handleCreateUser}
            >
              + Create User
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className={!user.isActive ? 'inactive-user' : ''}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge role-${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`status-toggle ${user.isActive ? 'active' : 'inactive'}`}
                          onClick={() => toggleUserStatus(user.id)}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td>{user.createdAt}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditUser(user)}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showModal && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h2>{selectedUser ? 'Edit User' : 'Create New User'}</h2>
                  <button 
                    className="close-btn"
                    onClick={() => setShowModal(false)}
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Username:</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Role:</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="customer">Customer</option>
                      <option value="agent">Agent</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      />
                      Active
                    </label>
                  </div>
                  <div className="modal-actions">
                    <button type="button" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit">
                      {selectedUser ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        <style>{`
          .users-table-container {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .users-table {
            width: 100%;
            border-collapse: collapse;
          }

          .users-table th,
          .users-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .users-table th {
            background: rgba(255, 255, 255, 0.1);
            font-weight: 600;
            color: #fff;
          }

          .users-table td {
            color: #f0f0f0;
          }

          .role-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
          }

          .role-admin {
            background: #ff6b6b;
            color: white;
          }

          .role-agent {
            background: #4ecdc4;
            color: white;
          }

          .role-customer {
            background: #45b7d1;
            color: white;
          }

          .status-toggle {
            padding: 4px 8px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          }

          .status-toggle.active {
            background: #4ecdc4;
            color: white;
          }

          .status-toggle.inactive {
            background: #666;
            color: white;
          }

          .action-buttons {
            display: flex;
            gap: 8px;
          }

          .edit-btn, .delete-btn {
            padding: 4px 8px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          }

          .edit-btn {
            background: #667eea;
            color: white;
          }

          .delete-btn {
            background: #ff6b6b;
            color: white;
          }

          .inactive-user {
            opacity: 0.6;
          }

          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .modal {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            min-width: 400px;
            color: white;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }

          .close-btn {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
          }

          .form-group {
            margin-bottom: 15px;
          }

          .form-group label {
            display: block;
            margin-bottom: 5px;
            color: #f0f0f0;
          }

          .form-group input,
          .form-group select {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
          }

          .modal-actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            margin-top: 20px;
          }

          .modal-actions button {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          }

          .modal-actions button[type="button"] {
            background: #666;
            color: white;
          }

          .modal-actions button[type="submit"] {
            background: #667eea;
            color: white;
          }
        `}</style>
      </div>
    </div>
  );
};

export default UserManager;