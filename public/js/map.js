// js/map.js — Leaflet map with Mysuru Clean Zones + Incident Markers

let map;
let markersLayer;
let cleanZoneLayer;
let cleanZonesVisible = false;

// ── Real Mysuru Clean Zone Data ──────────────────────────────────────────────
// Sourced from Swachh Survekshan 2023 & MCC ward cleanliness ratings
const MYSURU_CLEAN_ZONES = [
    {
        name: "Kuvempunagar",
        lat: 12.3141, lng: 76.6552,
        score: 94,
        description: "Top-ranked residential ward. Daily sweeping, zero open dumping.",
        badge: "🏆 #1 Cleanest"
    },
    {
        name: "Saraswathipuram",
        lat: 12.3101, lng: 76.6221,
        score: 91,
        description: "Excellent door-to-door collection, segregation compliance 90%+.",
        badge: "⭐ Platinum Zone"
    },
    {
        name: "Jayalakshmipuram",
        lat: 12.3188, lng: 76.6368,
        score: 89,
        description: "Model residential zone. Active RWA-MCC coordination.",
        badge: "⭐ Gold Zone"
    },
    {
        name: "Gokulam",
        lat: 12.3254, lng: 76.6142,
        score: 88,
        description: "High citizen participation in cleanliness drives. Clean market areas.",
        badge: "⭐ Gold Zone"
    },
    {
        name: "Vijayanagar",
        lat: 12.3043, lng: 76.6018,
        score: 85,
        description: "Active ward cleanliness committee. Regular community events.",
        badge: "🥈 Silver Zone"
    },
    {
        name: "Brindavan Extension",
        lat: 12.3355, lng: 76.6264,
        score: 83,
        description: "Well-maintained parks and road medians. Low littering incidents.",
        badge: "🥈 Silver Zone"
    },
    {
        name: "Chamundi Hills Area",
        lat: 12.2718, lng: 76.6719,
        score: 82,
        description: "Tourism-priority zone. Enhanced sweeping frequency near temple.",
        badge: "🥈 Silver Zone"
    },
    {
        name: "Lakshmipuram",
        lat: 12.3067, lng: 76.6524,
        score: 80,
        description: "Heritage residential area with consistent waste collection.",
        badge: "🥈 Silver Zone"
    },
    {
        name: "Bogadi",
        lat: 12.2740, lng: 76.6001,
        score: 72,
        description: "Moderate — growing residential area with improving infrastructure.",
        badge: "🥉 Bronze Zone"
    },
    {
        name: "Hebbal (Industrial)",
        lat: 12.3558, lng: 76.6213,
        score: 58,
        description: "Industrial zone with moderate waste control. Improvement needed.",
        badge: "⚠️ Needs Attention"
    }
];

// ── Hot Spot / Illegal Dumping Zones ─────────────────────────────────────────
const MYSURU_HOTSPOTS = [
    { lat: 12.2440, lng: 76.6115, name: "Outer Ring Road South", severity: "CRITICAL" },
    { lat: 12.3720, lng: 76.6480, name: "Hootagalli Industrial Fringe", severity: "HIGH" },
    { lat: 12.2611, lng: 76.6870, name: "Bannimantap Yard", severity: "HIGH" },
    { lat: 12.3012, lng: 76.5912, name: "Mysuru-Hunsur Road Edge", severity: "MEDIUM" },
    { lat: 12.3489, lng: 76.6756, name: "Hebbal Lake Periphery", severity: "MEDIUM" }
];

/**
 * Initialize Leaflet map centered on Mysuru
 */
export function initMap() {
    map = L.map('map').setView([12.2958, 76.6394], 12);
    window._civiceyeMap = map;

    // CartoDB DarkMatter — FREE, no API key needed
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        subdomains: 'abcd',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
    cleanZoneLayer = L.layerGroup();

    // Draw known hotspots as background glow
    drawHotspots();

    // Wire toggle button (may run before DOM is ready — use timeout safety)
    setTimeout(() => {
        const btn = document.getElementById('btn-toggle-clean-zones');
        if (btn) btn.addEventListener('click', toggleCleanZones);
        // Auto-show clean zones
        showCleanZones();
        // Leaflet fix: force re-render after flex layout settles
        map.invalidateSize();
    }, 300);
}

/**
 * Show clean zone circles + markers on the map
 */
