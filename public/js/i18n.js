const translations = {
  en: {
    title: 'CivicEye AI',
    subtitle: 'Autonomous Waste Detection for Mysuru',
    totalIncidents: 'Total Incidents',
    activeAlerts: 'Active Alerts',
    resolved: 'Resolved',
    avgUrgency: 'Avg Urgency Score',
    uploadTab: 'Upload Video/Image',
    cameraTab: 'Live Camera',
    dropzoneText: 'Drag & Drop video/image files here',
    dropzoneSubtext: 'or click to browse',
    captureBtn: '📸 Capture & Analyze',
    originalFrame: 'Original Frame',
    enhancedFrame: 'Enhanced (Night Vision)',
    detectionResults: 'Detection Results',
    type: 'Type',
    confidence: 'Confidence',
    volume: 'Volume',
    severity: 'Severity',
    description: 'Description',
    action: 'Recommended Action',
    liveMap: 'Live Incident Map',
    incidentFeed: 'Recent Incidents Feed',
    time: 'Time',
    location: 'Location',
    status: 'Status',
    sightings: 'Sightings',
    footer: 'Built for HackMysuru 1.0 — Phase 1',
    generateReport: 'Generate PDF Report',
    askCivicEye: 'Ask CivicEye',
    chatPlaceholder: 'Ask about your area...',
    monsoonMode: '🌧️ Monsoon Mode Active',
    cleanupRoute: 'Optimal Cleanup Route',
    repeatOffenders: 'Chronic Dump Sites',
    analytics: 'Analytics Dashboard'
  },
  kn: {
    title: 'ಸಿವಿಕ್ ಐ AI',
    subtitle: 'ಮೈಸೂರಿಗಾಗಿ ಸ್ವಯಂಚಾಲಿತ ತ್ಯಾಜ್ಯ ಪತ್ತೆ',
    totalIncidents: 'ಒಟ್ಟು ಘಟನೆಗಳು',
    activeAlerts: 'ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳು',
    resolved: 'ಪರಿಹರಿಸಲಾಗಿದೆ',
    avgUrgency: 'ಸರಾಸರಿ ತುರ್ತು ಅಂಕ',
    uploadTab: 'ವೀಡಿಯೊ/ಚಿತ್ರ ಅಪ್ಲೋಡ್',
    cameraTab: 'ನೇರ ಕ್ಯಾಮೆರಾ',
    dropzoneText: 'ವೀಡಿಯೊ/ಚಿತ್ರ ಫೈಲ್ಗಳನ್ನು ಇಲ್ಲಿ ಡ್ರ್ಯಾಗ್ & ಡ್ರಾಪ್ ಮಾಡಿ',
    dropzoneSubtext: 'ಅಥವಾ ಬ್ರೌಸ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ',
    captureBtn: '📸 ಸೆರೆಹಿಡಿ ಮತ್ತು ವಿಶ್ಲೇಷಿಸಿ',
    originalFrame: 'ಮೂಲ ಚೌಕಟ್ಟು',
    enhancedFrame: 'ವರ್ಧಿತ (ರಾತ್ರಿ ದೃಷ್ಟಿ)',
    detectionResults: 'ಪತ್ತೆ ಫಲಿತಾಂಶಗಳು',
    type: 'ವಿಧ',
    confidence: 'ವಿಶ್ವಾಸ',
    volume: 'ಪರಿಮಾಣ',
    severity: 'ತೀವ್ರತೆ',
    description: 'ವಿವರಣೆ',
    action: 'ಶಿಫಾರಸು ಕ್ರಮ',
    liveMap: 'ನೇರ ಘಟನೆ ನಕ್ಷೆ',
    incidentFeed: 'ಇತ್ತೀಚಿನ ಘಟನೆ ಫೀಡ್',
    time: 'ಸಮಯ',
    location: 'ಸ್ಥಳ',
    status: 'ಸ್ಥಿತಿ',
    sightings: 'ದೃಶ್ಯಗಳು',
    footer: 'HackMysuru 1.0 ಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ — ಹಂತ 1',
    generateReport: 'PDF ವರದಿ ರಚಿಸಿ',
    askCivicEye: 'CivicEye ಗೆ ಕೇಳಿ',
    chatPlaceholder: 'ನಿಮ್ಮ ಪ್ರದೇಶದ ಬಗ್ಗೆ ಕೇಳಿ...',
    monsoonMode: '🌧️ ಮಳೆಗಾಲ ಮೋಡ್ ಸಕ್ರಿಯ',
    cleanupRoute: 'ಅತ್ಯುತ್ತಮ ಸ್ವಚ್ಛತಾ ಮಾರ್ಗ',
    repeatOffenders: 'ಪುನರಾವರ್ತಿತ ಡಂಪ್ ತಾಣಗಳು',
    analytics: 'ವಿಶ್ಲೇಷಣೆ ಡ್ಯಾಶ್ಬೋರ್ಡ್'
  }
};

let currentLang = 'en';

export function setLanguage(lang) {
  if (!translations[lang]) return;
  
  currentLang = lang;
  document.documentElement.setAttribute('lang', lang);
  
  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });
  
  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[currentLang][key]) {
      el.placeholder = translations[currentLang][key];
    }
  });
}

export function t(key) {
  return translations[currentLang]?.[key] || translations.en[key] || key;
}

export function getCurrentLang() { 
  return currentLang; 
}

export default { setLanguage, t, getCurrentLang };
