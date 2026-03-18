const { Op } = require('sequelize');
const { Salary, Timesheet, User } = require('../models');

exports.getSalaries = async (req, res) => {
  try {
    const { role, id, companyId } = req.user;
    let where = {};

    if (role === 'employee' || role === 'manager') {
      where.userId = id;
    } else if (role === 'admin') {
      const companyUsers = await User.findAll({ where: { companyId }, attributes: ['id'] });
      where.userId = { [Op.in]: companyUsers.map(u => u.id) };
    }

    if (req.query.month) where.month = Number(req.query.month);
    if (req.query.year) where.year = Number(req.query.year);

    const salaries = await Salary.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role', 'department'] }],
      order: [['year', 'DESC'], ['month', 'DESC']],
    });
    res.json(salaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSalary = async (req, res) => {
  try {
    const { userId, month, year, baseSalary, expectedHours, allowances, deductions, overtime, notes } = req.body;

    const exists = await Salary.findOne({ where: { userId, month, year } });
    if (exists) return res.status(400).json({ message: 'Salary record already exists for this month/year' });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const timesheets = await Timesheet.findAll({
      where: {
        userId,
        status: 'approved',
        weekStart: { [Op.gte]: startDate, [Op.lte]: endDate },
      },
    });
    const actualHours = timesheets.reduce((sum, ts) => sum + ts.totalHours, 0);

    const user = await User.findByPk(userId);
    const salary = await Salary.create({
      userId,
      companyId: req.user.companyId,
      month: Number(month),
      year: Number(year),
      baseSalary: baseSalary || user.baseSalary || 0,
      expectedHours: expectedHours || 160,
      actualHours,
      allowances: allowances || 0,
      deductions: deductions || 0,
      overtime: overtime || 0,
      notes,
    });

    const populated = await Salary.findByPk(salary.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
    });
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSalary = async (req, res) => {
  try {
    const salary = await Salary.findByPk(req.params.id);
    if (!salary) return res.status(404).json({ message: 'Salary not found' });
    if (salary.status === 'paid') return res.status(400).json({ message: 'Cannot edit paid salary' });

    const fields = ['baseSalary', 'expectedHours', 'allowances', 'deductions', 'overtime', 'notes', 'status'];
    fields.forEach(f => { if (req.body[f] !== undefined) salary[f] = req.body[f]; });
    await salary.save();

    const populated = await Salary.findByPk(salary.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
    });
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.paySalary = async (req, res) => {
  try {
    const salary = await Salary.findByPk(req.params.id);
    if (!salary) return res.status(404).json({ message: 'Salary not found' });
    if (salary.status !== 'finalized') return res.status(400).json({ message: 'Salary must be finalized before paying' });
    salary.status = 'paid';
    salary.paidAt = new Date();
    await salary.save();

    const populated = await Salary.findByPk(salary.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
    });
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSalary = async (req, res) => {
  try {
    const salary = await Salary.findByPk(req.params.id);
    if (!salary) return res.status(404).json({ message: 'Salary not found' });
    if (salary.status === 'paid') return res.status(400).json({ message: 'Cannot delete paid salary' });
    await salary.destroy();
    res.json({ message: 'Salary deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
