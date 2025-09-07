const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authentication = require('../middleware/authentication');
const authorization = require('../middleware/authorization');

// Apply authentication to all admin routes
router.use(authentication);

// Apply authorization - only admins can access these routes
router.use(authorization(['admin']));

// GET /api/admin/analytics
router.get('/analytics', adminController.getAnalytics);

// GET /api/admin/audit
router.get('/audit', adminController.getAuditLogs);

// GET /api/admin/sla
router.get('/sla', adminController.listSLA);

// POST /api/admin/sla
router.post('/sla', adminController.createSLA);

// PUT /api/admin/sla/:id
router.put('/sla/:id', adminController.editSLA);

// DELETE /api/admin/sla/:id
router.delete('/sla/:id', adminController.deleteSLA);

// Knowledge Base Management Routes
// GET /api/admin/kb
router.get('/kb', adminController.listKB);

// POST /api/admin/kb
router.post('/kb', adminController.createKB);

// PUT /api/admin/kb/:id
router.put('/kb/:id', adminController.editKB);

// DELETE /api/admin/kb/:id
router.delete('/kb/:id', adminController.deleteKB);

// User Management Routes
// GET /api/admin/users
router.get('/users', adminController.listUsers);

// PUT /api/admin/users/:id
router.put('/users/:id', adminController.updateUser);

// DELETE /api/admin/users/:id
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
