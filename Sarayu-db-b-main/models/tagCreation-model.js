const mongoose = require("mongoose");

const tagCreationSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: [true, "Topic is required"],
  },
  device: {
    type: String,
    required: [true, "Device is required"],
  },
  label: {
    type: String,
    required: [true, "Label is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  __v: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("TagCreation", tagCreationSchema);
