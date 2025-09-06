const { Ticket } = require('../models');

const ticketController = {
  // POST /api/tickets - Submit new ticket
  submitTicket: async (req, res) => {
    try {
      const { title, description, category, priority = 'medium' } = req.body;
      const customerId = req.user.userId;

      if (!title || !description || !category) {
        return res.status(400).json({
          status: 'error',
          message: 'Title, description, and category are required'
        });
      }

      const ticket = new Ticket({
        title,
        description,
        category,
        priority,
        customer: customerId
      });

      await ticket.save();

      res.status(201).json({
        status: 'success',
        message: 'Ticket submitted successfully',
        data: ticket
      });

    } catch (error) {
      console.error('Error submitting ticket:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  },

  // GET /api/tickets - List logged-in customer's tickets
  getCustomerTickets: async (req, res) => {
    try {
      const customerId = req.user.userId;

      const tickets = await Ticket.find({ customer: customerId })
        .sort({ createdAt: -1 });

      res.status(200).json({
        status: 'success',
        data: tickets
      });

    } catch (error) {
      console.error('Error fetching tickets:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  },

  // GET /api/tickets/:id - View specific ticket + replies + SLA
  getTicketById: async (req, res) => {
    try {
      const { id } = req.params;
      const customerId = req.user.userId;

      const ticket = await Ticket.findOne({ _id: id, customer: customerId })
        .populate('assignedAgent', 'name email')
        .populate('slaPolicy');

      if (!ticket) {
        return res.status(404).json({
          status: 'error',
          message: 'Ticket not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: ticket
      });

    } catch (error) {
      console.error('Error fetching ticket:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  },

  // POST /api/tickets/:id/attachments - Upload attachment
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
      const attachment = {
        fileName: file.name,
        originalName: file.name,
        filePath: `/uploads/${file.name}`,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedBy: customerId
      };

      ticket.attachments.push(attachment);
      await ticket.save();

      res.status(200).json({
        status: 'success',
        message: 'Attachment uploaded successfully',
        data: attachment
      });

    } catch (error) {
      console.error('Error uploading attachment:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  },

  // POST /api/tickets/:id/replies - Add comment/reply
  addReply: async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const customerId = req.user.userId;

      if (!content) {
        return res.status(400).json({
          status: 'error',
          message: 'Reply content is required'
        });
      }

      const ticket = await Ticket.findOne({ _id: id, customer: customerId });
      if (!ticket) {
        return res.status(404).json({
          status: 'error',
          message: 'Ticket not found'
        });
      }

      const reply = {
        author: customerId,
        authorType: 'customer',
        content,
        isInternal: false,
        aiGenerated: false
      };

      ticket.replies.push(reply);
      await ticket.save();

      res.status(201).json({
        status: 'success',
        message: 'Reply added successfully',
        data: reply
      });

    } catch (error) {
      console.error('Error adding reply:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  }
};

module.exports = ticketController;