const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'awaaz.db');

function run(sql) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);
    db.run(sql, function(err) {
      db.close();
      if (err) reject(err); else resolve();
    });
  });
}

async function upgrade() {
  try {
    // Add columns if they don't exist – SQLite will error if column exists, so we ignore errors.
    const columns = [
      "city TEXT",
      "latitude REAL NOT NULL",
      "longitude REAL NOT NULL",
      "camera_type TEXT",
      "operator TEXT",
      "database_linked TEXT",
      "rti_status TEXT",
      "breach_count INTEGER",
      "broker_count INTEGER",
      "risk_score REAL"
    ];
    for (const col of columns) {
      const sql = `ALTER TABLE heatmap ADD COLUMN ${col}`;
      try { await run(sql); console.log('Added column', col); } catch (e) { /* ignore if exists */ }
    }
    console.log('Heatmap schema upgrade completed');
  } catch (e) {
    console.error('Upgrade failed', e);
  }
}

upgrade();
