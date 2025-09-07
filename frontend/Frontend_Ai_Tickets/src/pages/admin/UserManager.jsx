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

  return (
    <div className="admin-dashboard">
      <Sidebar />
      <div className={`main-content ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>User Management</h1>
          </div>
          <div>User management functionality here...</div>
        </div>
      </div>
    </div>
  );
};

export default UserManager;
