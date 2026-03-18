const { Op } = require('sequelize');
const { Timesheet, User } = require('../models');

exports.getTimesheets = async (req, res) => {
  try {
    const { role, id, companyId } = req.user;
    let where = {};

    if (role === 'employee') {
      where.userId = id;
    } else if (role === 'manager') {
      if (req.query.scope === 'own') {
        where.userId = id;
      } else if (req.query.scope === 'team') {
        const teamMembers = await User.findAll({ where: { managerId: id }, attributes: ['id'] });
        where.userId = { [Op.in]: teamMembers.map(m => m.id) };
      } else {
        const teamMembers = await User.findAll({ where: { managerId: id }, attributes: ['id'] });
        where.userId = { [Op.in]: [...teamMembers.map(m => m.id), id] };
      }
    } else if (role === 'admin') {
      const companyUsers = await User.findAll({ where: { companyId }, attributes: ['id'] });
      where.userId = { [Op.in]: companyUsers.map(u => u.id) };
    }
    // superadmin sees all — no where filter needed

    const timesheets = await Timesheet.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] },
        { model: User, as: 'approver', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(timesheets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createTimesheet = async (req, res) => {
  try {
    const { weekStart, weekEnd, entries, notes } = req.body;
    const totalHours = (entries || []).reduce((sum, e) => sum + (Number(e.hours) || 0), 0);

    const timesheet = await Timesheet.create({
      userId: req.user.id,
      companyId: req.user.companyId,
      weekStart: new Date(weekStart),
      weekEnd: new Date(weekEnd),
      entries: entries || [],
      totalHours,
      notes,
    });
    res.status(201).json(timesheet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.actionTimesheet = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;
    const ts = await Timesheet.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'role', 'managerId'] }],
    });
    if (!ts) return res.status(404).json({ message: 'Timesheet not found' });
    if (ts.status !== 'pending') return res.status(400).json({ message: 'Timesheet already processed' });

    const actor = req.user;
    const submitter = ts.user;

    // Nobody can approve their own timesheet
    if (submitter.id === actor.id) {
      return res.status(403).json({ message: 'Cannot approve your own timesheet' });
    }

    // Manager can only approve their direct reports (employees, not other managers)
    if (actor.role === 'manager') {
      if (submitter.role === 'manager') {
        return res.status(403).json({ message: 'Cannot approve another manager\'s timesheet. Needs admin or superadmin approval.' });
      }
      if (submitter.managerId !== actor.id) {
        return res.status(403).json({ message: 'Not your team member' });
      }
    }

    // Admin can approve anyone in their company (including managers)
    // Superadmin can approve anyone — no restrictions

    ts.status = action === 'approve' ? 'approved' : 'rejected';
    ts.approvedBy = actor.id;
    ts.approvedAt = new Date();
    if (rejectionReason) ts.rejectionReason = rejectionReason;
    await ts.save();

    const updated = await Timesheet.findByPk(ts.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] },
        { model: User, as: 'approver', attributes: ['id', 'name'] },
      ],
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTimesheet = async (req, res) => {
  try {
    const ts = await Timesheet.findByPk(req.params.id);
    if (!ts) return res.status(404).json({ message: 'Timesheet not found' });
    if (ts.userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (ts.status !== 'pending') return res.status(400).json({ message: 'Cannot delete processed timesheet' });
    await ts.destroy();
    res.json({ message: 'Timesheet deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
