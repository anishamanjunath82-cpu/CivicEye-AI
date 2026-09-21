// js/app.js — Main Application Logic for CivicEye AI
// Wires together ALL modules: map, dashboard, voice, slider, charts, pdf, i18n, chatbot, video-processor

import { initMap, addIncidentMarker, updateMarkers } from './map.js';
import { updateStats, renderIncidentTable } from './dashboard.js';
import { speakAlert, playAlertBeep } from './voice.js';
import { initSlider, updateSliderImages } from './slider.js';
import { initCharts, refreshCharts } from './charts.js';
import { generateIncidentReport } from './pdf-report.js';
import { setLanguage, t, getCurrentLang } from './i18n.js';
import { initChatbot } from './chatbot.js';
import { startVideoProcessing, stopVideoProcessing } from './video-processor.js';

let stream = null;
let refreshInterval;
let lastDetectionResult = null;

// ── Bootstrap ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    // Core modules
    setupTabs();
    setupFileUpload();
    setupCamera();

    // New feature modules
    initSlider('slider-container');
    initCharts();
    initChatbot();
    setupLanguageToggle();
    setupActionButtons();
    setupWhatsAppModal();
    fetchWeather();

    // Register PWA Service Worker
    registerServiceWorker();

    // Initial data fetch
    await fetchData();

    // Poll every 10s
    refreshInterval = setInterval(() => {
        fetchData();
        refreshCharts();
    }, 10000);

    // Refresh charts once on load
    refreshCharts();
}

// ── PWA Service Worker ───────────────────────────────────────
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('PWA Service Worker registered:', reg.scope))
            .catch(err => console.log('SW registration failed:', err));
    }
}

// ── Language Toggle ──────────────────────────────────────────
function setupLanguageToggle() {
    const toggleBtn = document.getElementById('lang-toggle');
    if (!toggleBtn) return;

    let isKannada = false;
    toggleBtn.addEventListener('click', () => {
        isKannada = !isKannada;
        setLanguage(isKannada ? 'kn' : 'en');
        toggleBtn.textContent = isKannada ? 'EN | ಕನ್ನಡ ✓' : 'EN ✓ | ಕನ್ನಡ';
    });
}

// ── Weather Badge ────────────────────────────────────────────
async function fetchWeather() {
    try {
        const res = await fetch('/api/weather');
        if (!res.ok) return;
        const weather = await res.json();
        const badge = document.getElementById('weather-badge');
        if (badge) {
            const icon = weather.isRaining ? '🌧️' : weather.temperature > 35 ? '☀️' : '⛅';
            badge.textContent = `${icon} ${weather.condition} ${Math.round(weather.temperature)}°C`;
            badge.className = `weather-badge ${weather.isRaining ? 'rainy' : 'clear'}`;
            badge.style.display = 'inline-flex';
        }
        // Show monsoon mode indicator
        if (weather.monsoonMode) {
            const monsoon = document.getElementById('monsoon-indicator');
            if (monsoon) monsoon.style.display = 'inline-flex';
        }
    } catch (e) {
        console.debug('Weather fetch skipped:', e.message);
    }
}

