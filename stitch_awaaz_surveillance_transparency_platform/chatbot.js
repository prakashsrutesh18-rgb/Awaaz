// Simple chatbot stub that returns informational summaries about legal rights
// This is a lightweight, non-authoritative helper for the hackathon demo.

function getLegalRightsResponse(question) {
  const q = (question || '').toLowerCase();

  if (q.includes('data protection') || q.includes('dpdp') || q.includes('dpdp act')) {
    return {
      title: 'DPDP Act (high-level)',
      body: `The Data Protection Act (DPDP) establishes principles for lawful processing, data minimisation, purpose limitation, and individual rights like access and correction. For surveillance reporting, explain what data was collected, who collected it, and request disclosure. This bot gives general info — consult a lawyer for legal advice.`
    };
  }

  if (q.includes('it act') || q.includes('information technology')) {
    return {
      title: 'IT Act & Intermediaries',
      body: `Certain unauthorized access, interception, or misuse of digital data may engage provisions of the Information Technology Act. Citizens can file complaints with local authorities and use statutory grievance mechanisms. This is informational only.`
    };
  }

  // Default helpful answer
  return {
    title: 'How to report surveillance (quick guide)',
    body: `1) Note exact location/time and device details (camera model, visible tag).
2) Take photos or short videos (if safe).
3) File a report here using the "Report" button — it will appear on the public map.
4) For legal help, request a Right to Information or consult a consumer/rights lawyer.`
  };
}

module.exports = { getLegalRightsResponse };
