import React, { useEffect, useState } from 'react';
import { getAuditLogs } from '../../api/adminApi';

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

  if (loading) return <div>Loading audit logs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Audit Logs</h2>
      <ul>
        {logs.map(log => (
          <li key={log._id}>
            <strong>{log.action.type}</strong> - {log.action.description} ({log.timestamp})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default KBManager;
