import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateProfile } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const Profile = () => {
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    createdAt: '',
    lastLogin: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getCurrentUser();
      setProfileData({
        name: data.user.name || '',
        email: data.user.email || '',
        phone: data.user.phone || '',
        role: data.user.role || '',
        createdAt: data.user.createdAt || '',
        lastLogin: data.user.lastLogin || ''
      });
      setError(null);
    } catch (error) {
      console.error('Error loading profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const updateData = {
        name: profileData.name,
        phone: profileData.phone
      };

      const response = await updateProfile(updateData);
      
      // Update the user in context
      if (setUser) {
        setUser(response.user);
      }

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="profile-page">
      <div className="glass-card">
        <div className="card-header">
          <h2>My Profile</h2>
          <p>Manage your personal information</p>
        </div>

        {error && (
          <div className="message error-message">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="message success-message">
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                disabled
                className="disabled-field"
                title="Email cannot be changed"
              />
              <small className="field-note">Email address cannot be changed</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <input
                type="text"
                id="role"
                name="role"
                value={profileData.role}
                disabled
                className="disabled-field"
                title="Role cannot be changed"
              />
              <small className="field-note">Role is assigned by administrators</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="createdAt">Member Since</label>
              <input
                type="text"
                id="createdAt"
                value={profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : ''}
                disabled
                className="disabled-field"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastLogin">Last Login</label>
              <input
                type="text"
                id="lastLogin"
                value={profileData.lastLogin ? new Date(profileData.lastLogin).toLocaleString() : 'Never'}
                disabled
                className="disabled-field"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={loadProfile}
              disabled={saving}
            >
              Reset Changes
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .profile-page {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
          min-height: 100vh;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 40px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .card-header {
          margin-bottom: 30px;
          text-align: center;
        }

        .card-header h2 {
          color: rgba(255, 255, 255, 0.95);
          margin-bottom: 10px;
          font-size: 2rem;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .card-header p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          font-size: 1.1rem;
        }

        .message {
          padding: 15px;
          border-radius: 12px;
          margin-bottom: 20px;
          backdrop-filter: blur(10px);
        }

        .error-message {
          background: rgba(245, 101, 101, 0.1);
          border: 1px solid rgba(245, 101, 101, 0.3);
          color: #fc8181;
        }

        .success-message {
          background: rgba(72, 187, 120, 0.1);
          border: 1px solid rgba(72, 187, 120, 0.3);
          color: #68d391;
        }

        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
        }

        .form-group input {
          padding: 12px 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
          font-size: 1rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .form-group input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }

        .disabled-field {
          background: rgba(255, 255, 255, 0.05) !important;
          color: rgba(255, 255, 255, 0.5) !important;
          cursor: not-allowed !important;
        }

        .field-note {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.8rem;
          margin-top: -4px;
        }

        .form-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 30px;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s ease;
          min-width: 140px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #5a67d8, #6b46c1);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: linear-gradient(135deg, #a0aec0, #718096);
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: linear-gradient(135deg, #718096, #4a5568);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(160, 174, 192, 0.4);
        }

        @media (max-width: 768px) {
          .profile-page {
            padding: 10px;
          }

          .glass-card {
            padding: 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .form-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .btn {
            min-width: auto;
          }

          .card-header h2 {
            font-size: 1.6rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;
