const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key');

/**
 * Detects waste in the given image buffer using Gemini API.
 * Uses a demo fallback if API key is not present or API call fails.
 * @param {Buffer} imageBuffer 
 * @param {Object} metadata 
 * @returns {Promise<Object>}
 */
async function detectWaste(imageBuffer, metadata) {
    const hasValidKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
    
    const prompt = `You are an AI waste detection system analyzing dashcam footage from Mysuru, India.
Analyze this image and respond ONLY with valid JSON (no markdown, no code blocks):
{
  "detected": true/false,
  "type": "C&D_Debris" | "Garbage_Pile" | "Overflowing_Bin" | "Mixed_Waste" | "Pothole" | "None",
  "confidence": 0.0-1.0,
  "volume_estimate_tonnes": number,
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "description": "Brief description of what was detected",
  "material_type": "Brick_Rubble" | "Concrete" | "Mixed_Construction" | "Organic" | "Plastic" | "Unknown",
  "recommended_action": "Brief recommended cleanup action"
}`;

    if (hasValidKey) {
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
            
            const imagePart = {
                inlineData: {
                    data: imageBuffer.toString('base64'),
                    mimeType: 'image/jpeg'
                }
            };
            
            const result = await model.generateContent([prompt, imagePart]);
            const responseText = result.response.text().trim();
            
            // Clean up possible markdown wrappers
            let jsonString = responseText;
            if (jsonString.startsWith('```json')) {
                jsonString = jsonString.substring(7);
            }
            if (jsonString.startsWith('```')) {
                jsonString = jsonString.substring(3);
            }
            if (jsonString.endsWith('```')) {
                jsonString = jsonString.substring(0, jsonString.length - 3);
            }
            
            return JSON.parse(jsonString.trim());
        } catch (error) {
            console.error('Gemini API call failed, falling back to demo response:', error);
            return getDemoResponse();
        }
    } else {
        // Fallback to demo response if no valid key
        console.log('No valid Gemini API key found, using demo response');
        return getDemoResponse();
    }
}

function getDemoResponse() {
    const types = ["C&D_Debris", "Garbage_Pile", "Overflowing_Bin", "Mixed_Waste"];
    const materials = ["Brick_Rubble", "Concrete", "Mixed_Construction", "Organic", "Plastic"];
    const severities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    
    return {
        detected: true,
        type: types[Math.floor(Math.random() * types.length)],
        confidence: 0.75 + (Math.random() * 0.20), // 0.75 - 0.95
        volume_estimate_tonnes: 0.5 + (Math.random() * 3), // 0.5 - 3.5 tonnes
        severity: severities[Math.floor(Math.random() * severities.length)],
        description: "Demo fallback detection of waste pile.",
        material_type: materials[Math.floor(Math.random() * materials.length)],
        recommended_action: "Schedule pickup via municipal truck."
    };
}

module.exports = { detectWaste };
