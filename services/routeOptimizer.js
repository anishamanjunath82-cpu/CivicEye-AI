// Haversine distance formula (approximate)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c; // Distance in km
}

function optimizeCleanupRoute(incidents) {
    if (!incidents || incidents.length === 0) {
        return { orderedStops: [], totalDistanceKm: 0, estimatedTimeMin: 0 };
    }

    // Sort by urgency/severity to start with the most critical
    const sorted = [...incidents].sort((a, b) => {
        const scoreA = a.urgencyScore || 0;
        const scoreB = b.urgencyScore || 0;
        return scoreB - scoreA;
    });

    const orderedStops = [];
    const unvisited = [...sorted];
    
    // Start at the most urgent
    let current = unvisited.shift();
    orderedStops.push({
        id: current.id,
        lat: current.lat,
        lng: current.lng,
        type: current.type,
        urgency: current.urgencyLabel
    });
    
    let totalDistanceKm = 0;

    while (unvisited.length > 0) {
        let nearestIdx = 0;
        let minDistance = Infinity;

        for (let i = 0; i < unvisited.length; i++) {
            const dist = getDistanceFromLatLonInKm(current.lat, current.lng, unvisited[i].lat, unvisited[i].lng);
            if (dist < minDistance) {
                minDistance = dist;
                nearestIdx = i;
            }
        }

        totalDistanceKm += minDistance;
        current = unvisited.splice(nearestIdx, 1)[0];
        
        orderedStops.push({
            id: current.id,
            lat: current.lat,
            lng: current.lng,
            type: current.type,
            urgency: current.urgencyLabel
        });
    }

    // Rough estimate: 20km/h average speed in city + 15 mins per stop
    const estimatedTimeMin = Math.round((totalDistanceKm / 20) * 60) + (orderedStops.length * 15);

    return {
        orderedStops,
        totalDistanceKm: parseFloat(totalDistanceKm.toFixed(2)),
        estimatedTimeMin
    };
}

module.exports = { optimizeCleanupRoute };
