// js/charts.js — Analytics Dashboard Charts using Chart.js
// Canvas IDs: chart-type, chart-severity, chart-hourly (matching index.html)

let typeChart, severityChart, hourlyChart;

export function initCharts() {
  const typeCtx = document.getElementById('chart-type');
  const severityCtx = document.getElementById('chart-severity');
  const hourlyCtx = document.getElementById('chart-hourly');

  if (typeCtx) typeChart = createTypeChart(typeCtx);
  if (severityCtx) severityChart = createSeverityChart(severityCtx);
  if (hourlyCtx) hourlyChart = createHourlyChart(hourlyCtx);
}

export async function refreshCharts() {
  try {
    const res = await fetch('/api/analytics');
    if (!res.ok) return;
    const data = await res.json();

    // Update Type chart (doughnut)
    if (typeChart && data.byType) {
      const labels = Object.keys(data.byType);
      const values = Object.values(data.byType);
      if (labels.length > 0) {
        typeChart.data.labels = labels;
        typeChart.data.datasets[0].data = values;
        typeChart.update();
      }
    }

    // Update Severity chart (bar)
    if (severityChart && data.bySeverity) {
      severityChart.data.datasets[0].data = [
        data.bySeverity.CRITICAL || 0,
        data.bySeverity.HIGH || 0,
        data.bySeverity.MEDIUM || 0,
        data.bySeverity.LOW || 0
      ];
      severityChart.update();
    }

    // Update Hourly chart (line)
    if (hourlyChart && data.byHour) {
      hourlyChart.data.datasets[0].data = data.byHour;
      hourlyChart.update();
    }
  } catch (error) {
    console.debug('Charts refresh skipped:', error.message);
  }
}

function createTypeChart(ctx) {
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['C&D Debris', 'Garbage Pile', 'Overflowing Bin', 'Mixed Waste'],
      datasets: [{
        data: [3, 5, 2, 4],
        backgroundColor: ['#ff6b35', '#00d4aa', '#ffcc00', '#ff3333'],
        borderWidth: 0,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#e0e0e0', font: { family: 'Inter', size: 11 }, padding: 12 }
        }
      }
    }
  });
}

function createSeverityChart(ctx) {
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      datasets: [{
        label: 'Incidents',
        data: [2, 4, 6, 3],
        backgroundColor: ['#ff3333', '#ff6b35', '#ffcc00', '#00d4aa'],
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: '#888' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#e0e0e0', font: { weight: 'bold' } }, grid: { display: false } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function createHourlyChart(ctx) {
  // Sample data showing peak at night hours (the "Suspicion Clock")
  const sampleData = [3,2,4,5,3,1,0,0,1,1,2,2,1,1,2,1,0,1,1,2,3,4,6,5];

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({length: 24}, (_, i) => `${i}:00`),
      datasets: [{
        label: 'Detections',
        data: sampleData,
        borderColor: '#00d4aa',
        backgroundColor: 'rgba(0, 212, 170, 0.15)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#00d4aa'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: '#888', maxTicksLimit: 12 }, grid: { display: false } },
        y: { ticks: { color: '#888' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      },
      plugins: { legend: { display: false } }
    },
    plugins: [{
      id: 'suspicionClockBg',
      beforeDraw: (chart) => {
        const { ctx: c, chartArea: { top, bottom, left, right }, scales: { x } } = chart;
        c.save();
        c.fillStyle = 'rgba(255, 51, 51, 0.08)';
        // Highlight 10PM-4AM danger zone
        const x4 = x.getPixelForValue(4);
        const x22 = x.getPixelForValue(22);
        c.fillRect(left, top, x4 - left, bottom - top);
        c.fillRect(x22, top, right - x22, bottom - top);
        c.restore();
      }
    }]
  });
}

export default { initCharts, refreshCharts };
