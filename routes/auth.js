const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const { generateToken, authenticate } = require('../middleware/auth');

/* ── Register ────────────────────────────────────────────────── */
router.post('/register', (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (User.findByEmail(email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const result = User.create({ email, password, firstName, lastName });

    res.status(201).json({
      message:
        '[Simulated SMTP] Verification token dispatched to employee email address successfully!',
      employeeId: result.employeeId,
      id: result.id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Login ───────────────────────────────────────────────────── */
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = User.findByEmail(email);
    if (!user || !User.verifyPassword(password, user.password, user.salt)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id:          user.id,
        employeeId:  user.employee_id,
        email:       user.email,
        role:        user.role,
        firstName:   user.first_name,
        lastName:    user.last_name,
        department:  user.department,
        designation: user.designation,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Current User ────────────────────────────────────────────── */
router.get('/me', authenticate, (req, res) => {
  try {
    const user = User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
