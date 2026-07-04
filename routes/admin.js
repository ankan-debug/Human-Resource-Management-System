const express    = require('express');
const router     = express.Router();
const User       = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave      = require('../models/Leave');
const Salary     = require('../models/Salary');
const { authenticate, requireHR } = require('../middleware/auth');

router.use(authenticate, requireHR);

/* ── Employee Directory (with live status dots) ──────────────── */
router.get('/employees', (req, res) => {
  try {
    const employees = Attendance.getAllTodayStatus();

    const enriched = employees.map((emp) => {
      let statusDot = 'red';                      // default absent
      if (emp.status === 'Present' || emp.check_in) statusDot = 'green';
      else if (emp.status === 'On Leave')           statusDot = 'yellow';
      return { ...emp, statusDot };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Dashboard Stats ─────────────────────────────────────────── */
router.get('/stats', (req, res) => {
  try {
    const now   = new Date();
    const year  = now.getFullYear();
    const month = now.getMonth() + 1;

    const employees     = User.findEmployees();
    const totalEmployees = employees.length;
    const todayStatus   = Attendance.getAllTodayStatus();

    const presentToday  = todayStatus.filter(e => e.status === 'Present' || e.check_in).length;
    const onLeaveToday  = todayStatus.filter(e => e.status === 'On Leave').length;
    const absentToday   = totalEmployees - presentToday - onLeaveToday;

    // Salary distribution buckets
    const salaryRanges = { 'Below 30K': 0, '30K–50K': 0, '50K–80K': 0, '80K–1L': 0, 'Above 1L': 0 };
    employees.forEach(({ total_wage: w }) => {
      if (w < 30000)       salaryRanges['Below 30K']++;
      else if (w < 50000)  salaryRanges['30K–50K']++;
      else if (w < 80000)  salaryRanges['50K–80K']++;
      else if (w < 100000) salaryRanges['80K–1L']++;
      else                 salaryRanges['Above 1L']++;
    });

    // Department head-count
    const departments = {};
    employees.forEach(({ department: d }) => {
      departments[d] = (departments[d] || 0) + 1;
    });

    const pendingLeavesCount = Leave.getPending().length;

    res.json({
      totalEmployees, presentToday, absentToday, onLeaveToday,
      salaryRanges, departments, pendingLeavesCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Update Employee ─────────────────────────────────────────── */
router.put('/employee/:id', (req, res) => {
  try {
    const { total_wage, department, designation, role } = req.body;
    const updates = {};
    if (total_wage !== undefined) updates.total_wage  = total_wage;
    if (department)               updates.department  = department;
    if (designation)              updates.designation = designation;
    if (role)                     updates.role        = role;

    User.update(parseInt(req.params.id), updates);
    res.json({ message: 'Employee updated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ── Employee Payroll (HR view) ──────────────────────────────── */
router.get('/payroll/:id', (req, res) => {
  try {
    const user = User.findById(parseInt(req.params.id));
    if (!user) return res.status(404).json({ error: 'Employee not found' });

    const now     = new Date();
    const payroll = Salary.getEmployeePayroll(
      user.id, user.total_wage, now.getFullYear(), now.getMonth() + 1
    );
    res.json({ employee: user, payroll });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
