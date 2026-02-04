const connectDB = require("./config/db");
const User = require("./models/userModel");
const Company = require("./models/company-model");
const MqttMessage = require("./models/topicsModel");
const Manager = require("./models/managerModel");
const Employee = require("./models/employeeModel");
const TagCreation = require("./models/tagCreation-model");
const Topics = require("./models/topicsModel");
const Device = require("./models/device-model");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();

// Load JSON Data
const admin_data = JSON.parse(
  fs.readFileSync("./data/admin-data.json", "utf-8")
);

const company_data = JSON.parse(
  fs.readFileSync("./data/company-data.json", "utf-8")
);

const manager_data = JSON.parse(
  fs.readFileSync("./data/manager-data.json", "utf-8")
);

const employee_data = JSON.parse(
  fs.readFileSync("./data/employee-data.json", "utf-8")
);

const topics_data = JSON.parse(
  fs.readFileSync("./data/topics-data.json", "utf-8")
);

const device_data = JSON.parse(
  fs.readFileSync("./data/device-data.json", "utf-8")
);

connectDB();

/* ===============================
   INSERT FUNCTIONS
=================================*/

// Insert Admin Data
const insertAdmin = async () => {
  try {
    const adminWithRole = admin_data.map((user) => ({
      ...user,
      role: "admin",
    }));

    await User.create(adminWithRole);
    console.log("✅ Admin inserted successfully!");
    process.exit();
  } catch (error) {
    console.log("❌ Admin Insert Error:", error.message);
    process.exit();
  }
};

// Insert Company Data
const insertCompany = async () => {
  try {
    await Company.create(company_data);
    console.log("✅ Company inserted successfully!");
    process.exit();
  } catch (error) {
    console.log("❌ Company Insert Error:", error.message);
    process.exit();
  }
};

// Insert Manager Data
const insertManager = async () => {
  try {
    const bcrypt = require("bcryptjs");
    const mongoose = require("mongoose");
    
    // First, get actual company IDs from database
    const companies = await Company.find();
    if (companies.length === 0) {
      console.log("❌ No companies found. Please run 'node seeder.js -c' first to create companies.");
      process.exit();
    }
    
    // Process manager data with password hashing and proper ObjectId conversion
    const managerDataWithHashedPassword = await Promise.all(
      manager_data.map(async (manager, index) => {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(manager.password, salt);
        
        // Use actual company ID from database or fallback to data
        const companyId = companies[index % companies.length]._id;
        
        return {
          name: manager.name,
          email: manager.email,
          phoneNumber: manager.phoneNumber,
          password: hashedPassword,
          company: companyId, // Use actual ObjectId
          role: "manager"
        };
      })
    );
    
    await Manager.insertMany(managerDataWithHashedPassword);
    console.log("✅ Manager inserted successfully!");
    process.exit();
  } catch (error) {
    console.log("❌ Manager Insert Error:", error.message);
    process.exit();
  }
};

// Insert Employee Data
const insertEmployee = async () => {
  try {
    const bcrypt = require("bcryptjs");
    
    // First, get actual manager IDs from database
    const managers = await Manager.find();
    if (managers.length === 0) {
      console.log("❌ No managers found. Please run 'node seeder.js -md' first to create managers.");
      process.exit();
    }
    
    // Process employee data with manual password hashing and proper ObjectId conversion
    const employeeDataWithHashedPassword = await Promise.all(
      employee_data.map(async (employee, index) => {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(employee.password, salt);
        
        // Use actual manager ID from database
        const managerId = managers[index % managers.length]._id;
        const companyId = managers[index % managers.length].company;
        
        return {
          name: employee.name,
          email: employee.email,
          selectManager: managerId, // Use actual ObjectId
          phoneNumber: employee.phoneNumber,
          headerOne: employee.headerOne,
          headerTwo: employee.headerTwo,
          password: hashedPassword,
          company: companyId, // Use actual ObjectId from manager's company
          role: "employee"
        };
      })
    );
    
    await Employee.insertMany(employeeDataWithHashedPassword);
    console.log("✅ Employee inserted successfully!");
    process.exit();
  } catch (error) {
    console.log("❌ Employee Insert Error:", error.message);
    process.exit();
  }
};

// Insert Topics Data
const insertTopics = async () => {
  try {
    // Since topics_data is an array, insert directly
    await Topics.create(topics_data);
    console.log("✅ Topics inserted successfully!");
    process.exit();
  } catch (error) {
    console.log("❌ Topics Insert Error:", error.message);
    process.exit();
  }
};

// Insert Device Data
const insertDevice = async () => {
  try {
    // Drop the devices collection to remove all indexes and data
    await Device.collection.drop();
    console.log("🗑️ Dropped devices collection to clear indexes");
  } catch (error) {
    // Collection might not exist, that's okay
    console.log("ℹ️ Collection might not exist, continuing...");
  }
  
  try {
    // Wait a moment for collection to be fully dropped
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Insert new device data
    await Device.create(device_data);
    console.log("✅ Device inserted successfully!");
    process.exit();
  } catch (error) {
    console.log("❌ Device Insert Error:", error.message);
    
    // Try alternative approach with bulk write
    try {
      console.log("🔄 Trying bulk write approach...");
      const operations = device_data.map(device => ({
        updateOne: {
          filter: { device: device.device },
          update: { $set: device },
          upsert: true
        }
      }));
      
      await Device.bulkWrite(operations);
      console.log("✅ Device inserted successfully with bulk write!");
      process.exit();
    } catch (fallbackError) {
      console.log("❌ Fallback Insert Error:", fallbackError.message);
      process.exit();
    }
  }
};

