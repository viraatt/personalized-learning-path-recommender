# How to Expand the Course Catalog

> **One file, two commands.** That is all it takes to add new courses.

---

## The File to Edit

```
scripts/seed-catalog.js
```

Open it and find the `const courses = [...]` array (starts around line 32).
Add your new course objects **anywhere inside that array** — order does not matter, the system topologically sorts them via prerequisites anyway.

---

## Course Object Schema

```js
{
  title: 'Unreal Engine 5 Fundamentals',
  description: 'Learn to build games with Unreal Engine 5: Blueprints, C++ integration, and level design.',
  domain: 'game-dev',
  difficulty: 'beginner',        // 'beginner' | 'intermediate' | 'advanced'
  duration_hours: 35,
  skills: ['unreal-engine', 'blueprints', 'level-design'],
},
```

### Valid Domains

| Domain String | Covers |
|---|---|
| `game-dev` | Game engines, shaders, game AI, multiplayer |
| `data-science` | Python, ML, statistics, data analysis |
| `web-dev` | HTML/CSS, JS, React, Next.js, full-stack |
| `cloud` | AWS, GCP, Azure, Kubernetes, Terraform |
| `devops` | Docker, CI/CD, Linux, monitoring, IaC |
| `mobile-dev` | iOS (Swift), Android (Kotlin), Flutter, React Native |
| `cybersecurity` | Ethical hacking, OWASP, cryptography, SOC |
| `system-programming` | C, C++, Rust, OS, embedded, compilers |
| `databases` | SQL, PostgreSQL, MongoDB, Redis, DB design |
| `blockchain` | Solidity, DeFi, Web3, NFT, smart contracts |
| `ai-engineering` | LLMs, RAG, vector DBs, fine-tuning, AI agents |
| `design` | UI/UX, Figma, design systems, motion |

---

## Adding Prerequisites

Find `const prerequisiteEdges = { ... }` in the same file. Add:

```js
'Unreal Engine 5 Fundamentals': ['C++ for Game Development'],
'Advanced Unreal Shaders':       ['Unreal Engine 5 Fundamentals', 'HLSL Shader Programming'],
```

- KEY = the course that requires something first
- VALUE = array of titles that must come before it
- Courses with no prerequisites need NO entry here

---

## The Two Commands to Run After Editing

```bash
node scripts/seed-catalog.js     # inserts/updates courses (idempotent, safe to re-run)
node scripts/embed-catalog.js    # generates embeddings for NEW courses only (skips existing)
```

The embed script adds a 500ms delay between calls for rate-limit safety,
and auto-switches to GEMINI_API_KEY_2 if the primary key quota runs out.

---

## If You Add a New Domain

Also update `ROLE_TO_DOMAIN` in `supabase/functions/generate-path/index.js`:

```js
"vr developer": ["game-dev", "system-programming"],
"xr engineer":  ["game-dev", "system-programming"],
```

Then redeploy:
```bash
npx supabase functions deploy generate-path
```

---

## Summary Checklist

- [ ] Edit `scripts/seed-catalog.js` - add course objects to `courses` array
- [ ] Add prerequisite edges to `prerequisiteEdges` (if applicable)
- [ ] Run `node scripts/seed-catalog.js`
- [ ] Run `node scripts/embed-catalog.js`
- [ ] If new domain: update `ROLE_TO_DOMAIN` in generate-path and redeploy
