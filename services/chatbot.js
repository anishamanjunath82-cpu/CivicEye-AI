const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key');

async function chatWithCivicEye(question, incidents) {
    const hasValidKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
    
    if (!hasValidKey) {
        return {
            answer: "Hello! I am CivicEye AI. I can see " + incidents.length + " active issues reported right now. (Demo mode)",
            relatedIncidents: incidents.slice(0, 3)
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
        
        const context = JSON.stringify(incidents.map(i => ({
            type: i.type,
            severity: i.severity,
            status: i.status,
            sightingCount: i.sightingCount,
            urgencyLabel: i.urgencyLabel
        })));

        const prompt = `You are CivicEye AI, a helpful assistant for citizens of Mysuru.
Current active incidents context: ${context}

Citizen asks: "${question}"

Answer the citizen's question helpfully based on the incidents data. Keep it concise.`;

        const result = await model.generateContent(prompt);
        const answer = result.response.text().trim();
        
        return {
            answer,
            relatedIncidents: incidents.slice(0, 3)
        };
    } catch (error) {
        console.error('Chatbot error:', error);
        return {
            answer: "Sorry, I am having trouble connecting to my brain right now.",
            relatedIncidents: []
        };
    }
}

module.exports = { chatWithCivicEye };
