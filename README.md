# 🧭 Pathfinder — AI Personalized Learning Path Recommender

> An intelligent, graph-sequenced, adaptive learning assistant that turns free-form career goals into structured, explainable roadmaps.

[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple.svg)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20pgvector-3ecf8e.svg)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI%20Flash-orange.svg)](https://aistudio.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 💡 What is Pathfinder?

Online learning catalogs have thousands of courses, but learners struggle with **what to learn next** and **in what order**. 

**Pathfinder** combines **Large Language Models**, **Vector Similarity Search (`pgvector`)**, and **Graph Theory (Directed Acyclic Graph Topological Sort)** to:
1. Understand your background, experience level, and goals through natural conversation.
2. Retrieve the highest-relevance courses and identify skill gaps.
3. Automatically sequence courses into a prerequisite-valid roadmap with milestones.
4. Provide hallucination-free, grounded explanations for every pick.
5. Adapt dynamically as you complete courses and rate your mastery.

---

## ✨ Key Features

| Feature | How It Works |
| :--- | :--- |
| 💬 **Conversational Intake** | Chat naturally in plain English. Gemini extracts structured profiles with experience levels, goals, and completed courses. |
| 🔍 **pgvector Semantic Search** | Goal text is converted to 768-dim embeddings to perform cosine similarity retrieval over catalog courses via Postgres HNSW indexes. |
| 🕸️ **Prerequisite DAG Sequencer** | Kahn’s Topological Sort algorithm resolves dependencies, pulls missing prerequisites, and groups courses into logical milestones. |
| 🛡️ **Grounded Explainability** | Zero-shot fact-constrained prompting produces precise, hallucination-free rationales ("*Why this is recommended*") for every step. |
| 🤖 **Context-Aware AI Tutor** | In-app AI tutor is grounded on your active roadmap to answer questions and offer personalized study strategies. |
| 📊 **Adaptive Dashboard & Feedback** | Interactive mastery charts track your skill growth (0–100). Completing or rating steps triggers dynamic path re-sequencing. |

---

## 🏗️ Architecture & Tech Stack

```
[React 19 + Tailwind + Recharts]
               │  (Supabase Auth & JWT)
               ▼
[Supabase Edge Functions (Deno Runtime)]
 ├── parse-profile     ──> Gemini Structured JSON Output
 ├── retrieve-courses  ──> pgvector Cosine Search + Skill Gap Engine
 ├── generate-path     ──> Prerequisite DAG Topological Sort + Milestones
 ├── explain-step      ──> Zero-Shot Grounded Rationales
 └── tutor-chat        ──> Context-Bound Interactive Tutor
               │
               ▼
[Supabase Postgres DB (pgvector + Row-Level Security)]
```

---

## ⚡ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/<your-username>/personalized-learning-path-recommender.git
cd personalized-learning-path-recommender
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Deploy & Seed (One-time)
```bash
# Push DB schema & HNSW indexes
npx supabase db push

# Set Gemini API key for Edge Functions
npx supabase secrets set GEMINI_API_KEY=your-gemini-key

# Deploy edge functions
npx supabase functions deploy

# Seed catalog & precompute embeddings
node scripts/seed-catalog.js
node scripts/embed-catalog.js
```

### 4. Run Locally
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🧪 Verification & End-to-End QA

Run the automated test suite to verify Supabase Auth, database RLS, and all 6 Gemini Edge Functions:
```bash
# Run comprehensive E2E QA
node scripts/qa-e2e.js

# Run quick auth check
node scripts/auth-smoke.js
```

To create a clean submission ZIP archive:
```bash
npm run package
```

---

## 📚 Deep Dive Documentation

For detailed architectural diagrams, algorithm specifications, and development logs, see:
- 📐 **[System Design & Algorithms](file:///docs/SYSTEM_DESIGN.md)** — Topological sort, vector math, grounding prompts & formulas.
- 🏛️ **[Architecture Overview](file:///docs/ARCHITECTURE.md)** — Folder layout, database schemas, and conventions.
- 🎯 **[Project Brief & Criteria](file:///docs/PROJECT_BRIEF.md)** — Hackathon problem statement and deliverables.
- 📋 **[Progress Tracker & QA Log](file:///docs/PROGRESS.md)** — Comprehensive record of all 12 completed phases.

---

## 📄 License & Attribution

- Built under the **MIT License**.
- Architectural edge function abstractions inspired by the open-source [AI Learning Path Generator](https://github.com/Enterprise-DNA-OS/ai-learning-path-generator) by Enterprise DNA.