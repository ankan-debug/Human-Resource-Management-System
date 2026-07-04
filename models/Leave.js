const { run, get, all } = require('../db/database');

class Leave {
  /* ── Create ────────────────────────────────────────────────── */
  static create({ userId, startDate, endDate, leaveType = 'Casual', reason }) {
    const overlap = get(`
      SELECT id FROM Leave_Requests
      WHERE user_id = ? AND status != 'Rejected'
        AND ((start_date BETWEEN ? AND ?)
          OR (end_date   BETWEEN ? AND ?)
          OR (start_date <= ? AND end_date >= ?))
    `, [userId, startDate, endDate, startDate, endDate, startDate, endDate]);

    if (overlap) throw new Error('Overlapping leave request already exists');

    const result = run(`
      INSERT INTO Leave_Requests (user_id, start_date, end_date, leave_type, reason)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, startDate, endDate, leaveType, reason]);

    return { id: result.lastInsertRowid };
  }

  /* ── Read ──────────────────────────────────────────────────── */
  static getByUser(userId) {
    return all(`
      SELECT lr.*, u.first_name || ' ' || u.last_name AS reviewed_by_name
      FROM   Leave_Requests lr
      LEFT JOIN Users u ON lr.reviewed_by = u.id
      WHERE  lr.user_id = ?
      ORDER  BY lr.created_at DESC
    `, [userId]);
  }

  static getPending() {
    return all(`
      SELECT lr.*, u.first_name, u.last_name, u.employee_id,
             u.email, u.department
      FROM   Leave_Requests lr
      JOIN   Users u ON lr.user_id = u.id
      WHERE  lr.status = 'Pending'
      ORDER  BY lr.created_at ASC
    `);
  }

  static getAll() {
    return all(`
      SELECT lr.*, u.first_name, u.last_name, u.employee_id, u.department
      FROM   Leave_Requests lr
      JOIN   Users u ON lr.user_id = u.id
      ORDER  BY lr.created_at DESC
    `);
  }

  /* ── Approve / Reject ──────────────────────────────────────── */
  static approve(id, reviewedBy) {
    const leave = get('SELECT * FROM Leave_Requests WHERE id = ?', [id]);
    if (!leave) throw new Error('Leave request not found');
    if (leave.status !== 'Pending') throw new Error('Leave already processed');

    const now = new Date().toISOString();
    run(
      `UPDATE Leave_Requests SET status='Approved', reviewed_by=?, reviewed_at=? WHERE id=?`,
      [reviewedBy, now, id]
    );

    // Mark attendance as "On Leave" for every day in the range
    for (let d = new Date(leave.start_date); d <= new Date(leave.end_date); d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const exists  = get(
        'SELECT id FROM Attendance WHERE user_id = ? AND date = ?',
        [leave.user_id, dateStr]
      );
      if (exists) {
        run('UPDATE Attendance SET status = ? WHERE id = ?', ['On Leave', exists.id]);
      } else {
        run(
          'INSERT INTO Attendance (user_id, date, status) VALUES (?, ?, ?)',
          [leave.user_id, dateStr, 'On Leave']
        );
      }
    }

    return { success: true };
  }

  static reject(id, reviewedBy) {
    const leave = get('SELECT * FROM Leave_Requests WHERE id = ?', [id]);
    if (!leave) throw new Error('Leave request not found');
    if (leave.status !== 'Pending') throw new Error('Leave already processed');

    const now = new Date().toISOString();
    return run(
      `UPDATE Leave_Requests SET status='Rejected', reviewed_by=?, reviewed_at=? WHERE id=?`,
      [reviewedBy, now, id]
    );
  }

  static getApprovedForUser(userId) {
    return all(`
      SELECT * FROM Leave_Requests
      WHERE user_id = ? AND status = 'Approved'
      ORDER BY start_date
    `, [userId]);
  }
}

module.exports = Leave;
