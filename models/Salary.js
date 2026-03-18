const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Salary = sequelize.define('Salary', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  companyId: { type: DataTypes.INTEGER, allowNull: true },
  month: { type: DataTypes.INTEGER, allowNull: false },
  year: { type: DataTypes.INTEGER, allowNull: false },
  baseSalary: { type: DataTypes.FLOAT, defaultValue: 0 },
  expectedHours: { type: DataTypes.FLOAT, defaultValue: 160 },
  actualHours: { type: DataTypes.FLOAT, defaultValue: 0 },
  allowances: { type: DataTypes.FLOAT, defaultValue: 0 },
  deductions: { type: DataTypes.FLOAT, defaultValue: 0 },
  overtime: { type: DataTypes.FLOAT, defaultValue: 0 },
  overtimeRate: { type: DataTypes.FLOAT, defaultValue: 1.5 },
  netSalary: { type: DataTypes.FLOAT, defaultValue: 0 },
  status: { type: DataTypes.ENUM('draft', 'finalized', 'paid'), defaultValue: 'draft' },
  paidAt: { type: DataTypes.DATE, allowNull: true },
  notes: { type: DataTypes.TEXT, defaultValue: '' },
}, { timestamps: true });

function calcNetSalary(salary) {
  const overtimePay = salary.overtime * (salary.baseSalary / salary.expectedHours) * salary.overtimeRate;
  salary.netSalary = salary.baseSalary + salary.allowances + overtimePay - salary.deductions;
  if (salary.netSalary < 0) salary.netSalary = 0;
}

Salary.beforeCreate(calcNetSalary);
Salary.beforeUpdate(calcNetSalary);

module.exports = Salary;
