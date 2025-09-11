const { Ticket, User, SLA, AuditLog, KB } = require('../models');

const ticketController = {
  // UC01 - Submit Ticket
  // POST /api/tickets - Submit new ticket (validation, create, save)
  submitTicket: async (req, res) => {
    try {
      const { title, description, category, priority = 'medium', tags } = req.body;
      const customerId = req.user.userId;

      // Enhanced validation
      if (!title || title.trim().length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Title is required and cannot be empty'
        });
      }

      if (!description || description.trim().length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Description is required and cannot be empty'
        });
      }

      if (!category || category.trim().length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Category is required and cannot be empty'
        });
      }

      // Validate priority
      const validPriorities = ['low', 'medium', 'high', 'critical'];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`
        });
      }

      // Validate title and description length
      if (title.length > 200) {
        return res.status(400).json({
          status: 'error',
          message: 'Title cannot exceed 200 characters'
        });
      }

      if (description.length > 5000) {
        return res.status(400).json({
          status: 'error',
          message: 'Description cannot exceed 5000 characters'
        });
      }

      // Create new ticket with auto-generated ticketId and timestamps
      const ticket = new Ticket({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        priority,
        customer: customerId,
        tags: tags || [],
        source: 'web',
        status: 'open'
      });

      // Generate ticketId manually if pre-save middleware fails
      if (!ticket.ticketId) {
        const count = await Ticket.countDocuments();
        ticket.ticketId = `TKT-${String(count + 1).padStart(6, '0')}`;
      }

      // Save ticket
      await ticket.save();

      // Store audit entry for UC12
      try {
        await AuditLog.logAction({
          actor: {
            userId: customerId,
            userRole: req.user.role || 'customer'
          },
          action: {
            type: 'ticket-submit',
            description: `New ticket created: ${ticket.ticketId}`,
            category: 'ticket'
          },
          resource: {
            type: 'ticket',
            id: ticket._id.toString(),
            identifier: ticket.ticketId
          },
          changes: {
            before: null,
            after: {
              title: ticket.title,
              category: ticket.category,
              priority: ticket.priority,
              status: ticket.status,
              source: ticket.source
            }
          },
          result: {
            success: true,
            statusCode: 201
          }
        });
      } catch (auditError) {
        console.error('Failed to create audit log entry:', auditError);
        // Continue execution even if audit logging fails
      }

      // Return response with generated ticket ID and timestamps
      res.status(201).json({
        status: 'success',
        message: 'Ticket submitted successfully',
        data: {
          _id: ticket._id,
          ticketId: ticket.ticketId,
          title: ticket.title,
          description: ticket.description,
          category: ticket.category,
          priority: ticket.priority,
          status: ticket.status,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt
        }
      });

    } catch (error) {
      console.error('Error submitting ticket:', error);
      
      // Log failed ticket submission for audit
      try {
        await AuditLog.logAction({
          actor: {
            userId: req.user?.userId,
            userRole: req.user?.role
          },
          action: {
            type: 'ticket-submit',
            description: 'Failed ticket submission',
            category: 'ticket'
          },
          resource: {
            type: 'ticket',
            id: null,
            identifier: null
          },
          result: {
            success: false,
            statusCode: 500,
            errorMessage: error.message
          }
        });
      } catch (auditError) {
        console.error('Failed to create audit log entry for error:', auditError);
      }

      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  },

  // UC02 - View Ticket Status & Replies
  // GET /api/tickets - List all tickets of logged-in customer with filters
  getCustomerTickets: async (req, res) => {
    try {
      const customerId = req.user.userId;
      const { status, priority, category, startDate, endDate, archived } = req.query;

      // Build filter object for role-based access
      let filter = { customer: customerId };

      // Apply filters for multiple tickets
      if (status) {
        filter.status = status;
      }

      if (priority) {
        filter.priority = priority;
      }

      if (category) {
        filter.category = category;
      }

      // Handle archived tickets gracefully
      if (archived === 'true') {
        filter.isArchived = true;
      } else {
        filter.isArchived = { $ne: true };
      }

      // Add date range filter
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) {
          filter.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          filter.createdAt.$lte = new Date(endDate);
        }
      }

      const tickets = await Ticket.find(filter)
        .populate('assignedAgent', 'name email')
        .populate('slaPolicy', 'name responseTime resolutionTime')
        .sort({ createdAt: -1 });

      res.status(200).json({
        status: 'success',
        data: tickets,
        filters: { status, priority, category, startDate, endDate, archived },
        count: tickets.length
      });

    } catch (error) {
      console.error('Error fetching tickets:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  },

  // UC02 - View specific ticket with timeline
  // GET /api/tickets/:id - View specific ticket + replies + SLA
  getTicketById: async (req, res) => {
    try {
      const { id } = req.params;
      const customerId = req.user.userId;

      const ticket = await Ticket.findOne({ _id: id, customer: customerId })
        .populate('assignedAgent', 'name email')
        .populate('slaPolicy', 'name responseTime resolutionTime priorities')
        .populate('replies.author', 'name email role')
        .populate('attachments.uploadedBy', 'name email');

      if (!ticket) {
        return res.status(404).json({
          status: 'error',
          message: 'Ticket not found'
        });
      }

      // Handle archived tickets gracefully
      if (ticket.isArchived) {
        return res.status(200).json({
          status: 'success',
          data: ticket,
          notice: 'This ticket has been archived'
        });
      }

      // Apply PII masking based on role - filter out internal notes for customers
      const filteredReplies = ticket.replies.filter(reply => !reply.isInternal);
      
      // Query timeline: messages, status, SLA, attachments
      const response = {
        ...ticket.toObject(),
        replies: filteredReplies,
        timeline: {
          created: ticket.createdAt,
          lastUpdated: ticket.updatedAt,
          firstResponse: ticket.slaMetrics?.firstResponseTime,
          resolution: ticket.slaMetrics?.resolutionTime,
          slaStatus: ticket.slaMetrics?.slaStatus,
          responseDeadline: ticket.slaMetrics?.responseDeadline,
          resolutionDeadline: ticket.slaMetrics?.resolutionDeadline
        }
      };

      res.status(200).json({
        status: 'success',
        data: response
      });

    } catch (error) {
      console.error('Error fetching ticket:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  },

  // UC03 - Add Attachment
  // POST /api/tickets/:id/attachments - File upload service + malware scan
  uploadAttachment: async (req, res) => {
    try {
      const { id } = req.params;
      const customerId = req.user.userId;

      if (!req.files || !req.files.attachment) {
        return res.status(400).json({
          status: 'error',
          message: 'No file uploaded'
        });
      }

      const ticket = await Ticket.findOne({ _id: id, customer: customerId });
      if (!ticket) {
        return res.status(404).json({
          status: 'error',
          message: 'Ticket not found'
        });
      }

      const file = req.files.attachment;

      // File validation (antivirus scan + file upload middleware)
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (file.size > maxFileSize) {
        return res.status(400).json({
          status: 'error',
          message: 'File size cannot exceed 10MB'
        });
      }

      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid file type. Allowed types: images, PDF, Word documents, Excel files, and text files'
        });
      }
      
      // Generate unique filename with timestamps
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const uploadPath = `src/uploads/${fileName}`;

      // Move file to uploads directory
      await file.mv(uploadPath);

      const attachment = {
        fileName: fileName,
        originalName: file.name,
        filePath: `/uploads/${fileName}`,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedBy: customerId,
        scanResult: {
          status: 'pending',
          scanDate: new Date()
        }
      };

      // Link file → ticket in DB
      ticket.attachments.push(attachment);

      // Insert system note in timeline
      const systemNote = {
        author: customerId,
        authorType: 'system',
        content: `File attachment uploaded: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
        isInternal: false,
        aiGenerated: false,
        createdAt: new Date()
      };

      ticket.replies.push(systemNote);
      await ticket.save();

      // Store audit entry for UC12
      try {
        await AuditLog.logAction({
          actor: {
            userId: customerId,
            userRole: req.user.role || 'customer'
          },
          action: {
            type: 'create',
            description: `Attachment uploaded to ticket ${ticket.ticketId}: ${file.name}`,
            category: 'ticket'
          },
          resource: {
            type: 'ticket',
            id: ticket._id.toString(),
            identifier: ticket.ticketId
          },
          changes: {
            after: {
              attachmentAdded: true,
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.mimetype
            }
          },
          result: {
            success: true,
            statusCode: 200
          }
        });
      } catch (auditError) {
        console.error('Failed to create audit log entry:', auditError);
      }

      res.status(200).json({
        status: 'success',
        message: 'Attachment uploaded successfully',
        data: {
          fileName: attachment.fileName,
          originalName: attachment.originalName,
          fileSize: attachment.fileSize,
          mimeType: attachment.mimeType,
          uploadedAt: attachment.createdAt,
          scanStatus: attachment.scanResult.status
        }
      });

    } catch (error) {
      console.error('Error uploading attachment:', error);

      // Log failed attachment upload for audit
      try {
        await AuditLog.logAction({
          actor: {
            userId: req.user?.userId,
            userRole: req.user?.role
          },
          action: {
            type: 'create',
            description: 'Failed attachment upload',
            category: 'ticket'
          },
          resource: {
            type: 'ticket',
            id: req.params.id,
            identifier: null
          },
          result: {
            success: false,
            statusCode: 500,
            errorMessage: error.message
          }
        });
      } catch (auditError) {
        console.error('Failed to create audit log entry for error:', auditError);
      }

      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  },

  // UC02 - Add comment/reply to ticket
  // POST /api/tickets/:id/replies - Add comment/reply to ticket
  addReply: async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const customerId = req.user.userId;

      // Enhanced validation
      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Reply content is required and cannot be empty'
        });
      }

      if (content.length > 5000) {
        return res.status(400).json({
          status: 'error',
          message: 'Reply content cannot exceed 5000 characters'
        });
      }

      const ticket = await Ticket.findOne({ _id: id, customer: customerId });
      if (!ticket) {
        return res.status(404).json({
          status: 'error',
          message: 'Ticket not found'
        });
      }

      // Check if ticket is closed
      if (ticket.status === 'closed') {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot add reply to a closed ticket'
        });
      }

      const reply = {
        author: customerId,
        authorType: 'customer',
        content: content.trim(),
        isInternal: false,
        aiGenerated: false,
        createdAt: new Date()
      };

      ticket.replies.push(reply);

      // Update ticket status if it was resolved/closed
      if (ticket.status === 'resolved') {
        ticket.status = 'open';
      }

      await ticket.save();

      // Store audit entry for UC12
      try {
        await AuditLog.logAction({
          actor: {
            userId: customerId,
            userRole: req.user.role || 'customer'
          },
          action: {
            type: 'create',
            description: `Customer added reply to ticket ${ticket.ticketId}`,
            category: 'ticket'
          },
          resource: {
            type: 'ticket',
            id: ticket._id.toString(),
            identifier: ticket.ticketId
          },
          changes: {
            after: {
              replyAdded: true,
              contentLength: content.trim().length,
              statusChanged: ticket.status === 'open'
            }
          },
          result: {
            success: true,
            statusCode: 201
          }
        });
      } catch (auditError) {
        console.error('Failed to create audit log entry:', auditError);
      }

      res.status(201).json({
        status: 'success',
        message: 'Reply added successfully',
        data: {
          _id: reply._id,
          content: reply.content,
          authorType: reply.authorType,
          createdAt: reply.createdAt,
          ticketStatus: ticket.status
        }
      });

    } catch (error) {
      console.error('Error adding reply:', error);

      // Log failed reply for audit
      try {
        await AuditLog.logAction({
          actor: {
            userId: req.user?.userId,
            userRole: req.user?.role
          },
          action: {
            type: 'create',
            description: 'Failed to add customer reply',
            category: 'ticket'
          },
          resource: {
            type: 'ticket',
            id: req.params.id,
            identifier: null
          },
          result: {
            success: false,
            statusCode: 500,
            errorMessage: error.message
          }
        });
      } catch (auditError) {
        console.error('Failed to create audit log entry for error:', auditError);
      }

      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  }
};

module.exports = ticketController;