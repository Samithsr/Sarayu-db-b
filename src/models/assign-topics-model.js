const mongoose = require("mongoose");

const assignTopicsSchema = new mongoose.Schema(
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
assignTopicsSchema.index({ user: 1, userType: 1 });
assignTopicsSchema.index({ topic: 1 });
assignTopicsSchema.index({ user: 1, userType: 1, topic: 1 }, { unique: true });

const AssignTopics = mongoose.model("AssignTopics", assignTopicsSchema);

module.exports = AssignTopics;
