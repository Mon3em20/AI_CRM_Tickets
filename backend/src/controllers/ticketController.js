const { Ticket, User } = require('../models');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const ticketController = {
  // POST /api/tickets - Submit new ticket
  submitTicket: async (req, res) => {
    try {
      const { title, description, category, priority = 'medium' } = req.body;
      const customerId = req.user.userId;

      if (!title || !description || !category) {
        return res.status(400).json({ message: "Title, description, and category are required" });
      }

      const newTicket = new Ticket({
        title,
        description,
        customer: customerId,
        category,
        priority,
        status: 'open'
      });

      await newTicket.save();

      res.status(201).json({
        message: "Ticket submitted successfully",
        ticket: {
          id: newTicket._id,
          ticketId: newTicket.ticketId,
          title: newTicket.title,
          status: newTicket.status,
          priority: newTicket.priority,
          createdAt: newTicket.createdAt
        }
      });

    } catch (error) {
      console.error("Error submitting ticket:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // GET /api/tickets - List logged-in customer's tickets
  getCustomerTickets: async (req, res) => {
    try {
      const customerId = req.user.userId;

      const tickets = await Ticket.find({ customer: customerId })
        .select('ticketId title status priority category createdAt updatedAt')
        .sort({ createdAt: -1 });

      res.status(200).json({
        tickets
      });

    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // GET /api/tickets/:id - View specific ticket + replies + SLA
  getTicketById: async (req, res) => {
    try {
      const { id } = req.params;
      const customerId = req.user.userId;

      const ticket = await Ticket.findOne({ _id: id, customer: customerId })
        .populate('customer', 'name email')
        .populate('assignedAgent', 'name email')
        .populate('replies.author', 'name email role');

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      res.status(200).json({
        ticket
      });

    } catch (error) {
      console.error("Error fetching ticket:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // POST /api/tickets/:id/attachments - Upload attachment
  uploadAttachment: async (req, res) => {
    try {
      const { id } = req.params;
      const customerId = req.user.userId;

      const ticket = await Ticket.findOne({ _id: id, customer: customerId });
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const attachment = {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: customerId
      };

      ticket.attachments.push(attachment);
      await ticket.save();

      res.status(201).json({
        message: "Attachment uploaded successfully",
        attachment: {
          fileName: attachment.fileName,
          originalName: attachment.originalName,
          fileSize: attachment.fileSize
        }
      });

    } catch (error) {
      console.error("Error uploading attachment:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // POST /api/tickets/:id/replies - Add comment/reply
  addReply: async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const customerId = req.user.userId;

      if (!content) {
        return res.status(400).json({ message: "Reply content is required" });
      }

      const ticket = await Ticket.findOne({ _id: id, customer: customerId });
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      const newReply = {
        author: customerId,
        authorType: 'customer',
        content,
        createdAt: new Date()
      };

      ticket.replies.push(newReply);
      await ticket.save();

      res.status(201).json({
        message: "Reply added successfully",
        reply: {
          id: newReply._id,
          content: newReply.content,
          createdAt: newReply.createdAt
        }
      });

    } catch (error) {
      console.error("Error adding reply:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
};

// Export upload middleware along with controller
ticketController.upload = upload;

module.exports = ticketController;