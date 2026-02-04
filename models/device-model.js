const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  device: {
    type: String,
    required: [true, "Device is required"],
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: 'devices'
});

module.exports = mongoose.model("Device", deviceSchema);