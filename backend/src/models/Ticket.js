const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scanResult: {
    status: {
      type: String,
      enum: ['pending', 'clean', 'infected', 'error'],
      default: 'pending'
    },
    scanDate: Date,
    details: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const replySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorType: {
    type: String,
    enum: ['customer', 'agent', 'system', 'ai'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [5000, 'Reply content cannot exceed 5000 characters']
  },
  isInternal: {
    type: Boolean,
    default: false
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiMetadata: {
    model: String,
    confidence: Number,
    approved: Boolean,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    originalDraft: String,
    editedContent: String
  },
  attachments: [attachmentSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'waiting-customer', 'resolved', 'closed', 'escalated'],
    default: 'open'
  },
  source: {
    type: String,
    enum: ['web', 'email', 'phone', 'chat'],
    default: 'web'
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // SLA related fields
  slaPolicy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SLA'
  },
  slaMetrics: {
    responseDeadline: Date,
    resolutionDeadline: Date,
    firstResponseTime: Date,
    resolutionTime: Date,
    escalationTime: Date,
    slaStatus: {
      type: String,
      enum: ['on-track', 'at-risk', 'breached'],
      default: 'on-track'
    },
    pausedTime: {
      type: Number,
      default: 0
    },
    pauseHistory: [{
      pausedAt: Date,
      resumedAt: Date,
      reason: String
    }]
  },

  // AI Analysis
  aiAnalysis: {
    classification: {
      category: String,
      subcategory: String,
      confidence: Number,
      suggestedPriority: String,
      timestamp: Date,
      model: String
    },
    sentiment: {
      score: Number,
      label: String,
      confidence: Number,
      timestamp: Date
    },
    suggestedKBArticles: [{
      articleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KB'
      },
      relevanceScore: Number,
      snippet: String
    }]
  },

  replies: [replySchema],
  attachments: [attachmentSchema],

  // Escalation
  escalation: {
    isEscalated: {
      type: Boolean,
      default: false
    },
    escalatedAt: Date,
    escalatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    escalationReason: String,
    escalationLevel: {
      type: Number,
      default: 1
    },
    previousAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },

  // Metadata
  internalNotes: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,
  
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

// Generate ticket ID
ticketSchema.pre('save', async function(next) {
  if (!this.ticketId) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketId = `TKT-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Index for performance
ticketSchema.index({ customer: 1, status: 1 });
ticketSchema.index({ assignedAgent: 1, status: 1 });
ticketSchema.index({ priority: 1, status: 1 });
ticketSchema.index({ createdAt: -1 });
ticketSchema.index({ 'slaMetrics.responseDeadline': 1 });
ticketSchema.index({ 'slaMetrics.resolutionDeadline': 1 });

module.exports = mongoose.model('Ticket', ticketSchema);