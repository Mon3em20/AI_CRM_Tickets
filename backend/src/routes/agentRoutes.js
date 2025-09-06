const express = require('express');
const agentController = require('../controllers/agentController');
const authentication = require('../middleware/authentication');
const authorization = require('../middleware/authorization');

const router = express.Router();

// Apply authentication to all agent routes
router.use(authentication);

// Apply authorization - only agents and admins can access these routes
router.use(authorization(['agent', 'admin']));

// Agent Routes
router.put('/tickets/:id/ai-response', agentController.handleAiResponse);
router.post('/tickets/:id/escalate', agentController.escalateTicket);
router.post('/tickets/:id/replies', agentController.addReply);
router.put('/tickets/:id/status', agentController.updateTicketStatus);

module.exports = router;