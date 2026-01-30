const mongoose = require("mongoose");

const graphWhitelistSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
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

const GraphWhitelist = mongoose.model("GraphWhitelist", graphWhitelistSchema);
module.exports = GraphWhitelist;
