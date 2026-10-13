# NovaPad Troubleshooting & FAQ

This document addresses common installation, runtime, and development issues encountered when working with NovaPad.

---

## 1. Frontend Issues

### Issue: Pyodide Web Worker Fails to Load or Times Out
**Symptom**: Running Python code hangs indefinitely or outputs `Web Worker failed to initialize`.
**Cause**:
- Pyodide WebAssembly bundles are fetched dynamically from the official CDN (`cdn.jsdelivr.net`). If the machine is behind an offline firewall or proxy that blocks CDN downloads, the worker initialization times out.
**Resolution**:
1. Check your internet connection or network firewall policies.
2. Inspect the browser Console (`F12`) for blocked CDN script requests.
3. For enterprise/offline air-gapped environments, download Pyodide v0.26+ binaries into `frontend/public/pyodide/` and configure the worker base URL to load locally.

---

### Issue: `Module not found` or Build Errors in Frontend
**Symptom**: `npm run build` fails with missing module errors.
**Resolution**:
1. Remove stale artifacts and reinstall cleanly:
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Verify you are using a supported Node.js version (`node -v` >= 18.0.0).

---

### Issue: Monaco Editor Syntax Highlighting or Web Workers Not Found
**Symptom**: Monaco editor loads in plain-text mode or throws a warning regarding web worker paths.
**Cause**: Vite bundling requires Monaco's web workers to be configured with appropriate worker loaders.
**Resolution**:
- NovaPad uses `@monaco-editor/react`, which dynamically pulls Monaco assets. Ensure that network requests to `cdn.jsdelivr.net/npm/monaco-editor/` are not blocked by ad-blockers or privacy extensions.

---

## 2. Backend & Runner Issues

### Issue: `ModuleNotFoundError: No module named 'app'` when running Pytest
**Symptom**: `pytest backend/tests` fails during collection with `No module named 'app'`.
**Cause**: Python needs `backend/` in its module search path (`sys.path`).
**Resolution**:
- Set the `PYTHONPATH` environment variable before executing pytest:
  - **Windows PowerShell**:
    ```powershell
    $env:PYTHONPATH = "backend"
    pytest backend/tests
    ```
  - **Windows CMD**:
    ```cmd
    set PYTHONPATH=backend
    pytest backend/tests
    ```
  - **macOS / Linux**:
    ```bash
    export PYTHONPATH="backend"
    pytest backend/tests
    ```

---

### Issue: `Compiler Toolchain Not Found (g++ / clang)` for C/C++ Execution
**Symptom**: Executing C or C++ code returns `Compiler Toolchain Not Found: g++ or clang must be installed on the host`.
**Cause**: The host machine running the FastAPI backend does not have GCC (`g++`) or Clang available in the system `PATH`.
**Resolution**:
- **Windows**: Install MinGW-w64 or LLVM, and add `bin/g++.exe` to your Windows System `PATH`.
- **Ubuntu / Debian**:
  ```bash
  sudo apt update && sudo apt install -y build-essential
  ```
- **macOS**:
  ```bash
  xcode-select --install
  ```
- Alternatively, run the backend via Docker, which includes pre-installed GCC:
  ```bash
  cd infra
  docker compose up --build
  ```

---

### Issue: Port Conflicts (`Port 5173` or `Port 8000` Already in Use)
**Symptom**: Vite starts on port `5174` instead of `5173`, or FastAPI throws `[Errno 10048] error while attempting to bind on address ('127.0.0.1', 8000)`.
**Resolution**:
1. Check which process is occupying the port:
   - **Windows**: `Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess`
   - **Linux / macOS**: `lsof -i :8000`
2. Terminate the stale background process or specify a different port:
   ```bash
   uvicorn app.main:app --port 8001
   ```
   If changing the backend port, update `VITE_BACKEND_URL` in `frontend/.env` to match.
