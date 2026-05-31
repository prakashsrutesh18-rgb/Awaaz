const fetch = require('node-fetch');
const { upsertHeatmapRecord } = require('./heatmap');

// URL for Statcounter OS market share (desktop worldwide) CSV download – retained as example source
const STATCOUNTER_CSV_URL = 'https://gs.statcounter.com/os-market-share/desktop/worldwide?download=1';

/**
 * Fetch OS usage CSV, parse the latest row, and store as a heatmap record.
 * For this heatmap we map the OS share to a generic "risk_score" for demonstration.
 * All records are anchored to Hyderabad (city) with placeholder coordinates.
 */
async function fetchAndStoreStatcounter() {
  try {
    const response = await fetch(STATCOUNTER_CSV_URL);
    if (!response.ok) throw new Error(`Failed to fetch CSV: ${response.status}`);
    const csvText = await response.text();
    const { parse } = require('csv-parse/sync');
    const records = parse(csvText, { columns: true, skip_empty_lines: true });
    const latest = records[records.length - 1];
    const windowsShare = parseFloat(latest['Windows'] || latest['Windows%'] || latest['Windows Share'] || 0);
    // Map Windows share to a risk score (0-1 range) for demo purposes
    const riskScore = Math.min(Math.max(windowsShare, 0), 100) / 100;
    await upsertHeatmapRecord({
      source: 'statcounter-global',
      city: 'Hyderabad',
      latitude: 17.3850,
      longitude: 78.4867,
      camera_type: 'CCTV',
      operator: 'GHMC',
      database_linked: 'TSCOP',
      rti_status: 'filed',
      breach_count: 0,
      broker_count: 0,
      risk_score: riskScore
    });
    console.log('Statcounter heatmap data updated');
  } catch (e) {
    console.error('Error updating heatmap data:', e.message || e);
  }
}

module.exports = { fetchAndStoreStatcounter };
