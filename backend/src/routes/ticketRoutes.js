const express = require('express');
const ticketController = require('../controllers/ticketController');
const authentication = require('../middleware/authentication');
const authorization = require('../middleware/authorization');

const router = express.Router();

// Apply authentication to all ticket routes
router.use(authentication);

// Apply authorization - only customers can access these routes
router.use(authorization(['customer']));

// Ticket Routes
router.post('/', ticketController.submitTicket);
router.get('/', ticketController.getCustomerTickets);
router.get('/:id', ticketController.getTicketById);
router.post('/:id/attachments', ticketController.upload.single('file'), ticketController.uploadAttachment);
router.post('/:id/replies', ticketController.addReply);

module.exports = router;