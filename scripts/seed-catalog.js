// seed-catalog.js
// Populates the `courses` and `prerequisites` tables with a 100-course catalog
// spanning 12 domains. Idempotent: safe to re-run.
//
// Usage: node scripts/seed-catalog.js

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    'Missing env vars. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const courses = [
  {
    "title": "C++ for Game Development",
    "description": "Learn C++ from scratch with a game-dev focus: pointers, memory, OOP, STL, and performance patterns used in real game engines.",
    "domain": "game-dev",
    "difficulty": "beginner",
    "duration_hours": 30,
    "skills": [
      "c++",
      "oop",
      "memory-management",
      "game-programming"
    ]
  },
  {
    "title": "C# for Unity Developers",
    "description": "Master C# syntax, classes, delegates, coroutines, and the event system as used inside Unity projects.",
    "domain": "game-dev",
    "difficulty": "beginner",
    "duration_hours": 20,
    "skills": [
      "c#",
      "unity",
      "scripting",
      "oop"
    ]
  },
  {
    "title": "Game Design & Level Design",
    "description": "Core game-design theory: player motivation, feedback loops, difficulty curves, and hands-on level layout with industry tools.",
    "domain": "game-dev",
    "difficulty": "beginner",
    "duration_hours": 20,
    "skills": [
      "game-design",
      "level-design",
      "game-theory",
      "prototyping"
    ]
  },
  {
    "title": "Game Mathematics & Linear Algebra",
    "description": "Vectors, matrices, quaternions, coordinate spaces, and transformations — the math every game programmer must master.",
    "domain": "game-dev",
    "difficulty": "beginner",
    "duration_hours": 22,
    "skills": [
      "linear-algebra",
      "vectors",
      "matrices",
      "quaternions",
      "game-math"
    ]
  },
  {
    "title": "Unity Game Engine Fundamentals",
    "description": "Build 2D and 3D games in Unity: GameObjects, components, physics, animation, UI, and the asset pipeline.",
    "domain": "game-dev",
    "difficulty": "intermediate",
    "duration_hours": 35,
    "skills": [
      "unity",
      "c#",
      "game-objects",
      "physics",
      "animation"
    ]
  },
  {
    "title": "Unreal Engine 5 Fundamentals",
    "description": "Blueprints visual scripting, Nanite geometry, Lumen lighting, and the UE5 actor/component architecture.",
    "domain": "game-dev",
    "difficulty": "intermediate",
    "duration_hours": 40,
    "skills": [
      "unreal-engine",
      "blueprints",
      "ue5",
      "nanite",
      "lumen"
    ]
  },
  {
    "title": "Game Physics & Collision Detection",
    "description": "Rigid-body dynamics, broad/narrow-phase collision, constraint solvers, and integrating PhysX or Bullet into a game engine.",
    "domain": "game-dev",
    "difficulty": "intermediate",
    "duration_hours": 25,
    "skills": [
      "game-physics",
      "rigid-body",
      "collision-detection",
      "physx"
    ]
  },
  {
    "title": "3D Rendering Pipeline & Graphics",
    "description": "The full real-time rendering pipeline: geometry, rasterization, shading models, post-processing, and OpenGL/DirectX fundamentals.",
    "domain": "game-dev",
    "difficulty": "intermediate",
    "duration_hours": 35,
    "skills": [
      "rendering",
      "opengl",
      "rasterization",
      "shading",
      "graphics-pipeline"
    ]
  },
  {
    "title": "HLSL & GLSL Shader Programming",
    "description": "Write vertex, fragment, and compute shaders in HLSL/GLSL: PBR materials, shadow mapping, screen-space effects, and GPU optimization.",
    "domain": "game-dev",
    "difficulty": "intermediate",
    "duration_hours": 30,
    "skills": [
      "hlsl",
      "glsl",
      "shaders",
      "pbr",
      "gpu-programming"
    ]
  },
  {
    "title": "Game AI & Pathfinding",
    "description": "Finite-state machines, behaviour trees, A* pathfinding, navigation meshes, steering behaviours, and decision-making systems for NPCs.",
    "domain": "game-dev",
    "difficulty": "intermediate",
    "duration_hours": 25,
    "skills": [
      "game-ai",
      "pathfinding",
      "behavior-trees",
      "fsm",
      "a-star"
    ]
  },
  {
    "title": "Multiplayer Game Networking",
    "description": "Client-server and peer-to-peer architectures, UDP sockets, rollback netcode, lag compensation, and cheat prevention for online games.",
    "domain": "game-dev",
    "difficulty": "intermediate",
    "duration_hours": 30,
    "skills": [
      "multiplayer",
      "networking",
      "udp",
      "rollback-netcode",
      "game-servers"
    ]
  },
  {
    "title": "Unreal Engine 5 Advanced C++",
    "description": "Deep-dive UE5 C++ subsystems: gameplay framework, GAS (Gameplay Ability System), network replication, and plugin development.",
    "domain": "game-dev",
    "difficulty": "advanced",
    "duration_hours": 45,
    "skills": [
      "unreal-engine",
      "c++",
      "gas",
      "network-replication",
      "ue5-advanced"
    ]
  },
  {
    "title": "DirectX 12 & Vulkan Low-Level Graphics",
    "description": "Command queues, descriptor heaps, render passes, synchronisation primitives, and building a modern renderer from scratch in DX12/Vulkan.",
    "domain": "game-dev",
    "difficulty": "advanced",
    "duration_hours": 50,
    "skills": [
      "directx12",
      "vulkan",
      "low-level-graphics",
      "render-graph",
      "gpu-sync"
    ]
  },
  {
    "title": "Game Optimization & Profiling",
    "description": "CPU/GPU profiling tools, draw-call batching, level-of-detail systems, memory budgets, and achieving 60fps on target hardware.",
    "domain": "game-dev",
    "difficulty": "advanced",
    "duration_hours": 25,
    "skills": [
      "game-optimization",
      "profiling",
      "lod",
      "performance",
      "frame-budget"
    ]
  },
  {
    "title": "Console Game Development",
    "description": "PlayStation 5 and Xbox Series X development kits, platform certification requirements, console-specific APIs, and shipping on console.",
    "domain": "game-dev",
    "difficulty": "advanced",
    "duration_hours": 30,
    "skills": [
      "console-dev",
      "playstation",
      "xbox",
      "platform-cert",
      "gdkx"
    ]
  },
  {
    "title": "Python Fundamentals",
    "description": "Core Python syntax, data types, control flow, functions, and file I/O.",
    "domain": "data-science",
    "difficulty": "beginner",
    "duration_hours": 20,
    "skills": [
      "python",
      "programming-basics"
    ]
  },
  {
    "title": "Data Analysis with Pandas",
    "description": "Load, clean, transform, and analyze tabular data with pandas.",
    "domain": "data-science",
    "difficulty": "intermediate",
    "duration_hours": 25,
    "skills": [
      "pandas",
      "data-cleaning",
      "python"
    ]
  },
  {
    "title": "Data Visualization",
    "description": "Create clear charts and dashboards with matplotlib and seaborn.",
    "domain": "data-science",
    "difficulty": "intermediate",
    "duration_hours": 15,
    "skills": [
      "matplotlib",
      "seaborn",
      "visualization"
    ]
  },
  {
    "title": "Statistics for Data Science",
    "description": "Descriptive and inferential statistics, probability, and hypothesis testing.",
    "domain": "data-science",
    "difficulty": "intermediate",
    "duration_hours": 30,
    "skills": [
      "statistics",
      "probability"
    ]
  },
  {
    "title": "Machine Learning Foundations",
    "description": "Supervised and unsupervised learning with scikit-learn: regression, classification, clustering.",
    "domain": "data-science",
    "difficulty": "intermediate",
    "duration_hours": 35,
    "skills": [
      "scikit-learn",
      "ml-basics"
    ]
  },
  {
    "title": "Deep Learning with TensorFlow",
    "description": "Neural networks, CNNs, and training workflows with TensorFlow/Keras.",
    "domain": "data-science",
    "difficulty": "advanced",
    "duration_hours": 40,
    "skills": [
      "tensorflow",
      "neural-networks"
    ]
  },
  {
    "title": "Applied Machine Learning Project",
    "description": "End-to-end project: build, evaluate, and deploy an ML model on a real dataset.",
    "domain": "data-science",
    "difficulty": "advanced",
    "duration_hours": 30,
    "skills": [
      "ml-project",
      "model-deployment"
    ]
  },
  {
    "title": "Natural Language Processing",
    "description": "Text preprocessing, embeddings, transformers, and building NLP pipelines with Hugging Face for classification and generation tasks.",
    "domain": "data-science",
    "difficulty": "intermediate",
    "duration_hours": 30,
    "skills": [
      "nlp",
      "transformers",
      "huggingface",
      "text-processing"
    ]
  },
  {
    "title": "Time Series Analysis",
    "description": "Stationarity, ARIMA/SARIMA, Prophet, LSTM for forecasting, and detecting anomalies in temporal data.",
    "domain": "data-science",
    "difficulty": "intermediate",
    "duration_hours": 25,
    "skills": [
      "time-series",
      "forecasting",
      "arima",
      "prophet"
    ]
  },
  {
    "title": "Feature Engineering & Selection",
    "description": "Encoding, scaling, imputation, polynomial features, and selecting the right features to maximise model performance.",
    "domain": "data-science",
    "difficulty": "intermediate",
    "duration_hours": 20,
    "skills": [
      "feature-engineering",
      "preprocessing",
      "feature-selection"
    ]
  },
  {
    "title": "MLOps & Model Deployment",
    "description": "Packaging models with Docker, CI/CD for ML, model registries, serving with FastAPI, and monitoring drift in production.",
    "domain": "data-science",
    "difficulty": "advanced",
    "duration_hours": 30,
    "skills": [
      "mlops",
      "model-serving",
      "docker",
      "model-monitoring"
    ]
  },
  {
    "title": "Kaggle Competition Strategies",
    "description": "Winning strategies: EDA, ensembles, stacking, hyperparameter search, cross-validation, and reading top competition kernels.",
    "domain": "data-science",
    "difficulty": "advanced",
    "duration_hours": 25,
    "skills": [
      "kaggle",
      "ensembles",
      "stacking",
      "competition-ml"
    ]
  },
  {
    "title": "HTML & CSS Foundations",
    "description": "Semantic HTML, responsive CSS layout, Flexbox, and Grid.",
    "domain": "web-dev",
    "difficulty": "beginner",
    "duration_hours": 18,
    "skills": [
      "html",
      "css"
    ]
  },
  {
    "title": "JavaScript Essentials",
    "description": "Core JavaScript: variables, functions, arrays, objects, and events.",
    "domain": "web-dev",
    "difficulty": "beginner",
    "duration_hours": 22,
    "skills": [
      "javascript",
      "frontend-basics"
    ]
  },
  {
    "title": "React Development",
    "description": "Build interactive single-page apps with React, components, and hooks.",
    "domain": "web-dev",
    "difficulty": "intermediate",
    "duration_hours": 30,
    "skills": [
      "react",
      "components",
      "hooks"
    ]
  },
  {
    "title": "Full-Stack Web Development",
    "description": "Connect a frontend to a backend API and database to ship a full app.",
    "domain": "web-dev",
    "difficulty": "advanced",
    "duration_hours": 40,
    "skills": [
      "backend-apis",
      "databases",
      "full-stack"
    ]
  },
  {
    "title": "TypeScript Fundamentals",
    "description": "Static typing for JavaScript: interfaces, generics, utility types, decorators, and migrating JS projects to TypeScript.",
    "domain": "web-dev",
    "difficulty": "intermediate",
    "duration_hours": 20,
    "skills": [
      "typescript",
      "type-safety",
      "interfaces",
      "generics"
    ]
  },
  {
    "title": "Next.js & Server-Side Rendering",
    "description": "SSR, SSG, ISR, App Router, Server Components, and deploying production Next.js apps.",
    "domain": "web-dev",
    "difficulty": "intermediate",
    "duration_hours": 25,
    "skills": [
      "nextjs",
      "ssr",
      "ssg",
      "react",
      "server-components"
    ]
  },
  {
    "title": "GraphQL APIs",
    "description": "Schema-first API design, resolvers, subscriptions, Apollo Client/Server, and comparing GraphQL to REST.",
    "domain": "web-dev",
    "difficulty": "intermediate",
    "duration_hours": 20,
    "skills": [
      "graphql",
      "api-design",
      "apollo",
      "resolvers"
    ]
  },
  {
    "title": "Web Performance Optimization",
    "description": "Core Web Vitals, code splitting, image optimization, caching strategies, and measuring with Lighthouse and WebPageTest.",
    "domain": "web-dev",
    "difficulty": "intermediate",
    "duration_hours": 15,
    "skills": [
      "web-performance",
      "lighthouse",
      "core-web-vitals",
      "caching"
    ]
  },
  {
    "title": "Frontend Testing with Jest & Cypress",
    "description": "Unit tests with Jest and React Testing Library, integration tests, and end-to-end tests with Cypress — including CI integration.",
    "domain": "web-dev",
    "difficulty": "intermediate",
    "duration_hours": 20,
    "skills": [
      "jest",
      "cypress",
      "testing",
      "react-testing-library"
    ]
  },
  {
    "title": "Web Accessibility",
    "description": "WCAG 2.2 standards, ARIA roles, keyboard navigation, screen-reader testing, and building inclusive web experiences.",
    "domain": "web-dev",
    "difficulty": "beginner",
    "duration_hours": 12,
    "skills": [
      "accessibility",
      "wcag",
      "aria",
      "inclusive-design"
    ]
  },
  {
    "title": "Cloud Basics with AWS",
    "description": "Core cloud concepts: compute, storage, networking, and IAM on AWS.",
    "domain": "cloud",
    "difficulty": "beginner",
    "duration_hours": 20,
    "skills": [
      "aws",
      "cloud-basics"
    ]
  },
  {
    "title": "Serverless Applications",
    "description": "Design and deploy serverless functions, databases, and auth flows.",
    "domain": "cloud",
    "difficulty": "intermediate",
    "duration_hours": 25,
    "skills": [
      "serverless",
      "aws",
      "cloud-architecture"
    ]
  },
  {
    "title": "Google Cloud Platform Fundamentals",
    "description": "GCP compute (GCE, GKE, Cloud Run), storage, BigQuery, Pub/Sub, and core IAM patterns on Google Cloud.",
    "domain": "cloud",
    "difficulty": "beginner",
    "duration_hours": 20,
    "skills": [
      "gcp",
      "bigquery",
      "cloud-run",
      "cloud-basics"
    ]
  },
  {
    "title": "Microsoft Azure Core Services",
    "description": "Azure VMs, App Service, Blob Storage, Azure AD, and the Azure DevOps ecosystem for cloud-native development.",
    "domain": "cloud",
    "difficulty": "beginner",
    "duration_hours": 20,
    "skills": [
      "azure",
      "azure-devops",
      "cloud-basics",
      "arm-templates"
    ]
  },
  {
    "title": "Kubernetes & Container Orchestration",
    "description": "Pods, deployments, services, ingress, Helm charts, autoscaling, and running production workloads on Kubernetes.",
    "domain": "cloud",
    "difficulty": "intermediate",
    "duration_hours": 30,
    "skills": [
      "kubernetes",
      "k8s",
      "helm",
      "containers",
      "orchestration"
    ]
  },
  {
    "title": "Infrastructure as Code with Terraform",
    "description": "HCL syntax, providers, modules, state management, and managing multi-cloud infrastructure with Terraform.",
    "domain": "cloud",
    "difficulty": "intermediate",
    "duration_hours": 25,
    "skills": [
      "terraform",
      "iac",
      "hcl",
      "cloud-automation"
    ]
  },
  {
    "title": "Cloud Security & Compliance",
    "description": "Shared responsibility model, IAM least-privilege, VPC design, encryption, and compliance frameworks on AWS/GCP/Azure.",
    "domain": "cloud",
    "difficulty": "intermediate",
    "duration_hours": 20,
    "skills": [
      "cloud-security",
      "iam",
      "compliance",
      "vpc",
      "encryption"
    ]
  },
  {
    "title": "FinOps & Cloud Cost Optimization",
    "description": "Tagging strategies, reserved instances, spot fleets, rightsizing, and building a cost visibility culture with FinOps principles.",
    "domain": "cloud",
    "difficulty": "advanced",
    "duration_hours": 15,
    "skills": [
      "finops",
      "cloud-cost",
      "cost-optimization",
      "reserved-instances"
    ]
  },
  {
    "title": "Linux for Developers",
    "description": "File system, permissions, processes, package management, networking commands, and shell fundamentals every developer needs.",
    "domain": "devops",
    "difficulty": "beginner",
    "duration_hours": 18,
    "skills": [
      "linux",
      "bash",
      "command-line",
      "shell"
    ]
  },
  {
    "title": "Bash Scripting & Automation",
    "description": "Variables, loops, functions, error handling, cron jobs, and automating repetitive tasks with robust Bash scripts.",
    "domain": "devops",
    "difficulty": "beginner",
    "duration_hours": 15,
    "skills": [
      "bash",
      "shell-scripting",
      "automation",
      "cron"
    ]
  },
  {
    "title": "Docker & Containerization",
    "description": "Images, containers, Dockerfile best practices, multi-stage builds, Docker Compose, and container security hardening.",
    "domain": "devops",
    "difficulty": "beginner",
    "duration_hours": 20,
    "skills": [
      "docker",
      "containers",
      "dockerfile",
      "docker-compose"
    ]
  },
  {
    "title": "CI/CD Pipelines with GitHub Actions",
    "description": "Workflows, jobs, steps, caching, secrets management, deployment strategies, and automated testing in GitHub Actions.",
    "domain": "devops",
    "difficulty": "intermediate",
    "duration_hours": 20,
    "skills": [
      "ci-cd",
      "github-actions",
      "pipelines",
      "deployment-automation"
    ]
  },
  {
    "title": "Monitoring & Observability",
    "description": "Metrics with Prometheus and Grafana, structured logging with ELK, distributed tracing with OpenTelemetry, and on-call alerting.",
    "domain": "devops",
    "difficulty": "intermediate",
    "duration_hours": 20,
    "skills": [
      "monitoring",
      "prometheus",
      "grafana",
      "opentelemetry",
      "logging"
    ]
  },
  {
    "title": "DevSecOps",
    "description": "Shifting security left: SAST/DAST tools, dependency scanning, secrets detection, container image scanning, and secure CI pipelines.",
    "domain": "devops",
    "difficulty": "advanced",
    "duration_hours": 25,
    "skills": [
      "devsecops",
      "sast",
      "dast",
      "security-scanning",
      "supply-chain"
    ]
  },
  {
    "title": "Site Reliability Engineering",
    "description": "SLOs, SLAs, error budgets, toil elimination, chaos engineering, incident management, and building reliable distributed systems.",
    "domain": "devops",
    "difficulty": "advanced",
    "duration_hours": 30,
    "skills": [
      "sre",
      "reliability",
      "slos",
      "chaos-engineering",
      "incident-response"
    ]
  },
  {
    "title": "Platform Engineering",
    "description": "Internal developer portals (Backstage), golden paths, self-service infrastructure, and building a world-class developer experience platform.",
    "domain": "devops",
    "difficulty": "advanced",
    "duration_hours": 30,
    "skills": [
      "platform-engineering",
      "backstage",
      "developer-experience",
      "idp"
    ]
  },
  {
    "title": "Swift & iOS Development",
    "description": "Swift syntax, UIKit, Auto Layout, navigation, networking, and the complete iOS app development lifecycle from Xcode to App Store.",
    "domain": "mobile-dev",
    "difficulty": "beginner",
    "duration_hours": 30,
    "skills": [
      "swift",
      "ios",
      "xcode",
      "uikit",
      "auto-layout"
    ]
  },
  {
    "title": "Kotlin & Android Development",
    "description": "Kotlin fundamentals, Jetpack Compose, ViewModel, Room, Retrofit, and shipping Android apps on the Google Play Store.",
    "domain": "mobile-dev",
    "difficulty": "beginner",
    "duration_hours": 30,
    "skills": [
      "kotlin",
      "android",
      "jetpack-compose",
      "viewmodel",
      "room"
    ]
  },
  {
    "title": "App Store Deployment & Monetization",
    "description": "Provisioning profiles, TestFlight, App Store Connect, ASO, in-app purchases, subscriptions, and analytics.",
    "domain": "mobile-dev",
    "difficulty": "beginner",
    "duration_hours": 10,
    "skills": [
      "app-store",
      "google-play",
      "aso",
      "iap",
      "monetization"
    ]
  },
  {
    "title": "SwiftUI for iOS",
    "description": "Declarative UI, state management with @State/@Observable, animations, accessibility, and building production SwiftUI apps.",
    "domain": "mobile-dev",
    "difficulty": "intermediate",
    "duration_hours": 25,
    "skills": [
      "swiftui",
      "ios",
      "declarative-ui",
      "state-management"
    ]
  },
  {
    "title": "Flutter Cross-Platform Development",
    "description": "Dart language, Flutter widgets, state management (Riverpod/Bloc), platform channels, and shipping to iOS and Android from one codebase.",
    "domain": "mobile-dev",
    "difficulty": "intermediate",
    "duration_hours": 30,
    "skills": [
      "flutter",
      "dart",
      "cross-platform",
      "riverpod",
      "bloc"
    ]
  },
  {
    "title": "React Native Development",
    "description": "Building cross-platform mobile apps with React Native, Expo, navigation, native modules, and deploying to both app stores.",
    "domain": "mobile-dev",
    "difficulty": "intermediate",
    "duration_hours": 25,
    "skills": [
      "react-native",
      "expo",
      "mobile",
      "javascript",
      "cross-platform"
    ]
  },
  {
    "title": "Mobile App Architecture",
    "description": "MVVM, Clean Architecture, dependency injection, offline-first design, and testing strategies for scalable mobile apps.",
    "domain": "mobile-dev",
    "difficulty": "intermediate",
    "duration_hours": 20,
    "skills": [
      "mvvm",
      "clean-architecture",
      "dependency-injection",
      "mobile-patterns"
    ]
  },
  {
    "title": "Mobile App Testing & QA",
    "description": "Unit and UI testing on iOS (XCTest, XCUITest) and Android (Espresso, UI Automator), snapshot testing, and test automation pipelines.",
    "domain": "mobile-dev",
    "difficulty": "intermediate",
    "duration_hours": 15,
    "skills": [
      "mobile-testing",
      "xctest",
      "espresso",
      "ui-automator",
      "snapshot-testing"
    ]
  },
  {
    "title": "Network Security Fundamentals",
    "description": "TCP/IP model, firewalls, VPNs, IDS/IPS, network scanning, and defending against common network attacks.",
    "domain": "cybersecurity",
    "difficulty": "beginner",
    "duration_hours": 20,
    "skills": [
      "network-security",
      "tcp-ip",
      "firewalls",
      "vpn",
      "ids"
    ]
  },
  {
    "title": "Linux for Security",
    "description": "Kali Linux, file permissions, process inspection, network tools (nmap, Wireshark), and using Linux as a security platform.",
    "domain": "cybersecurity",
    "difficulty": "beginner",
    "duration_hours": 18,
    "skills": [
      "linux",
      "kali",
      "nmap",
      "wireshark",
      "security-tools"
    ]
  },
  {
    "title": "OWASP Top 10 & Web Security",
    "description": "SQL injection, XSS, CSRF, insecure deserialization, broken authentication, and hands-on labs exploiting and patching web vulnerabilities.",
    "domain": "cybersecurity",
    "difficulty": "intermediate",
    "duration_hours": 20,
    "skills": [
      "owasp",
      "web-security",
      "xss",
      "sqli",
      "csrf"
    ]
  },
  {
    "title": "Cryptography Fundamentals",
    "description": "Symmetric and asymmetric encryption, hash functions, digital signatures, TLS/PKI, and common cryptographic attacks.",
    "domain": "cybersecurity",
    "difficulty": "intermediate",
    "duration_hours": 25,
    "skills": [
      "cryptography",
      "encryption",
      "tls",
      "pki",
      "digital-signatures"
    ]
  },
  {
    "title": "Ethical Hacking & Penetration Testing",
    "description": "Full pentest methodology: reconnaissance, exploitation with Metasploit, privilege escalation, post-exploitation, and professional reporting.",
    "domain": "cybersecurity",
    "difficulty": "intermediate",
    "duration_hours": 35,
    "skills": [
      "ethical-hacking",
      "pentesting",
      "metasploit",
      "exploitation",
      "reporting"
    ]
  },
  {
    "title": "SOC Analyst & Threat Hunting",
    "description": "SIEM platforms, log analysis, IOC investigation, threat intelligence, MITRE ATT&CK framework, and incident response playbooks.",
    "domain": "cybersecurity",
    "difficulty": "intermediate",
    "duration_hours": 30,
    "skills": [
      "soc",
      "threat-hunting",
      "siem",
      "incident-response",
      "mitre-attck"
    ]
  },
  {
    "title": "Secure Coding Practices",
    "description": "Writing secure code in Python, JS, and C++: input validation, output encoding, dependency auditing, and threat modeling.",
    "domain": "cybersecurity",
    "difficulty": "intermediate",
    "duration_hours": 20,
    "skills": [
      "secure-coding",
      "code-review",
      "threat-modeling",
      "dependency-auditing"
    ]
  },
  {
    "title": "Cloud Security Architecture",
    "description": "Zero-trust design, cloud-native SIEM, CSPM tools, identity federation, secrets management, and securing multi-cloud environments.",
    "domain": "cybersecurity",
    "difficulty": "advanced",
    "duration_hours": 25,
    "skills": [
      "cloud-security",
      "zero-trust",
      "cspm",
      "identity-federation",
      "secrets-management"
    ]
  },
  {
    "title": "C Programming Fundamentals",
    "description": "Variables, pointers, arrays, structs, dynamic memory, file I/O, and the C standard library — the foundation of system programming.",
    "domain": "system-programming",
    "difficulty": "beginner",
    "duration_hours": 25,
    "skills": [
      "c",
      "pointers",
      "memory-management",
      "systems"
    ]
  },
  {
    "title": "Advanced C++ Programming",
    "description": "Modern C++17/20: move semantics, smart pointers, templates, variadic packs, coroutines, and idiomatic STL usage.",
    "domain": "system-programming",
    "difficulty": "intermediate",
    "duration_hours": 35,
    "skills": [
      "c++",
      "modern-cpp",
      "templates",
      "smart-pointers",
      "stl"
    ]
  },
  {
    "title": "Rust Programming Language",
    "description": "Ownership, borrowing, lifetimes, traits, async/await, unsafe Rust, and building memory-safe systems software.",
    "domain": "system-programming",
    "difficulty": "intermediate",
    "duration_hours": 30,
    "skills": [
      "rust",
      "ownership",
      "borrowing",
      "lifetimes",
      "async-rust"
    ]
  },
  {
    "title": "Operating Systems Internals",
    "description": "Processes, threads, scheduling algorithms, virtual memory, file systems, and inter-process communication mechanisms.",
    "domain": "system-programming",
    "difficulty": "intermediate",
    "duration_hours": 35,
    "skills": [
      "os",
      "processes",
      "threads",
      "scheduling",
      "virtual-memory"
    ]
  },
  {
    "title": "Concurrency & Parallel Programming",
    "description": "Mutexes, condition variables, lock-free structures, POSIX threads, OpenMP, and avoiding data races and deadlocks.",
    "domain": "system-programming",
    "difficulty": "intermediate",
    "duration_hours": 25,
    "skills": [
      "concurrency",
      "threads",
      "lock-free",
      "openmp",
      "data-races"
    ]
  },
  {
    "title": "Embedded Systems Programming",
    "description": "Microcontroller architecture, bare-metal C, RTOS (FreeRTOS), GPIO, I2C/SPI/UART protocols, and debugging with JTAG/SWD.",
    "domain": "system-programming",
    "difficulty": "intermediate",
    "duration_hours": 30,
    "skills": [
      "embedded",
      "microcontrollers",
      "rtos",
      "freertos",
      "gpio"
    ]
  },
  {
    "title": "Compiler Design & Interpreters",
    "description": "Lexing, parsing (recursive descent, LALR), ASTs, semantic analysis, IR generation, and building a working language interpreter.",
    "domain": "system-programming",
    "difficulty": "advanced",
    "duration_hours": 40,
    "skills": [
      "compilers",
      "lexing",
      "parsing",
      "ast",
      "ir-generation"
    ]
  },
  {
    "title": "High-Performance Computing",
    "description": "SIMD intrinsics, cache-friendly data structures, branch prediction, profiling (perf, VTune), and squeezing maximum throughput from hardware.",
    "domain": "system-programming",
    "difficulty": "advanced",
    "duration_hours": 35,
    "skills": [
      "hpc",
      "simd",
      "cache-optimization",
      "profiling",
      "vtune"
    ]
  },
  {
    "title": "SQL Mastery",
    "description": "SELECT, JOINs, aggregations, window functions, CTEs, indexes, and writing complex queries across PostgreSQL, MySQL, and SQLite.",
    "domain": "databases",
    "difficulty": "beginner",
    "duration_hours": 20,
    "skills": [
      "sql",
      "queries",
      "joins",
      "window-functions",
      "indexes"
    ]
  },
  {
    "title": "PostgreSQL Advanced",
    "description": "EXPLAIN ANALYZE, index tuning, partitioning, PL/pgSQL, JSONB, logical replication, and operating Postgres in production.",
    "domain": "databases",
    "difficulty": "intermediate",
    "duration_hours": 25,
    "skills": [
      "postgresql",
      "plpgsql",
      "query-optimization",
      "partitioning",
      "replication"
    ]
  },
  {
    "title": "MongoDB & NoSQL",
    "description": "Document model, BSON, aggregation pipeline, indexing strategies, transactions, and Atlas for managed MongoDB deployments.",
    "domain": "databases",
    "difficulty": "intermediate",
    "duration_hours": 20,
    "skills": [
      "mongodb",
      "nosql",
      "document-db",
      "aggregation-pipeline",
      "atlas"
    ]
  },
  {
    "title": "Redis & Caching Strategies",
    "description": "Data structures, persistence modes, pub/sub, Lua scripting, cache eviction policies, and Redis Cluster for high availability.",
    "domain": "databases",
    "difficulty": "intermediate",
    "duration_hours": 15,
    "skills": [
      "redis",
      "caching",
      "pub-sub",
      "lua-scripting",
      "eviction"
    ]
  },
  {
    "title": "Database Design & Normalization",
    "description": "Entity-relationship modelling, 1NF-3NF/BCNF, schema design trade-offs, and translating business requirements to efficient schemas.",
    "domain": "databases",
    "difficulty": "intermediate",
    "duration_hours": 20,
    "skills": [
      "db-design",
      "normalization",
      "erd",
      "schema-design"
    ]
  },
  {
    "title": "Distributed Databases & Consistency",
    "description": "CAP theorem, eventual consistency, Cassandra, CockroachDB, Spanner, and designing globally distributed data systems.",
    "domain": "databases",
    "difficulty": "advanced",
    "duration_hours": 30,
    "skills": [
      "distributed-systems",
      "cap-theorem",
      "cassandra",
      "consistency"
    ]
  },
  {
    "title": "Blockchain Fundamentals",
    "description": "Distributed ledgers, consensus mechanisms (PoW, PoS), cryptographic hashing, Merkle trees, and how Bitcoin and Ethereum work.",
    "domain": "blockchain",
    "difficulty": "beginner",
    "duration_hours": 20,
    "skills": [
      "blockchain",
      "distributed-ledger",
      "consensus",
      "cryptographic-hashing"
    ]
  },
  {
    "title": "Solidity & Smart Contracts",
    "description": "Solidity syntax, contract lifecycle, events, modifiers, gas optimization, and deploying contracts to Ethereum testnets.",
    "domain": "blockchain",
    "difficulty": "intermediate",
    "duration_hours": 30,
    "skills": [
      "solidity",
      "ethereum",
      "smart-contracts",
      "gas-optimization",
      "hardhat"
    ]
  },
  {
    "title": "Web3.js & Ethers.js",
    "description": "Connecting dApps to wallets (MetaMask), reading/writing contract state, signing transactions, and building Web3 frontends.",
    "domain": "blockchain",
    "difficulty": "intermediate",
    "duration_hours": 20,
    "skills": [
      "web3",
      "ethers",
      "dapp",
      "metamask",
      "wagmi"
    ]
  },
  {
    "title": "NFT & Marketplace Development",
    "description": "ERC-721 and ERC-1155 standards, IPFS metadata, building an NFT mint site, and creating a fully on-chain marketplace.",
    "domain": "blockchain",
    "difficulty": "intermediate",
    "duration_hours": 25,
    "skills": [
      "nft",
      "erc721",
      "erc1155",
      "ipfs",
      "marketplace"
    ]
  },
  {
    "title": "DeFi Protocol Development",
    "description": "AMM mechanics, liquidity pools, yield farming, flash loans, protocol security (reentrancy, oracle attacks), and auditing DeFi code.",
    "domain": "blockchain",
    "difficulty": "advanced",
    "duration_hours": 35,
    "skills": [
      "defi",
      "amm",
      "liquidity-pools",
      "flash-loans",
      "protocol-security"
    ]
  },
  {
    "title": "LLM APIs & Prompt Engineering",
    "description": "Calling OpenAI, Gemini, and Anthropic APIs, crafting effective prompts, few-shot examples, chain-of-thought, and output parsing.",
    "domain": "ai-engineering",
    "difficulty": "beginner",
    "duration_hours": 15,
    "skills": [
      "llm-apis",
      "prompt-engineering",
      "openai",
      "gemini",
      "chain-of-thought"
    ]
  },
  {
    "title": "RAG Systems & Vector Databases",
    "description": "Embeddings, chunking strategies, vector stores (Pinecone, pgvector, Qdrant), retrieval-augmented generation pipelines, and evaluation.",
    "domain": "ai-engineering",
    "difficulty": "intermediate",
    "duration_hours": 25,
    "skills": [
      "rag",
      "vector-db",
      "embeddings",
      "pinecone",
      "pgvector"
    ]
  },
  {
    "title": "AI Agents & Tool Use",
    "description": "Agentic loops, function/tool calling, planning, memory systems, multi-agent orchestration, and building autonomous AI workflows.",
    "domain": "ai-engineering",
    "difficulty": "intermediate",
    "duration_hours": 25,
    "skills": [
      "ai-agents",
      "function-calling",
      "tool-use",
      "planning",
      "multi-agent"
    ]
  },
  {
    "title": "LangChain & LlamaIndex",
    "description": "Chains, agents, document loaders, text splitters, and building production-grade LLM applications with LangChain and LlamaIndex.",
    "domain": "ai-engineering",
    "difficulty": "intermediate",
    "duration_hours": 20,
    "skills": [
      "langchain",
      "llamaindex",
      "chains",
      "agents",
      "document-loaders"
    ]
  },
  {
    "title": "AI Safety & Alignment",
    "description": "Alignment research overview, RLHF, Constitutional AI, red-teaming, bias evaluation, and responsible AI deployment practices.",
    "domain": "ai-engineering",
    "difficulty": "intermediate",
    "duration_hours": 15,
    "skills": [
      "ai-safety",
      "alignment",
      "rlhf",
      "red-teaming",
      "responsible-ai"
    ]
  },
  {
    "title": "Fine-Tuning Language Models",
    "description": "LoRA, QLoRA, PEFT, dataset preparation, training on custom data with Hugging Face Transformers, and evaluating fine-tuned models.",
    "domain": "ai-engineering",
    "difficulty": "advanced",
    "duration_hours": 30,
    "skills": [
      "fine-tuning",
      "lora",
      "qlora",
      "peft",
      "huggingface"
    ]
  },
  {
    "title": "Multimodal AI Applications",
    "description": "Vision-language models, image generation, audio understanding, video analysis, and building applications with Gemini and GPT-4V.",
    "domain": "ai-engineering",
    "difficulty": "advanced",
    "duration_hours": 30,
    "skills": [
      "multimodal",
      "vision-language",
      "image-generation",
      "gemini",
      "gpt-4v"
    ]
  },
  {
    "title": "UI/UX Design Fundamentals",
    "description": "Design thinking, user research methods, information architecture, wireframing, and the principles behind great user experiences.",
    "domain": "design",
    "difficulty": "beginner",
    "duration_hours": 20,
    "skills": [
      "ux",
      "ui",
      "user-research",
      "wireframing",
      "design-thinking"
    ]
  },
  {
    "title": "Figma for Designers & Developers",
    "description": "Frames, auto-layout, components, variables, prototyping, developer handoff, and collaborative design workflows in Figma.",
    "domain": "design",
    "difficulty": "beginner",
    "duration_hours": 15,
    "skills": [
      "figma",
      "prototyping",
      "auto-layout",
      "components",
      "design-tools"
    ]
  },
  {
    "title": "User Research & Usability Testing",
    "description": "Interviews, surveys, card sorting, usability studies, A/B testing, and synthesising research into actionable design insights.",
    "domain": "design",
    "difficulty": "intermediate",
    "duration_hours": 20,
    "skills": [
      "user-research",
      "usability-testing",
      "interviews",
      "ab-testing"
    ]
  },
  {
    "title": "Design Systems & Component Libraries",
    "description": "Atomic design, token-based theming, building reusable component libraries with Storybook, and maintaining design-to-code consistency.",
    "domain": "design",
    "difficulty": "intermediate",
    "duration_hours": 20,
    "skills": [
      "design-systems",
      "atomic-design",
      "storybook",
      "design-tokens"
    ]
  },
  {
    "title": "Motion Design & Micro-animations",
    "description": "Easing curves, timing principles, After Effects, Lottie, CSS animations, and using motion to guide attention and delight users.",
    "domain": "design",
    "difficulty": "intermediate",
    "duration_hours": 15,
    "skills": [
      "motion-design",
      "animations",
      "after-effects",
      "lottie",
      "css-animations"
    ]
  }
]