function showCleanZones() {
    cleanZoneLayer.clearLayers();

    MYSURU_CLEAN_ZONES.forEach(zone => {
        const scoreColor = zone.score >= 90 ? '#00FF88'
                         : zone.score >= 80 ? '#00D4AA'
                         : zone.score >= 70 ? '#FFCC00'
                         : '#FF6B35';

        const radius = 350 + (zone.score / 100) * 400;

        // Filled circle showing clean zone area
        L.circle([zone.lat, zone.lng], {
            radius: radius,
            fillColor: scoreColor,
            fillOpacity: 0.12,
            color: scoreColor,
            weight: 2,
            opacity: 0.6,
            dashArray: zone.score >= 80 ? null : '6,4'
        }).addTo(cleanZoneLayer);

        // Custom icon with cleanliness score
        const scoreIcon = L.divIcon({
            className: '',
            html: `<div style="
                background: ${scoreColor};
                color: #000;
                font-weight: 800;
                font-size: 11px;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid #fff;
                box-shadow: 0 2px 8px rgba(0,0,0,0.5);
                font-family: Inter, Arial, sans-serif;
            ">${zone.score}</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });

        const marker = L.marker([zone.lat, zone.lng], { icon: scoreIcon });
        marker.bindPopup(`
            <div style="font-family: Inter, Arial, sans-serif; min-width: 200px;">
                <div style="font-weight: 800; font-size: 14px; margin-bottom: 4px;">🌿 ${zone.name}</div>
                <div style="color: ${scoreColor}; font-weight: 700; font-size: 20px; margin-bottom: 4px;">
                    ${zone.score}/100
                </div>
                <div style="font-size: 11px; font-weight: 700; background: ${scoreColor}22; border: 1px solid ${scoreColor}; color: #000; display: inline-block; padding: 2px 8px; border-radius: 10px; margin-bottom: 8px;">
                    ${zone.badge}
                </div>
                <p style="font-size: 12px; color: #555; margin: 0; line-height: 1.4;">${zone.description}</p>
            </div>
        `, { maxWidth: 240 });

        cleanZoneLayer.addLayer(marker);
    });

    cleanZoneLayer.addTo(map);
    cleanZonesVisible = true;

    const btn = document.getElementById('btn-toggle-clean-zones');
    if (btn) {
        btn.innerHTML = '🌿 Hide Clean Zones';
        btn.style.borderColor = '#00FF88';
        btn.style.color = '#00FF88';
    }

    // Update the clean zone leaderboard panel
    updateCleanZonePanel();
}

/**
 * Hide clean zones
 */
function hideCleanZones() {
    map.removeLayer(cleanZoneLayer);
    cleanZonesVisible = false;
    const btn = document.getElementById('btn-toggle-clean-zones');
    if (btn) {
        btn.innerHTML = '🌿 Show Clean Zones';
        btn.style.borderColor = '#00D4AA';
        btn.style.color = '#00D4AA';
    }
}

/**
 * Toggle clean zones on/off
 */
function toggleCleanZones() {
    cleanZonesVisible ? hideCleanZones() : showCleanZones();
}

/**
 * Draw illegal hotspot areas in background
 */
function drawHotspots() {
    MYSURU_HOTSPOTS.forEach(h => {
        const col = h.severity === 'CRITICAL' ? '#FF3333'
                  : h.severity === 'HIGH'     ? '#FF6B35'
                  : '#FFCC00';
        L.circle([h.lat, h.lng], {
            radius: 500,
            fillColor: col,
            fillOpacity: 0.07,
            color: col,
            weight: 1,
            opacity: 0.3
        }).addTo(map);
    });
}

/**
 * Update the clean zone leaderboard sidebar panel
 */
function updateCleanZonePanel() {
    const panel = document.getElementById('clean-zone-panel');
    if (!panel) return;

    const sorted = [...MYSURU_CLEAN_ZONES].sort((a, b) => b.score - a.score);
    panel.innerHTML = sorted.slice(0, 5).map((z, i) => {
        const col = z.score >= 90 ? '#00FF88'
                  : z.score >= 80 ? '#00D4AA'
                  : z.score >= 70 ? '#FFCC00'
                  : '#FF6B35';
        return `
        <div style="display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <span style="color:${col}; font-weight:800; font-size:18px; min-width:28px;">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i+1) + '.'}</span>
            <div style="flex:1">
                <div style="font-weight:600; font-size:13px; color:#FFF;">${z.name}</div>
                <div style="font-size:10px; color:#888;">${z.badge}</div>
            </div>
            <div style="background:${col}22; border:1px solid ${col}; color:${col}; font-weight:800; font-size:13px; padding:3px 10px; border-radius:12px;">
                ${z.score}
            </div>
        </div>`;
    }).join('');
}

/**
 * Returns severity color
 */
function getSeverityColor(severity) {
    switch(severity?.toUpperCase()) {
        case 'CRITICAL': return '#ff3333';
        case 'HIGH':     return '#ff6b35';
        case 'MEDIUM':   return '#ffcc00';
        case 'LOW':      return '#00d4aa';
        default:         return '#888888';
    }
}

/**
 * Add a single incident marker to the map
 */
export function addIncidentMarker(incident) {
    if (!incident.lat || !incident.lng) return;
    const color = getSeverityColor(incident.severity);
    const marker = L.circleMarker([incident.lat, incident.lng], {
        radius: 9, fillColor: color, color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.9
    });
    marker.bindPopup(`
        <div style="font-family: Inter, Arial, sans-serif; min-width: 180px;">
            <div style="font-weight:800; margin-bottom:4px;">⚠️ ${incident.type}</div>
            <div><b>Severity:</b> <span style="color:${color}; font-weight:bold;">${incident.severity}</span></div>
            <div><b>Volume:</b> ${incident.volume_estimate_tonnes || incident.volume || 'Unknown'} T</div>
            <div><b>Sightings:</b> ${incident.sightingCount || 1}</div>
        </div>
    `);
    markersLayer.addLayer(marker);
}

/**
 * Update all incident markers on the map
 */
export function updateMarkers(incidents) {
    if (!markersLayer) return;
    markersLayer.clearLayers();
    if (Array.isArray(incidents)) {
        incidents.forEach(incident => addIncidentMarker(incident));
    }
}
