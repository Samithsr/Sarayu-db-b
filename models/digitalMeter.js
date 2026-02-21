const mongoose = require("mongoose");

const digitalMeterSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    trim: true
  },
  meterType: {
    type: String,
    required: true,
    enum: ['analog', 'digital'],
    default: 'digital'
  },
  minValue: {
    type: Number,
    required: true
  },
  maxValue: {
    type: Number,
    required: true
  },
  ticks: {
    type: Number,
    required: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manager', // Can reference Manager or Employee
    required: false
  },
  assignedToType: {
    type: String,
    enum: ['manager', 'employee'],
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: false
  }
}, {
  timestamps: true
});

// Add index for faster queries
digitalMeterSchema.index({ topic: 1 });
digitalMeterSchema.index({ assignedTo: 1 });
digitalMeterSchema.index({ assignedToType: 1 });
digitalMeterSchema.index({ company: 1 });

const DigitalMeter = mongoose.model("DigitalMeter", digitalMeterSchema);

module.exports = DigitalMeter;