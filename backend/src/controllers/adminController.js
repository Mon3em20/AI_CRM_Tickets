const { SLA, AuditLog, Ticket, AiLog, KB, User } = require('../models');

// GET /api/admin/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, category, priority } = req.query;
    const dateFilter = {};
    const ticketFilter = {};
    
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
      ticketFilter.createdAt = dateFilter.createdAt;
    }
    
    if (category) ticketFilter.category = category;
    if (priority) ticketFilter.priority = priority;

    // SLA compliance: % of tickets resolved within SLA
    const totalTickets = await Ticket.countDocuments(ticketFilter);
    const slaCompliant = await Ticket.countDocuments({
      ...ticketFilter,
      'slaMetrics.slaStatus': { $in: ['on-track', 'at-risk'] },
      status: 'resolved'
    });
    const slaComplianceRate = totalTickets ? ((slaCompliant / totalTickets) * 100).toFixed(2) : 0;

    // AI accuracy: average accuracy from AiLog humanFeedback
    const aiFilter = { ...dateFilter };
    if (category) aiFilter['metadata.category'] = category;
    const aiLogs = await AiLog.find({ 
      ...aiFilter,
      'humanFeedback.accuracy': { $exists: true } 
    });
    const aiAccuracy = aiLogs.length
      ? (aiLogs.reduce((sum, log) => sum + (log.humanFeedback.accuracy || 0), 0) / aiLogs.length).toFixed(2)
      : 0;

    // Resolution rate: % of tickets resolved
    const resolvedTickets = await Ticket.countDocuments({ 
      ...ticketFilter, 
      status: 'resolved' 
    });
    const resolutionRate = totalTickets ? ((resolvedTickets / totalTickets) * 100).toFixed(2) : 0;

    // Backlog metrics
    const openTickets = await Ticket.countDocuments({ 
      ...ticketFilter, 
      status: { $in: ['open', 'in-progress'] } 
    });
    
    // Average resolution time (in hours)
    const resolvedTicketsWithTime = await Ticket.find({
      ...ticketFilter,
      status: 'resolved',
      resolvedAt: { $exists: true }
    }).select('createdAt resolvedAt');

    const avgResolutionTime = resolvedTicketsWithTime.length
      ? resolvedTicketsWithTime.reduce((sum, ticket) => {
          const resolutionTime = (new Date(ticket.resolvedAt) - new Date(ticket.createdAt)) / (1000 * 60 * 60);
          return sum + resolutionTime;
        }, 0) / resolvedTicketsWithTime.length
      : 0;

    // SLA breach count
    const slaBreaches = await Ticket.countDocuments({
      ...ticketFilter,
      'slaMetrics.slaStatus': 'breached'
    });

    // Auto-response rate
    const totalAiResponses = await AiLog.countDocuments({
      ...aiFilter,
      action: 'auto_response'
    });
    const autoResponseRate = totalTickets && totalAiResponses 
      ? ((totalAiResponses / totalTickets) * 100).toFixed(2) 
      : 0;

    res.json({
      slaComplianceRate: Number(slaComplianceRate),
      aiAccuracy: Number(aiAccuracy),
      resolutionRate: Number(resolutionRate),
      backlogCount: openTickets,
      avgResolutionTimeHours: Number(avgResolutionTime.toFixed(2)),
      slaBreachCount: slaBreaches,
      autoResponseRate: Number(autoResponseRate),
      totalTickets,
      resolvedTickets,
      dateRange: { startDate, endDate },
      filters: { category, priority }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics', details: err.message });
  }
};

// GET /api/admin/audit
exports.getAuditLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      actor, 
      ticketId, 
      startDate, 
      endDate, 
      action,
      entity 
    } = req.query;
    
    const filter = {};
    
    // Filter by actor (user who performed the action)
    if (actor) filter.actor = actor;
    
    // Filter by related ticket
    if (ticketId) filter['metadata.ticketId'] = ticketId;
    
    // Filter by action type
    if (action) filter.action = action;
    
    // Filter by entity type
    if (entity) filter.entity = entity;
    
    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    const logs = await AuditLog.find(filter)
      .populate('actor', 'name email role')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    const total = await AuditLog.countDocuments(filter);
    
    // Mask sensitive fields in the response
    const maskedLogs = logs.map(log => {
      if (log.sensitiveData) {
        // Mask PII but keep structure visible
        log.details = { ...log.details, sensitiveDataMasked: true };
        delete log.sensitiveData;
      }
      return log;
    });
    
    res.json({
      logs: maskedLogs,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      filters: { actor, ticketId, startDate, endDate, action, entity }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs', details: err.message });
  }
};

