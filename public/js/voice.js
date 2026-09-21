// Uses browser SpeechSynthesis API for voice alerts
// No external dependencies needed

export function speakAlert(detectionResult) {
  if (!('speechSynthesis' in window)) return;
  
  const severity = detectionResult.severity || 'MEDIUM';
  const type = detectionResult.type || 'waste';
  const confidence = detectionResult.confidence ? Math.round(detectionResult.confidence * 100) : 0;
  const volume = detectionResult.volume_estimate_tonnes ? detectionResult.volume_estimate_tonnes.toFixed(1) : 'unknown';
  
  let message = `Alert! ${type.replace(/_/g, ' ')} detected with ${confidence} percent confidence. `;
  message += `Estimated volume: ${volume} tonnes. Severity level: ${severity}.`;
  
  if (severity === 'CRITICAL') {
    message += ' Immediate action required!';
  }
  
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.rate = 0.95;
  utterance.pitch = severity === 'CRITICAL' ? 1.2 : 1.0;
  utterance.volume = 1.0;
  // Try to use a clear English voice
  const voices = speechSynthesis.getVoices();
  const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'));
  if (englishVoice) utterance.voice = englishVoice;
  
  speechSynthesis.speak(utterance);
}

// Also play a beep sound for alerts
export function playAlertBeep(severity) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  // Different frequencies for different severities
  const freqs = { CRITICAL: 880, HIGH: 660, MEDIUM: 440, LOW: 330 };
  osc.frequency.value = freqs[severity] || 440;
  osc.type = 'sine';
  gain.gain.value = 0.3;
  
  osc.start();
  setTimeout(() => { osc.stop(); ctx.close(); }, 300);
}

export default { speakAlert, playAlertBeep };
