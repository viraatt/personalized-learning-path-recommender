# 🧭 Pathfinder — AI Personalized Learning Path Recommender

> An intelligent, graph-sequenced, adaptive learning assistant that turns free-form career goals into structured, prerequisite-validated, explainable roadmaps.

[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple.svg)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20pgvector-3ecf8e.svg)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI%20Flash-orange.svg)](https://aistudio.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 💡 What is Pathfinder?

Modern course catalogs contain thousands of disparate offerings, but self-directed learners face severe decision paralysis around **what to learn next** and **in what prerequisite order**.

**Pathfinder** solves this by pairing **Large Language Models (Google Gemini)**, **Vector Similarity Search (`pgvector`)**, and **Graph Theory (Directed Acyclic Graph Topological Sort)**:
1. **Conversational Intake**: Extracts structured background, target roles, and skill profiles from free-form chat.
2. **Semantic Course Retrieval**: Projects learner goals into 768-dimensional vector space to find relevant catalog courses via HNSW cosine distance search.
3. **Prerequisite DAG Sequencing**: Automatically injects missing prerequisites and topological-sorts courses into logically ordered milestone checkpoints.
4. **Grounded Explainability**: Applies zero-shot fact constraints to generate hallucination-free, traceable rationale cards for every recommendation.
5. **Adaptive Mastery Loop**: Dynamically recalculates skill mastery (0–100) on step completion and rating, re-sequencing the roadmap in real time.
6. **In-App AI Tutor**: Road-map bound contextual mentor answering questions tailored to active milestones.

---

## 🏛️ Architecture & System Blueprint

Pathfinder is architected as a modern serverless application utilizing **React 19** on the client and **Supabase Edge Functions (Deno runtime)** backed by **PostgreSQL with `pgvector`** for storage and vector retrieval.

```
┌─────────────────────────────────────────────────────────────┐
│                 React 19 Frontend (Vite)                    │
│   [Chat Intake]  [Roadmap Timeline]  [Mastery SkillChart]   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Supabase Auth & JWT
                               ▼
┌─────────────────────────────────────────────────────────────┐
│          Supabase Edge Functions (Deno Runtime)             │
│  ├── parse-profile     ──> Gemini JSON Schema extraction    │
│  ├── retrieve-courses  ──> pgvector Cosine Search + Gap     │
│  ├── generate-path     ──> Prerequisite DAG Topological Sort│
│  ├── explain-step      ──> Zero-Shot Grounded Rationales    │
│  └── tutor-chat        ──> Context-Bound Interactive Mentor │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│         Supabase Postgres (pgvector + HNSW Indexes)         │
│  ├── courses & prerequisites (Catalog DAG)                  │
│  ├── learner_profiles & skill_mastery (User State)          │
│  └── learning_paths & path_steps (RLS Protected)            │
└─────────────────────────────────────────────────────────────┘
```

### 📑 Architecture Definition Files

All core architecture, algorithms, schemas, and provider abstractions are defined in the following files:

| Layer / Component | Source File | Description |
| :--- | :--- | :--- |
| **System Design & Algorithms** | [`docs/SYSTEM_DESIGN.md`](docs/SYSTEM_DESIGN.md) | Kahn’s DAG topological sort algorithm, cosine vector math, zero-shot grounding formulas, and mastery equations. |
| **Architecture Specification** | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | High-level system topology, stack breakdown, conventions, and database schema summary. |
| **Database Migrations** | [`supabase/migrations/`](supabase/migrations/) | SQL DDL scripts creating tables, Row-Level Security (RLS) policies, HNSW vector indexes, and the `match_courses` RPC. |
| **DAG Sequencer Engine** | [`supabase/functions/_shared/pathGraph.js`](supabase/functions/_shared/pathGraph.js) | Directed graph topological sorter, missing prerequisite resolver, and cycle-resilient fallback engine. |
| **Grounded Prompt Engine** | [`supabase/functions/_shared/grounding.js`](supabase/functions/_shared/grounding.js) | Strict fact-constrained prompt compiler preventing LLM hallucinations in recommendation rationales. |
| **AI Provider Abstraction** | [`supabase/functions/_shared/ai.js`](supabase/functions/_shared/ai.js) | Unified Google Gemini client wrapper supporting structured JSON schema output, embeddings, and exponential backoff. |
| **Skill Gap Analyzer** | [`supabase/functions/_shared/skillGap.js`](supabase/functions/_shared/skillGap.js) | Set-theoretic skill gap calculator comparing target course skills with learner competencies. |
| **Edge Functions Suite** | [`supabase/functions/`](supabase/functions/) | Microservices for profiling, retrieval, path generation, rationales, and conversational tutoring. |
| **Frontend UI Hierarchy** | [`src/components/`](src/components/) | React 19 component library containing the intake chat, roadmap timeline, mastery charts, and tutor widget. |

---

## ⚡ Clone & Run Guide (Getting Started)

Follow these steps to set up, configure, seed, and run the project locally.

### Prerequisites
- **Node.js**: `v18.0.0` or higher (`v20+` recommended)
- **npm**: `v9.0.0` or higher
- **Supabase Account**: Free project on [supabase.com](https://supabase.com) (or local Supabase CLI)
- **Google Gemini API Key**: Free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

---

### Step 1: Clone Repository & Install Dependencies

```bash
git clone https://github.com/viraatt/personalized-learning-path-recommender.git
cd personalized-learning-path-recommender
npm install
```

---

### Step 2: Configure Environment Variables

1. Copy the example environment template to `.env`:
   ```bash
   cp .env.example .env
   # On Windows PowerShell:
   # Copy-Item .env.example .env
   ```

2. Open `.env` and supply your credentials:
   ```env
   # Frontend Client (from Supabase Dashboard -> Project Settings -> API)
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

   # Service Role (Required ONLY for catalog seeding & embedding scripts)
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # Google Gemini API Key (Required for edge functions & embedding script)
   GEMINI_API_KEY=your-gemini-api-key
   ```

---

### Step 3: Initialize Database & Deploy Edge Functions

Link your Supabase project and push the database migrations and serverless functions:

```bash
# 1. Login & link your Supabase project (replace with your project ref)
npx supabase login
npx supabase link --project-ref your-project-ref

# 2. Push database tables, RLS policies, HNSW index & match_courses RPC
npx supabase db push

# 3. Set the Gemini API key secret in Supabase Edge Functions runtime
npx supabase secrets set GEMINI_API_KEY=your-gemini-api-key

# 4. Deploy all Edge Functions
npx supabase functions deploy
```

> [!TIP]
> Alternatively, if not using Supabase CLI, you can copy the SQL files in [`supabase/migrations/`](supabase/migrations/) and execute them in order in the **Supabase Dashboard SQL Editor**.

---

### Step 4: Seed Course Catalog & Precompute Embeddings

Populate the database with the curated course catalog, prerequisite graph edges, and precomputed 768-dimensional Gemini embeddings:

```bash
# Seed courses and prerequisite graph edges
npm run seed

# Precompute and store 768-dim embeddings for all catalog items
npm run embed
```

---

### Step 5: Launch Local Development Server

Start the Vite development server:

```bash
npm run dev
```

Open your browser at **[http://localhost:5173](http://localhost:5173)** to start using Pathfinder!

---

## 🧪 Automated Testing & Verification

Pathfinder comes with a test suite covering authentication, database RLS, and end-to-end Edge Function pipelines:

```bash
# Run comprehensive End-to-End QA (validates profile parsing, DAG generation, explainability & tutor)
npm run test:e2e

# Run quick Supabase Auth smoke test
npm run test:auth

# Check code quality with oxlint
npm run lint

# Validate production build
npm run build
```

### Packaging for Submission

To create a clean submission ZIP archive omitting local logs, dependencies, and environment files:
```bash
npm run package
```

---

## 📁 Repository Directory Structure

```
personalized-learning-path-recommender/
├── docs/
│   ├── ARCHITECTURE.md          # System architecture, stack & conventions
│   ├── SYSTEM_DESIGN.md         # Detailed algorithms, DAG & vector formulas
│   ├── PROJECT_BRIEF.md         # Problem statement and hackathon scope
│   └── PROGRESS.md              # Phase-by-phase implementation log
├── scripts/
│   ├── seed-catalog.js          # Catalog & prerequisite DAG seeder
│   ├── embed-catalog.js         # 768-dim Gemini vector embedding script
│   ├── qa-e2e.js                # Full end-to-end integration QA test suite
│   ├── auth-smoke.js            # Supabase auth smoke test
│   └── package-zip.js           # Clean submission ZIP packaging utility
├── src/
│   ├── components/
│   │   ├── auth/                # AuthCard sign-in & sign-up
│   │   ├── intake/              # Natural language intake chat
│   │   ├── path/                # Milestone timeline & step cards
│   │   ├── dashboard/           # Skill mastery charts & next actions
│   │   ├── tutor/               # Context-aware AI tutor widget
│   │   └── ui/                  # Accessible UI primitives (shadcn/ui)
│   ├── hooks/                   # Custom React hooks (auth, path, profile, tutor)
│   ├── lib/                     # Supabase client & utilities
│   ├── pages/                   # Landing, ChatPage, DashboardPage, ProfilePage
│   ├── App.jsx                  # Application root & router
│   └── main.jsx                 # Vite entry point
├── supabase/
│   ├── functions/
│   │   ├── _shared/             # Shared AI client, DAG graph, grounding & gap tools
│   │   ├── parse-profile/       # Chat intake -> structured JSON profile
│   │   ├── retrieve-courses/    # pgvector cosine similarity search
│   │   ├── generate-path/       # DAG topological sequencing & milestone chunking
│   │   ├── explain-step/        # Zero-shot grounded rationale generator
│   │   └── tutor-chat/          # Roadmap-scoped AI tutor assistant
│   └── migrations/              # SQL schema, RLS, indexes & RPC functions
├── .env.example                 # Environment configuration template
├── .gitignore                   # Git ignore rules (protects prompts & secrets)
├── package.json                 # Project dependencies and npm scripts
└── vite.config.js               # Vite bundler configuration
```

---

## 🛠️ Troubleshooting & FAQ

<details>
<summary><strong>1. "Supabase credentials not found in .env" banner on startup</strong></summary>

Make sure you copied `.env.example` to `.env` and provided valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Restart `npm run dev` after editing `.env`.
</details>

<details>
<summary><strong>2. Edge Function returns 500 or "AI Provider Error"</strong></summary>

Ensure the `GEMINI_API_KEY` secret is set in Supabase Edge Functions:
```bash
npx supabase secrets set GEMINI_API_KEY=your-gemini-api-key
```
Also verify your Google AI Studio quota has not been exceeded.
</details>

<details>
<summary><strong>3. "match_courses RPC does not exist" during path generation</strong></summary>

Apply the database migrations using `npx supabase db push` or run `supabase/migrations/20260824170000_match_courses_rpc.sql` in the Supabase Dashboard SQL Editor.
</details>

---

## 📄 License & Attribution

- Built under the **MIT License**.
- Architectural edge function abstractions inspired by the open-source [AI Learning Path Generator](https://github.com/Enterprise-DNA-OS/ai-learning-path-generator) by Enterprise DNA.