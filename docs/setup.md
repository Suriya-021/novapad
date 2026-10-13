# IDE Setup & Quickstart Guide

## Prerequisites

- **Node.js**: v18+ (verified on v24)
- **npm**: v9+ (verified on v11)
- **Python**: 3.10+ (for FastAPI backend runner)
- Optional: Docker (for containerized backend execution)

---

## 1. Running the Frontend (Browser-First IDE)

1. Open a terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open the URL shown by Vite (typically `http://localhost:5173`) in modern browsers (Chrome, Firefox, Safari, Edge).
3. The IDE will automatically initialize:
   - Python environment with **Pyodide in a dedicated Web Worker**
   - SQLite relational database with **sql.js WebAssembly**
   - Web Playground with **sandboxed iframe preview**
   - IndexedDB local storage with preloaded starter projects

---

## 2. Running the Backend Execution Service (FastAPI)

For server-side C/C++ compilation and isolated backend tasks:

### Option A: Local Python Environment
```bash
# From workspace root
python -m venv venv
.\venv\Scripts\activate      # Windows
# or source venv/bin/activate  # macOS / Linux

pip install -r backend/requirements.txt

# Run backend service
$env:PYTHONPATH = "backend"   # Windows PowerShell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Option B: Docker Container
```bash
cd infra
docker compose up --build
```

---

## 3. Running Verification Tests

### Frontend Tests (Vitest)
```bash
cd frontend
npm test
```

### Backend Tests (pytest)
```bash
$env:PYTHONPATH = "backend"
.\venv\Scripts\python -m pytest backend/tests
```
