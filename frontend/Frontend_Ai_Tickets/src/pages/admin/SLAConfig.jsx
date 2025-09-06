import React, { useEffect, useState } from 'react';
import { listSLA, createSLA, editSLA, deleteSLA } from '../../api/adminApi';

const SLAConfig = () => {
  const [slaPolicies, setSlaPolicies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', responseTime: 60, resolutionTime: 120, conditions: { categories: [] } });
  const [editId, setEditId] = useState(null);

  const fetchSLA = () => {
    setLoading(true);
    listSLA()
      .then(data => {
        setSlaPolicies(data.slaPolicies);
        setCategories(data.categories);
      })
      .catch(err => setError(err.response?.data?.error || 'Failed to load SLA policies'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSLA(); }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleCategoryChange = e => {
    setForm(f => ({ ...f, conditions: { ...f.conditions, categories: e.target.value.split(',').map(c => c.trim()) } }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const action = editId ? editSLA(editId, form) : createSLA(form);
    action.then(() => {
      setForm({ name: '', responseTime: 60, resolutionTime: 120, conditions: { categories: [] } });
      setEditId(null);
      fetchSLA();
    }).catch(err => setError(err.response?.data?.error || 'Failed to save SLA policy'));
  };

  const handleEdit = sla => {
    setEditId(sla._id);
    setForm({ ...sla });
  };

  const handleDelete = id => {
    deleteSLA(id).then(fetchSLA).catch(err => setError(err.response?.data?.error || 'Failed to delete SLA policy'));
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <div className="loading-text">Loading SLA policies...</div>
    </div>
  );
  
  if (error) return (
    <div className="form-container" style={{ maxWidth: '600px', margin: '50px auto', padding: '40px' }}>
      <div className="error-message">Error: {error}</div>
    </div>
  );

  return (
    <div className="sla-config-container">
      <div className="form-container" style={{ maxWidth: '800px', margin: '30px auto', padding: '40px' }}>
        <div className="form-header">
          <h1>SLA Management</h1>
          <h2>Service Level Agreements</h2>
          <p>Configure response and resolution time policies</p>
        </div>

        <form onSubmit={handleSubmit} className="sla-form">
          <div className="form-group">
            <label htmlFor="name">SLA Policy Name</label>
            <input 
              id="name"
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              placeholder="Enter SLA policy name" 
              required 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="responseTime">Response Time (minutes)</label>
              <input 
                id="responseTime"
                name="responseTime" 
                type="number" 
                value={form.responseTime} 
                onChange={handleChange} 
                placeholder="60" 
                required 
              />
              <small className="help-text">Time to first response</small>
            </div>

            <div className="form-group">
              <label htmlFor="resolutionTime">Resolution Time (minutes)</label>
              <input 
                id="resolutionTime"
                name="resolutionTime" 
                type="number" 
                value={form.resolutionTime} 
                onChange={handleChange} 
                placeholder="120" 
                required 
              />
              <small className="help-text">Time to resolve ticket</small>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="categories">Applicable Categories</label>
            <input 
              id="categories"
              name="categories" 
              value={form.conditions.categories.join(', ')} 
              onChange={handleCategoryChange} 
              placeholder="Technical Issue, Bug Report, Feature Request" 
            />
            <small className="help-text">Comma-separated categories (leave empty for all)</small>
          </div>

          <div className="form-actions">
            <button type="submit" className="form-button primary">
              {editId ? 'Update' : 'Create'} SLA Policy
            </button>
            {editId && (
              <button 
                type="button" 
                className="form-button secondary"
                onClick={() => { 
                  setEditId(null); 
                  setForm({ name: '', responseTime: 60, resolutionTime: 120, conditions: { categories: [] } }); 
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {slaPolicies.length > 0 && (
          <div className="sla-policies-section">
            <h3 style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '20px', fontSize: '1.5rem' }}>
              Existing SLA Policies
            </h3>
            <div className="sla-policies-list">
              {slaPolicies.map(sla => (
                <div key={sla._id} className="sla-policy-card">
                  <div className="sla-policy-info">
                    <h4 style={{ color: 'rgba(255, 255, 255, 0.95)', marginBottom: '10px' }}>
                      {sla.name}
                    </h4>
                    <div className="sla-policy-details">
                      <span className="sla-detail">Response: {sla.responseTime} min</span>
                      <span className="sla-detail">Resolution: {sla.resolutionTime} min</span>
                      {sla.conditions.categories?.length > 0 && (
                        <span className="sla-detail">Categories: {sla.conditions.categories.join(', ')}</span>
                      )}
                    </div>
                  </div>
                  <div className="sla-policy-actions">
                    <button 
                      onClick={() => handleEdit(sla)}
                      className="sla-button edit"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(sla._id)}
                      className="sla-button delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {categories.length > 0 && (
          <div className="categories-info">
            <h4 style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '10px' }}>
              Available Categories:
            </h4>
            <div className="categories-list">
              {categories.map((category, index) => (
                <span key={index} className="category-tag">
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SLAConfig;
