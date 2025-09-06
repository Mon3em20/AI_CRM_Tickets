const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

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

module.exports = router;
