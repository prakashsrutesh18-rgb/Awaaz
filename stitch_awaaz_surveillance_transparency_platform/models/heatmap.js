const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the same SQLite DB
const DB_PATH = path.join(__dirname, 'awaaz.db');

function getDb() {
  return new sqlite3.Database(DB_PATH);
}

/**
 * Upsert a heatmap record. If a record with the same source and coordinates exists, update it; otherwise insert.
 * @param {Object} opts
 * @param {string} opts.source - Identifier of the data source.
 * @param {string} opts.city - City name (optional).
 * @param {number} opts.latitude - Latitude.
 * @param {number} opts.longitude - Longitude.
 * @param {string} opts.camera_type - Camera type (e.g., FR, CCTV, basic).
 * @param {string} opts.operator - Operator (police, GHMC, private).
 * @param {string} opts.database_linked - Linked database (TSCOP, CCTNS, Aadhaar).
 * @param {string} opts.rti_status - RTI filing status.
 * @param {number} opts.breach_count - Number of breaches reported.
 * @param {number} opts.broker_count - Number of broker reports.
 * @param {number} opts.risk_score - Computed risk score.
 */
function upsertHeatmapRecord({
  source,
  city = null,
  latitude,
  longitude,
  camera_type = null,
  operator = null,
  database_linked = null,
  rti_status = null,
  breach_count = 0,
  broker_count = 0,
  risk_score = 0
}) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    const now = new Date().toISOString();
    // Try update first based on source + latitude + longitude
    db.run(
      `UPDATE heatmap SET city = ?, camera_type = ?, operator = ?, database_linked = ?, rti_status = ?, breach_count = ?, broker_count = ?, risk_score = ?, updated_at = ?
       WHERE source = ? AND latitude = ? AND longitude = ?`,
      [city, camera_type, operator, database_linked, rti_status, breach_count, broker_count, risk_score, now, source, latitude, longitude],
      function (err) {
        if (err) {
          db.close();
          return reject(err);
        }
        if (this.changes > 0) {
          db.close();
          return resolve({ updated: true });
        }
        // Insert new record
        db.run(
          `INSERT INTO heatmap (source, city, latitude, longitude, camera_type, operator, database_linked, rti_status, breach_count, broker_count, risk_score, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [source, city, latitude, longitude, camera_type, operator, database_linked, rti_status, breach_count, broker_count, risk_score, now],
          function (insErr) {
            db.close();
            if (insErr) return reject(insErr);
            resolve({ inserted: true });
          }
        );
      }
    );
  });
}

/** Retrieve all heatmap records */
function getHeatmapData() {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.all('SELECT * FROM heatmap', (err, rows) => {
      db.close();
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = { upsertHeatmapRecord, getHeatmapData };