// GET /api/admin/sla
exports.listSLA = async (req, res) => {
  try {
    const slaPolicies = await SLA.find()
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    // Extract unique categories from all SLA policies and existing tickets
    const slaCategories = [...new Set(slaPolicies.flatMap(sla => sla.conditions.categories || []))];
    const ticketCategories = await Ticket.distinct('category');
    const allCategories = [...new Set([...slaCategories, ...ticketCategories])];
    
    // Get SLA policy statistics
    const stats = {
      totalPolicies: slaPolicies.length,
      activePolicies: slaPolicies.filter(sla => sla.isActive).length,
      categoriesCovered: slaCategories.length
    };
    
    res.json({ 
      slaPolicies, 
      categories: allCategories,
      stats 
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch SLA policies', details: err.message });
  }
};

// POST /api/admin/sla
exports.createSLA = async (req, res) => {
  try {
    // Remove any fields that shouldn't be set manually
    const { createdAt, updatedAt, _id, version, ...slaData } = req.body;
    
    const sla = new SLA({ 
      ...slaData, 
      createdBy: req.user.userId // Use userId from auth middleware
    });
    
    await sla.save();
    
    // Create audit log entry with proper error handling
    try {
      await AuditLog.logAction({
        actor: {
          userId: req.user.userId,
          userRole: req.user.role
        },
        action: {
          type: 'create',
          description: `Created SLA policy: ${sla.name}`,
          category: 'admin'
        },
        resource: {
          type: 'sla',
          id: sla._id.toString(),
          identifier: sla.name
        },
        changes: {
          after: {
            name: sla.name,
            categories: sla.conditions.categories,
            responseTime: sla.responseTime,
            resolutionTime: sla.resolutionTime,
            isDefault: sla.isDefault,
            isActive: sla.isActive
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
    
    res.status(201).json({
      status: 'success',
      message: 'SLA policy created successfully',
      data: sla
    });
  } catch (err) {
    console.error('Error creating SLA policy:', err);
    res.status(400).json({ 
      status: 'error',
      message: 'Failed to create SLA policy', 
      details: err.message 
    });
  }
};

// PUT /api/admin/sla/:id
exports.editSLA = async (req, res) => {
  try {
    const oldSLA = await SLA.findById(req.params.id).lean();
    if (!oldSLA) {
      return res.status(404).json({ 
        status: 'error',
        message: 'SLA policy not found' 
      });
    }

    // Remove fields that shouldn't be updated manually
    const { createdAt, _id, version, createdBy, ...updateData } = req.body;
    
    const sla = await SLA.findByIdAndUpdate(
      req.params.id,
      { 
        ...updateData, 
        updatedBy: req.user.userId, // Use userId from auth middleware
        updatedAt: Date.now() 
      },
      { new: true, runValidators: true }
    );
    
    // Create audit log entry with diffs
    try {
      const changes = {};
      if (oldSLA.name !== sla.name) changes.name = { from: oldSLA.name, to: sla.name };
      if (JSON.stringify(oldSLA.conditions) !== JSON.stringify(sla.conditions)) {
        changes.conditions = { from: oldSLA.conditions, to: sla.conditions };
      }
      if (oldSLA.responseTime !== sla.responseTime) {
        changes.responseTime = { from: oldSLA.responseTime, to: sla.responseTime };
      }
      if (oldSLA.resolutionTime !== sla.resolutionTime) {
        changes.resolutionTime = { from: oldSLA.resolutionTime, to: sla.resolutionTime };
      }
      if (oldSLA.isActive !== sla.isActive) {
        changes.isActive = { from: oldSLA.isActive, to: sla.isActive };
      }

      await AuditLog.logAction({
        actor: {
          userId: req.user.userId,
          userRole: req.user.role
        },
        action: {
          type: 'update',
          description: `Updated SLA policy: ${sla.name}`,
          category: 'admin'
        },
        resource: {
          type: 'sla',
          id: sla._id.toString(),
          identifier: sla.name
        },
        changes: {
          before: oldSLA,
          after: changes
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
      message: 'SLA policy updated successfully',
      data: sla
    });
  } catch (err) {
    console.error('Error updating SLA policy:', err);
    res.status(400).json({ 
      status: 'error',
      message: 'Failed to update SLA policy', 
      details: err.message 
    });
  }
};

// DELETE /api/admin/sla/:id
exports.deleteSLA = async (req, res) => {
  try {
    const sla = await SLA.findById(req.params.id).lean();
    if (!sla) {
      return res.status(404).json({ 
        status: 'error',
        message: 'SLA policy not found' 
      });
    }
    
    await SLA.findByIdAndDelete(req.params.id);
    
    // Create audit log entry with proper error handling
    try {
      await AuditLog.logAction({
        actor: {
          userId: req.user.userId,
          userRole: req.user.role
        },
        action: {
          type: 'delete',
          description: `Deleted SLA policy: ${sla.name}`,
          category: 'admin'
        },
        resource: {
          type: 'sla',
          id: req.params.id,
          identifier: sla.name
        },
        changes: {
          before: {
            name: sla.name,
            categories: sla.conditions.categories,
            isActive: sla.isActive
          },
          after: null
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
      message: 'SLA policy deleted successfully' 
    });
  } catch (err) {
    console.error('Error deleting SLA policy:', err);
    res.status(400).json({ 
      status: 'error',
      message: 'Failed to delete SLA policy', 
      details: err.message 
    });
  }
};

// Knowledge Base Management Functions

// GET /api/admin/kb
exports.listKB = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, category } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (category) filter.category = category;

    const kbArticles = await KB.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('reviewProcess.reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await KB.countDocuments(filter);
    
    res.json({
      articles: kbArticles,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch KB articles', details: err.message });
  }
};

// POST /api/admin/kb
exports.createKB = async (req, res) => {
  try {
    const kbData = {
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id
    };

    // Add initial version to changelog
    if (req.body.changeLog) {
      kbData.changeLog = [{
        version: 1,
        changes: 'Initial creation',
        changedBy: req.user._id,
        changedAt: new Date()
      }];
    }

    const kb = new KB(kbData);
    await kb.save();
    
    // Create audit log entry
    await AuditLog.logAction({
      actor: {
        userId: req.user._id,
        userEmail: req.user.email,
        userName: req.user.name,
        userRole: req.user.role,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      },
      action: {
        type: 'kb-create',
        description: `Created KB article: ${kb.title}`,
        category: 'kb'
      },
      resource: {
        type: 'kb',
        id: kb._id
      },
      details: {
        title: kb.title,
        category: kb.category,
        status: kb.status,
        visibility: kb.visibility
      },
      result: {
        success: true
      }
    });
    
    await kb.populate('createdBy', 'name email');
    res.status(201).json(kb);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create KB article', details: err.message });
  }
};

// PUT /api/admin/kb/:id
exports.editKB = async (req, res) => {
  try {
    const currentKB = await KB.findById(req.params.id);
    if (!currentKB) return res.status(404).json({ error: 'KB article not found' });

    const updateData = {
      ...req.body,
      updatedBy: req.user._id,
      updatedAt: new Date()
    };

    // Handle versioning if content changed
    if (req.body.content && req.body.content !== currentKB.content) {
      updateData.version = currentKB.version + 1;
      updateData.previousVersion = currentKB._id;
      
      // Add to changelog
      if (!updateData.changeLog) updateData.changeLog = [...currentKB.changeLog];
      updateData.changeLog.push({
        version: updateData.version,
        changes: req.body.changeDescription || 'Content updated',
        changedBy: req.user._id,
        changedAt: new Date()
      });
    }

    // Handle status changes
    if (req.body.status === 'published' && currentKB.status !== 'published') {
      updateData.publishedAt = new Date();
    }
    if (req.body.status === 'archived' && currentKB.status !== 'archived') {
      updateData.archivedAt = new Date();
    }

    const kb = await KB.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy updatedBy', 'name email');

    // Create audit log entry with diffs
    const changes = {};
    if (currentKB.title !== kb.title) changes.title = { from: currentKB.title, to: kb.title };
    if (currentKB.status !== kb.status) changes.status = { from: currentKB.status, to: kb.status };
    if (currentKB.category !== kb.category) changes.category = { from: currentKB.category, to: kb.category };
    if (currentKB.content !== kb.content) changes.contentUpdated = true;
    
    await AuditLog.logAction({
      actor: {
        userId: req.user._id,
        userEmail: req.user.email,
        userName: req.user.name,
        userRole: req.user.role,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      },
      action: {
        type: 'kb-update',
        description: `Updated KB article: ${kb.title}`,
        category: 'kb'
      },
      resource: {
        type: 'kb',
        id: kb._id
      },
      details: {
        title: kb.title,
        version: kb.version,
        changes
      },
      result: {
        success: true
      }
    });

    res.json(kb);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update KB article', details: err.message });
  }
};

// DELETE /api/admin/kb/:id
exports.deleteKB = async (req, res) => {
  try {
    const kb = await KB.findById(req.params.id);
    if (!kb) return res.status(404).json({ error: 'KB article not found' });

    // Check if article is referenced by tickets
    const usageCount = kb.analytics?.usedInTickets?.length || 0;
    if (usageCount > 0 && req.query.force !== 'true') {
      return res.status(400).json({ 
        error: 'KB article is referenced by tickets', 
        usageCount,
        message: 'Use ?force=true to delete anyway'
      });
    }

    await KB.findByIdAndDelete(req.params.id);
    
    // Create audit log entry
    await AuditLog.logAction({
      actor: {
        userId: req.user._id,
        userEmail: req.user.email,
        userName: req.user.name,
        userRole: req.user.role,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      },
      action: {
        type: 'delete',
        description: `Deleted KB article: ${kb.title}`,
        category: 'kb'
      },
      resource: {
        type: 'kb',
        id: req.params.id
      },
      details: {
        title: kb.title,
        category: kb.category,
        usageCount,
        forcedDeletion: req.query.force === 'true'
      },
      result: {
        success: true
      }
    });
    
    res.json({ message: 'KB article deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete KB article', details: err.message });
  }
};

// =======================
// User Management Functions
// =======================

// GET /api/admin/users
exports.listUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      role, 
      isActive, 
      search 
    } = req.query;

    const filter = {};
    
    // Filter by role
    if (role) filter.role = role;
    
    // Filter by active status
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    // Search by name or email
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password') // Exclude password field
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await User.countDocuments(filter);

    // Log admin activity
    await AuditLog.logAction({
      actor: req.user.userId,
      action: 'VIEW_USERS',
      resource: 'users',
      metadata: {
        filters: filter,
        page,
        limit,
        totalResults: total
      },
      details: {
        userId: req.user.userId,
        userEmail: req.user.email,
        userName: req.user.name,
        userRole: req.user.role,
        timestamp: new Date(),
        userAgent: req.get('User-Agent')
      }
    });

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
};

// PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, isActive } = req.body;

    // Don't allow updating password through this endpoint
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.updatedAt = new Date();

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log admin activity
    await AuditLog.logAction({
      actor: req.user.userId,
      action: 'UPDATE_USER',
      resource: 'user',
      resourceId: id,
      metadata: {
        updatedFields: Object.keys(updateData),
        targetUser: {
          id: user._id,
          email: user.email,
          role: user.role
        }
      },
      details: {
        userId: req.user.userId,
        userEmail: req.user.email,
        userName: req.user.name,
        userRole: req.user.role,
        timestamp: new Date(),
        userAgent: req.get('User-Agent')
      }
    });

    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(400).json({ error: 'Failed to update user', details: err.message });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.userId) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log admin activity
    await AuditLog.logAction({
      actor: req.user.userId,
      action: 'DELETE_USER',
      resource: 'user',
      resourceId: id,
      metadata: {
        deletedUser: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name
        }
      },
      details: {
        userId: req.user.userId,
        userEmail: req.user.email,
        userName: req.user.name,
        userRole: req.user.role,
        timestamp: new Date(),
        userAgent: req.get('User-Agent')
      }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user', details: err.message });
  }
};
