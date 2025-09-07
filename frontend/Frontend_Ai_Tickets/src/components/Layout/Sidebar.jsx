import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isCollapsed, isHovered, setIsHovered, toggleSidebar } = useSidebar();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth <= 768) {
      // Don't auto-close on mobile, let user control it
    }
  }, [location.pathname]);

  const getMenuItems = () => {
    const commonItems = [
      { path: '/dashboard', label: 'Dashboard', icon: '📊' }
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...commonItems,
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
    <>
      {/* Toggle Button */}
      <button 
        className="sidebar-toggle" 
        onClick={toggleSidebar}
        aria-label="Toggle Sidebar"
      >
        <span className="hamburger-icon">
          <span className={`line ${isCollapsed ? 'collapsed' : ''}`}></span>
          <span className={`line ${isCollapsed ? 'collapsed' : ''}`}></span>
          <span className={`line ${isCollapsed ? 'collapsed' : ''}`}></span>
        </span>
      </button>

      {/* Sidebar */}
      <aside 
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isHovered ? 'hovered' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="sidebar-header">
          <h3 className="sidebar-title">
            <span className="title-icon">🎛️</span>
            <span className="title-text">Control Panel</span>
          </h3>
          <button 
            className="close-btn"
            onClick={toggleSidebar}
            aria-label="Close Sidebar"
          >
            ✕
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item, index) => (
              <li 
                key={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <button 
                  className="nav-link"
                  onClick={() => navigate(item.path)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-arrow">→</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || '👤'}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-role">{user?.role || 'Role'}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div 
          className="sidebar-overlay"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;