const mongoose = require('mongoose');

const aiLogSchema = new mongoose.Schema({
  // Reference to related entities
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // AI Operation details
  operation: {
    type: String,
    enum: ['classify', 'suggest-reply', 'sentiment-analysis', 'kb-search', 'escalation-prediction'],
    required: true
  },
  model: {
    name: {
      type: String,
      required: true
    },
    version: {
      type: String,
      required: true
    },
    provider: {
      type: String,
      enum: ['gemini', 'openai', 'custom', 'huggingface'],
      default: 'gemini'
    }
  },

  // Input data (sanitized for privacy)
  input: {
    textContent: String,
    sanitizedContent: String, // PII removed version
    contentLength: Number,
    language: String,
    metadata: {
      category: String,
      priority: String,
      customerTier: String,
      previousInteractions: Number
    }
  },

  // AI Output/Results
  output: {
    // For classification
    classification: {
      category: String,
      subcategory: String,
      confidence: Number,
      alternativeCategories: [{
        category: String,
        confidence: Number
      }]
    },
    
    // For reply suggestions
    suggestedReply: {
      content: String,
      confidence: Number,
      usedKBArticles: [{
        articleId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'KB'
        },
        relevanceScore: Number
      }],
      tone: String,
      estimatedReadingTime: Number
    },

    // For sentiment analysis
    sentiment: {
      score: Number, // -1 to 1
      label: String, // positive, negative, neutral
      confidence: Number,
      emotions: [{
        emotion: String,
        intensity: Number
      }]
    },

    // For KB search
    kbSearch: {
      query: String,
      results: [{
        articleId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'KB'
        },
        relevanceScore: Number,
        snippet: String
      }],
      totalResults: Number,
      searchTime: Number
    },

    // General metadata
    processingTime: Number, // in milliseconds
    rawResponse: String, // Full AI response (limited size)
    tokens: {
      input: Number,
      output: Number,
      total: Number
    }
  },

  // Human intervention and feedback
  humanFeedback: {
    reviewed: {
      type: Boolean,
      default: false
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    approved: Boolean,
    feedback: String,
    correctedOutput: String,
    
    // Quality rating
    accuracy: {
      type: Number,
      min: 1,
      max: 5
    },
    helpfulness: {
      type: Number,
      min: 1,
      max: 5
    }
  },

  // System performance metrics
  performance: {
    responseTime: Number, // milliseconds
    apiLatency: Number,
    retryCount: {
      type: Number,
      default: 0
    },
    errorCount: {
      type: Number,
      default: 0
    },
    cacheHit: {
      type: Boolean,
      default: false
    }
  },

  // Error handling
  errorLogs: [{
    errorType: String,
    errorMessage: String,
    errorCode: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    stackTrace: String
  }],

  // Privacy and compliance
  dataHandling: {
    piiRemoved: {
      type: Boolean,
      default: true
    },
    dataRetentionDate: Date,
    complianceFlags: [{
      flag: String,
      reason: String
    }]
  },

  // Usage and billing (if applicable)
  billing: {
    cost: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    billingUnit: String // tokens, requests, etc.
  },

  // Status and lifecycle
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  
  // Audit trail
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

// TTL for automatic cleanup (optional - configure based on retention policy)
aiLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

// Other indexes for performance
aiLogSchema.index({ ticketId: 1, operation: 1 });
aiLogSchema.index({ operation: 1, createdAt: -1 });
aiLogSchema.index({ 'model.name': 1, 'model.version': 1 });
aiLogSchema.index({ status: 1 });
aiLogSchema.index({ 'humanFeedback.reviewed': 1 });
aiLogSchema.index({ 'performance.responseTime': 1 });

// Methods
aiLogSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.endTime = new Date();
  return this.save();
};

aiLogSchema.methods.markFailed = function(error) {
  this.status = 'failed';
  this.endTime = new Date();
  if (error) {
    this.errorLogs.push({
      errorType: error.name || 'Unknown',
      errorMessage: error.message || 'Unknown error',
      errorCode: error.code || 'UNKNOWN',
      stackTrace: error.stack
    });
  }
  return this.save();
};

aiLogSchema.methods.addFeedback = function(userId, feedback) {
  this.humanFeedback = {
    ...this.humanFeedback,
    reviewed: true,
    reviewedBy: userId,
    reviewedAt: new Date(),
    ...feedback
  };
  return this.save();
};

module.exports = mongoose.model('AiLog', aiLogSchema);