// ── Action Buttons ───────────────────────────────────────────
function setupActionButtons() {
    const voiceBtn = document.getElementById('btn-voice-alert');
    const pdfBtn = document.getElementById('btn-generate-pdf');
    const routeBtn = document.getElementById('btn-cleanup-route');

    if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
            if (lastDetectionResult) {
                playAlertBeep(lastDetectionResult.severity || 'MEDIUM');
                speakAlert(lastDetectionResult);
            } else {
                alert('No detection result yet. Upload an image first!');
            }
        });
    }

    if (pdfBtn) {
        pdfBtn.addEventListener('click', async () => {
            if (lastDetectionResult) {
                await generateIncidentReport({
                    ...lastDetectionResult,
                    lat: 12.2958,
                    lng: 76.6394,
                    firstSeen: new Date().toISOString(),
                    lastSeen: new Date().toISOString(),
                    sightingCount: 1,
                    urgencyScore: lastDetectionResult.urgencyScore || 50
                });
                showToast('📄 PDF Report generated and downloading!');
            } else {
                alert('No detection result yet. Upload an image first!');
            }
        });
    }

    if (routeBtn) {
        routeBtn.addEventListener('click', async () => {
            try {
                const res = await fetch('/api/cleanup-route');
                if (!res.ok) throw new Error('Failed to fetch route');
                const route = await res.json();
                if (route.orderedStops && route.orderedStops.length > 0) {
                    showToast(`🗺️ Cleanup route: ${route.orderedStops.length} stops, ${route.totalDistanceKm?.toFixed(1) || '?'} km, ~${route.estimatedTimeMin || '?'} min`);
                    // Draw route on map
                    drawCleanupRoute(route.orderedStops);
                } else {
                    showToast('No active incidents to route.');
                }
            } catch (e) {
                showToast('Could not generate cleanup route.');
            }
        });
    }

    const waBountyBtn = document.getElementById('btn-whatsapp-bounty');
    if (waBountyBtn) {
        waBountyBtn.addEventListener('click', openWhatsAppModal);
    }
}

