# CivicEye AI — Architecture

## 1. System Overview

CivicEye AI is a web-based civic monitoring platform that combines a browser-based interface, a Node.js backend and modular analysis services.

The system accepts civic/waste-related information from the user, processes the input, performs AI-assisted analysis and presents the resulting insights through the web interface.

---

## 2. High-Level Architecture

```text
┌──────────────────────────────┐
│          User                │
│ Citizen / Civic Staff       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      CivicEye Web UI         │
│ HTML / CSS / JavaScript      │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│     Node.js / Express        │
│        server.js             │
└──────────────┬───────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│ AI / Image  │  │ Civic       │
│ Processing  │  │ Services    │
└──────┬──────┘  └──────┬──────┘
       │                │
       └───────┬────────┘
               ▼
┌──────────────────────────────┐
│      Structured Results      │
│ Analysis / Urgency / Data    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Dashboard / Reports / Chat   │
└──────────────────────────────┘