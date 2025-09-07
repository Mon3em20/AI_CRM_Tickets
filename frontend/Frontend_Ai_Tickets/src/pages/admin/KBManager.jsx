import React, { useEffect, useState, useCallback } from 'react';
import { useSidebar } from '../../context/SidebarContext';
import Navbar from '../../components/Layout/Navbar';
import Sidebar from '../../components/Layout/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';

const KBManager = () => {
  const { isCollapsed } = useSidebar();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: '',
    subcategory: '',
    tags: '',
    keywords: '',
    status: 'draft',
    visibility: 'internal',
    changeDescription: ''
  });

  // Mock API functions
  const createKB = async (data) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newArticle = {
          ...data,
          _id: Date.now().toString(),
          version: '1.0',
          author: { name: 'Current User', email: 'user@example.com' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setArticles(prev => [newArticle, ...prev]);
        resolve(newArticle);
      }, 500);
    });
  };

  const editKB = async (id, data) => {
    return new Promise(resolve => {
      setTimeout(() => {
        setArticles(prev => prev.map(article => 
          article._id === id 
            ? { ...article, ...data, updatedAt: new Date().toISOString() }
            : article
        ));
        resolve({ success: true });
      }, 500);
    });
  };

  const deleteKB = async (id) => {
    return new Promise(resolve => {
      setTimeout(() => {
        setArticles(prev => prev.filter(article => article._id !== id));
        resolve({ success: true });
      }, 500);
    });
  };

  const createSampleData = async () => {
    try {
      const sampleArticles = [
        {
          title: 'Password Reset Procedure',
          content: `# Password Reset Procedure

## For End Users
1. Go to the login page
2. Click "Forgot Password"
3. Enter your email address
4. Check your email for reset link
5. Follow the link and create a new password

## Password Requirements
- Minimum 8 characters
- Must include uppercase and lowercase letters
- Must include at least one number
- Must include at least one special character

## Troubleshooting
If you don't receive the email:
- Check your spam folder
- Verify the email address is correct
- Contact IT support if issues persist`,
          summary: 'Step-by-step guide for users to reset their passwords and troubleshooting common issues.',
          category: 'Authentication',
          subcategory: 'Password Management',
          tags: 'password,reset,security,login',
          keywords: 'password reset,forgot password,login issues',
          status: 'published',
          visibility: 'public'
        },
        {
          title: 'How to Submit a Support Ticket',
          content: `# How to Submit a Support Ticket

## Getting Started
1. Log into the support portal
2. Click "Create New Ticket"
3. Select the appropriate category
4. Set the priority level

## Writing an Effective Ticket
- Use a clear, descriptive title
- Provide detailed description of the issue
- Include steps to reproduce the problem
- Attach relevant screenshots or files
- Specify the urgency level

## Priority Levels
- **Critical**: System down, security breach
- **High**: Major functionality affected
- **Medium**: Minor issues, feature requests
- **Low**: General questions, documentation

## What Happens Next
- You'll receive a confirmation email
- A support agent will be assigned
- Updates will be sent to your email
- You can track progress in the portal`,
          summary: 'Complete guide for users on how to create effective support tickets and understand the support process.',
          category: 'Support Process',
          subcategory: 'Ticket Creation',
          tags: 'support,ticket,helpdesk,process',
          keywords: 'create ticket,support request,help',
          status: 'published',
          visibility: 'public'
        },
        {
          title: 'Network Connectivity Troubleshooting',
          content: `# Network Connectivity Troubleshooting

## Basic Steps
1. Check physical connections
2. Restart your network adapter
3. Run network diagnostics
4. Check with other devices

## Advanced Troubleshooting
- Flush DNS cache: \`ipconfig /flushdns\`
- Reset network stack: \`netsh winsock reset\`
- Update network drivers
- Check firewall settings

## When to Escalate
Contact IT immediately if:
- Multiple users affected
- Security-related issues
- Hardware failures suspected
- VPN connection problems

## Common Solutions
- Restart router/modem
- Check cable connections
- Verify network settings
- Update network drivers`,
          summary: 'Comprehensive troubleshooting guide for common network connectivity issues.',
          category: 'Technical Support',
          subcategory: 'Network Issues',
          tags: 'network,connectivity,troubleshooting,internet',
          keywords: 'network problems,internet down,connection issues',
          status: 'published',
          visibility: 'internal'
        }
      ];

      for (const article of sampleArticles) {
        await createKB(article);
      }
      
      // Reload articles after creating samples
      loadArticles();
    } catch (error) {
      console.error('Error creating sample data:', error);
    }
  };

  const loadArticles = useCallback(async () => {
    try {
      setLoading(true);
      // Sample data for demonstration
      const allSampleArticles = [
        {
          _id: '1',
          title: 'Password Reset Procedure',
          summary: 'Step-by-step guide for resetting user passwords',
          category: 'Authentication',
          status: 'published',
          visibility: 'public',
          version: '1.2',
          author: { name: 'John Doe', email: 'john@example.com' },
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-03-10T14:30:00Z',
          tags: ['password', 'reset', 'authentication'],
          keywords: ['password', 'forgot', 'reset', 'login']
        },
        {
          _id: '2',
          title: 'Email Configuration Guide',
          summary: 'How to configure email settings for notifications',
          category: 'Configuration',
          status: 'published',
          visibility: 'internal',
          version: '2.0',
          author: { name: 'Jane Smith', email: 'jane@example.com' },
          createdAt: '2024-02-20T09:15:00Z',
          updatedAt: '2024-03-15T11:45:00Z',
          tags: ['email', 'configuration', 'notifications'],
          keywords: ['email', 'smtp', 'configuration', 'notifications']
        },
        {
          _id: '3',
          title: 'Ticket Escalation Process',
          summary: 'Guidelines for escalating support tickets',
          category: 'Process',
          status: 'published',
          visibility: 'internal',
          version: '1.5',
          author: { name: 'Mike Johnson', email: 'mike@example.com' },
          createdAt: '2024-01-30T16:20:00Z',
          updatedAt: '2024-03-12T13:10:00Z',
          tags: ['escalation', 'process', 'support'],
          keywords: ['escalation', 'priority', 'support', 'tickets']
        },
        {
          _id: '4',
          title: 'API Documentation',
          summary: 'Complete API reference and examples',
          category: 'Technical',
          status: 'draft',
          visibility: 'internal',
          version: '1.0',
          author: { name: 'Sarah Wilson', email: 'sarah@example.com' },
          createdAt: '2024-03-01T12:00:00Z',
          updatedAt: '2024-03-18T10:30:00Z',
          tags: ['api', 'documentation', 'technical'],
          keywords: ['api', 'endpoints', 'documentation', 'reference']
        },
        {
          _id: '5',
          title: 'Security Best Practices',
          summary: 'Security guidelines and recommendations',
          category: 'Security',
          status: 'published',
          visibility: 'public',
          version: '3.1',
          author: { name: 'Alex Brown', email: 'alex@example.com' },
          createdAt: '2024-01-10T08:30:00Z',
          updatedAt: '2024-03-20T15:20:00Z',
          tags: ['security', 'best-practices', 'guidelines'],
          keywords: ['security', 'authentication', 'encryption', 'privacy']
        }
      ];
      
      // Apply filters
      let filteredArticles = allSampleArticles;
      
      if (filters.status) {
        filteredArticles = filteredArticles.filter(article => 
          article.status === filters.status
        );
      }
      
      if (filters.category) {
        filteredArticles = filteredArticles.filter(article => 
          article.category.toLowerCase().includes(filters.category.toLowerCase())
        );
      }
      
      setArticles(filteredArticles);
      setPagination({
        total: filteredArticles.length,
        page: 1,
        pages: 1
      });
    } catch (err) {
      setError(err.message || 'Failed to load KB articles');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        keywords: formData.keywords.split(',').map(keyword => keyword.trim()).filter(keyword => keyword)
      };

      if (editingArticle) {
        await editKB(editingArticle._id, submitData);
      } else {
        await createKB(submitData);
      }

      resetForm();
      loadArticles();
      alert(editingArticle ? 'Article updated successfully!' : 'Article created successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      summary: article.summary || '',
      category: article.category,
      subcategory: article.subcategory || '',
      tags: article.tags ? article.tags.join(', ') : '',
      keywords: article.keywords ? article.keywords.join(', ') : '',
      status: article.status,
      visibility: article.visibility,
      changeDescription: ''
    });
    setShowForm(true);
  };

  const handleDelete = async (articleId, hasUsage = false) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    
    try {
      await deleteKB(articleId, hasUsage);
      loadArticles();
      alert('Article deleted successfully!');
    } catch (err) {
      if (err.message.includes('referenced by tickets')) {
        if (confirm('This article is referenced by tickets. Force delete anyway?')) {
          await deleteKB(articleId, true);
          loadArticles();
          alert('Article deleted successfully!');
        }
      } else {
        alert(`Error: ${err.message}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      summary: '',
      category: '',
      subcategory: '',
      tags: '',
      keywords: '',
      status: 'draft',
      visibility: 'internal',
      changeDescription: ''
    });
    setEditingArticle(null);
    setShowForm(false);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      draft: 'status-draft',
      review: 'status-review',
      published: 'status-published',
      archived: 'status-archived',
      deprecated: 'status-deprecated'
    };
    return <span className={`status-badge ${statusClasses[status]}`}>{status}</span>;
  };

  if (loading && articles.length === 0) {
    return <LoadingSpinner message="Loading KB articles..." />;
  }

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-content">
        <Sidebar />
        <main className={`main-content ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
          <div className="dashboard-header">
            <h1>Knowledge Base Manager</h1>
            <p>Manage knowledge base articles with versioning and review process</p>
            <button 
              onClick={() => setShowForm(!showForm)} 
              className="btn-primary"
            >
              {showForm ? 'Cancel' : 'Add New Article'}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* Filters */}
          <div className="kb-filters">
            <div className="filter-group">
              <label>Status:</label>
              <select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
                <option value="deprecated">Deprecated</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Category:</label>
              <input
                type="text"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                placeholder="Filter by category..."
              />
            </div>
          </div>

          {/* Article Form */}
          {showForm && (
            <div className="kb-form-container">
              <h2>{editingArticle ? 'Edit Article' : 'Create New Article'}</h2>
              <form onSubmit={handleSubmit} className="kb-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      required
                      maxLength="200"
                    />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Subcategory</label>
                    <input
                      type="text"
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Visibility</label>
                    <select
                      name="visibility"
                      value={formData.visibility}
                      onChange={handleFormChange}
                    >
                      <option value="public">Public</option>
                      <option value="internal">Internal</option>
                      <option value="agent-only">Agent Only</option>
                      <option value="admin-only">Admin Only</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Summary</label>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleFormChange}
                    rows="2"
                    maxLength="500"
                    placeholder="Brief summary of the article..."
                  />
                </div>

                <div className="form-group">
                  <label>Content *</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleFormChange}
                    rows="10"
                    required
                    maxLength="10000"
                    placeholder="Article content..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tags (comma-separated)</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleFormChange}
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Keywords (comma-separated)</label>
                    <input
                      type="text"
                      name="keywords"
                      value={formData.keywords}
                      onChange={handleFormChange}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                    >
                      <option value="draft">Draft</option>
                      <option value="review">Review</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  {editingArticle && (
                    <div className="form-group">
                      <label>Change Description</label>
                      <input
                        type="text"
                        name="changeDescription"
                        value={formData.changeDescription}
                        onChange={handleFormChange}
                        placeholder="Describe your changes..."
                      />
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingArticle ? 'Update Article' : 'Create Article'}
                  </button>
                  <button type="button" onClick={resetForm} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Articles List */}
          <div className="kb-articles-list">
            <div className="articles-header">
              <h2>Knowledge Base Articles ({pagination.total || 0})</h2>
              {loading && <span className="loading-indicator">Loading...</span>}
            </div>

            {articles.length === 0 ? (
              <div className="no-articles">
                <div className="empty-state">
                  <div className="empty-icon">📚</div>
                  <h3>No Knowledge Base Articles Found</h3>
                  <p>Your knowledge base is empty. Create your first article to get started!</p>
                  <div className="empty-actions">
                    <button 
                      onClick={() => setShowForm(true)} 
                      className="btn-primary"
                    >
                      Create First Article
                    </button>
                    <button 
                      onClick={createSampleData} 
                      className="btn-secondary"
                    >
                      Add Sample Articles
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="kb-articles-grid">
                {articles.map(article => (
                  <div key={article._id} className="kb-article-card">
                    <div className="article-header">
                      <h3>{article.title}</h3>
                      <div className="article-meta">
                        {getStatusBadge(article.status)}
                        <span className="article-version">v{article.version}</span>
                      </div>
                    </div>

                    <div className="article-info">
                      <p><strong>Category:</strong> {article.category}</p>
                      {article.subcategory && <p><strong>Subcategory:</strong> {article.subcategory}</p>}
                      <p><strong>Visibility:</strong> {article.visibility}</p>
                      <p><strong>Created:</strong> {new Date(article.createdAt).toLocaleDateString()}</p>
                      <p><strong>Updated:</strong> {new Date(article.updatedAt).toLocaleDateString()}</p>
                      {article.analytics?.viewCount && (
                        <p><strong>Views:</strong> {article.analytics.viewCount}</p>
                      )}
                    </div>

                    {article.summary && (
                      <div className="article-summary">
                        <p>{article.summary}</p>
                      </div>
                    )}

                    {article.tags && article.tags.length > 0 && (
                      <div className="article-tags">
                        {article.tags.map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}

                    <div className="article-actions">
                      <button 
                        onClick={() => handleEdit(article)} 
                        className="btn-edit"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(article._id, article.analytics?.usedInTickets?.length > 0)} 
                        className="btn-delete"
                      >
                        Delete
                      </button>
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
                <span>Page {pagination.page} of {pagination.pages}</span>
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
        </main>
      </div>

      <style>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
        }

        .dashboard-content {
          display: flex;
          width: 100%;
        }

        .main-content {
          flex: 1;
          margin-left: 280px;
          padding: 30px;
          background: transparent;
          min-height: 100vh;
        }

        .dashboard-header {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          text-align: center;
        }

        .dashboard-header h1 {
          color: rgba(255, 255, 255, 0.95);
          margin-bottom: 10px;
          font-size: 2.5rem;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .dashboard-header p {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 20px;
          font-size: 1.1rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #5a67d8, #6b46c1);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .error-message {
          background: rgba(245, 101, 101, 0.1);
          border: 1px solid rgba(245, 101, 101, 0.3);
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 20px;
          color: #fc8181;
          backdrop-filter: blur(10px);
          text-align: center;
          font-weight: 500;
        }

        .kb-filters {
          display: flex;
          gap: 20px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          margin-bottom: 30px;
          flex-wrap: wrap;
          align-items: end;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-group label {
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .filter-group input,
        .filter-group select {
          padding: 10px 14px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
          min-width: 200px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .filter-group input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .filter-group input:focus,
        .filter-group select:focus {
          outline: none;
          border-color: #667eea;
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }

        .filter-group select option {
          background: rgba(102, 126, 234, 0.9);
          color: white;
        }

        .kb-form-container {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .kb-form h2 {
          color: rgba(255, 255, 255, 0.95);
          margin-bottom: 25px;
          font-size: 1.8rem;
          font-weight: 700;
          text-align: center;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 12px 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
          font-size: 1rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .form-group textarea {
          min-height: 120px;
          resize: vertical;
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }

        .form-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 30px;
        }

        .btn-secondary {
          background: linear-gradient(135deg, #a0aec0, #718096);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 15px rgba(160, 174, 192, 0.3);
        }

        .btn-secondary:hover {
          background: linear-gradient(135deg, #718096, #4a5568);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(160, 174, 192, 0.4);
        }

        .kb-articles-list {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 30px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .articles-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .articles-header h2 {
          color: rgba(255, 255, 255, 0.95);
          font-size: 1.8rem;
          font-weight: 700;
          margin: 0;
        }

        .loading-indicator {
          color: rgba(255, 255, 255, 0.7);
          font-style: italic;
        }

        .kb-articles-grid {
          display: grid;
          gap: 20px;
          margin-bottom: 30px;
        }

        .kb-article-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 25px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .kb-article-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
        }

        .kb-article-card:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
        }

        .article-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .article-title {
          color: rgba(255, 255, 255, 0.95);
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 8px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .article-meta {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
          flex-wrap: wrap;
        }

        .meta-item {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 4px 8px;
          border-radius: 8px;
          backdrop-filter: blur(5px);
        }

        .article-summary {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
          margin-bottom: 20px;
          font-size: 0.95rem;
        }

        .article-tags {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .tag {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 4px 10px;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .status-badge.draft {
          background: linear-gradient(135deg, #a0aec0, #718096);
          color: white;
        }

        .status-badge.review {
          background: linear-gradient(135deg, #f6ad55, #ed8936);
          color: white;
        }

        .status-badge.published {
          background: linear-gradient(135deg, #48bb78, #38a169);
          color: white;
        }

        .status-badge.archived {
          background: linear-gradient(135deg, #cbd5e0, #a0aec0);
          color: white;
        }

        .status-badge.deprecated {
          background: linear-gradient(135deg, #f56565, #e53e3e);
          color: white;
        }

        .article-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .btn-edit {
          background: linear-gradient(135deg, #4299e1, #3182ce);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-edit:hover {
          background: linear-gradient(135deg, #3182ce, #2c5282);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
        }

        .btn-delete {
          background: linear-gradient(135deg, #f56565, #e53e3e);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-delete:hover {
          background: linear-gradient(135deg, #e53e3e, #c53030);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(245, 101, 101, 0.3);
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 30px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          backdrop-filter: blur(10px);
        }

        .pagination span {
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
        }

        .no-articles {
          text-align: center;
          padding: 60px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 1.2rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .empty-state {
          max-width: 400px;
          margin: 0 auto;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.5rem;
          margin-bottom: 15px;
          font-weight: 700;
        }

        .empty-state p {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 30px;
          line-height: 1.6;
        }

        .empty-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
            padding: 15px;
          }

          .dashboard-header h1 {
            font-size: 2rem;
          }

          .kb-filters {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-group input,
          .filter-group select {
            min-width: 100%;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .article-header {
            flex-direction: column;
            gap: 15px;
          }

          .article-actions {
            justify-content: flex-start;
          }

          .pagination {
            flex-direction: column;
            gap: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default KBManager;
