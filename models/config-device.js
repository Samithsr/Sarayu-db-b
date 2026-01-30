const mongoose = require("mongoose");

const configDeviceSchema = new mongoose.Schema(
  {
    gateway: {
      type: String,
      required: [true, "Gateway is required"],
    },
    slaveid: {
      type: String,
      required: [true, "Slave ID is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    functioncode: {
      type: String,
      required: [true, "Function code is required"],
    },
    size: {
      type: String,
      required: [true, "Size is required"],
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
      select: false,
    }
  },
  {
    timestamps: true,
  }
);

const ConfigDevice = mongoose.model("ConfigDevice", configDeviceSchema);
module.exports = ConfigDevice;
