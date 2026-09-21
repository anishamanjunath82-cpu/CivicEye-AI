/**
 * Calculates the distance between two GPS coordinates in meters.
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} Distance in meters
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const toRad = x => x * Math.PI / 180;
    
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
              
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
}

/**
 * Finds an existing incident within a given radius.
 * @param {Array} incidents 
 * @param {number} lat 
 * @param {number} lng 
 * @param {number} radiusMeters 
 * @returns {Object|null}
 */
function findNearbyIncident(incidents, lat, lng, radiusMeters = 15) {
    for (let incident of incidents) {
        if (incident.status === 'ACTIVE') {
            const distance = haversineDistance(incident.lat, incident.lng, lat, lng);
            if (distance <= radiusMeters) {
                return incident;
            }
        }
    }
    return null;
}

/**
 * Merges a new incident with a nearby one, or creates a new entry.
 * @param {Array} incidents 
 * @param {Object} newIncident 
 * @returns {Array} Updated incidents array
 */
function mergeOrCreateIncident(incidents, newIncident) {
    const { calculateUrgency, getUrgencyLabel } = require('./urgency');
    
    const nearby = findNearbyIncident(incidents, newIncident.lat, newIncident.lng);
    
    if (nearby) {
        // Update existing
        nearby.sightingCount = (nearby.sightingCount || 1) + 1;
        nearby.lastSeen = newIncident.lastSeen;
        
        // Optionally update other details like higher volume or more recent image
        if (newIncident.volume > nearby.volume) {
            nearby.volume = newIncident.volume;
        }
        
        // Recalculate urgency
        nearby.urgencyScore = calculateUrgency(nearby);
        nearby.urgencyLabel = getUrgencyLabel(nearby.urgencyScore);
    } else {
        // Create new
        incidents.push(newIncident);
    }
    
    return incidents;
}

module.exports = { haversineDistance, findNearbyIncident, mergeOrCreateIncident };
