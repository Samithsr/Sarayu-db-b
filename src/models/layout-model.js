const mongoose = require("mongoose");

const layoutSchema = new mongoose.Schema(
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
    layoutName: {
      type: String,
      required: true,
    },
    layoutConfig: {
      type: mongoose.Schema.Types.Mixed, // Allows any JSON structure
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
layoutSchema.index({ user: 1, userType: 1 });
layoutSchema.index({ layoutName: 1 });
layoutSchema.index({ user: 1, userType: 1, layoutName: 1 }, { unique: true });

const Layout = mongoose.model("Layout", layoutSchema);

module.exports = Layout;
