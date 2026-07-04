const express    = require('express');
const router     = express.Router();
const Attendance = require('../models/Attendance');
const User       = require('../models/User');
const Salary     = require('../models/Salary');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

/* ── Check-In ────────────────────────────────────────────────── */
router.post('/checkin', (req, res) => {
  try {
    Attendance.checkIn(req.user.id);
    res.json({ message: 'Checked in successfully', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ── Check-Out ───────────────────────────────────────────────── */
router.post('/checkout', (req, res) => {
  try {
    Attendance.checkOut(req.user.id);
    res.json({ message: 'Checked out successfully', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ── Today's Status ──────────────────────────────────────────── */
router.get('/status', (req, res) => {
  try {
    const status = Attendance.getTodayStatus(req.user.id);
    res.json(status || {
      status: 'Not checked in',
      date: new Date().toISOString().split('T')[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Monthly History ─────────────────────────────────────────── */
router.get('/history', (req, res) => {
  try {
    const now   = new Date();
    const year  = req.query.year  || now.getFullYear();
    const month = req.query.month || (now.getMonth() + 1);
    res.json(Attendance.getMonthlyHistory(req.user.id, year, month));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── My Payroll (any authenticated user) ─────────────────────── */
router.get('/payroll', (req, res) => {
  try {
    const user = User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

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
