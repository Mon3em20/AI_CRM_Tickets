import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>AI CRM System</h2>
      </div>
      
      <div className="navbar-menu">
        <div className="navbar-user">
          <span className="user-name">Welcome, {user?.name || user?.email}</span>
          <span className="user-role">({user?.role})</span>
        </div>
        
        <div className="navbar-actions">
          <button className="btn-profile">Profile</button>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;