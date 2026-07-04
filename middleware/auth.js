const jwt = require('jsonwebtoken');

const JWT_SECRET = 'ood-hrms-hackathon-2026-secret-key';

/**
 * Generate a JWT for an authenticated user.
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Express middleware – verifies the Bearer token and attaches `req.user`.
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Express middleware – blocks non-HR users.
 */
function requireHR(req, res, next) {
  if (req.user.role !== 'HR') {
    return res.status(403).json({ error: 'HR access required' });
  }
  next();
}

module.exports = { generateToken, authenticate, requireHR, JWT_SECRET };
