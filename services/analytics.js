function getAnalytics(incidents) {
    const byType = {};
    const bySeverity = {};
    const byHour = new Array(24).fill(0);
    const byDay = new Array(7).fill(0);
    let totalVolume = 0;
    let totalConfidence = 0;
    
    incidents.forEach(incident => {
        byType[incident.type] = (byType[incident.type] || 0) + 1;
        bySeverity[incident.severity] = (bySeverity[incident.severity] || 0) + 1;
        totalVolume += (incident.volume || 0);
        totalConfidence += (incident.confidence || 0);
        
        if (incident.firstSeen) {
            const date = new Date(incident.firstSeen);
            const hour = date.getHours();
            if (!isNaN(hour) && hour >= 0 && hour < 24) {
                byHour[hour]++;
            }
        }
    });

    const avgConfidence = incidents.length ? (totalConfidence / incidents.length) : 0;
    
    const topLocations = [...incidents]
        .sort((a, b) => (b.sightingCount || 0) - (a.sightingCount || 0))
        .slice(0, 5)
        .map(i => ({ lat: i.lat, lng: i.lng, count: i.sightingCount, type: i.type }));

    return {
        byType,
        bySeverity,
        byHour,
        byDay,
        totalVolume,
        avgConfidence,
        topLocations
    };
}

module.exports = { getAnalytics };
