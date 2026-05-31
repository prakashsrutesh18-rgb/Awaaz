const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

function load() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify({ reports: [] }, null, 2));
    }
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load DB', e);
    return { reports: [] };
  }
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function getReports() {
  const db = load();
  return db.reports || [];
}

function addReport(report) {
  const db = load();
  db.reports = db.reports || [];
  db.reports.unshift(report);
  // keep recent 500
  if (db.reports.length > 500) db.reports = db.reports.slice(0, 500);
  save(db);
  return report;
}

module.exports = { getReports, addReport };
