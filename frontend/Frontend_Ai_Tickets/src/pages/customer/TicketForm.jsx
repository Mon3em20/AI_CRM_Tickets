import React, { useState } from 'react';
import { createTicket, uploadTicketAttachment } from '../../api/ticketApi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const TicketForm = ({ onTicketCreated }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Categories matching the backend data structure
  const categories = [
    'Technical Issue',
    'Account Problem',
    'Billing Question',
    'Feature Request',
    'Bug Report',
    'General Inquiry',
    'Other'
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const allowedFileTypes = [
    'image/jpeg', 'image/png', 'image/gif',
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    
    files.forEach(file => {
      // Check file size
      if (file.size > maxFileSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }
      
      // Check file type
      if (!allowedFileTypes.includes(file.type)) {
        toast.error(`File ${file.name} has an unsupported format.`);
        return;
      }
      
      validFiles.push(file);
    });
    
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadAttachments = async (ticketId) => {
    if (attachments.length === 0) return;
    
    setUploadingFiles(true);
    try {
      for (const file of attachments) {
        await uploadTicketAttachment(ticketId, file);
      }
      toast.success('Attachments uploaded successfully');
    } catch (error) {
      console.error('Error uploading attachments:', error);
      toast.error('Some attachments failed to upload');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    setLoading(true);

    try {
      // Create the ticket first
      const response = await createTicket(formData);
      
      if (response.status === 'success') {
        const ticketId = response.data._id;
        
        // Upload attachments if any
        if (attachments.length > 0) {
          await uploadAttachments(ticketId);
        }
        
        toast.success(`Ticket #${response.data.ticketId} created successfully!`);
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          category: '',
          priority: 'medium'
        });
        setAttachments([]);
        
        // Navigate back to dashboard or call callback
        if (onTicketCreated) {
          onTicketCreated(response.data);
        } else {
          navigate('/customer/dashboard');
        }
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  if (loading || uploadingFiles) {
    return (
      <div className="loading-container">
        <div className="loading-text">
          {uploadingFiles ? "Uploading attachments..." : "Creating ticket..."}
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-form-container">
      <div className="form-header">
        <h2>Create New Support Ticket</h2>
        <p>Please provide as much detail as possible to help us resolve your issue quickly.</p>
      </div>

      <form onSubmit={handleSubmit} className="ticket-form">
        {/* Title */}
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Brief description of your issue"
            required
            maxLength="200"
          />
          <small className="help-text">
            {formData.title.length}/200 characters
          </small>
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            {priorities.map(priority => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
          <small className="help-text">
            Select urgent only for critical issues that prevent you from working
          </small>
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Please describe your issue in detail. Include steps to reproduce, error messages, and expected behavior."
            required
            rows="6"
            maxLength="2000"
          />
          <small className="help-text">
            {formData.description.length}/2000 characters
          </small>
        </div>

        {/* File Attachments */}
        <div className="form-group">
          <label htmlFor="attachments">Attachments</label>
          <div className="file-upload-area">
            <input
              type="file"
              id="attachments"
              multiple
              onChange={handleFileSelect}
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
              className="file-input"
            />
            <div className="file-upload-text">
              <p>Choose files or drag and drop</p>
              <small>
                Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX, TXT<br />
                Maximum size: 10MB per file
              </small>
            </div>
          </div>

          {/* Selected Files */}
          {attachments.length > 0 && (
            <div className="selected-files">
              <h4>Selected Files:</h4>
              {attachments.map((file, index) => (
                <div key={index} className="file-item">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">({formatFileSize(file.size)})</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="remove-file"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/customer/dashboard')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || uploadingFiles}
          >
            {loading ? 'Creating...' : 'Create Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketForm;
