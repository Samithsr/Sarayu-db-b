const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema(
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company is required"],
    },
    selectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manager",
      required: [true, "Manager selection is required"],
    },
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
      default: "employee",
    },
    assignedDigitalMeter: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "DigitalMeter",
    }],
    headerOne: {
      type: String,
      default: [],
    },
    headerTwo: {
      type: String,
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

// Hash password before saving
employeeSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    if (next) next();
    return;
  }

  // Hash password with cost of 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  
  if (next) next();
});

// Method to check password
employeeSchema.methods.verifyPass = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get JWT token
employeeSchema.methods.getToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const Employee = mongoose.model("Employee", employeeSchema);
module.exports = Employee;






// const mongoose = require("mongoose");

// const employeeSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: [true, "Name is required"],
//     },
//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       unique: true,
//       match: [/.+\@.+\..+/, "Please enter a valid email address"],
//     },
//     phoneNumber: {
//       type: String,
//       required: [true, "Phone number is required"],
//     },
//     password: {
//       type: String,
//       required: [true, "Password is required"],
//       select: false,
//     },
//     company: {
//       type: String,
//       required: [true, "Company is required"],
//     },
//     topics: {
//       type: mongoose.Schema.Types.Mixed,
//       default: { rows: [], columns: [] }
//     },
//     graphwhitlist: {
//       type: mongoose.Schema.Types.Mixed,
//       default: { rows: [], columns: [] }
//     },
//     layout: {
//       type: String,
//       default: "default",
//     },
//     favorites: [{
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     }],
//     role: {
//       type: String,
//       default: "employee",
//     },
//     assignedDigitalMeter: [{
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "DigitalMeter",
//     }],
//     headerOne: {
//       type: String,
//       default: "",
//     },
//     headerTwo: {
//       type: String,
//       default: "",
//     },
//     supervisor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Supervisor",
//       required: [true, "Supervisor assignment is required"],
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//     updatedAt: {
//       type: Date,
//       default: Date.now,
//     },
//     __v: {
//       type: Number,
//       select: false,
//     }
//   },
//   {
//     timestamps: true,
//   }
// );

// const Employee = mongoose.model("Employee", employeeSchema);
// module.exports = Employee;








