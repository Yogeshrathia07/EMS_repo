const { User, Company } = require('../models');

exports.getUsers = async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'admin') {
      where.companyId = req.user.companyId;
      where.role = ['employee', 'manager'];
    } else if (req.user.role === 'manager') {
      where.managerId = req.user.id;
    } else if (req.user.role === 'superadmin') {
      if (req.query.companyId) where.companyId = req.query.companyId;
    }

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name'] },
        { model: User, as: 'manager', attributes: ['id', 'name'] },
      ],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, companyId, managerId, baseSalary, department, phone } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email already exists' });

    const userData = { name, email, password: password || 'Password@123', role, department, phone };
    if (req.user.role === 'admin') {
      userData.companyId = req.user.companyId;
      if (managerId) userData.managerId = managerId;
      if (baseSalary) userData.baseSalary = baseSalary;
    } else if (req.user.role === 'superadmin') {
      userData.companyId = companyId;
      if (baseSalary) userData.baseSalary = baseSalary;
    }

    const user = await User.create(userData);
    const plain = user.toJSON();
    delete plain.password;
    res.status(201).json(plain);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, companyId, managerId, baseSalary, status, department, phone, password } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (department !== undefined) user.department = department;
    if (phone !== undefined) user.phone = phone;
    if (status) user.status = status;
    if (baseSalary !== undefined) user.baseSalary = baseSalary;
    if (password) user.password = password;

    if (req.user.role === 'superadmin') {
      if (role) user.role = role;
      if (companyId) user.companyId = companyId;
    }
    if (req.user.role === 'admin') {
      if (managerId !== undefined) user.managerId = managerId || null;
    }

    await user.save();
    const plain = user.toJSON();
    delete plain.password;
    res.json(plain);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name'] },
        { model: User, as: 'manager', attributes: ['id', 'name'] },
      ],
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
