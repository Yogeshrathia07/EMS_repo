const { Op } = require('sequelize');
const { Leave, User } = require('../models');

exports.getLeaves = async (req, res) => {
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

    const leaves = await Leave.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] },
        { model: User, as: 'approver', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createLeave = async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const leave = await Leave.create({
      userId: req.user.id,
      companyId: req.user.companyId,
      type, startDate: start, endDate: end, days, reason,
    });
    res.status(201).json(leave);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.actionLeave = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;
    const leave = await Leave.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'role', 'managerId'] }],
    });
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    if (leave.status !== 'pending') return res.status(400).json({ message: 'Leave already processed' });

    const actor = req.user;
    const submitter = leave.user;

    if (actor.role === 'manager') {
      if (submitter.id === actor.id) {
        return res.status(403).json({ message: 'Cannot approve your own leave' });
      }
      if (submitter.role === 'manager') {
        return res.status(403).json({ message: 'Cannot approve another manager\'s leave' });
      }
      if (submitter.managerId !== actor.id) {
        return res.status(403).json({ message: 'Not your team member' });
      }
    }

    leave.status = action === 'approve' ? 'approved' : 'rejected';
    leave.approvedBy = actor.id;
    leave.approvedAt = new Date();
    if (rejectionReason) leave.rejectionReason = rejectionReason;
    await leave.save();

    const updated = await Leave.findByPk(leave.id, {
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

exports.deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findByPk(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    if (leave.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (leave.status !== 'pending') return res.status(400).json({ message: 'Cannot delete processed leave' });
    await leave.destroy();
    res.json({ message: 'Leave deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
