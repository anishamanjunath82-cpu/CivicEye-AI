// js/slider.js — Before/After Image Comparison Slider
// Works with the existing HTML structure in index.html

let sliderContainerId = 'slider-container';

export function initSlider(containerId) {
  sliderContainerId = containerId || 'slider-container';
  const container = document.getElementById(sliderContainerId);
  if (!container) return;

  // Get the before/after image elements from existing HTML
  const beforeImg = container.querySelector('.slider-image-before img');
  const afterWrapper = container.querySelector('.slider-image-after');
  const divider = container.querySelector('.slider-divider');

  if (!beforeImg || !afterWrapper || !divider) {
    // If HTML structure doesn't match, build it dynamically
    buildSliderDynamic(container);
    return;
  }

  // Setup drag behavior
  let isDragging = false;

  const updatePosition = (clientX) => {
    const rect = container.getBoundingClientRect();
    let pos = clientX - rect.left;
    pos = Math.max(0, Math.min(pos, rect.width));
    const percent = (pos / rect.width) * 100;
    
    afterWrapper.style.clipPath = `polygon(${percent}% 0, 100% 0, 100% 100%, ${percent}% 100%)`;
    divider.style.left = `${percent}%`;
  };

  divider.addEventListener('mousedown', (e) => { isDragging = true; e.preventDefault(); });
  divider.addEventListener('touchstart', (e) => { isDragging = true; e.preventDefault(); }, { passive: false });
  
  window.addEventListener('mousemove', (e) => { if (isDragging) updatePosition(e.clientX); });
  window.addEventListener('touchmove', (e) => { if (isDragging) updatePosition(e.touches[0].clientX); }, { passive: false });
  
  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('touchend', () => { isDragging = false; });

  // Also allow clicking anywhere on the container to move the slider
  container.addEventListener('click', (e) => { updatePosition(e.clientX); });
}

function buildSliderDynamic(container) {
  // Fallback: build slider elements dynamically
  container.innerHTML = '';
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  container.style.minHeight = '250px';
  container.style.borderRadius = '8px';
  container.style.border = '1px solid #1e1e2e';
  container.style.cursor = 'ew-resize';

  const beforeDiv = document.createElement('div');
  beforeDiv.className = 'slider-image-before';
  const beforeImg = document.createElement('img');
  beforeImg.alt = 'Before';
  beforeDiv.appendChild(beforeImg);
  const labelLeft = document.createElement('div');
  labelLeft.className = 'slider-label left';
  labelLeft.textContent = 'Original (Dark)';
  beforeDiv.appendChild(labelLeft);

  const afterDiv = document.createElement('div');
  afterDiv.className = 'slider-image-after';
  const afterImg = document.createElement('img');
  afterImg.alt = 'After';
  afterDiv.appendChild(afterImg);
  const labelRight = document.createElement('div');
  labelRight.className = 'slider-label right';
  labelRight.textContent = 'Night Vision Enhanced';
  afterDiv.appendChild(labelRight);

  const divider = document.createElement('div');
  divider.className = 'slider-divider';

  container.appendChild(beforeDiv);
  container.appendChild(afterDiv);
  container.appendChild(divider);

  // Re-init with newly created elements
  initSlider(sliderContainerId);
}

export function updateSliderImages(originalSrc, enhancedSrc) {
  const container = document.getElementById(sliderContainerId);
  if (!container) return;

  const beforeImg = container.querySelector('.slider-image-before img');
  const afterImg = container.querySelector('.slider-image-after img');

  if (beforeImg && originalSrc) beforeImg.src = originalSrc;
  if (afterImg && enhancedSrc) afterImg.src = enhancedSrc;
}

export default { initSlider, updateSliderImages };
