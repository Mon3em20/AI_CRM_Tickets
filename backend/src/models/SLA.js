const mongoose = require('mongoose');

const slaRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'SLA rule name is required'],
    trim: true,
    maxlength: [100, 'SLA name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Conditions for this SLA to apply
  conditions: {
    categories: [{
      type: String,
      trim: true
    }],
    priorities: [{
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    }],
    customerTiers: [{
      type: String,
      enum: ['basic', 'premium', 'enterprise'],
      default: 'basic'
    }]
  },

  // Time commitments (in minutes)
  responseTime: {
    type: Number,
    required: [true, 'Response time is required'],
    min: [1, 'Response time must be at least 1 minute']
  },
  resolutionTime: {
    type: Number,
    required: [true, 'Resolution time is required'],
    min: [1, 'Resolution time must be at least 1 minute']
  },
  escalationTime: {
    type: Number,
    min: [1, 'Escalation time must be at least 1 minute']
  },

  // Business hours configuration
  businessHours: {
    enabled: {
      type: Boolean,
      default: true
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    workingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    startTime: {
      type: String, // Format: "09:00"
      default: "09:00"
    },
    endTime: {
      type: String, // Format: "17:00"
      default: "17:00"
    },
    holidays: [{
      date: Date,
      name: String
    }]
  },

  // Warning thresholds (percentage of SLA time)
  warningThresholds: {
    yellow: {
      type: Number,
      default: 70,
      min: [1, 'Yellow threshold must be between 1-100'],
      max: [100, 'Yellow threshold must be between 1-100']
    },
    red: {
      type: Number,
      default: 90,
      min: [1, 'Red threshold must be between 1-100'],
      max: [100, 'Red threshold must be between 1-100']
    }
  },

  // Auto-escalation rules
  autoEscalation: {
    enabled: {
      type: Boolean,
      default: false
    },
    escalateToRole: {
      type: String,
      enum: ['agent', 'admin'],
      default: 'admin'
    },
    escalateAfterBreachMinutes: {
      type: Number,
      default: 60
    }
  },

  // Priority and ordering
  priority: {
    type: Number,
    default: 1,
    min: [1, 'Priority must be at least 1']
  },

  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },

  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  },
  previousVersion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SLA'
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure only one default SLA policy
slaRuleSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await mongoose.model('SLA').updateMany(
      { _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Index for performance
slaRuleSchema.index({ isActive: 1, priority: 1 });
slaRuleSchema.index({ 'conditions.categories': 1 });
slaRuleSchema.index({ 'conditions.priorities': 1 });
slaRuleSchema.index({ isDefault: 1 });

module.exports = mongoose.model('SLA', slaRuleSchema);