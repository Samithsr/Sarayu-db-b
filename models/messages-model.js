const mongoose = require("mongoose");

const messagesSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for better performance
messagesSchema.index({ topic: 1 });
messagesSchema.index({ timestamp: -1 });
messagesSchema.index({ topic: 1, timestamp: -1 });

const MessagesModel = mongoose.model("MessagesModel", messagesSchema);

module.exports = MessagesModel;
