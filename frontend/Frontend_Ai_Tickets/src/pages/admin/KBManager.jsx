import React, { useEffect, useState } from 'react';
import { getAuditLogs } from '../../api/adminApi';
import Navbar from '../../components/Layout/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';

const KBManager = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAuditLogs()
      .then(setLogs)
      .catch(err => setError(err.response?.data?.error || 'Failed to load audit logs'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading audit logs..." />;
  
  if (error) return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Knowledge Base Manager</h1>
          <p>Error: {error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Knowledge Base Manager</h1>
          <p>Manage system audit logs and knowledge base entries</p>
        </div>

        <div className="dashboard-section">
          <h2>Audit Logs</h2>
          <div className="logs-container">
            {logs.length === 0 ? (
              <div className="no-tickets">No audit logs found</div>
            ) : (
              <div className="logs-grid">
                {logs.map(log => (
                  <div key={log._id} className="log-card">
                    <div className="log-header">
                      <span className="log-action">{log.action.type}</span>
                      <span className="log-timestamp">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="log-description">{log.action.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KBManager;