// ── WhatsApp Citizen Vigilance & Reward Modal ────────────────
function setupWhatsAppModal() {
    const openBtn = document.getElementById('btn-open-whatsapp');
    const closeBtn = document.getElementById('btn-close-whatsapp');
    const modal = document.getElementById('whatsapp-modal');
    const updateBtn = document.getElementById('btn-update-qr');
    const customInput = document.getElementById('custom-wa-input');
    const qrImg = document.getElementById('qr-img');
    const directBtn = document.getElementById('btn-whatsapp-direct');

    if (openBtn) openBtn.addEventListener('click', openWhatsAppModal);
    if (closeBtn) closeBtn.addEventListener('click', closeWhatsAppModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeWhatsAppModal();
        });
    }

    if (updateBtn && customInput && qrImg && directBtn) {
        updateBtn.addEventListener('click', () => {
            const rawVal = customInput.value.trim();
            if (!rawVal) {
                alert('Please enter a valid WhatsApp group link or phone number.');
                return;
            }

            let finalUrl = rawVal;
            if (/^\d{10,12}$/.test(rawVal)) {
                // Phone number format
                const phone = rawVal.startsWith('91') ? rawVal : `91${rawVal}`;
                const defaultMsg = encodeURIComponent("🚨 MCC CITIZEN VIGILANCE: I am reporting illegal dumping for Citizen Reward Points.");
                finalUrl = `https://wa.me/${phone}?text=${defaultMsg}`;
            }

            // Update QR image dynamically using reliable high-speed QR generator
            qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=10&data=${encodeURIComponent(finalUrl)}`;
            directBtn.href = finalUrl;
            showToast('✅ WhatsApp Reward QR updated successfully!');
        });
    }
}

function openWhatsAppModal() {
    const modal = document.getElementById('whatsapp-modal');
    if (modal) modal.classList.add('active');
}

function closeWhatsAppModal() {
    const modal = document.getElementById('whatsapp-modal');
    if (modal) modal.classList.remove('active');
}


// ── Draw Cleanup Route on Map ────────────────────────────────
function drawCleanupRoute(stops) {
    // Import map reference and draw polyline
    if (window._civiceyeMap) {
        const latlngs = stops.map(s => [s.lat, s.lng]);
        // Remove previous route if exists
        if (window._cleanupRouteLine) {
            window._civiceyeMap.removeLayer(window._cleanupRouteLine);
        }
        window._cleanupRouteLine = L.polyline(latlngs, {
            color: '#00d4aa',
            weight: 3,
            opacity: 0.8,
            dashArray: '10, 5'
        }).addTo(window._civiceyeMap);
        window._civiceyeMap.fitBounds(window._cleanupRouteLine.getBounds(), { padding: [30, 30] });
    }
}

// ── Tab Switching ────────────────────────────────────────────
function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.style.display = 'none');

            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).style.display = 'block';

            if (tab.dataset.tab === 'camera-tab') {
                startWebcam();
            } else {
                stopWebcam();
                stopVideoProcessing();
            }
        });
    });
}

// ── Drag-and-Drop & File Input ───────────────────────────────
function setupFileUpload() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', () => fileInput.click());

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev =>
        dropzone.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); }, false)
    );
    ['dragenter', 'dragover'].forEach(ev =>
        dropzone.addEventListener(ev, () => dropzone.classList.add('dragover'), false)
    );
    ['dragleave', 'drop'].forEach(ev =>
        dropzone.addEventListener(ev, () => dropzone.classList.remove('dragover'), false)
    );

    dropzone.addEventListener('drop', e => handleFiles(e.dataTransfer.files));
    fileInput.addEventListener('change', e => handleFiles(e.target.files));
}

// ── File Routing ─────────────────────────────────────────────
function handleFiles(files) {
    if (files.length === 0) return;
    const file = files[0];

    if (file.type.startsWith('image/')) {
        handleImageUpload(file);
    } else if (file.type.startsWith('video/')) {
        handleVideoUpload(file);
    } else {
        alert('Please upload an image or video file.');
    }
}

// ── Image Upload → Backend API ───────────────────────────────
function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = e => {
        document.getElementById('img-original').src = e.target.result;
    };
    reader.readAsDataURL(file);
    analyzeFrame(file);
}

// ── Video Upload → Extract Frames → Backend API ──────────────
function handleVideoUpload(file) {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = url;
    video.muted = true;
    video.preload = 'auto';

    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'flex';

    video.addEventListener('loadeddata', () => {
        const frameTimes = [1, 3, 5];
        let currentIndex = 0;

        function extractNextFrame() {
            if (currentIndex >= frameTimes.length) {
                overlay.style.display = 'none';
                URL.revokeObjectURL(url);
                return;
            }
            video.currentTime = frameTimes[currentIndex];
        }

        video.addEventListener('seeked', () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            document.getElementById('img-original').src = canvas.toDataURL('image/jpeg');

            canvas.toBlob(blob => {
                if (blob) analyzeFrame(blob);
                currentIndex++;
                extractNextFrame();
            }, 'image/jpeg', 0.9);
        });

        extractNextFrame();
    });
}

// ── Core: Send frame to backend /api/analyze-frame ───────────
async function analyzeFrame(imageBlob) {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'flex';

    try {
        const formData = new FormData();
        formData.append('frame', imageBlob);

        const response = await fetch('/api/analyze-frame', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const result = await response.json();
        overlay.style.display = 'none';
        lastDetectionResult = result;

        // Display enhanced image
        if (result.enhancedImage) {
            document.getElementById('img-enhanced').src = result.enhancedImage;
            // Update the before/after slider
            const origImg = document.getElementById('img-original');
            updateSliderImages(origImg.src, result.enhancedImage);
        }

        // Display detection results
        displayResult(result);

        // Highlight result card
        const resultBox = document.getElementById('detection-result');
        resultBox.classList.add('detected');
        setTimeout(() => resultBox.classList.remove('detected'), 3000);

        // Voice alert if waste detected
        if (result.detected) {
            playAlertBeep(result.severity || 'MEDIUM');
            speakAlert(result);

            const lat = 12.2958 + (Math.random() * 0.04 - 0.02);
            const lng = 76.6394 + (Math.random() * 0.04 - 0.02);
            await reportIncident(result, lat, lng);
        }

    } catch (error) {
        console.error('Frame analysis failed:', error);
        overlay.style.display = 'none';
        showToast('❌ Analysis failed. Check server connection.');
    }
}

// ── Display Detection Result in UI ───────────────────────────
function displayResult(result) {
    document.getElementById('result-type').innerText = result.type || 'None';
    document.getElementById('result-confidence').innerText =
        result.confidence ? `${(result.confidence * 100).toFixed(1)}%` : '0%';
    document.getElementById('result-volume').innerText =
        result.volume_estimate_tonnes ? `${result.volume_estimate_tonnes.toFixed(1)} tonnes` : '-';

    const badge = document.getElementById('result-severity');
    const severity = (result.severity || 'NONE').toUpperCase();
    badge.className = `badge ${severity.toLowerCase()}`;
    badge.innerText = severity;

    document.getElementById('result-description').innerText = result.description || '-';
    document.getElementById('result-action').innerText = result.recommended_action || '-';
    // Show weather label if present
    if (result.weatherLabel) {
        const weatherInfo = document.getElementById('result-weather');
        if (weatherInfo) weatherInfo.innerText = result.weatherLabel;
    }

    showToast(`🚨 Detected: ${result.type} (${(result.confidence * 100).toFixed(0)}% confidence)`);
}

// ── Report Incident to Backend ───────────────────────────────
async function reportIncident(result, lat, lng) {
    try {
        const incident = {
            lat, lng,
            type: result.type,
            confidence: result.confidence,
            volume: result.volume_estimate_tonnes,
            severity: result.severity,
            material_type: result.material_type,
            recommended_action: result.recommended_action,
            description: result.description,
            timestamp: new Date().toISOString()
        };

        await fetch('/api/report-incident', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(incident)
        });

        fetchData();
        refreshCharts();
        fetchRepeatOffenders();
    } catch (error) {
        console.error('Failed to report incident:', error);
    }
}

// ── Fetch Stats & Incidents from Backend ─────────────────────
async function fetchData() {
    try {
        const statsResponse = await fetch('/api/stats');
        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            updateStats({
                total: stats.totalIncidents,
                active: stats.activeIncidents,
                resolved: stats.resolvedIncidents,
                avgUrgency: Math.round(parseFloat(stats.avgUrgency) || 0)
            });
        }

        const incidentsResponse = await fetch('/api/incidents');
        if (incidentsResponse.ok) {
            const incidents = await incidentsResponse.json();
            updateMarkers(incidents);
            renderIncidentTable(incidents.map(inc => ({
                ...inc,
                timestamp: inc.lastSeen || inc.firstSeen,
                volume: inc.volume ? `${parseFloat(inc.volume).toFixed(1)}T` : '-',
                sightings: inc.sightingCount || 1,
                urgencyScore: inc.urgencyScore || 0
            })));
        }
    } catch (error) {
        console.debug('Data fetch skipped:', error.message);
    }
}

// ── Fetch Repeat Offenders ───────────────────────────────────
async function fetchRepeatOffenders() {
    try {
        const res = await fetch('/api/repeat-offenders');
        if (!res.ok) return;
        const repeats = await res.json();
        const countEl = document.getElementById('chronic-count');
        if (countEl) countEl.textContent = repeats.length;
    } catch (e) {
        console.debug('Repeat offenders fetch skipped');
    }
}

// ── Webcam Controls ──────────────────────────────────────────
function setupCamera() {
    const captureBtn = document.getElementById('capture-btn');
    if (captureBtn) captureBtn.addEventListener('click', captureWebcamFrame);

    // Real-time processing toggle
    const rtBtn = document.getElementById('btn-realtime');
    if (rtBtn) {
        let isRealtime = false;
        rtBtn.addEventListener('click', () => {
            const video = document.getElementById('webcam-video');
            const overlay = document.getElementById('video-overlay');
            if (!isRealtime) {
                startVideoProcessing(video, overlay, 4000);
                rtBtn.textContent = '⏹️ Stop Real-Time';
                rtBtn.classList.add('active');
                isRealtime = true;
            } else {
                stopVideoProcessing();
                rtBtn.textContent = '🔴 Start Real-Time';
                rtBtn.classList.remove('active');
                isRealtime = false;
            }
        });
    }
}

function startWebcam() {
    const video = document.getElementById('webcam-video');
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(s => { stream = s; video.srcObject = stream; })
            .catch(err => {
                console.error('Webcam error:', err);
                alert('Could not access camera.');
            });
    }
}

function stopWebcam() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

function captureWebcamFrame() {
    const video = document.getElementById('webcam-video');
    if (!video.srcObject) {
        alert('Please start the camera first.');
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    document.getElementById('img-original').src = canvas.toDataURL('image/jpeg');

    canvas.toBlob(blob => {
        if (blob) analyzeFrame(blob);
    }, 'image/jpeg', 0.9);
}

// ── Toast Notification ───────────────────────────────────────
function showToast(message = 'New detection recorded!') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}
