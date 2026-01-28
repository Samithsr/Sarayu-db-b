const connectDB = require("./config/db");
const User = require("./models/userModel");
const dotenv = require("dotenv");
const fs = require("fs");
const bcrypt = require("bcryptjs");

dotenv.config();

const admin_data = JSON.parse(
  fs.readFileSync("./data/admin-data.json", "utf-8")
);

connectDB();

const insertData = async () => {
  try {
    // Insert admin data with manager role and hashed password
    const adminUsers = await Promise.all(
      admin_data.map(async (admin) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(admin.password, salt);
        
        return {
          name: admin.name,
          email: admin.email,
          password: hashedPassword,
          role: "manager"
        };
      })
    );
    
    // Insert admin users
    await User.insertMany(adminUsers);
    console.log("Admin data insertion successful!");
  } catch (error) {
    console.error("Error inserting admin data:", error.message);
  } finally {
    process.exit();
  }
};

const deleteData = async () => {
  try {
    await User.deleteMany();
    console.log("Admin data destroyed!");
  } catch (error) {
    console.error("Error deleting admin data:", error.message);
  } finally {
    process.exit();
  }
};

if (process.argv[2] === "-i") {
  insertData();
}
if (process.argv[2] === "-d") {
  deleteData();
}