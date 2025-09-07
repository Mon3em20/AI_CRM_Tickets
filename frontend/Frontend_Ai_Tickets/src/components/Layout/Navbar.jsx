import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

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
        <div className="navbar-links">
          {user?.role === 'admin' && (
            <>
              <Link to="/admin/dashboard" className="nav-link">Admin Dashboard</Link>
              <Link to="/admin/users" className="nav-link">User Management</Link>
            </>
          )}
          {user?.role === 'agent' && (
            <Link to="/agent/dashboard" className="nav-link">Agent Dashboard</Link>
          )}
          {user?.role === 'customer' && (
            <Link to="/customer/dashboard" className="nav-link">Customer Dashboard</Link>
          )}
        </div>
        
        <div className="navbar-user">
          <span className="user-name">Welcome, {user?.name || user?.email}</span>
          <span className="user-role">({user?.role})</span>
        </div>
        
        <div className="navbar-actions">
          <Link to="/profile" className="btn-profile">Profile</Link>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <style>{`
        .navbar {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .navbar-brand h2 {
          color: #333;
          margin: 0;
          font-size: 1.5rem;
        }

        .navbar-menu {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .navbar-links {
          display: flex;
          gap: 1rem;
        }

        .nav-link {
          color: #333;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .nav-link:hover {
          background: rgba(0, 123, 255, 0.1);
          color: #007bff;
        }

        .navbar-user {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .user-name {
          font-weight: 600;
          color: #333;
        }

        .user-role {
          font-size: 0.8rem;
          color: #666;
          text-transform: capitalize;
        }

        .navbar-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .btn-profile {
          color: #007bff;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          transition: all 0.2s ease;
          background: rgba(0, 123, 255, 0.1);
          border: 1px solid rgba(0, 123, 255, 0.3);
        }

        .btn-profile:hover {
          background: rgba(0, 123, 255, 0.2);
          transform: translateY(-1px);
        }

        .btn-logout {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .btn-logout:hover {
          background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 1rem;
            flex-direction: column;
            gap: 1rem;
          }

          .navbar-menu {
            flex-direction: column;
            gap: 1rem;
            width: 100%;
          }

          .navbar-links {
            justify-content: center;
            flex-wrap: wrap;
          }

          .navbar-user {
            align-items: center;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;