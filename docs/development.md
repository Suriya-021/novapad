# NovaPad Development Guide

This guide provides instructions for setting up, developing, testing, and debugging NovaPad locally.

---

## 1. Prerequisites

Ensure your development environment meets the following requirements:

| Tool | Minimum Version | Recommended | Notes |
|------|-----------------|-------------|-------|
| **Node.js** | 18.0.0+ | 20.x or 22.x LTS | Runtime for frontend development server & build |
| **npm** | 9.0.0+ | 10.x+ | Package manager |
| **Python** | 3.10+ | 3.11+ or 3.12+ | Required for backend execution runner |
| **Git** | 2.30+ | Latest | Version control |
| **GCC / Clang** | Optional | Latest | Required only for native C/C++ execution testing |
| **Docker** | Optional | Latest | For containerized backend deployment |

---

## 2. Repository Structure

```text
novapad/
├── .github/                  # GitHub Actions CI workflows and issue templates
│   ├── workflows/ci.yml
│   └── ISSUE_TEMPLATE/
├── backend/                  # FastAPI backend execution service
│   ├── app/
│   │   ├── api/routes/       # Health, execution, curriculum routes
│   │   ├── core/             # Configuration & environment settings
│   │   ├── execution/        # Subprocess isolation runners
│   │   └── security/         # Resource limits & environment sanitization
│   ├── tests/                # Backend pytest suite
│   ├── Dockerfile            # Container definition
│   └── requirements.txt      # Python dependencies
├── docs/                     # Architectural & technical documentation
│   ├── assets/               # Logos, banners, diagrams
│   ├── api.md
│   ├── architecture.md
│   ├── development.md
│   ├── runtime-matrix.md
│   ├── security.md
│   └── troubleshooting.md
├── frontend/                 # React 19 + TypeScript + Vite frontend
│   ├── public/               # Static assets, WebAssembly binaries, diagrams
│   │   ├── images/chapter1/  # Curriculum diagram images
│   │   └── sql-wasm.wasm     # SQLite WebAssembly binary
│   ├── src/
│   │   ├── app/              # Top-level navigation header & view state
│   │   ├── coding/           # Contextual coding launcher & environments
│   │   ├── components/       # Monaco editor, file explorer, output panels
│   │   ├── learning/         # Flipbook reader, pages, themes, curriculum
│   │   ├── runtimes/         # Execution manager, Pyodide worker, sql.js, web
│   │   ├── storage/          # IndexedDB database repositories & starters
│   │   ├── tests/            # Vitest unit test suite
│   │   └── types/            # TypeScript domain interfaces
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── infra/                    # Docker Compose configuration
│   └── docker-compose.yml
├── screenshots/              # Genuine application interface screenshots
├── .editorconfig
├── .env.example
├── .gitignore
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
└── SECURITY.md
```

---

## 3. Quick Start (Running Locally)

### A. Start the Frontend (Vite)

```bash
cd frontend
npm install
npm run dev
```

The application will start on `http://127.0.0.1:5173`.

> [!NOTE]
> The browser-first runtimes (Python via Pyodide, SQLite via sql.js, and HTML/CSS/JS via sandboxed iframe) run **entirely client-side** without needing the backend running.

### B. Start the Backend Execution Service (FastAPI)

To execute C/C++ or server-side Python workloads:

**Windows (PowerShell)**:
```powershell
# From repository root
python -m venv venv
.\venv\Scripts\activate
pip install -r backend/requirements.txt

$env:PYTHONPATH = "backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**macOS / Linux**:
```bash
# From repository root
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

export PYTHONPATH="backend"
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Verify backend health at `http://127.0.0.1:8000/health`.

---

## 4. Running Verification Tests

### Frontend Unit Tests (Vitest)
```bash
cd frontend
npm test
```
To run tests in watch mode during development:
```bash
npx vitest
```

### Frontend Typechecking & Production Build
```bash
cd frontend
npm run build
```

### Frontend Linting (Oxlint)
```bash
cd frontend
npm run lint
```

### Backend Unit Tests (pytest)
```bash
# In repository root with virtual environment activated
# Windows PowerShell:
$env:PYTHONPATH = "backend"
pytest backend/tests -v

# macOS / Linux:
export PYTHONPATH="backend"
pytest backend/tests -v
```

---

## 5. IndexedDB & State Debugging

NovaPad stores projects, file buffers, user preferences, and curriculum progress in browser IndexedDB under the database name `antigravity-ide-db`.

To inspect or reset local state during development:
1. Open Chrome DevTools (`F12`).
2. Navigate to **Application** -> **Storage** -> **IndexedDB** -> `antigravity-ide-db`.
3. Inspect `projects`, `files`, `settings`, and `lessonProgress` object stores.
4. To wipe all state and reseed defaults, click **Delete database** and reload the page.
