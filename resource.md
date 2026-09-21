## 1. Team Details

| Field | Value |
|---|---|
| Team ID (from dashboard) | `HM26-6551` |
| Team Name | `Jeshta` |
| College(s) | `PES College of Engineering, Mandya` |
| Team Leader | `Anisha M` · `anishamanjunath82@gmail.com` · `8151920063` |
| Repository | `https://github.com/anishamanjunath82-cpu/CivicEye-AI` |

| # | Member | Program & Year | GitHub Handle | Primary Role |
|---|---|---|---|---|
| 1 | `Anisha M` (Lead) | `EEE, 3rd year` | `@anishamanjunath82-cpu` | `AI / Backend / Integration` |
| 2 | `Chiranth U` | `EEE, 3rd year` | `@chiranthchiru142006-creator` | `Frontend / Testing / Integration` |

---

## 2. What We Built (one-liner)

**Sub-problem:** `Detection without reporting`

**In one sentence:** `CivicEye AI is an AI-assisted civic monitoring system that analyzes visual input to detect waste-related civic issues, estimate their severity and volume, and generate structured insights without requiring a separate manual complaint for every detected issue.`
---

## 3. Repository Documents

| Document | Link |
|---|---|
| Project README | [README.md](./README.md) |
| AI Usage Disclosure | [ai.md](./ai.md) |
| Architecture | [docs/architecture.md](./docs/architecture.md) |
| Setup & Run Instructions | [docs/setup.md](./docs/setup.md) |
| Constraints | [docs/constraints.md](./docs/constraints.md) |
| Known Limitations & Future Scope | [docs/limitations.md](./docs/limitations.md) |

---

## 4. Submission Artifacts (Google Drive)

The required submission artifacts will be uploaded to Google Drive before the submission freeze.

| # | Artifact | Google Drive Link | File Name | SHA-256 (first 16 chars) |
|---|---|---|---|---|
| 1 | Pitch + Code Walkthrough Video (≤ 10 min, MP4) | `TO BE ADDED` | `HM26-6551_video.mp4` | `TO BE ADDED` |
| 2 | Decision Log (1 page, PDF) | `TO BE ADDED` | `HM26-6551_decision-log.pdf` | `TO BE ADDED` |
| 3 | Presentation (≤ 10 slides, PDF) | `TO BE ADDED` | `HM26-6551_presentation.pdf` | `TO BE ADDED` |

### Video Chapters

Video chapter timestamps will be added after the final video is recorded and uploaded.

---

## 5. Live MVP

| Field | Value |
|---|---|
| Live URL | `Not publicly deployed` |
| Platform | `Web application — Node.js / Express` |
| Test login | `Not required for the local MVP` |
| Sample data loaded? | `Can be demonstrated using submitted image/input data` |
| How to run | Follow [docs/setup.md](./docs/setup.md) |
| Local URL | `http://localhost:3000` |

### Local testing

1. Clone the repository.
2. Run `npm install`.
3. Configure `.env` using `.env.example`.
4. Start the application using `npm start`.
5. Open `http://localhost:3000`.
6. Test the CivicEye AI visual analysis workflow.

The application is not claimed to be publicly deployed. `localhost` is provided only for local development and judging setup.

---

## 6. Quick Reviewer Path

A reviewer can evaluate the CivicEye AI prototype using the following flow:

1. Start the application using the instructions in `docs/setup.md`.
2. Open the CivicEye AI web interface.
3. Provide a civic/waste-related image through the visual analysis workflow.
4. Run the analysis.
5. Review the AI-assisted detection result.
6. Review the detected issue type, confidence, severity, estimated volume and recommended action.
7. Review the weather-related adjustment when available.
8. Report the detected issue as an incident.
9. Review incident information and urgency.
10. Explore the dashboard, analytics, chatbot and cleanup-route functionality available in the application.

### Core demonstration flow

```text
Visual Input
     ↓
Image Enhancement
     ↓
Gemini AI Analysis
     ↓
Waste / Civic Issue Detection
     ↓
Severity + Confidence + Volume
     ↓
Weather Adjustment
     ↓
Incident Reporting
     ↓
Urgency / Analytics
     ↓
Civic Monitoring Dashboard
## 4. Submission Artifacts (Google Drive)

The required submission artifacts are uploaded to Google Drive.

| # | Artifact | Google Drive Link | File Name | SHA-256 (first 16 chars) |
|---|---|---|---|---|
| 1 | Pitch + Code Walkthrough Video (≤ 10 min, MP4) | https://drive.google.com/file/d/18_0Sq66fo3HIsGtfUFG3ljMQheL17f7I/view?usp=drive_link | `HM26-6551_video.mp4` | `TO BE ADDED` |
| 2 | Decision Log (1 page, PDF) | https://drive.google.com/file/d/151KMrS7Pyr-OeXrs-ptaNo8ZNpfXJBKz/view?usp=drive_link | `HM26-6551_decision-log.pdf` | `AD759206CBCA5FEA` |
| 3 | Presentation (≤ 10 slides, PDF) | https://docs.google.com/presentation/d/1RjEZoK3zQ78uOShDYUPTXL-eusxh-6eX/edit?usp=drive_link | `HM26-6551_presentation.pdf` | `TO BE ADDED` |

### Additional Video Backup

A second video recording is also retained in the submission Drive folder:

https://drive.google.com/file/d/11R1_AFB-CLFndn5HQrPjqvwEM48O1qfs/view?usp=drive_link

The first listed video is the official pitch/code-walkthrough submission artifact.