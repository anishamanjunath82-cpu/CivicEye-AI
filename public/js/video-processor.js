// Processes video frame-by-frame with visual feedback
// Shows bounding box overlays on a canvas

let isProcessing = false;
let processInterval = null;

export function startVideoProcessing(videoElement, canvasOverlay, intervalMs = 3000) {
  // Every intervalMs, capture a frame from the video element
  // Send to /api/analyze-frame
  // Draw bounding box on canvas overlay if waste detected
  // Return detection results for each frame
  isProcessing = true;
  processInterval = setInterval(async () => {
    if (!isProcessing) return;
    try {
      const blob = await captureFrame(videoElement);
      if (!blob) return;
      const result = await analyzeFrame(blob);
      if (result && result.detected) {
        drawBoundingBox(canvasOverlay, result);
      } else {
        // Clear if nothing detected
        const ctx = canvasOverlay.getContext('2d');
        ctx.clearRect(0, 0, canvasOverlay.width, canvasOverlay.height);
      }
    } catch (err) {
      console.error('Frame processing error:', err);
    }
  }, intervalMs);
}

export function stopVideoProcessing() {
  isProcessing = false;
  if (processInterval) {
    clearInterval(processInterval);
    processInterval = null;
  }
}

function captureFrame(videoElement) {
  if (videoElement.readyState < 2) return Promise.resolve(null); // NOT_ENOUGH_DATA
  
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth || 640;
  canvas.height = videoElement.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
  return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
}

async function analyzeFrame(blob) {
  const formData = new FormData();
  formData.append('frame', blob, 'frame.jpg');
  
  const res = await fetch('/api/analyze-frame', { 
    method: 'POST', 
    body: formData 
  });
  
  if (!res.ok) throw new Error('API error during frame analysis');
  return res.json();
}

function drawBoundingBox(canvas, result) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw a prominent bounding box in the center area (simulated position)
  // In a real scenario, the API would return bounding box coordinates [x, y, w, h]
  const colors = { CRITICAL: '#ff3333', HIGH: '#ff6b35', MEDIUM: '#ffcc00', LOW: '#00d4aa' };
  const color = colors[result.severity] || '#00d4aa';
  
  const x = canvas.width * 0.15;
  const y = canvas.height * 0.2;
  const w = canvas.width * 0.7;
  const h = canvas.height * 0.6;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, w, h);
  
  // Background for label
  ctx.fillStyle = color;
  const labelHeight = 30;
  ctx.fillRect(x, y - labelHeight, 280, labelHeight);
  
  // Label text
  ctx.fillStyle = '#000';
  ctx.font = 'bold 16px Inter, sans-serif';
  ctx.textBaseline = 'middle';
  const typeStr = (result.type || 'UNKNOWN').replace(/_/g, ' ');
  const confidenceStr = result.confidence ? `${Math.round(result.confidence * 100)}%` : '';
  ctx.fillText(`${typeStr.toUpperCase()} | ${confidenceStr}`, x + 10, y - (labelHeight / 2));
}

export default { startVideoProcessing, stopVideoProcessing };