const prerequisiteEdges = {
  "Game Mathematics & Linear Algebra": [
    "C++ for Game Development"
  ],
  "Unity Game Engine Fundamentals": [
    "C# for Unity Developers"
  ],
  "Unreal Engine 5 Fundamentals": [
    "C++ for Game Development",
    "Game Mathematics & Linear Algebra"
  ],
  "Game Physics & Collision Detection": [
    "C++ for Game Development",
    "Game Mathematics & Linear Algebra"
  ],
  "3D Rendering Pipeline & Graphics": [
    "C++ for Game Development",
    "Game Mathematics & Linear Algebra"
  ],
  "HLSL & GLSL Shader Programming": [
    "Game Mathematics & Linear Algebra",
    "3D Rendering Pipeline & Graphics"
  ],
  "Game AI & Pathfinding": [
    "C++ for Game Development",
    "Game Mathematics & Linear Algebra"
  ],
  "Multiplayer Game Networking": [
    "C++ for Game Development"
  ],
  "Unreal Engine 5 Advanced C++": [
    "Unreal Engine 5 Fundamentals"
  ],
  "DirectX 12 & Vulkan Low-Level Graphics": [
    "3D Rendering Pipeline & Graphics",
    "HLSL & GLSL Shader Programming"
  ],
  "Game Optimization & Profiling": [
    "Unreal Engine 5 Fundamentals"
  ],
  "Console Game Development": [
    "Unreal Engine 5 Advanced C++"
  ],
  "Data Analysis with Pandas": [
    "Python Fundamentals"
  ],
  "Data Visualization": [
    "Data Analysis with Pandas"
  ],
  "Statistics for Data Science": [
    "Python Fundamentals"
  ],
  "Machine Learning Foundations": [
    "Python Fundamentals",
    "Data Analysis with Pandas",
    "Statistics for Data Science"
  ],
  "Deep Learning with TensorFlow": [
    "Machine Learning Foundations",
    "Data Analysis with Pandas"
  ],
  "Applied Machine Learning Project": [
    "Machine Learning Foundations"
  ],
  "Natural Language Processing": [
    "Python Fundamentals",
    "Machine Learning Foundations"
  ],
  "Time Series Analysis": [
    "Python Fundamentals",
    "Data Analysis with Pandas"
  ],
  "Feature Engineering & Selection": [
    "Data Analysis with Pandas",
    "Machine Learning Foundations"
  ],
  "MLOps & Model Deployment": [
    "Applied Machine Learning Project"
  ],
  "Kaggle Competition Strategies": [
    "Machine Learning Foundations",
    "Feature Engineering & Selection"
  ],
  "JavaScript Essentials": [
    "HTML & CSS Foundations"
  ],
  "React Development": [
    "JavaScript Essentials",
    "HTML & CSS Foundations"
  ],
  "Full-Stack Web Development": [
    "React Development"
  ],
  "TypeScript Fundamentals": [
    "JavaScript Essentials"
  ],
  "Next.js & Server-Side Rendering": [
    "React Development",
    "TypeScript Fundamentals"
  ],
  "GraphQL APIs": [
    "JavaScript Essentials"
  ],
  "Web Performance Optimization": [
    "HTML & CSS Foundations",
    "JavaScript Essentials"
  ],
  "Frontend Testing with Jest & Cypress": [
    "JavaScript Essentials",
    "React Development"
  ],
  "Web Accessibility": [
    "HTML & CSS Foundations"
  ],
  "Serverless Applications": [
    "Cloud Basics with AWS"
  ],
  "Kubernetes & Container Orchestration": [
    "Docker & Containerization",
    "Cloud Basics with AWS"
  ],
  "Infrastructure as Code with Terraform": [
    "Cloud Basics with AWS"
  ],
  "Cloud Security & Compliance": [
    "Cloud Basics with AWS"
  ],
  "FinOps & Cloud Cost Optimization": [
    "Cloud Basics with AWS"
  ],
  "Bash Scripting & Automation": [
    "Linux for Developers"
  ],
  "Docker & Containerization": [
    "Linux for Developers"
  ],
  "CI/CD Pipelines with GitHub Actions": [
    "Docker & Containerization"
  ],
  "Monitoring & Observability": [
    "Docker & Containerization"
  ],
  "DevSecOps": [
    "CI/CD Pipelines with GitHub Actions"
  ],
  "Site Reliability Engineering": [
    "Monitoring & Observability",
    "Kubernetes & Container Orchestration"
  ],
  "Platform Engineering": [
    "Kubernetes & Container Orchestration",
    "CI/CD Pipelines with GitHub Actions"
  ],
  "SwiftUI for iOS": [
    "Swift & iOS Development"
  ],
  "React Native Development": [
    "JavaScript Essentials"
  ],
  "Mobile App Architecture": [
    "Swift & iOS Development"
  ],
  "App Store Deployment & Monetization": [
    "Swift & iOS Development"
  ],
  "Mobile App Testing & QA": [
    "Swift & iOS Development"
  ],
  "Linux for Security": [
    "Linux for Developers"
  ],
  "OWASP Top 10 & Web Security": [
    "Network Security Fundamentals"
  ],
  "Cryptography Fundamentals": [
    "Network Security Fundamentals"
  ],
  "Ethical Hacking & Penetration Testing": [
    "Network Security Fundamentals",
    "Linux for Security"
  ],
  "SOC Analyst & Threat Hunting": [
    "Network Security Fundamentals",
    "Cryptography Fundamentals"
  ],
  "Secure Coding Practices": [
    "OWASP Top 10 & Web Security"
  ],
  "Cloud Security Architecture": [
    "Cloud Security & Compliance",
    "Network Security Fundamentals"
  ],
  "Advanced C++ Programming": [
    "C Programming Fundamentals"
  ],
  "Rust Programming Language": [
    "C Programming Fundamentals"
  ],
  "Operating Systems Internals": [
    "C Programming Fundamentals"
  ],
  "Concurrency & Parallel Programming": [
    "Operating Systems Internals"
  ],
  "Embedded Systems Programming": [
    "C Programming Fundamentals"
  ],
  "Compiler Design & Interpreters": [
    "Advanced C++ Programming",
    "Operating Systems Internals"
  ],
  "High-Performance Computing": [
    "Concurrency & Parallel Programming",
    "Advanced C++ Programming"
  ],
  "PostgreSQL Advanced": [
    "SQL Mastery"
  ],
  "Database Design & Normalization": [
    "SQL Mastery"
  ],
  "Distributed Databases & Consistency": [
    "PostgreSQL Advanced",
    "MongoDB & NoSQL"
  ],
  "Solidity & Smart Contracts": [
    "Blockchain Fundamentals",
    "JavaScript Essentials"
  ],
  "Web3.js & Ethers.js": [
    "Solidity & Smart Contracts"
  ],
  "NFT & Marketplace Development": [
    "Solidity & Smart Contracts"
  ],
  "DeFi Protocol Development": [
    "Solidity & Smart Contracts"
  ],
  "LLM APIs & Prompt Engineering": [
    "Python Fundamentals"
  ],
  "RAG Systems & Vector Databases": [
    "LLM APIs & Prompt Engineering",
    "Python Fundamentals"
  ],
  "AI Agents & Tool Use": [
    "LLM APIs & Prompt Engineering"
  ],
  "LangChain & LlamaIndex": [
    "LLM APIs & Prompt Engineering",
    "Python Fundamentals"
  ],
  "AI Safety & Alignment": [
    "LLM APIs & Prompt Engineering"
  ],
  "Fine-Tuning Language Models": [
    "Machine Learning Foundations",
    "Deep Learning with TensorFlow"
  ],
  "Multimodal AI Applications": [
    "LLM APIs & Prompt Engineering",
    "Deep Learning with TensorFlow"
  ],
  "Figma for Designers & Developers": [
    "UI/UX Design Fundamentals"
  ],
  "User Research & Usability Testing": [
    "UI/UX Design Fundamentals"
  ],
  "Design Systems & Component Libraries": [
    "Figma for Designers & Developers"
  ],
  "Motion Design & Micro-animations": [
    "Figma for Designers & Developers"
  ]
}

