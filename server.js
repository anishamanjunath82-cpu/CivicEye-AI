require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const { enhanceImage } = require('./services/enhancer');
const { detectWaste } = require('./services/detector');
const { mergeOrCreateIncident } = require('./services/geocluster');
const { calculateUrgency, getUrgencyLabel } = require('./services/urgency');
const { getMysoreWeather, getWeatherAdjustment } = require('./services/weather');
const { chatWithCivicEye } = require('./services/chatbot');
const { getAnalytics } = require('./services/analytics');
const { optimizeCleanupRoute } = require('./services/routeOptimizer');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store for incidents
let incidents = [];

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public')); // Serve static files

// API Route: Analyze Frame
app.post('/api/analyze-frame', upload.single('frame'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        const imagePath = req.file.path;
        const imageBuffer = fs.readFileSync(imagePath);
        
        // 1. Enhance image using Sharp
        const { enhancedBuffer, metadata } = await enhanceImage(imageBuffer);
        
        // 2. Detect waste using Gemini Vision API
        const detectionResult = await detectWaste(enhancedBuffer, metadata);
        
        // 2.5 Apply weather adjustment
        const weather = await getMysoreWeather();
        const weatherAdj = getWeatherAdjustment(weather);
        if (detectionResult && detectionResult.confidence !== undefined) {
            detectionResult.confidence = parseFloat((detectionResult.confidence * weatherAdj.factor).toFixed(2));
            detectionResult.weatherLabel = weatherAdj.label;
        }
        
        // 3. Return results
        const enhancedBase64 = enhancedBuffer.toString('base64');
        
        // Clean up uploaded file
        fs.unlinkSync(imagePath);
        
        res.json({
            ...detectionResult,
            enhancedImage: `data:image/jpeg;base64,${enhancedBase64}`
        });

    } catch (error) {
        console.error('Error in /api/analyze-frame:', error);
        res.status(500).json({ error: 'Failed to analyze frame' });
    }
});

// API Route: Report Incident
app.post('/api/report-incident', (req, res) => {
    try {
        const { lat, lng, type, confidence, volume, imageBase64, timestamp, description, severity, material_type, recommended_action } = req.body;
        
        if (!lat || !lng || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newIncident = {
            id: uuidv4(),
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            type,
            confidence: parseFloat(confidence) || 0,
            volume: parseFloat(volume) || 0,
            severity: severity || 'MEDIUM',
            material_type: material_type || 'Unknown',
            recommended_action: recommended_action || '',
            description: description || '',
            imageBase64: imageBase64 || null,
            firstSeen: timestamp || new Date().toISOString(),
            lastSeen: timestamp || new Date().toISOString(),
            sightingCount: 1,
            status: 'ACTIVE'
        };

        // Calculate initial urgency
        newIncident.urgencyScore = calculateUrgency(newIncident);
        newIncident.urgencyLabel = getUrgencyLabel(newIncident.urgencyScore);

        // Geo-deduplication: merge or create
        incidents = mergeOrCreateIncident(incidents, newIncident);

        res.status(201).json({ message: 'Incident reported successfully', incidentsCount: incidents.length });
    } catch (error) {
        console.error('Error in /api/report-incident:', error);
        res.status(500).json({ error: 'Failed to report incident' });
    }
});

// API Route: Get all incidents
app.get('/api/incidents', (req, res) => {
    res.json(incidents);
});

// API Route: Get stats
app.get('/api/stats', (req, res) => {
    const totalIncidents = incidents.length;
    const activeIncidents = incidents.filter(i => i.status === 'ACTIVE').length;
    const resolvedIncidents = incidents.filter(i => i.status === 'RESOLVED').length;
    
    let totalUrgency = 0;
    let highPriorityCount = 0;
    
    incidents.forEach(i => {
        totalUrgency += (i.urgencyScore || 0);
        if (i.urgencyLabel === 'CRITICAL' || i.urgencyLabel === 'HIGH') {
            highPriorityCount++;
        }
    });

    const avgUrgency = totalIncidents > 0 ? (totalUrgency / totalIncidents).toFixed(2) : 0;

    res.json({
        totalIncidents,
        activeIncidents,
        resolvedIncidents,
        avgUrgency,
        highPriorityCount
    });
});

// Weather endpoint
app.get('/api/weather', async (req, res) => {
    try {
        const weather = await getMysoreWeather();
        const adjustment = getWeatherAdjustment(weather);
        res.json({ weather, adjustment });
    } catch (err) {
        console.error('Error fetching weather:', err);
        res.status(500).json({ error: 'Failed to fetch weather' });
    }
});

// Chatbot endpoint  
app.post('/api/chat', async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ error: 'Missing question' });
        }
        const result = await chatWithCivicEye(question, incidents);
        res.json(result);
    } catch (err) {
        console.error('Error in chatbot:', err);
        res.status(500).json({ error: 'Chatbot error' });
    }
});

// Analytics endpoint
app.get('/api/analytics', (req, res) => {
    res.json(getAnalytics(incidents));
});

// Repeat offenders (incidents with 3+ sightings)
app.get('/api/repeat-offenders', (req, res) => {
    const repeats = incidents.filter(i => (i.sightingCount || 1) >= 3);
    res.json(repeats);
});

// Cleanup route optimizer
app.get('/api/cleanup-route', (req, res) => {
    const activeIncidents = incidents.filter(i => i.status === 'ACTIVE');
    const route = optimizeCleanupRoute(activeIncidents);
    res.json(route);
});

app.listen(PORT, () => {
    console.log(`CivicEye AI Server running on http://localhost:${PORT}`);
});
