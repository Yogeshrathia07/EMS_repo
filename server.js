require('dotenv').config();
const express = require('express');
const path = require('path');
const { sequelize, Company, User } = require('./models');

const app = express();

// ─── Middleware ───
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── View Engine ───
const ejs = require('ejs');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', (filePath, options, callback) => {
  ejs.renderFile(filePath, options, { root: path.join(__dirname, 'views'), views: [path.join(__dirname, 'views')] }, callback);
});

// ─── API Routes ───
app.use('/api', require('./routes/index'));

// ─── Page Routes ───

// Root redirect
app.get('/', (req, res) => res.redirect('/login'));

// Login
app.get('/login', (req, res) => res.render('login'));

// Employee pages
app.get('/employee/dashboard', (req, res) => res.render('employee/dashboard', { title: 'Dashboard' }));
app.get('/employee/profile',   (req, res) => res.render('employee/profile',   { title: 'Profile' }));
app.get('/employee/leaves',    (req, res) => res.render('employee/leaves',    { title: 'Time Off' }));
app.get('/employee/timesheets',(req, res) => res.render('employee/timesheets',{ title: 'Timesheets' }));
app.get('/employee/salary',    (req, res) => res.render('employee/salary',    { title: 'Salary Details' }));
app.get('/employee/documents', (req, res) => res.render('employee/documents', { title: 'Documents' }));
app.get('/employee/training',  (req, res) => res.render('employee/training',  { title: 'Training' }));
app.get('/employee/benefits',  (req, res) => res.render('employee/benefits',  { title: 'Benefits' }));

// Manager pages
app.get('/manager/dashboard',  (req, res) => res.render('manager/dashboard',  { title: 'Dashboard' }));
app.get('/manager/profile',    (req, res) => res.render('employee/profile',   { title: 'Profile' }));
app.get('/manager/leaves',     (req, res) => res.render('manager/leaves',     { title: 'Leave Requests' }));
app.get('/manager/timesheets', (req, res) => res.render('manager/timesheets', { title: 'Timesheets' }));

// Admin pages
app.get('/admin/dashboard',    (req, res) => res.render('admin/dashboard',    { title: 'Dashboard' }));
app.get('/admin/users',        (req, res) => res.render('admin/users',        { title: 'Employees' }));
app.get('/admin/leaves',       (req, res) => res.render('admin/leaves',       { title: 'Leave Management' }));
app.get('/admin/timesheets',   (req, res) => res.render('admin/timesheets',   { title: 'Timesheets' }));
app.get('/admin/salary',       (req, res) => res.render('admin/salary',       { title: 'Payroll' }));
app.get('/admin/performance',  (req, res) => res.render('admin/performance',  { title: 'Performance' }));
app.get('/admin/training',     (req, res) => res.render('admin/training',     { title: 'Training' }));

// Admin CRM pages
app.get('/admin/crm/contacts', (req, res) => res.render('admin/crm/contacts', { title: 'CRM Contacts' }));
app.get('/admin/crm/deals',    (req, res) => res.render('admin/crm/deals',    { title: 'CRM Deals' }));
app.get('/admin/crm/pipeline', (req, res) => res.render('admin/crm/pipeline', { title: 'CRM Pipeline' }));

// Super Admin pages
app.get('/superadmin/dashboard', (req, res) => res.render('superadmin/dashboard', { title: 'Dashboard' }));
app.get('/superadmin/companies', (req, res) => res.render('superadmin/companies', { title: 'Companies' }));
app.get('/superadmin/users',     (req, res) => res.render('superadmin/users',     { title: 'All Users' }));
app.get('/superadmin/reports',   (req, res) => res.render('superadmin/dashboard', { title: 'Analytics' }));
app.get('/superadmin/settings',  (req, res) => res.render('superadmin/dashboard', { title: 'Settings' }));

// 404 fallback
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'Route not found' });
  }
  res.redirect('/login');
});

// ─── Database & Server Start ───
const PORT = process.env.PORT || 5500;

sequelize.sync({ alter: true })
  .then(async () => {
    console.log('✅ MySQL connected & tables synced');
    await seedInitialData();
    app.listen(PORT, () => {
      console.log(`\n🚀 EMS Platform running at http://localhost:${PORT}`);
      console.log(`📋 Login page: http://localhost:${PORT}/login`);
      console.log('\n📧 Demo accounts (password: Admin@123):');
      console.log('   🔴 Super Admin : superadmin@ems.com');
      console.log('   🟠 Admin       : admin@demo.com');
      console.log('   🟡 Manager     : manager@demo.com');
      console.log('   🟢 Employee    : employee@demo.com\n');
    });
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  });

// ─── Seed Initial Data ───
async function seedInitialData() {
  const existing = await User.findOne({ where: { email: 'superadmin@ems.com' } });
  if (existing) return;

  console.log('🌱 Seeding initial data...');

  const company = await Company.create({
    name: 'Demo Corp',
    email: 'contact@democorp.com',
    phone: '+1-555-0100',
    industry: 'Technology',
    address: '123 Tech Street, San Francisco, CA',
    status: 'active',
  });

  await User.create({
    name: 'Super Admin',
    email: 'superadmin@ems.com',
    password: 'Admin@123',
    role: 'superadmin',
    status: 'active',
  });

  await User.create({
    name: 'John Admin',
    email: 'admin@demo.com',
    password: 'Admin@123',
    role: 'admin',
    companyId: company.id,
    baseSalary: 8000,
    department: 'Management',
    status: 'active',
  });

  const manager = await User.create({
    name: 'Sarah Manager',
    email: 'manager@demo.com',
    password: 'Admin@123',
    role: 'manager',
    companyId: company.id,
    baseSalary: 6000,
    department: 'Engineering',
    status: 'active',
  });

  await User.create({
    name: 'Alex Employee',
    email: 'employee@demo.com',
    password: 'Admin@123',
    role: 'employee',
    companyId: company.id,
    managerId: manager.id,
    baseSalary: 4000,
    department: 'Engineering',
    status: 'active',
  });

  await User.bulkCreate([
    {
      name: 'Bob Smith',
      email: 'bob@demo.com',
      password: 'Admin@123',
      role: 'employee',
      companyId: company.id,
      managerId: manager.id,
      baseSalary: 3800,
      department: 'Engineering',
      status: 'active',
    },
    {
      name: 'Carol Jones',
      email: 'carol@demo.com',
      password: 'Admin@123',
      role: 'employee',
      companyId: company.id,
      managerId: manager.id,
      baseSalary: 4200,
      department: 'Design',
      status: 'active',
    },
  ], { individualHooks: true });

  console.log('✅ Seed data created successfully!');
}
