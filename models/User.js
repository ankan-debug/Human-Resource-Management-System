const crypto = require('crypto');
const { run, get, all } = require('../db/database');

class User {
  /* ── Employee ID Generator ─────────────────────────────────────
   *  Format: OOD-{F}{L}-2026-0001
   * ──────────────────────────────────────────────────────────── */
  static generateEmployeeId(firstName, lastName) {
    const prefix   = 'OOD';
    const initials = (firstName[0] + lastName[0]).toUpperCase();
    const year     = '2026';
    const pattern  = `OOD-${initials}-${year}-%`;

    const row = get('SELECT COUNT(*) AS count FROM Users WHERE employee_id LIKE ?', [pattern]);
    const serial = String((row?.count || 0) + 1).padStart(4, '0');
    return `${prefix}-${initials}-${year}-${serial}`;
  }

  /* ── Password helpers (PBKDF2) ─────────────────────────────── */
  static hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100_000, 64, 'sha256').toString('hex');
    return { hash, salt };
  }

  static verifyPassword(password, hash, salt) {
    return crypto.pbkdf2Sync(password, salt, 100_000, 64, 'sha256').toString('hex') === hash;
  }

  /* ── CRUD ───────────────────────────────────────────────────── */
  static create({ email, password, firstName, lastName,
                   role = 'Employee', totalWage = 0,
                   department = 'General', designation = 'Associate' }) {

    const employeeId     = this.generateEmployeeId(firstName, lastName);
    const { hash, salt } = this.hashPassword(password);

    const result = run(`
      INSERT INTO Users
        (employee_id, email, password, salt, role,
         first_name, last_name, total_wage, department, designation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [employeeId, email, hash, salt, role,
        firstName, lastName, totalWage, department, designation]);

    return { id: result.lastInsertRowid, employeeId };
  }

  static findByEmail(email) {
    return get('SELECT * FROM Users WHERE email = ?', [email]);
  }

  static findById(id) {
    return get(`
      SELECT id, employee_id, email, role, first_name, last_name,
             total_wage, department, designation, phone,
             profile_image, created_at
      FROM Users WHERE id = ?
    `, [id]);
  }

  static findAll() {
    return all(`
      SELECT id, employee_id, email, role, first_name, last_name,
             total_wage, department, designation, phone,
             profile_image, created_at
      FROM Users ORDER BY id
    `);
  }

  static findEmployees() {
    return all(`
      SELECT id, employee_id, email, role, first_name, last_name,
             total_wage, department, designation, phone,
             profile_image, created_at
      FROM Users WHERE role = 'Employee' ORDER BY id
    `);
  }

  static update(id, fields) {
    const keys = Object.keys(fields);
    if (!keys.length) return;
    const sets   = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => fields[k]);
    values.push(id);
    return run(`UPDATE Users SET ${sets} WHERE id = ?`, values);
  }

  static delete(id) {
    return run('DELETE FROM Users WHERE id = ?', [id]);
  }

  static count() {
    const row = get('SELECT COUNT(*) AS count FROM Users');
    return row?.count || 0;
  }
}

module.exports = User;
