const express = require('express');
const router  = express.Router();
const Leave   = require('../models/Leave');
const { authenticate, requireHR } = require('../middleware/auth');

router.use(authenticate);

/* ── Submit Request ──────────────────────────────────────────── */
router.post('/request', (req, res) => {
  try {
    const { startDate, endDate, leaveType, reason } = req.body;
    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ error: 'Start date, end date, and reason are required' });
    }

    const result = Leave.create({
      userId:    req.user.id,
      startDate, endDate,
      leaveType: leaveType || 'Casual',
      reason,
    });
    res.status(201).json({ message: 'Leave request submitted', id: result.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ── My Requests ─────────────────────────────────────────────── */
router.get('/my-requests', (req, res) => {
  try {
    res.json(Leave.getByUser(req.user.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Approved leaves (for calendar) ──────────────────────────── */
router.get('/approved', (req, res) => {
  try {
    res.json(Leave.getApprovedForUser(req.user.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Pending Queue (HR only) ─────────────────────────────────── */
router.get('/pending', requireHR, (req, res) => {
  try {
    res.json(Leave.getPending());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── All Leaves (HR only) ────────────────────────────────────── */
router.get('/all', requireHR, (req, res) => {
  try {
    res.json(Leave.getAll());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Approve (HR only) ───────────────────────────────────────── */
router.put('/approve/:id', requireHR, (req, res) => {
  try {
    Leave.approve(parseInt(req.params.id), req.user.id);
    res.json({ message: 'Leave approved successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ── Reject (HR only) ────────────────────────────────────────── */
router.put('/reject/:id', requireHR, (req, res) => {
  try {
    Leave.reject(parseInt(req.params.id), req.user.id);
    res.json({ message: 'Leave rejected' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
