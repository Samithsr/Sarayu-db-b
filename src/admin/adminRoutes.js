const express = require("express");
const { authenticate, authorize, authorizeCompanyAccess } = require("../../middlewares/auth");
const {
  adminLogin,
  createCompany,
  deleteCompany,
  deleteAnyEmployeeCompany,
  getSingleCompany,
  getAllCompanies,
  createManager,
  getAllManagerOfSameCompany,
  createEmployee,
  getAllEmployeesOfSameCompany,
  changeManagerForEmployee,
  changeManagerForAllEmployee,
  swapManagerForAllEmployee,
  createEmployeeWithoutManager,
  removeManagerFromEmployee,
  resetPasswordForManager,
  resetPasswordForEmployee,
} = require("./adminController");

const router = express.Router();

// Admin login
router.route("/admin/login").post(adminLogin);

// Company routes
router.route("/companies").post(authenticate, authorize('admin'), createCompany).get(authenticate, authorize('admin'), getAllCompanies);
router.route("/company/:companyId").get(authenticate, authorizeCompanyAccess, getSingleCompany);
router.route("/companies/:id").delete(authenticate, authorize('admin'), deleteCompany);
router.route("/deleteAnyEmployee/:id").delete(authenticate, authorize('admin'), deleteAnyEmployeeCompany);

// Manager routes
router.route("/manager/create/:companyId").post(authenticate, authorize('admin'), createManager);
router.route("/manager/getAllManagerOfSameCompany/:companyId").get(authenticate, authorizeCompanyAccess, getAllManagerOfSameCompany);

// Employee routes
router.route("/employee/create/:companyId/:managerId").post(authenticate, authorize('admin', 'manager'), createEmployee);
router.route("/employee/create/:companyId").post(authenticate, authorize('admin'), createEmployeeWithoutManager);
router.route("/employee/changeManager/:empId/:managerId").post(authenticate, authorize('admin', 'manager'), changeManagerForEmployee);
router.route("/employee/changeManagerforAllEmployees/:oldManagerId/:newManagerId").post(authenticate, authorize('admin'), changeManagerForAllEmployee);
router.route("/employee/swapManagerForAllEmployees/:firstManagerId/:secondManagerId").post(authenticate, authorize('admin'), swapManagerForAllEmployee);
router.route("/employee/getAllEmployeesOfSameCompany/:companyId").get(authenticate, authorizeCompanyAccess, getAllEmployeesOfSameCompany);
router.route("/employee/removeManager/:id").post(authenticate, authorize('admin'), removeManagerFromEmployee);

// Password reset routes
router.post("/manager/reset-password", authenticate, resetPasswordForManager);
router.post("/employee/reset-password", authenticate, resetPasswordForEmployee);

module.exports = router;