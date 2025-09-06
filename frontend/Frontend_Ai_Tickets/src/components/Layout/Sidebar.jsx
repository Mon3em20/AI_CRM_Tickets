import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getMenuItems = () => {
    const commonItems = [
      { path: '/dashboard', label: 'Dashboard', icon: '📊' }
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...commonItems,
          { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
          { path: '/admin/sla', label: 'SLA Config', icon: '⚙️' },
          { path: '/admin/kb', label: 'Knowledge Base', icon: '📚' },
          { path: '/admin/audit', label: 'Audit Logs', icon: '📋' },
          { path: '/admin/users', label: 'User Management', icon: '👥' }
        ];
      
      case 'agent':
        return [
          ...commonItems,
          { path: '/agent/tickets', label: 'My Tickets', icon: '🎫' },
          { path: '/agent/kb', label: 'Knowledge Base', icon: '📚' },
          { path: '/agent/stats', label: 'My Stats', icon: '📊' }
        ];
      
      case 'customer':
        return [
          ...commonItems,
          { path: '/customer/tickets', label: 'My Tickets', icon: '🎫' },
          { path: '/customer/create', label: 'Create Ticket', icon: '➕' }
        ];
      
      default:
        return commonItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Menu</h3>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li 
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <button 
                className="nav-link"
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;