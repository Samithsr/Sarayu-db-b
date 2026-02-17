const mongoose = require("mongoose");

const layoutSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    layoutType: {
      type: String,
      required: true,
      enum: ["layout1", "layout2", "layout3", "custom"],
      default: "layout1"
    },
    components: {
      type: [
        {
          id: String,
          type: String,
          position: {
            x: Number,
            y: Number,
            width: Number,
            height: Number
          },
          properties: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
          }
        }
      ],
      default: []
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manager",
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

const Layout = mongoose.model("Layout", layoutSchema);
module.exports = Layout;