console.log('Seeding ' + courses.length + ' courses across 12 domains...')

const { data: existingRows, error: fetchError } = await supabase
  .from('courses')
  .select('id, title')

if (fetchError) {
  console.error('Failed to fetch existing courses:', fetchError.message)
  process.exit(1)
}

const idByTitle = new Map()
for (const row of existingRows ?? []) {
  idByTitle.set(row.title, row.id)
}

let insertedCount = 0
let updatedCount = 0

for (const course of courses) {
  const existingCourse = existingRows?.find((r) => r.title === course.title)
  const payload = {
    description: course.description,
    domain: course.domain,
    difficulty: course.difficulty,
    duration_hours: course.duration_hours,
    skills: course.skills,
  }

  const { data, error } = existingCourse
    ? await supabase.from('courses').update(payload).eq('id', existingCourse.id).select('id')
    : await supabase.from('courses').insert({ title: course.title, ...payload }).select('id')

  if (error) {
    console.error('Failed to write course "' + course.title + '":', error.message)
    process.exit(1)
  }

  const row = Array.isArray(data) ? data[0] : data
  const courseId = row?.id ?? existingCourse?.id
  if (courseId) idByTitle.set(course.title, courseId)

  if (existingCourse) {
    updatedCount += 1
    console.log('  updated:  ' + course.title)
  } else {
    insertedCount += 1
    console.log('  inserted: ' + course.title)
  }
}

