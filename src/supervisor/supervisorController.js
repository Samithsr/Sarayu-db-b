const Supervisor = require("../../models/supervisorModel");
const Company = require("../../models/company-model");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");

const createSupervisor = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const { name, email, password, phonenumber, mqttTopic } = req.body;
  console.log(password);
  const findSupervisor = await Supervisor.findOne({ email });
  if (findSupervisor) {
    return next(new ErrorResponse("Email already exists!", 500));
  }
  const supervisor = await Supervisor.create({
    name,
    email,
    password,
    phonenumber,
    mqttTopic,
    company: companyId,
  });
  res.status(201).json({
    success: true,
    data: supervisor,
  });
});

module.exports = {
  createSupervisor
};