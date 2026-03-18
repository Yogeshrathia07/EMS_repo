const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');

// Auth
const authCtrl = require('../controllers/authController');
router.post('/auth/login', authCtrl.login);

// Users
const userCtrl = require('../controllers/userController');
router.get('/users/me', auth, userCtrl.getMe);
router.get('/users', auth, requireRole('admin', 'manager', 'superadmin'), userCtrl.getUsers);
router.post('/users', auth, requireRole('admin', 'superadmin'), userCtrl.createUser);
router.put('/users/:id', auth, requireRole('admin', 'superadmin'), userCtrl.updateUser);
router.delete('/users/:id', auth, requireRole('admin', 'superadmin'), userCtrl.deleteUser);

// Leaves
const leaveCtrl = require('../controllers/leaveController');
router.get('/leaves', auth, leaveCtrl.getLeaves);
router.post('/leaves', auth, leaveCtrl.createLeave);
router.patch('/leaves/:id/action', auth, requireRole('manager', 'admin'), leaveCtrl.actionLeave);
router.delete('/leaves/:id', auth, leaveCtrl.deleteLeave);

// Timesheets
const tsCtrl = require('../controllers/timesheetController');
router.get('/timesheets', auth, tsCtrl.getTimesheets);
router.post('/timesheets', auth, tsCtrl.createTimesheet);
router.patch('/timesheets/:id/action', auth, requireRole('manager', 'admin'), tsCtrl.actionTimesheet);
router.delete('/timesheets/:id', auth, tsCtrl.deleteTimesheet);

// Salary
const salaryCtrl = require('../controllers/salaryController');
router.get('/salary', auth, salaryCtrl.getSalaries);
router.post('/salary', auth, requireRole('admin'), salaryCtrl.createSalary);
router.put('/salary/:id', auth, requireRole('admin'), salaryCtrl.updateSalary);
router.patch('/salary/:id/pay', auth, requireRole('admin'), salaryCtrl.paySalary);
router.delete('/salary/:id', auth, requireRole('admin'), salaryCtrl.deleteSalary);

// Companies
const companyCtrl = require('../controllers/companyController');
router.get('/companies/stats', auth, requireRole('superadmin'), companyCtrl.getCompanyStats);
router.get('/companies', auth, requireRole('superadmin', 'admin'), companyCtrl.getCompanies);
router.post('/companies', auth, requireRole('superadmin'), companyCtrl.createCompany);
router.put('/companies/:id', auth, requireRole('superadmin'), companyCtrl.updateCompany);
router.delete('/companies/:id', auth, requireRole('superadmin'), companyCtrl.deleteCompany);

module.exports = router;