const { data: afterRows, error: refetchError } = await supabase
  .from('courses')
  .select('id, title')

if (refetchError) {
  console.error('Failed to re-fetch courses:', refetchError.message)
  process.exit(1)
}

idByTitle.clear()
for (const row of afterRows ?? []) {
  idByTitle.set(row.title, row.id)
}

const { error: deleteEdgesError } = await supabase
  .from('prerequisites')
  .delete()
  .neq('course_id', '00000000-0000-0000-0000-000000000000')

if (deleteEdgesError) {
  console.error('Failed to clear prerequisite edges:', deleteEdgesError.message)
  process.exit(1)
}

let edgeCount = 0
for (const [courseTitle, prereqTitles] of Object.entries(prerequisiteEdges)) {
  const courseId = idByTitle.get(courseTitle)
  if (!courseId) {
    console.warn('  Skipping edges for unknown course "' + courseTitle + '"')
    continue
  }
  for (const prereqTitle of prereqTitles) {
    const prereqId = idByTitle.get(prereqTitle)
    if (!prereqId) {
      console.warn('  Skipping unknown prerequisite "' + prereqTitle + '"')
      continue
    }
    const { error } = await supabase.from('prerequisites').insert({
      course_id: courseId,
      prerequisite_course_id: prereqId,
    })
    if (error) {
      console.error('Failed to add edge ' + courseTitle + ' <- ' + prereqTitle + ':', error.message)
      process.exit(1)
    }
    edgeCount += 1
  }
}

console.log(
  '\\nDone. ' + insertedCount + ' inserted, ' + updatedCount + ' updated, ' + edgeCount + ' prerequisite edges created.'
)
console.log('Next step: node scripts/embed-catalog.js')
