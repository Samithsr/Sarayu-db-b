const Employee = require("../../../models/employeeModel");
const ErrorResponse = require("../../../utils/errorResponse");
const asyncHandler = require("../../../middleware/asyncHandler");

//create a employee
const createEmployee = asyncHandler(async (req, res, next) => {
  const { managerId, companyId } = req.params;
  const { name, email, password, phonenumber, mqttTopic , headerOne , headerTwo } = req.body;
  const employee = await Employee.create({
    name,
    email,
    password,
    phonenumber,
    headerOne , 
    headerTwo,
    company: companyId,
    manager: managerId,
  });
  res.status(201).json({
    success: true,
    data: employee,
  });
});

// Get all employees of a company or all employees
const getAllEmployeesOfSameCompany = asyncHandler(async (req, res, next) => {
  try {
    const { companyId } = req.params;
    console.log("Fetching employees - companyId:", companyId);
    
    let employees, employeeCount;
    
    if (companyId) {
      // Get employees for specific company
      employees = await Employee.find({ company: companyId })
        .populate("company")
        .populate("manager");
      employeeCount = await Employee.countDocuments({ company: companyId });
      console.log(`Found ${employeeCount} employees for company ${companyId}`);
    } else {
      // Get all employees
      employees = await Employee.find()
        .populate("company")
        .populate("manager");
      employeeCount = await Employee.countDocuments();
      console.log(`Found ${employeeCount} total employees`);
    }
    
    console.log("Employees:", employees);
    
    res.status(200).json({
      success: true,
      count: employeeCount,
      data: employees,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch employees",
      details: error.message
    });
  }
});

// Get employees by manager ID
const getEmployeesByManagerId = asyncHandler(async (req, res, next) => {
  try {
    const { managerId } = req.params;
    console.log("Fetching employees for manager:", managerId);
    
    const employees = await Employee.find({ manager: managerId })
      .populate("company")
      .populate("manager");
    const employeeCount = await Employee.countDocuments({ manager: managerId });
    
    console.log(`Found ${employeeCount} employees for manager ${managerId}`);
    console.log("Employees:", employees);
    
    res.status(200).json({
      success: true,
      count: employeeCount,
      data: employees,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch employees",
      details: error.message
    });
  }
});

module.exports = {
  createEmployee,
  getAllEmployeesOfSameCompany,
  getEmployeesByManagerId
};