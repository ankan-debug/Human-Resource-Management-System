/**
 * Seed script — populates the database with realistic mock data.
 * Run with:  npm run seed
 */
const { initDatabase, run, getDb } = require('./database');
const User = require('../models/User');

async function seed() {
  await initDatabase();
  const db = getDb();

  /* ── Clear existing data ─────────────────────────────────── */
  db.run('DELETE FROM Leave_Requests');
  db.run('DELETE FROM Attendance');
  db.run('DELETE FROM Users');
  const { save } = require('./database');
  save();

  console.log('🗑️  Cleared existing data.');

  /* ── Mock Employees ──────────────────────────────────────── */
  const people = [
    { email: 'admin@oodhrms.com',        password: 'admin123', firstName: 'Rajesh',  lastName: 'Sharma', role: 'HR',       totalWage: 95000,  department: 'Human Resources', designation: 'HR Manager' },
    { email: 'priya.singh@oodhrms.com',   password: 'emp123',   firstName: 'Priya',   lastName: 'Singh',  role: 'Employee', totalWage: 65000,  department: 'Engineering',     designation: 'Senior Developer' },
    { email: 'amit.patel@oodhrms.com',    password: 'emp123',   firstName: 'Amit',    lastName: 'Patel',  role: 'Employee', totalWage: 55000,  department: 'Design',          designation: 'UI/UX Designer' },
    { email: 'sneha.gupta@oodhrms.com',   password: 'emp123',   firstName: 'Sneha',   lastName: 'Gupta',  role: 'Employee', totalWage: 60000,  department: 'Marketing',       designation: 'Marketing Lead' },
    { email: 'vikram.reddy@oodhrms.com',  password: 'emp123',   firstName: 'Vikram',  lastName: 'Reddy',  role: 'Employee', totalWage: 58000,  department: 'Engineering',     designation: 'Backend Developer' },
    { email: 'ananya.das@oodhrms.com',    password: 'emp123',   firstName: 'Ananya',  lastName: 'Das',    role: 'Employee', totalWage: 72000,  department: 'Product',         designation: 'Product Manager' },
    { email: 'rohan.mehta@oodhrms.com',   password: 'emp123',   firstName: 'Rohan',   lastName: 'Mehta',  role: 'Employee', totalWage: 62000,  department: 'Engineering',     designation: 'DevOps Engineer' },
    { email: 'kavita.iyer@oodhrms.com',   password: 'emp123',   firstName: 'Kavita',  lastName: 'Iyer',   role: 'Employee', totalWage: 50000,  department: 'Operations',      designation: 'Business Analyst' },
    { email: 'arjun.nair@oodhrms.com',    password: 'emp123',   firstName: 'Arjun',   lastName: 'Nair',   role: 'Employee', totalWage: 48000,  department: 'Engineering',     designation: 'QA Engineer' },
  ];

  const userIds = {};

  people.forEach((p) => {
    const result = User.create(p);
    userIds[p.email] = result.id;
    console.log(`👤  Created ${p.firstName} ${p.lastName} → ${result.employeeId}`);
  });

  /* ── Historical Attendance (past 30 weekdays) ──────────── */
  function randomTime(base, minH, maxH) {
    const h = minH + Math.floor(Math.random() * (maxH - minH));
    const m = Math.floor(Math.random() * 60);
    return `${base}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00.000Z`;
  }

  const today = new Date();
  const employeeEmails = people.filter(p => p.role === 'Employee').map(p => p.email);

  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (d.getDay() === 0 || d.getDay() === 6) continue; // skip weekends

    const dateStr = d.toISOString().split('T')[0];

    employeeEmails.forEach((email) => {
      const uid  = userIds[email];
      const rand = Math.random();

      if (rand < 0.10) {
        run('INSERT INTO Attendance (user_id, date, status) VALUES (?, ?, ?)',
            [uid, dateStr, 'Absent']);
      } else if (rand < 0.15) {
        run('INSERT INTO Attendance (user_id, date, status) VALUES (?, ?, ?)',
            [uid, dateStr, 'On Leave']);
      } else {
        const cin  = randomTime(dateStr, 8, 10);
        const cout = randomTime(dateStr, 17, 19);
        const hrs  = ((new Date(cout) - new Date(cin)) / 3_600_000).toFixed(2);
        run('INSERT INTO Attendance (user_id, date, check_in, check_out, status, hours_worked) VALUES (?, ?, ?, ?, ?, ?)',
            [uid, dateStr, cin, cout, 'Present', parseFloat(hrs)]);
      }
    });
  }

  console.log('📅  Seeded attendance for past 30 weekdays.');

  /* ── Leave Requests ────────────────────────────────────── */
  const hrId = userIds['admin@oodhrms.com'];

  // Past approved
  run(`INSERT INTO Leave_Requests (user_id, start_date, end_date, leave_type, reason, status, reviewed_by, reviewed_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userIds['priya.singh@oodhrms.com'], '2026-06-15', '2026-06-17', 'Casual',
     'Family function', 'Approved', hrId, '2026-06-14T10:00:00Z', '2026-06-13T09:00:00Z']);

  run(`INSERT INTO Leave_Requests (user_id, start_date, end_date, leave_type, reason, status, reviewed_by, reviewed_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userIds['rohan.mehta@oodhrms.com'], '2026-06-20', '2026-06-20', 'Sick',
     'Not feeling well', 'Approved', hrId, '2026-06-20T08:00:00Z', '2026-06-20T07:30:00Z']);

  // Past rejected
  run(`INSERT INTO Leave_Requests (user_id, start_date, end_date, leave_type, reason, status, reviewed_by, reviewed_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userIds['amit.patel@oodhrms.com'], '2026-06-25', '2026-06-28', 'Earned',
     'Personal travel', 'Rejected', hrId, '2026-06-24T14:00:00Z', '2026-06-23T11:00:00Z']);

  // Pending (for HR to action during demo)
  run(`INSERT INTO Leave_Requests (user_id, start_date, end_date, leave_type, reason, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userIds['sneha.gupta@oodhrms.com'], '2026-07-10', '2026-07-12', 'Casual',
     'Cousin wedding', 'Pending', '2026-07-03T09:00:00Z']);

  run(`INSERT INTO Leave_Requests (user_id, start_date, end_date, leave_type, reason, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userIds['vikram.reddy@oodhrms.com'], '2026-07-14', '2026-07-14', 'Sick',
     'Doctor appointment', 'Pending', '2026-07-03T10:00:00Z']);

  run(`INSERT INTO Leave_Requests (user_id, start_date, end_date, leave_type, reason, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userIds['kavita.iyer@oodhrms.com'], '2026-07-08', '2026-07-09', 'Casual',
     'Personal emergency', 'Pending', '2026-07-03T11:00:00Z']);

  console.log('🏖️  Seeded leave requests (approved, pending, rejected).');
  console.log('');
  console.log('  ✅  Seed complete!');
  console.log('  🔑  HR Login:  admin@oodhrms.com / admin123');
  console.log('  👤  Employee:  priya.singh@oodhrms.com / emp123');
  console.log('');
}

seed().catch(console.error);
