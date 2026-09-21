// js/dashboard.js

/**
 * Smoothly animate number counting
 */
export function animateNumber(element, targetValue) {
    const startValue = parseInt(element.innerText.replace(/,/g, '')) || 0;
    const duration = 1000;
    const steps = 30;
    const stepTime = Math.abs(Math.floor(duration / steps));
    let currentStep = 0;
    
    const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        // Easing function
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeProgress);
        
        element.innerText = currentValue;
        
        if (currentStep >= steps) {
            element.innerText = targetValue;
            clearInterval(timer);
        }
    }, stepTime);
}

/**
 * Update stats cards
 */
export function updateStats(stats) {
    if (!stats) return;
    
    const elTotal = document.getElementById('stat-total');
    const elActive = document.getElementById('stat-active');
    const elResolved = document.getElementById('stat-resolved');
    const elUrgency = document.getElementById('stat-urgency');
    
    if(stats.total !== undefined) animateNumber(elTotal, stats.total);
    if(stats.active !== undefined) animateNumber(elActive, stats.active);
    if(stats.resolved !== undefined) animateNumber(elResolved, stats.resolved);
    if(stats.avgUrgency !== undefined) animateNumber(elUrgency, stats.avgUrgency);
}

/**
 * Convert ISO date to relative time (e.g., "5 min ago")
 */
function getRelativeTime(timestamp) {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const date = new Date(timestamp);
    const diffSeconds = Math.floor((now - date) / 1000);
    
    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} min ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hr ago`;
    return `${Math.floor(diffSeconds / 86400)} days ago`;
}

/**
 * Render incident table rows
 */
export function renderIncidentTable(incidents) {
    const tbody = document.getElementById('incident-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = ''; // Clear current
    
    if (!incidents || incidents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No incidents reported yet.</td></tr>';
        return;
    }
    
    // Sort incidents by time descending
    const sorted = [...incidents].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Take top 15 for the feed
    const displayList = sorted.slice(0, 15);
    
    displayList.forEach(incident => {
        const tr = document.createElement('tr');
        
        // Icon based on type
        let typeIcon = '🗑️';
        const typeLower = (incident.type || '').toLowerCase();
        if (typeLower.includes('c&d') || typeLower.includes('debris') || typeLower.includes('construction')) typeIcon = '🧱';
        else if (typeLower.includes('overflow')) typeIcon = '🗑️';
        else if (typeLower.includes('garbage') || typeLower.includes('mixed')) typeIcon = '♻️';
        else if (typeLower.includes('pothole')) typeIcon = '🕳️';
        
        const badgeClass = (incident.severity || incident.urgencyLabel || 'low').toLowerCase();
        const urgencyScore = incident.urgencyScore || 0;
        const location = (incident.lat && incident.lng) 
            ? `${parseFloat(incident.lat).toFixed(4)}, ${parseFloat(incident.lng).toFixed(4)}`
            : 'Unknown';
        
        tr.innerHTML = `
            <td>${getRelativeTime(incident.timestamp)}</td>
            <td>${location}</td>
            <td>${typeIcon} ${incident.type || 'Waste'}</td>
            <td><span class="badge ${badgeClass}">${incident.severity || incident.urgencyLabel}</span></td>
            <td>${incident.volume || '-'}</td>
            <td>
                <span style="font-weight: 600; color: ${urgencyScore > 70 ? 'var(--severity-critical)' : urgencyScore > 40 ? 'var(--severity-medium)' : 'var(--severity-low)'}">
                    ${Math.round(urgencyScore)}/100
                </span>
            </td>
            <td>${incident.status || 'ACTIVE'}</td>
            <td>${incident.sightings || incident.sightingCount || 1}</td>
        `;
        
        tbody.appendChild(tr);
    });
}
