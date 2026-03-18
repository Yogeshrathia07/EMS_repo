const jwt = require('jsonwebtoken');
const { User, Company } = require('../models');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: { email },
      include: [{ model: Company, as: 'company' }],
    });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.status === 'inactive') return res.status(403).json({ message: 'Account is inactive. Contact your administrator.' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.company,
        baseSalary: user.baseSalary,
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
