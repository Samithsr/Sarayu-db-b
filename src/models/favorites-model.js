const mongoose = require("mongoose");

const favoritesSchema = new mongoose.Schema(
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
    favoriteItem: {
      type: String,
      required: true,
    },
    itemType: {
      type: String,
      required: true,
      enum: ['topic', 'device', 'sensor', 'dashboard', 'report', 'other']
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
favoritesSchema.index({ user: 1, userType: 1 });
favoritesSchema.index({ favoriteItem: 1 });
favoritesSchema.index({ itemType: 1 });
favoritesSchema.index({ user: 1, userType: 1, favoriteItem: 1 }, { unique: true });

const Favorites = mongoose.model("Favorites", favoritesSchema);

module.exports = Favorites;
