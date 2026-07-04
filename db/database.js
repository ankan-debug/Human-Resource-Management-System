const initSqlJs = require('sql.js');
const fs   = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'hrms.db');

let db = null;

/**
 * Initialise (or open) the SQLite database.
 * Call once at app start; afterwards use getDb().
 */
async function initDatabase() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS Users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id   TEXT    UNIQUE,
      email         TEXT    UNIQUE NOT NULL,
      password      TEXT    NOT NULL,
      salt          TEXT    NOT NULL,
      role          TEXT    NOT NULL DEFAULT 'Employee',
      first_name    TEXT    NOT NULL,
      last_name     TEXT    NOT NULL,
      total_wage    REAL    DEFAULT 0,
      department    TEXT    DEFAULT 'General',
      designation   TEXT    DEFAULT 'Associate',
      phone         TEXT    DEFAULT '',
      profile_image TEXT    DEFAULT '',
      created_at    TEXT    DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Attendance (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL,
      date         TEXT    NOT NULL,
      check_in     TEXT,
      check_out    TEXT,
      status       TEXT    NOT NULL DEFAULT 'Absent',
      hours_worked REAL    DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
      UNIQUE(user_id, date)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Leave_Requests (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL,
      start_date  TEXT    NOT NULL,
      end_date    TEXT    NOT NULL,
      leave_type  TEXT    NOT NULL DEFAULT 'Casual',
      reason      TEXT    NOT NULL,
      status      TEXT    NOT NULL DEFAULT 'Pending',
      reviewed_by INTEGER,
      reviewed_at TEXT,
      created_at  TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (user_id)     REFERENCES Users(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewed_by) REFERENCES Users(id)
    );
  `);

  db.run('PRAGMA foreign_keys = ON;');

  save(); // persist initial schema
  return db;
}

/** Return the live db handle (synchronous after init). */
function getDb() {
  if (!db) throw new Error('Database not initialised – call initDatabase() first');
  return db;
}

/** Persist in-memory state to disk. */
function save() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

/* ── Tiny helpers that mimic better-sqlite3 API ────────────── */

/**
 * Run a statement and return { lastInsertRowid, changes }.
 * Accepts positional params as an array.
 */
function run(sql, params = []) {
  db.run(sql, params);
  const id   = db.exec('SELECT last_insert_rowid() AS id')[0]?.values[0][0] ?? 0;
  const chg  = db.exec('SELECT changes() AS c')[0]?.values[0][0] ?? 0;
  save();
  return { lastInsertRowid: id, changes: chg };
}

/**
 * Get one row as a plain object, or undefined.
 */
function get(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const cols = stmt.getColumnNames();
    const vals = stmt.get();
    stmt.free();
    const row = {};
    cols.forEach((c, i) => (row[c] = vals[i]));
    return row;
  }
  stmt.free();
  return undefined;
}

/**
 * Get all rows as an array of plain objects.
 */
function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const cols = stmt.getColumnNames();
  const rows = [];
  while (stmt.step()) {
    const vals = stmt.get();
    const row  = {};
    cols.forEach((c, i) => (row[c] = vals[i]));
    rows.push(row);
  }
  stmt.free();
  return rows;
}

module.exports = { initDatabase, getDb, save, run, get, all };
