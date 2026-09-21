# AI Usage Disclosure

## 1. AI Tools Used During Development

The CivicEye AI project was developed with assistance from AI-based development tools.

### ChatGPT

Used for:
- Brainstorming the CivicEye AI concept and workflow.
- Planning the application architecture.
- Debugging and improving JavaScript/Node.js code.
- Understanding APIs, libraries and implementation approaches.
- Improving documentation and project explanations.
- Generating and refining development prompts and technical ideas.

### Google Gemini

Used as part of the CivicEye AI application for AI-assisted analysis of civic/waste-related visual information and generating structured insights.

---

## 2. AI Inside the Product

CivicEye AI uses AI-assisted processing to help analyze submitted civic information.

The intended workflow is:

```text
User Input / Image
        ↓
Image Processing
        ↓
AI-Assisted Analysis
        ↓
Issue / Waste Insights
        ↓
Urgency & Supporting Analysis
        ↓
Dashboard / Results
## 7. Demo Fallback

CivicEye AI includes a demo fallback mechanism for situations where a valid Gemini API key is not available or the Gemini API request fails.

In fallback mode, the application returns a simulated waste-detection response so that the application flow can still be demonstrated.

The fallback response is not presented as a real AI prediction and should not be used for real-world civic decisions.