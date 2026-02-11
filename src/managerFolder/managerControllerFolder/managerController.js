const Manager = require("../../../models/managerModel");
const Company = require("../../../models/company-model");
const ErrorResponse = require("../../../utils/errorResponse");
const asyncHandler = require("../../../middleware/asyncHandler");

const createManager = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const { name, email, password, phonenumber } = req.body;
  const findMail = await Manager.findOne({ email });
  if (findMail) {
    return next(new ErrorResponse("Email already exists!", 400));
  }
  
  const manager = await Manager.create({
    name,
    email,
    password,
    phonenumber,
    company: companyId,
  });
  res.status(201).json({
    success: true,
    data: manager,
  });
});

// @desc    Delete manager
// @route   DELETE /api/v1/manager/:id
// @access  Public
const deleteManager = asyncHandler(async (req, res, next) => {
  const manager = await Manager.findById(req.params.id);
  
  if (!manager) {
    return next(new ErrorResponse(`Manager not found with id of ${req.params.id}`, 404));
  }
  
  await manager.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

module.exports = {
  createManager,
  deleteManager
};