const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Company email is required"],
      match: [/.+\@.+\..+/, "Please enter a valid email address"],
    },
    phonenumber: {
      type: String,
      required: [true, "Phone number is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    label: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    // __v: {
    //   type: Number,
    //   select: false,
    // }
  },
  {
    timestamps: true,
  }
);

const Company = mongoose.model("Company", companySchema);
module.exports = Company;
