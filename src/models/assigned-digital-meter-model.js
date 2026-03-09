const mongoose = require("mongoose");

const assignedDigitalMeterSchema = new mongoose.Schema(
  {
    // Reference to any user type (Employee, Supervisor, or Manager)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'userType'
    },
    // Field to determine which model to use for population
    userType: {
      type: String,
      required: true,
      enum: ['Employee', 'Supervisor', 'Manager']
    },
    topic: {
      type: String,
      required: true,
    },
    meterType: {
      type: String,
      required: true,
    },
    minValue: {
      type: Number,
      required: false,
    },
    maxValue: {
      type: Number,
      required: false,
    },
    ticks: {
      type: Number,
      required: false,
    },
    label: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
assignedDigitalMeterSchema.index({ user: 1, userType: 1 });
assignedDigitalMeterSchema.index({ topic: 1 });
assignedDigitalMeterSchema.index({ user: 1, userType: 1, topic: 1 }, { unique: true });

const AssignedDigitalMeter = mongoose.model("AssignedDigitalMeter", assignedDigitalMeterSchema);

module.exports = AssignedDigitalMeter;
