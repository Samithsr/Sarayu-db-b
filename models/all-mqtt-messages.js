const mongoose = require("mongoose");

const allMqttMessagesSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    trim: true
  },
  thresholds: [{
    color: {
      type: String,
      enum: ['red', 'yellow', 'green'],
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    resetValue: {
      type: Number,
      required: true
    }
  }],
  lastMessage: {
    type: String,
    default: null
  },
  lastTimestamp: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Add indexes for better performance
allMqttMessagesSchema.index({ topic: 1 });
allMqttMessagesSchema.index({ 'thresholds.color': 1 });
allMqttMessagesSchema.index({ 'thresholds.value': 1 });

const AllTopicsModel = mongoose.model("AllTopicsModel", allMqttMessagesSchema);

module.exports = AllTopicsModel;
