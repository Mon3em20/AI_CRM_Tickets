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

  if (loading) return <div>Loading SLA policies...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>SLA Policy Management</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="SLA Name" required />
        <input name="responseTime" type="number" value={form.responseTime} onChange={handleChange} placeholder="Response Time (min)" required />
        <input name="resolutionTime" type="number" value={form.resolutionTime} onChange={handleChange} placeholder="Resolution Time (min)" required />
        <input name="categories" value={form.conditions.categories.join(', ')} onChange={handleCategoryChange} placeholder="Categories (comma separated)" />
        <button type="submit">{editId ? 'Update' : 'Create'} SLA</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({ name: '', responseTime: 60, resolutionTime: 120, conditions: { categories: [] } }); }}>Cancel</button>}
      </form>
      <ul>
        {slaPolicies.map(sla => (
          <li key={sla._id}>
            <strong>{sla.name}</strong> (Response: {sla.responseTime} min, Resolution: {sla.resolutionTime} min, Categories: {sla.conditions.categories?.join(', ')})
            <button onClick={() => handleEdit(sla)}>Edit</button>
            <button onClick={() => handleDelete(sla._id)}>Delete</button>
          </li>
        ))}
      </ul>
      <div><strong>All Categories:</strong> {categories.join(', ')}</div>
    </div>
  );
};

export default SLAConfig;
