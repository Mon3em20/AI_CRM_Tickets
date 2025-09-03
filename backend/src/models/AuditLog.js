const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // Who performed the action
  actor: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userEmail: String,
    userName: String,
    userRole: String,
    ipAddress: String,
    userAgent: String,
    sessionId: String
  },

  // What action was performed
  action: {
    type: {
      type: String,
      enum: [
        'create', 'read', 'update', 'delete',
        'login', 'logout', 'password-change',
        'ticket-submit', 'ticket-assign', 'ticket-escalate', 'ticket-resolve',
        'ai-classify', 'ai-suggest', 'ai-approve', 'ai-reject',
        'sla-breach', 'sla-warning',
        'kb-create', 'kb-update', 'kb-publish',
        'admin-config-change'
      ],
      required: true
    },
    description: {
      type: String,
      required: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    category: {
      type: String,
      enum: ['authentication', 'ticket', 'ai', 'admin', 'sla', 'kb', 'user'],
      required: true
    }
  },

  // What resource was affected
  resource: {
    type: {
      type: String,
      enum: ['user', 'ticket', 'kb', 'sla', 'ai-log', 'system-config'],
      required: true
    },
    id: String, // Resource ID
    identifier: String, // Human readable identifier (e.g., ticket number)
    collection: String // MongoDB collection name
  },

  // Details of the change
  changes: {
    before: mongoose.Schema.Types.Mixed, // Previous state
    after: mongoose.Schema.Types.Mixed,  // New state
    fields: [String], // List of changed fields
    metadata: mongoose.Schema.Types.Mixed // Additional context
  },

  // Request context
  request: {
    method: String,
    url: String,
    endpoint: String,
    parameters: mongoose.Schema.Types.Mixed,
    body: mongoose.Schema.Types.Mixed, // Sanitized request body
    headers: {
      contentType: String,
      acceptLanguage: String,
      referer: String
    }
  },

  // Result of the action
  result: {
    success: {
      type: Boolean,
      required: true
    },
    statusCode: Number,
    errorMessage: String,
    errorCode: String,
    duration: Number, // Request duration in milliseconds
    affectedRecords: Number
  },

  // Security and compliance
  security: {
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    sensitiveData: {
      type: Boolean,
      default: false
    },
    complianceRelevant: {
      type: Boolean,
      default: false
    },
    requiresReview: {
      type: Boolean,
      default: false
    }
  },

  // System information
  system: {
    service: {
      type: String,
      default: 'crm-backend'
    },
    version: String,
    environment: {
      type: String,
      enum: ['development', 'staging', 'production'],
      default: 'development'
    },
    serverId: String,
    requestId: String
  },

  // Timestamps
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  // Data retention
  retentionDate: Date, // When this log can be deleted
  archived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for performance and querying
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ 'actor.userId': 1, timestamp: -1 });
auditLogSchema.index({ 'action.type': 1, timestamp: -1 });
auditLogSchema.index({ 'action.category': 1, timestamp: -1 });
auditLogSchema.index({ 'resource.type': 1, 'resource.id': 1 });
auditLogSchema.index({ 'result.success': 1, timestamp: -1 });
auditLogSchema.index({ 'security.riskLevel': 1, timestamp: -1 });
auditLogSchema.index({ archived: 1 });

// TTL index for automatic cleanup of old logs (configure based on compliance requirements)
auditLogSchema.index({ retentionDate: 1 }, { expireAfterSeconds: 0 });

// Static methods
auditLogSchema.statics.logAction = async function(actionData) {
  try {
    const auditEntry = new this(actionData);
    await auditEntry.save();
    return auditEntry;
  } catch (error) {
    console.error('Failed to create audit log entry:', error);
    // Don't throw error to avoid breaking main functionality
    return null;
  }
};

auditLogSchema.statics.getAuditTrail = async function(filters = {}, options = {}) {
  const {
    userId,
    resourceType,
    resourceId,
    actionType,
    category,
    startDate,
    endDate,
    riskLevel,
    success
  } = filters;

  const {
    page = 1,
    limit = 50,
    sort = { timestamp: -1 }
  } = options;

  const query = {};

  if (userId) query['actor.userId'] = userId;
  if (resourceType) query['resource.type'] = resourceType;
  if (resourceId) query['resource.id'] = resourceId;
  if (actionType) query['action.type'] = actionType;
  if (category) query['action.category'] = category;
  if (riskLevel) query['security.riskLevel'] = riskLevel;
  if (success !== undefined) query['result.success'] = success;

  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  return this.find(query)
    .populate('actor.userId', 'name email role')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
