const { run, get, all } = require('../db/database');

class Attendance {
  /* ── Clock Actions ─────────────────────────────────────────── */
  static checkIn(userId) {
    const today = new Date().toISOString().split('T')[0];
    const now   = new Date().toISOString();

    const existing = get(
      'SELECT * FROM Attendance WHERE user_id = ? AND date = ?', [userId, today]
    );

    if (existing && existing.check_in) {
      throw new Error('Already checked in today');
    }

    if (existing) {
      return run('UPDATE Attendance SET check_in = ?, status = ? WHERE id = ?',
                 [now, 'Present', existing.id]);
    }

    return run(
      'INSERT INTO Attendance (user_id, date, check_in, status) VALUES (?, ?, ?, ?)',
      [userId, today, now, 'Present']
    );
  }

  static checkOut(userId) {
    const today = new Date().toISOString().split('T')[0];
    const now   = new Date().toISOString();

    const existing = get(
      'SELECT * FROM Attendance WHERE user_id = ? AND date = ?', [userId, today]
    );

    if (!existing || !existing.check_in) throw new Error('Must check in first');
    if (existing.check_out) throw new Error('Already checked out today');

    const hours = ((new Date(now) - new Date(existing.check_in)) / 3_600_000).toFixed(2);

    return run(
      'UPDATE Attendance SET check_out = ?, hours_worked = ? WHERE id = ?',
      [now, parseFloat(hours), existing.id]
    );
  }

  /* ── Queries ───────────────────────────────────────────────── */
  static getTodayStatus(userId) {
    const today = new Date().toISOString().split('T')[0];
    return get('SELECT * FROM Attendance WHERE user_id = ? AND date = ?', [userId, today]);
  }

  static getMonthlyHistory(userId, year, month) {
    const mm    = String(month).padStart(2, '0');
    const start = `${year}-${mm}-01`;
    const end   = `${year}-${mm}-31`;
    return all(
      'SELECT * FROM Attendance WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date',
      [userId, start, end]
    );
  }

  static getAllTodayStatus() {
    const today = new Date().toISOString().split('T')[0];
    return all(`
      SELECT u.id, u.employee_id, u.first_name, u.last_name, u.email,
             u.department, u.designation, u.total_wage,
             a.status, a.check_in, a.check_out, a.hours_worked
      FROM   Users u
      LEFT JOIN Attendance a ON u.id = a.user_id AND a.date = ?
      WHERE  u.role = 'Employee'
    `, [today]);
  }

  static getMonthlyStats(year, month) {
    const mm    = String(month).padStart(2, '0');
    const start = `${year}-${mm}-01`;
    const end   = `${year}-${mm}-31`;
    return all(`
      SELECT status, COUNT(*) AS count
      FROM   Attendance
      WHERE  date BETWEEN ? AND ?
      GROUP  BY status
    `, [start, end]);
  }

  static getUnpaidLeaveDays(userId, year, month) {
    const mm    = String(month).padStart(2, '0');
    const start = `${year}-${mm}-01`;
    const end   = `${year}-${mm}-31`;
    const row   = get(`
      SELECT COUNT(*) AS count FROM Attendance
      WHERE user_id = ? AND date BETWEEN ? AND ? AND status = 'Absent'
    `, [userId, start, end]);
    return row?.count || 0;
  }
}

module.exports = Attendance;
