import React, { useEffect, useState } from 'react';
import { getAuditLogs } from '../../api/adminApi';
import Navbar from '../../components/Layout/Navbar';
import Sidebar from '../../components/Layout/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    actor: '',
    ticketId: '',
    startDate: '',
    endDate: '',
    action: '',
    entity: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const loadAuditLogs = async () => {
      try {
        setLoading(true);
        const activeFilters = {};
        Object.keys(filters).forEach(key => {
          if (filters[key]) activeFilters[key] = filters[key];
        });
        
        const response = await getAuditLogs(activeFilters);
        setLogs(response.logs || []);
        setPagination({
          total: response.total,
          page: response.page,
          pages: response.pages
        });
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };

    loadAuditLogs();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      actor: '',
      ticketId: '',
      startDate: '',
      endDate: '',
      action: '',
      entity: '',
      page: 1,
      limit: 20
    });
  };

  const getActionBadge = (action) => {
    const actionClasses = {
      create: 'action-create',
      update: 'action-update',
      delete: 'action-delete',
      login: 'action-login',
      logout: 'action-logout',
      access: 'action-access'
    };
    return <span className={`action-badge ${actionClasses[action] || 'action-default'}`}>{action}</span>;
  };

  const getEntityBadge = (entity) => {
    const entityClasses = {
      Ticket: 'entity-ticket',
      User: 'entity-user',
      SLA: 'entity-sla',
      KB: 'entity-kb',
      AI: 'entity-ai'
    };
    return <span className={`entity-badge ${entityClasses[entity] || 'entity-default'}`}>{entity}</span>;
  };

  if (loading && logs.length === 0) {
    return <LoadingSpinner message="Loading audit logs..." />;
  }

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-content">
        <Sidebar />
        <main className="main-content">
          <div className="dashboard-header">
            <h1>Audit Trail & Logging</h1>
            <p>View system audit logs with search and filter capabilities</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* Filters */}
          <div className="audit-filters">
            <div className="filter-row">
              <div className="filter-group">
                <label>Actor (User ID):</label>
                <input
                  type="text"
                  name="actor"
                  value={filters.actor}
                  onChange={handleFilterChange}
                  placeholder="Filter by user ID..."
                />
              </div>
              <div className="filter-group">
                <label>Ticket ID:</label>
                <input
                  type="text"
                  name="ticketId"
                  value={filters.ticketId}
                  onChange={handleFilterChange}
                  placeholder="Filter by ticket ID..."
                />
              </div>
              <div className="filter-group">
                <label>Action:</label>
                <select
                  name="action"
                  value={filters.action}
                  onChange={handleFilterChange}
                >
                  <option value="">All Actions</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="access">Access</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Entity:</label>
                <select
                  name="entity"
                  value={filters.entity}
                  onChange={handleFilterChange}
                >
                  <option value="">All Entities</option>
                  <option value="Ticket">Ticket</option>
                  <option value="User">User</option>
                  <option value="SLA">SLA</option>
                  <option value="KB">Knowledge Base</option>
                  <option value="AI">AI</option>
                </select>
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Start Date:</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="filter-group">
                <label>End Date:</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="filter-actions">
                <button onClick={clearFilters} className="btn-secondary">
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Applied Filters Display */}
          {Object.values(filters).some(value => value && value !== 1 && value !== 20) && (
            <div className="applied-filters">
              <h3>Applied Filters:</h3>
              <div className="filter-tags">
                {filters.actor && <span>Actor: {filters.actor}</span>}
                {filters.ticketId && <span>Ticket: {filters.ticketId}</span>}
                {filters.action && <span>Action: {filters.action}</span>}
                {filters.entity && <span>Entity: {filters.entity}</span>}
                {filters.startDate && <span>From: {new Date(filters.startDate).toLocaleString()}</span>}
                {filters.endDate && <span>To: {new Date(filters.endDate).toLocaleString()}</span>}
              </div>
            </div>
          )}

          {/* Audit Logs */}
          <div className="audit-logs">
            <div className="logs-header">
              <h2>Audit Logs ({pagination.total || 0})</h2>
              {loading && <span>Loading...</span>}
            </div>

            {logs.length === 0 ? (
              <div className="no-logs">No audit logs found</div>
            ) : (
              <div className="logs-list">
                {logs.map(log => (
                  <div key={log._id} className="log-entry">
                    <div className="log-header">
                      <div className="log-badges">
                        {getActionBadge(log.action)}
                        {getEntityBadge(log.entity)}
                      </div>
                      <div className="log-timestamp">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>

                    <div className="log-details">
                      <div className="log-actor">
                        <strong>Actor:</strong> {log.actor?.name || log.actor?.email || log.actor || 'Unknown'}
                        {log.actor?.role && <span className="actor-role">({log.actor.role})</span>}
                      </div>

                      {log.entityId && (
                        <div className="log-entity-id">
                          <strong>Entity ID:</strong> {log.entityId}
                        </div>
                      )}

                      {log.details && (
                        <div className="log-description">
                          <strong>Details:</strong>
                          <div className="details-content">
                            {typeof log.details === 'object' ? (
                              <pre>{JSON.stringify(log.details, null, 2)}</pre>
                            ) : (
                              <span>{log.details}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {log.ipAddress && (
                        <div className="log-ip">
                          <strong>IP Address:</strong> {log.ipAddress}
                        </div>
                      )}

                      {log.userAgent && (
                        <div className="log-user-agent">
                          <strong>User Agent:</strong> 
                          <span className="user-agent-text">{log.userAgent}</span>
                        </div>
                      )}

                      {log.sensitiveDataMasked && (
                        <div className="sensitive-data-notice">
                          <em>⚠️ Some sensitive data has been masked for privacy</em>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                  className="btn-secondary"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.pages}
                  className="btn-secondary"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Data Information */}
          <div className="data-info">
            <p><strong>Security Notice:</strong> All actions are logged for security and compliance purposes.</p>
            <p><strong>Data Retention:</strong> Audit logs are retained according to your organization's data retention policy.</p>
            <p><strong>Last Updated:</strong> {new Date().toLocaleString()}</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuditLogs;
