import React, { useEffect, useState } from 'react';
import { getAnalytics } from '../../api/adminApi';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAnalytics()
      .then(setAnalytics)
      .catch(err => setError(err.response?.data?.error || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Admin Analytics</h2>
      <ul>
        <li><strong>SLA Compliance Rate:</strong> {analytics.slaComplianceRate}%</li>
        <li><strong>AI Accuracy:</strong> {analytics.aiAccuracy}</li>
        <li><strong>Resolution Rate:</strong> {analytics.resolutionRate}%</li>
      </ul>
    </div>
  );
};

export default Dashboard;
