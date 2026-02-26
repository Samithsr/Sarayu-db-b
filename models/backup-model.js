const mongoose = require("mongoose");

const backupSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    trim: true
  },
  messages: [{
    message: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Add indexes for better performance
backupSchema.index({ topic: 1 });
backupSchema.index({ 'messages.timestamp': -1 });

const Backup = mongoose.model("Backup", backupSchema);

module.exports = Backup;
