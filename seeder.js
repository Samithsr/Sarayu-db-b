const connectDB = require("./config/db");
const User = require("./models/userModel");
const MqttMessage = require("./models/topicsModel");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();

// const user_data = JSON.parse(fs.readFileSync("./data/user-data.json", "utf-8"));
// const support_data = JSON.parse(
//   fs.readFileSync("./data/support-data.json", "utf-8")
// );
const user_data = JSON.parse(
  fs.readFileSync("./data/admin-data.json", "utf-8")
);
// const topics_data = JSON.parse(
//   fs.readFileSync("./data/topics-data.json", "utf-8")
// );

connectDB();

const insertData = async () => {
  try {
    // Add manager role to the data before inserting
    const adminDataWithRole = user_data.map(user => ({
      ...user,
      role: "manager"
    }));
    
    await User.create(adminDataWithRole);
    console.log("Manager inserted successfully!");
  } catch (err) {
    console.error(err.message);
  } finally {
    process.exit();
  }
};

const deleteData = async () => {
  try {
    // await User.deleteMany();
    console.log("Data destroyed!");
    // await SupportMail.deleteMany();
    await MqttMessage.deleteMany();
  } catch (error) {
    console.error("Error deleting data:", error.message);
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
