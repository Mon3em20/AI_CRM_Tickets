const { SLA, AuditLog, Ticket, AiLog } = require('../models');

// GET /api/admin/analytics
exports.getAnalytics = async (req, res) => {
  try {
    // SLA compliance: % of tickets resolved within SLA
    const totalTickets = await Ticket.countDocuments();
    const slaCompliant = await Ticket.countDocuments({
      'slaMetrics.slaStatus': { $in: ['on-track', 'at-risk'] },
      status: 'resolved'
    });
    const slaComplianceRate = totalTickets ? ((slaCompliant / totalTickets) * 100).toFixed(2) : 0;

    // AI accuracy: average accuracy from AiLog humanFeedback
    const aiLogs = await AiLog.find({ 'humanFeedback.accuracy': { $exists: true } });
    const aiAccuracy = aiLogs.length
      ? (aiLogs.reduce((sum, log) => sum + (log.humanFeedback.accuracy || 0), 0) / aiLogs.length).toFixed(2)
      : 0;

    // Resolution rate: % of tickets resolved
    const resolvedTickets = await Ticket.countDocuments({ status: 'resolved' });
    const resolutionRate = totalTickets ? ((resolvedTickets / totalTickets) * 100).toFixed(2) : 0;

    res.json({
      slaComplianceRate: Number(slaComplianceRate),
      aiAccuracy: Number(aiAccuracy),
      resolutionRate: Number(resolutionRate)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics', details: err.message });
  }
};

// GET /api/admin/audit
exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const logs = await AuditLog.getAuditTrail({}, { page: Number(page), limit: Number(limit) });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs', details: err.message });
  }
};

// GET /api/admin/sla
exports.listSLA = async (req, res) => {
  try {
    const slaPolicies = await SLA.find().lean();
    // Extract unique categories from all SLA policies
    const categories = [...new Set(slaPolicies.flatMap(sla => sla.conditions.categories || []))];
    res.json({ slaPolicies, categories });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch SLA policies', details: err.message });
  }
};

// POST /api/admin/sla
exports.createSLA = async (req, res) => {
  try {
    const sla = new SLA({ ...req.body, createdBy: req.user._id });
    await sla.save();
    res.status(201).json(sla);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create SLA policy', details: err.message });
  }
};

// PUT /api/admin/sla/:id
exports.editSLA = async (req, res) => {
  try {
    const sla = await SLA.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!sla) return res.status(404).json({ error: 'SLA policy not found' });
    res.json(sla);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update SLA policy', details: err.message });
  }
};

// DELETE /api/admin/sla/:id
exports.deleteSLA = async (req, res) => {
  try {
    const sla = await SLA.findByIdAndDelete(req.params.id);
    if (!sla) return res.status(404).json({ error: 'SLA policy not found' });
    res.json({ message: 'SLA policy deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete SLA policy', details: err.message });
  }
};
