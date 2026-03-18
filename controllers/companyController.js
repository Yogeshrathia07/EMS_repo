const { Company, User } = require('../models');

exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({ order: [['createdAt', 'DESC']] });
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCompanyStats = async (req, res) => {
  try {
    const companies = await Company.findAll();
    const stats = await Promise.all(companies.map(async (c) => {
      const userCount = await User.count({ where: { companyId: c.id } });
      return { ...c.toJSON(), userCount };
    }));
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCompany = async (req, res) => {
  try {
    const { name, email, phone, industry, address } = req.body;
    const company = await Company.create({ name, email, phone, industry, address });
    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    await company.update(req.body);
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    await company.destroy();
    res.json({ message: 'Company deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
