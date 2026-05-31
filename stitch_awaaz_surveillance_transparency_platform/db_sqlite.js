const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'awaaz.db');

function getDb() {
  const db = new sqlite3.Database(DB_PATH);
  return db;
}

function getReports(limit = 100) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.all('SELECT * FROM reports ORDER BY createdAt DESC LIMIT ?', [limit], (err, rows) => {
      db.close();
      if (err) return reject(err);
      rows.forEach(r => { if (r.tags && typeof r.tags === 'string') r.tags = JSON.parse(r.tags); });
      resolve(rows);
    });
  });
}

function addReport(report) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    const tags = JSON.stringify(report.tags || []);
    db.run(
      'INSERT INTO reports (id, title, description, lat, lon, tags, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [report.id, report.title, report.description || '', report.lat, report.lon, tags, report.createdAt],
      function(err) {
        db.close();
        if (err) return reject(err);
        resolve(report);
      }
    );
  });
}

function createUser(username, passwordHash, role = 'reporter') {
  return new Promise((resolve, reject) => {
    const db = getDb();
    const createdAt = new Date().toISOString();
    db.run(
      'INSERT INTO users (username, password_hash, role, createdAt) VALUES (?, ?, ?, ?)',
      [username, passwordHash, role, createdAt],
      function(err) {
        db.close();
        if (err) return reject(err);
        resolve({ id: this.lastID, username, role, createdAt });
      }
    );
  });
}

function findUserByUsername(username) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.get('SELECT id, username, password_hash as passwordHash, role FROM users WHERE username = ?', [username], (err, row) => {
      db.close();
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function deleteReportById(id) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run('DELETE FROM reports WHERE id = ?', [id], function(err) {
      db.close();
      if (err) return reject(err);
      resolve({ deleted: this.changes });
    });
  });
}

function flagReportById(id) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.get('SELECT tags FROM reports WHERE id = ?', [id], (err, row) => {
      if (err) { db.close(); return reject(err); }
      if (!row) { db.close(); return resolve(null); }
      let tags = [];
      try { tags = row.tags ? JSON.parse(row.tags) : []; } catch (e) { tags = []; }
      if (!tags.includes('flagged')) tags.push('flagged');
      const tagsStr = JSON.stringify(tags);
      db.run('UPDATE reports SET tags = ? WHERE id = ?', [tagsStr, id], function(uerr) {
        db.close();
        if (uerr) return reject(uerr);
        resolve({ flagged: true });
      });
    });
  });
}

module.exports = {
  getReports,
  addReport,
  createUser,
  findUserByUsername,
  deleteReportById,
  flagReportById
};

