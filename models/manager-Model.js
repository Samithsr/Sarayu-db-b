const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const managerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phonenumber: {
      type: String,
      required: false,
    },
    topics: {
      type: [String],
      default: [],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    favorites: {
      type: [String],
      default: [],
    },
    graphwl: {
      type: [String],
      default: [],
    },
    password: {
      type: String,
      select: false,
      required: [true, "Password is required"],
    },
    layout: {
      type: String,
      default: "layout1",
    },
    assignedDigitalMeters: {
      type: [
        {
          topic: String,
          meterType: String,
          minValue: Number,
          maxValue: Number,
          ticks: Number,
          label: String,
        },
      ],
      default: [],
    },
    role: {
      type: String,
      default: "manager",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
managerSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    // if (next) next();
    return;
  }

  // Hash password with cost of 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  
  // if (next) next();
});

// Method to check password
managerSchema.methods.verifyPass = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get JWT token
managerSchema.methods.getToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Add a virtual field to reverse populate employees under manager
managerSchema.virtual("employees", {
  ref: "Employee", // The model to populate
  localField: "_id", // The field in Manager
  foreignField: "manager", // The field in Employee that references Manager
  justOne: false, // To get an array of employees
});

// Ensure virtual fields are included in the output
managerSchema.set("toObject", { virtuals: true });
managerSchema.set("toJSON", { virtuals: true });

const Manager = mongoose.model("Manager", managerSchema);
module.exports = Manager;
