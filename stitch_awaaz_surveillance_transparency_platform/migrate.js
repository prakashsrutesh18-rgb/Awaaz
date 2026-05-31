const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'awaaz.db');

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  // Reports table
  db.run(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      lat REAL NOT NULL,
      lon REAL NOT NULL,
      tags TEXT,
      createdAt TEXT NOT NULL
    )
  `);

  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'reporter',
      createdAt TEXT NOT NULL
    )
  `);
  // Insert default admin user if not exists (password: adminpass) - useful for hackathon demo
  const bcrypt = require('bcrypt');
  const defaultAdmin = 'admin';
  const defaultPass = process.env.ADMIN_PASS || 'adminpass';
  db.get('SELECT id FROM users WHERE username = ?', [defaultAdmin], (err, row) => {
    if (err) console.error(err);
    if (!row) {
      bcrypt.hash(defaultPass, 10).then(hash => {
        const createdAt = new Date().toISOString();
        db.run('INSERT INTO users (username, password_hash, role, createdAt) VALUES (?, ?, ?, ?)', [defaultAdmin, hash, 'admin', createdAt], (e) => {
          if (e) console.error('Failed to create default admin', e);
          else console.log(`Default admin created: ${defaultAdmin} / ${defaultPass}`);
          db.close();
        });
      });
    } else {
      console.log('Admin user already exists');
      db.close();
    }
  });
  console.log('Migration complete. DB at', DB_PATH);
});
