const mongoose = require("mongoose");

const supervisorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/.+\@.+\..+/, "Please enter a valid email address"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    company: {
      type: String,
      required: [true, "Company is required"],
    },
    topics: [{
      type: String,
    }],
    graphwhitlist: [{
      type: String,
    }],
    layout: {
      type: String,
      default: "default",
    },
    favorites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    role: {
      type: String,
      default: "supervisor",
    },
    assignedDigitalMeter: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "DigitalMeter",
    }],
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

const Supervisor = mongoose.model("Supervisor", supervisorSchema);
module.exports = Supervisor;
