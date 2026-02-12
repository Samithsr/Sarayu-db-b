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

module.exports = {
  createEmployee
};