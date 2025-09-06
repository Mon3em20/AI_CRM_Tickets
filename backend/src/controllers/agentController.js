const { Ticket, User, AiLog, AuditLog } = require('../models');

const agentController = {
  // PUT /api/agent/tickets/:id/ai-response - Approve/edit/reject AI draft reply
  handleAiResponse: async (req, res) => {
    try {
      const { id } = req.params;
      const { action, content, feedback } = req.body; // action: 'approve', 'edit', 'reject'
      const agentId = req.user.userId;

      if (!['approve', 'edit', 'reject'].includes(action)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid action. Must be approve, edit, or reject'
        });
      }

      const ticket = await Ticket.findById(id);
      if (!ticket) {
        return res.status(404).json({
          status: 'error',
          message: 'Ticket not found'
        });
      }

      // Find the latest AI-generated reply that's pending approval
      const pendingAiReply = ticket.replies.find(reply => 
        reply.aiGenerated && !reply.aiMetadata.approved
      );

      if (!pendingAiReply) {
        return res.status(404).json({
          status: 'error',
          message: 'No pending AI response found'
        });
      }

      let updatedContent = pendingAiReply.content;
      let replyStatus = 'approved';

      if (action === 'edit') {
        if (!content) {
          return res.status(400).json({
            status: 'error',
            message: 'Content is required for edit action'
          });
        }
        pendingAiReply.aiMetadata.originalDraft = pendingAiReply.content;
        pendingAiReply.aiMetadata.editedContent = content;
        updatedContent = content;
        pendingAiReply.content = content;
      } else if (action === 'reject') {
        replyStatus = 'rejected';
        // Remove the rejected AI reply from the ticket
        ticket.replies = ticket.replies.filter(reply => 
          reply._id.toString() !== pendingAiReply._id.toString()
        );
      }

      if (action !== 'reject') {
        pendingAiReply.aiMetadata.approved = action === 'approve' || action === 'edit';
        pendingAiReply.aiMetadata.approvedBy = agentId;
      }

      await ticket.save();

      // Log the agent's action
      await AuditLog.logAction({
        actor: {
          userId: agentId,
          userRole: req.user.role
        },
        action: {
          type: `ai-${action}`,
          description: `Agent ${action}ed AI response for ticket ${ticket.ticketId}`,
          category: 'ai'
        },
        resource: {
          type: 'ticket',
          id: ticket._id.toString(),
          identifier: ticket.ticketId
        },
        changes: {
          before: { aiResponseStatus: 'pending' },
          after: { aiResponseStatus: replyStatus },
          metadata: { feedback, originalContent: pendingAiReply.content }
        },
        result: {
          success: true,
          statusCode: 200
        }
      });

      res.status(200).json({
        status: 'success',
        message: `AI response ${action}ed successfully`,
        data: {
          ticketId: ticket.ticketId,
          action,
          content: action !== 'reject' ? updatedContent : null
        }
      });

    } catch (error) {
      console.error('Error handling AI response:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  },

  // POST /api/agent/tickets/:id/escalate - Escalate ticket to senior team
  escalateTicket: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason, summary } = req.body;
      const agentId = req.user.userId;

      if (!reason) {
        return res.status(400).json({
          status: 'error',
          message: 'Escalation reason is required'
        });
      }

      const ticket = await Ticket.findById(id).populate('assignedAgent');
      if (!ticket) {
        return res.status(404).json({
          status: 'error',
          message: 'Ticket not found'
        });
      }

      if (ticket.escalation.isEscalated) {
        return res.status(400).json({
          status: 'error',
          message: 'Ticket is already escalated'
        });
      }

      // Update escalation details
      ticket.escalation = {
        isEscalated: true,
        escalatedAt: new Date(),
        escalatedBy: agentId,
        escalationReason: reason,
        escalationLevel: ticket.escalation.escalationLevel + 1,
        previousAgent: ticket.assignedAgent
      };

      // Update ticket status and remove current assignment
      ticket.status = 'escalated';
      ticket.assignedAgent = null;

      // Add internal note about escalation
      ticket.internalNotes.push({
        author: agentId,
        note: `Ticket escalated. Reason: ${reason}${summary ? `. Summary: ${summary}` : ''}`,
        createdAt: new Date()
      });

      await ticket.save();

      // Log the escalation
      await AuditLog.logAction({
        actor: {
          userId: agentId,
          userRole: req.user.role
        },
        action: {
          type: 'ticket-escalate',
          description: `Ticket ${ticket.ticketId} escalated to senior team`,
          category: 'ticket'
        },
        resource: {
          type: 'ticket',
          id: ticket._id.toString(),
          identifier: ticket.ticketId
        },
        changes: {
          before: { 
            status: 'in-progress',
            escalated: false 
          },
          after: { 
            status: 'escalated',
            escalated: true,
            escalationLevel: ticket.escalation.escalationLevel
          },
          metadata: { reason, summary }
        },
        result: {
          success: true,
          statusCode: 200
        }
      });

      res.status(200).json({
        status: 'success',
        message: 'Ticket escalated successfully',
        data: {
          ticketId: ticket.ticketId,
          escalationLevel: ticket.escalation.escalationLevel,
          escalatedAt: ticket.escalation.escalatedAt
        }
      });

    } catch (error) {
      console.error('Error escalating ticket:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  },

  // POST /api/agent/tickets/:id/replies - Add manual reply
  addReply: async (req, res) => {
    try {
      const { id } = req.params;
      const { content, isInternal = false } = req.body;
      const agentId = req.user.userId;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Reply content is required'
        });
      }

      if (content.length > 5000) {
        return res.status(400).json({
          status: 'error',
          message: 'Reply content cannot exceed 5000 characters'
        });
      }

      const ticket = await Ticket.findById(id);
      if (!ticket) {
        return res.status(404).json({
          status: 'error',
          message: 'Ticket not found'
        });
      }

      // Create new reply
      const newReply = {
        author: agentId,
        authorType: 'agent',
        content: content.trim(),
        isInternal,
        aiGenerated: false,
        createdAt: new Date()
      };

      ticket.replies.push(newReply);

      // Update ticket status if it was waiting for response
      if (ticket.status === 'open') {
        ticket.status = 'in-progress';
      }

      // Update first response time if this is the first agent response
      if (!ticket.slaMetrics.firstResponseTime) {
        ticket.slaMetrics.firstResponseTime = new Date();
      }

      await ticket.save();

      // Log the reply
      await AuditLog.logAction({
        actor: {
          userId: agentId,
          userRole: req.user.role
        },
        action: {
          type: 'create',
          description: `Agent added ${isInternal ? 'internal' : 'public'} reply to ticket ${ticket.ticketId}`,
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
            isInternal,
            contentLength: content.length
          }
        },
        result: {
          success: true,
          statusCode: 201
        }
      });

      res.status(201).json({
        status: 'success',
        message: 'Reply added successfully',
        data: {
          ticketId: ticket.ticketId,
          replyId: newReply._id,
          isInternal,
          createdAt: newReply.createdAt
        }
      });

    } catch (error) {
      console.error('Error adding reply:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  },

  // PUT /api/agent/tickets/:id/status - Update ticket status
  updateTicketStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, resolution } = req.body;
      const agentId = req.user.userId;

      const validStatuses = ['open', 'in-progress', 'waiting-customer', 'resolved', 'closed'];
      
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      const ticket = await Ticket.findById(id);
      if (!ticket) {
        return res.status(404).json({
          status: 'error',
          message: 'Ticket not found'
        });
      }

      const previousStatus = ticket.status;

      // Validate status transitions
      if (previousStatus === 'closed' && status !== 'open') {
        return res.status(400).json({
          status: 'error',
          message: 'Closed tickets can only be reopened'
        });
      }

      // Update status
      ticket.status = status;

      // Handle resolution
      if (status === 'resolved' || status === 'closed') {
        if (!ticket.slaMetrics.resolutionTime) {
          ticket.slaMetrics.resolutionTime = new Date();
        }
        
        if (resolution) {
          ticket.internalNotes.push({
            author: agentId,
            note: `Resolution: ${resolution}`,
            createdAt: new Date()
          });
        }
      }

      // Handle reopening
      if (previousStatus === 'closed' && status === 'open') {
        ticket.slaMetrics.resolutionTime = null;
      }

      await ticket.save();

      // Log the status change
      await AuditLog.logAction({
        actor: {
          userId: agentId,
          userRole: req.user.role
        },
        action: {
          type: 'update',
          description: `Ticket ${ticket.ticketId} status changed from ${previousStatus} to ${status}`,
          category: 'ticket'
        },
        resource: {
          type: 'ticket',
          id: ticket._id.toString(),
          identifier: ticket.ticketId
        },
        changes: {
          before: { status: previousStatus },
          after: { status },
          fields: ['status'],
          metadata: { resolution }
        },
        result: {
          success: true,
          statusCode: 200
        }
      });

      res.status(200).json({
        status: 'success',
        message: 'Ticket status updated successfully',
        data: {
          ticketId: ticket.ticketId,
          previousStatus,
          newStatus: status,
          updatedAt: ticket.updatedAt
        }
      });

    } catch (error) {
      console.error('Error updating ticket status:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  }
};

module.exports = agentController;