const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
    password: {
      type: String,
      select: false,
      required: [true, "Password is required"],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
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

// Pre-save middleware to hash the password before saving to database
managerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to verify the user-entered password with the existing password in the database
managerSchema.methods.verifyPass = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add a virtual field to reverse populate employees under the manager
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
