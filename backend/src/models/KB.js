const mongoose = require('mongoose');

const kbSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'KB article title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true
  },
  content: {
    type: String,
    required: [true, 'KB article content is required'],
    maxlength: [10000, 'Content cannot exceed 10000 characters']
  },
  summary: {
    type: String,
    trim: true,
    maxlength: [500, 'Summary cannot exceed 500 characters']
  },
  
  // Categorization
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Content metadata
  keywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  relatedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KB'
  }],
  
  // Publishing and versioning
  status: {
    type: String,
    enum: ['draft', 'review', 'published', 'archived', 'deprecated'],
    default: 'draft'
  },
  publishedAt: Date,
  archivedAt: Date,
  
  version: {
    type: Number,
    default: 1
  },
  previousVersion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KB'
  },
  changeLog: [{
    version: Number,
    changes: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Review process
  reviewProcess: {
    reviewRequired: {
      type: Boolean,
      default: true
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    reviewNotes: String,
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  },

  // Usage analytics
  analytics: {
    viewCount: {
      type: Number,
      default: 0
    },
    lastViewed: Date,
    usedInTickets: [{
      ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
      },
      usedAt: Date,
      usedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    helpfulVotes: {
      type: Number,
      default: 0
    },
    notHelpfulVotes: {
      type: Number,
      default: 0
    }
  },

  // AI and search optimization
  searchMetadata: {
    indexed: {
      type: Boolean,
      default: false
    },
    lastIndexed: Date,
    searchKeywords: [String],
    aiSummary: String,
    embedding: [Number] // For vector search if implemented
  },

  // Access control
  visibility: {
    type: String,
    enum: ['public', 'internal', 'agent-only', 'admin-only'],
    default: 'internal'
  },
  accessRoles: [{
    type: String,
    enum: ['customer', 'agent', 'admin']
  }],

  // Maintenance
  maintenanceSchedule: {
    nextReviewDate: Date,
    reviewFrequencyDays: {
      type: Number,
      default: 90
    },
    assignedReviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
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

// Generate slug from title
kbSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);
  }
  next();
});

// Update view count
kbSchema.methods.incrementViewCount = function() {
  this.analytics.viewCount += 1;
  this.analytics.lastViewed = new Date();
  return this.save();
};

// Index for performance and search
kbSchema.index({ title: 'text', content: 'text', summary: 'text' });
kbSchema.index({ status: 1, category: 1 });
kbSchema.index({ tags: 1 });
kbSchema.index({ createdAt: -1 });
kbSchema.index({ 'analytics.viewCount': -1 });
kbSchema.index({ publishedAt: -1 });

module.exports = mongoose.model('KB', kbSchema);