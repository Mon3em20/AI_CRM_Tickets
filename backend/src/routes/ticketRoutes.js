const express = require('express');
const ticketController = require('../controllers/ticketController');
const authentication = require('../middleware/authentication');

const router = express.Router();

// Apply authentication to all ticket routes
router.use(authentication);

// Customer ticket routes
router.post('/', ticketController.submitTicket);
router.get('/', ticketController.getCustomerTickets);
router.get('/:id', ticketController.getTicketById);
router.post('/:id/attachments', ticketController.uploadAttachment);
router.post('/:id/replies', ticketController.addReply);

module.exports = router;