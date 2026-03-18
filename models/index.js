const sequelize = require('../config/database');
const Company = require('./Company');
const User = require('./User');
const Leave = require('./Leave');
const Timesheet = require('./Timesheet');
const Salary = require('./Salary');

// User <-> Company
User.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
Company.hasMany(User, { foreignKey: 'companyId' });

// User self-reference (manager)
User.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });
User.hasMany(User, { foreignKey: 'managerId', as: 'subordinates' });

// Leave associations
Leave.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Leave.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });
Leave.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// Timesheet associations
Timesheet.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Timesheet.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });
Timesheet.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// Salary associations
Salary.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Salary.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

module.exports = { sequelize, Company, User, Leave, Timesheet, Salary };