/* ===============================
   DELETE FUNCTIONS
=================================*/

// Delete Admin Data
const deleteAdmin = async () => {
  try {
    await User.deleteMany({ role: "admin" });
    console.log("🗑️ Admin deleted successfully!");
    process.exit();
  } catch (error) {
    console.log("❌ Admin Delete Error:", error.message);
    process.exit();
  }
};

// Delete Company Data
const deleteCompany = async () => {
  try {
    await Company.deleteMany();
    console.log("🗑️ Company deleted successfully!");
    process.exit();
  } catch (error) {
    console.log("❌ Company Delete Error:", error.message);
    process.exit();
  }
};

// Delete MQTT Messages
const deleteMqttTopics = async () => {
  try {
    await MqttMessage.deleteMany();
    console.log("🗑️ MQTT Topics deleted successfully!");
    process.exit();
  } catch (error) {
    console.log("❌ MQTT Topics Delete Error:", error.message);
    process.exit();
  }
};

// Delete Manager Data
const deleteManager = async () => {
  try {
    await Manager.deleteMany();
    console.log("🗑️ Manager deleted successfully!");
    process.exit();
  } catch (error) {
    console.log("❌ Manager Delete Error:", error.message);
    process.exit();
  }
};

// Delete Employee Data
const deleteEmployee = async () => {
  try {
    await Employee.deleteMany();
    console.log("🗑️ Employee deleted successfully!");
    process.exit();
  } catch (error) {
    console.log("❌ Employee Delete Error:", error.message);
    process.exit();
  }
};

// Delete Topics Data
const deleteTopics = async () => {
  try {
    await Topics.deleteMany();
    console.log("🗑️ Topics deleted successfully!");
    process.exit();
  } catch (error) {
    console.log("❌ Topics Delete Error:", error.message);
    process.exit();
  }
};

// Delete Device Data
const deleteDevice = async () => {
  try {
    await Device.deleteMany();
    console.log("🗑️ Device deleted successfully!");
    process.exit();
  } catch (error) {
    console.log("❌ Device Delete Error:", error.message);
    process.exit();
  }
};

/* ===============================
   COMMAND HANDLER
=================================*/

if (process.argv[2] === "-a") {
  insertAdmin();
}

if (process.argv[2] === "-cd") {
  insertCompany();
}

if (process.argv[2] === "-ad") {
  deleteAdmin();
}

if (process.argv[2] === "-cdd") {
  deleteCompany();
}

if (process.argv[2] === "-mtd") {
  deleteMqttTopics();
}

if (process.argv[2] === "-td") {
  insertTopics();
}

if (process.argv[2] === "-md") {
  insertManager();
}

if (process.argv[2] === "-mdd") {
  deleteManager();
}

if (process.argv[2] === "-ed") {
  insertEmployee();
}

if (process.argv[2] === "-edd") {
  deleteEmployee();
}

if (process.argv[2] === "-td") {
  insertTopics();
}

if (process.argv[2] === "-tdd") {
  deleteTopics();
}

if (process.argv[2] === "-dd") {
  insertDevice();
}

if (process.argv[2] === "-ddd") {
  deleteDevice();
}





































// const connectDB = require("./config/db");
// const User = require("./models/userModel");
// const MqttMessage = require("./models/topicsModel");
// const Company = require("./models/company-model");
// const dotenv = require("dotenv");
// const fs = require("fs");

// dotenv.config();

// // const user_data = JSON.parse(fs.readFileSync("./data/user-data.json", "utf-8"));
// // const support_data = JSON.parse(
// //   fs.readFileSync("./data/support-data.json", "utf-8")
// // );
// const user_data = JSON.parse(
//   fs.readFileSync("./data/admin-data.json", "utf-8")
// );
// const company_data = JSON.parse(
//   fs.readFileSync("./data/company-data.json", "utf-8")
// );
// // const topics_data = JSON.parse(
// //   fs.readFileSync("./data/topics-data.json", "utf-8")
// // );

// connectDB();

// const insertData = async () => {
//   try {
//     // Add manager role to the data before inserting
//     const adminDataWithRole = user_data.map(user => ({
//       ...user,
//       role: "manager"
//     }));
    
//     await User.create(adminDataWithRole);
//     console.log("Manager inserted successfully!");
    
//     // Insert company data
//     await Company.create(company_data);
//     console.log("Company data inserted successfully!");
//   } catch (err) {
//     console.error(err.message);
//   } finally {
//     process.exit();
//   }
// };

// const deleteData = async () => {
//   try {
//     // await User.deleteMany();
//     console.log("Data destroyed!");
//     // await SupportMail.deleteMany();
//     await MqttMessage.deleteMany();
//     await Company.deleteMany();
//     console.log("Company data deleted successfully!");
//   } catch (error) {
//     console.error("Error deleting data:", error.message);
//   } finally {
//     process.exit();
//   }
// };

// if (process.argv[2] === "-i") {
//   insertData();
// }
// if (process.argv[2] === "-d") {
//   deleteData();
// }
