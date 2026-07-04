const express = require('express');
const path    = require('path');
const { initDatabase } = require('./db/database');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Middleware ───────────────────────────────────────────────── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

/* ── API Routes ──────────────────────────────────────────────── */
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/leave',      require('./routes/leave'));
app.use('/api/admin',      require('./routes/admin'));

/* ── SPA fallback ────────────────────────────────────────────── */
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ── Boot (async because sql.js init is async) ───────────────── */
(async () => {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════╗
  ║   🚀  OOD HRMS Server is running        ║
  ║   📡  http://localhost:${PORT}              ║
  ║   🏢  Odoo x Adamas Hackathon '26       ║
  ╚══════════════════════════════════════════╝
    `);
  });
})();
