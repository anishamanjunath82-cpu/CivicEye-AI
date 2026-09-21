/**
 * Calculates urgency score 1-100 based on incident properties.
 * @param {Object} incident 
 * @returns {number} Score (1-100)
 */
function calculateUrgency(incident) {
    let score = 0;

    // 1. Volume factor (0.3 weight): max 30 points (say 5 tonnes is max)
    const volumeScore = Math.min((incident.volume / 5) * 30, 30);
    score += volumeScore;

    // 2. Time-of-day factor (0.2 weight): max 20 points
    // Night hours 10 PM (22) to 4 AM (4) are highest urgency (illegal dumping)
    let timeScore = 0;
    try {
        const date = new Date(incident.lastSeen);
        const hour = date.getHours();
        if (hour >= 22 || hour <= 4) {
            timeScore = 20;
        } else {
            timeScore = 5;
        }
    } catch(e) {
        timeScore = 10;
    }
    score += timeScore;

    // 3. Severity factor (0.25 weight): max 25 points
    const severityMap = {
        'CRITICAL': 25,
        'HIGH': 18.75,
        'MEDIUM': 12.5,
        'LOW': 6.25
    };
    score += (severityMap[incident.severity] || 12.5);

    // 4. Sighting frequency factor (0.15 weight): max 15 points (5 sightings = max)
    const sightingScore = Math.min(((incident.sightingCount || 1) / 5) * 15, 15);
    score += sightingScore;

    // 5. Location sensitivity factor (0.1 weight): max 10 points
    // Placeholder - defaults to 5 points (0.5 of max)
    score += 5;

    return Math.min(Math.round(score), 100);
}

/**
 * Maps an urgency score to a label.
 * @param {number} score 
 * @returns {string} Label
 */
function getUrgencyLabel(score) {
    if (score > 80) return 'CRITICAL';
    if (score > 60) return 'HIGH';
    if (score > 40) return 'MEDIUM';
    return 'LOW';
}

module.exports = { calculateUrgency, getUrgencyLabel };
