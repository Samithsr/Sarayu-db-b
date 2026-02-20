const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema(
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
    password: {
      type: String,
      select: false,
      required: [true, "Password is required"],
    },
    topics: {
      type: [String],
    },
    favorites: {
      type: [String],
      default: [],
    },
    graphwl: {
      type: [String],
      default: [],
    },
    layout: {
      type: String,
      default: "layout1",
    },
    headerOne : {
      type : "String",
      required : true
    },
    headerTwo : {
      type : "String",
      required : false
    },
    assignedDigitalMeters: {
      type: [
        {
          topic: String,
          meterType: String,
          minValue: Number,
          maxValue: Number,
          ticks: Number,
          label : String
        },
      ],
      default: [],
    },
    role: {
      type: String,
      default: "employee",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
employeeSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    return;
  }

  // Hash password with cost of 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

employeeSchema.methods.getToken = function () {
  return jwt.sign(
    {
      id: this._id,
      name: this.name,
      email: this.email,
      role: this.role,
      assignedDigitalMeters: this.assignedDigitalMeters,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "3d",
    }
  );
};

employeeSchema.methods.verifyPass = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;








