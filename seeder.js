const connectDB = require("./config/db");
const User = require("./models/userModel");
const Company = require("./models/company-model");
const MqttMessage = require("./models/topicsModel");
const Manager = require("./models/managerModel");
const Employee = require("./models/employeeModel");
const TagCreation = require("./models/tagCreation-model");
const Topics = require("./models/topicsModel");
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
    
    // Process manager data with password hashing
    const managerDataWithHashedPassword = await Promise.all(
      manager_data.map(async (manager) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(manager.password, salt);
        
        return {
          name: manager.name,
          email: manager.email,
          phoneNumber: manager.phoneNumber,
          password: hashedPassword,
          company: manager.company,
          role: "manager"
        };
      })
    );
    
    await Manager.create(managerDataWithHashedPassword);
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
    
    // Process employee data with password hashing
    const employeeDataWithHashedPassword = await Promise.all(
      employee_data.map(async (employee) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(employee.password, salt);
        
        return {
          name: employee.name,
          email: employee.email,
          selectManager: employee.selectManager,
          phoneNumber: employee.phoneNumber,
          headerOne: employee.headerOne,
          headerTwo: employee.headerTwo,
          password: hashedPassword,
          company: employee.company,
          role: "employee"
        };
      })
    );
    
    await Employee.create(employeeDataWithHashedPassword);
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
