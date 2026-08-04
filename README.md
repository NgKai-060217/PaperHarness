# OpenHarness - AI Academic & Computational Guardrail SaaS Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-v19.0-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.8-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-v4.21-000000?logo=express&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.1-38B2AC?logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green.svg)

OpenHarness is an enterprise-grade AI SaaS dashboard and computational cost-guardrail platform. It enables research institutions, academic labs, and software organizations to set real-time financial spending ceilings, execute AI text transformations, and track audit telemetry across compute jobs with automatic Scale-To-Zero protection.

---

## 🌟 Key Features

- 🛡️ **Financial Guardrail Controls**: Set custom daily spending limits and hard per-job limits with double-verification algorithms to prevent compute budget runaways.
- ⚡ **Scale-To-Zero Automatic Protection**: Instant circuit breaker mechanism that suspends background processes the millisecond cost limits or safety thresholds are reached.
- 🤖 **Multi-Provider AI Fallback Pipeline**: Built-in support for Google AI Studio Gemini API (`@google/genai`), OpenRouter, and DeepSeek backends for high availability and low latency.
- 📄 **Academic Manuscript Processor**: Real-time academic abstract rewriting, summarizing, grammar polishing, and plagiarism risk estimation.
- 📊 **Audit & Compliance Telemetry**: Interactive visual analytics featuring spending charts, average latency gauges, and downloadable CSV audit logs.
- 💎 **Premium AI SaaS UI/UX**: Ultra-sleek dark mode interface designed with glassmorphism, responsive mobile/desktop navigation, and fluid animations using `motion`.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (TypeScript)
- **Styling**: Tailwind CSS v4 with custom glassmorphism design system
- **Icons**: Lucide React (`lucide-react`)
- **Animations**: Motion (`motion/react`)
- **Build Tool**: Vite 6

### Backend & Core Engine
- **Runtime**: Node.js with TypeScript (`tsx`)
- **Web Server**: Express 4 (integrated with Vite middleware in development)
- **AI Integration**: `@google/genai` (Google AI Studio SDK)
- **Parsing**: `mammoth` (DOCX), `pdf-parse` (PDF)
- **Build & Bundle**: `esbuild` for CJS production bundling

---

## 📁 Directory Structure

```text
├── server.ts               # Backend Express entry point & AI completion endpoints
├── database_store.json     # Persistent local JSON data store (git-ignored)
├── metadata.json           # Application metadata & permissions configuration
├── .env.example            # Environment variable template
├── index.html              # Frontend HTML entry point
├── src/
│   ├── App.tsx             # Main React application component & navigation layout
│   ├── index.css           # Global CSS, typography, and dark theme variables
│   ├── components/
│   │   ├── BudgetSetup.tsx # Financial guardrail configuration dashboard
│   │   ├── JobProcessor.tsx # Academic paper draft processor & AI completion pane
│   │   └── ReportingView.tsx # Analytics, charts, and comprehensive audit logs
│   └── main.tsx            # React DOM client entry point
└── dist/                   # Production build outputs
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.x or higher
- **Package Manager**: npm or bun

### 1. Installation

Clone the repository and install all dependencies:

```bash
git clone https://github.com/your-username/openharness-ai.git
cd openharness-ai
npm install
```

### 2. Environment Setup

Create a `.env` file at the root of the project based on `.env.example`:

```bash
cp .env.example .env
```

Add your active API credentials to `.env`:

```env
GEMINI_API_KEY=your_google_ai_studio_api_key_here
# Optional fallback providers:
OPENROUTER_API_KEY=your_openrouter_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### 3. Development Mode

Start the full-stack dev server (Express + Vite HMR on port 3000):

```bash
npm run dev
```

Open your browser at `http://localhost:3000`.

### 4. Production Build & Execution

To compile the backend server and static React bundle for deployment:

```bash
# Build the client & server bundle
npm run build

# Start the production server
npm run start
```

---

## 🔌 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/status` | `GET` | Retrieve active budget guardrail status, consumption metrics, and gateway state |
| `/api/budget` | `POST` | Update daily spending limits and per-job financial caps |
| `/api/process` | `POST` | Submit an academic text draft for AI processing (rewriting, summarizing, etc.) |
| `/api/jobs` | `GET` | Fetch audit logs and historical processing transactions |
| `/api/reset-db` | `POST` | Reset the local JSON database store to initial state |

---

## 🛡️ Financial Guardrails & Safety Architecture

1. **Pre-Execution Check**: Every request sent to `/api/process` checks current daily spending against user-defined hard caps.
2. **Circuit Breaker**: If `budgetUsed >= dailyBudgetLimit`, the request is rejected immediately with a `403 Scale-to-Zero Triggered` response.
3. **Atomic Logging**: After every successful completion, token length and computed dollar cost are atomically written to `database_store.json`.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Crafted with precision for AI SaaS research workflows.
</p>
