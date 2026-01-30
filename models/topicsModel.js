const mongoose = require("mongoose");

const topicsSchema = new mongoose.Schema(
  {
    employee: {
      type: String,
      required: [true, "Employee reference is required"],
    },
    rows: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    columns: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
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

const Topics = mongoose.model("Topics", topicsSchema);
module.exports = Topics;
