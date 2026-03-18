const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Timesheet = sequelize.define('Timesheet', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  weekStart: { type: DataTypes.DATE, allowNull: false },
  weekEnd: { type: DataTypes.DATE, allowNull: false },
  entries: { type: DataTypes.JSON, defaultValue: [] },
  totalHours: { type: DataTypes.FLOAT, defaultValue: 0 },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
  approvedBy: { type: DataTypes.INTEGER, allowNull: true },
  approvedAt: { type: DataTypes.DATE, allowNull: true },
  rejectionReason: { type: DataTypes.TEXT, defaultValue: '' },
  companyId: { type: DataTypes.INTEGER, allowNull: true },
  notes: { type: DataTypes.TEXT, defaultValue: '' },
}, { timestamps: true });

module.exports = Timesheet;
