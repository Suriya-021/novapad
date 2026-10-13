# Security Architecture & Boundary Controls

## 1. Threat Model & Philosophy

All user-submitted code is treated as **untrusted**. Security controls are enforced at both the client and server levels.

---

## 2. Browser Execution Boundary

1. **Web Worker Isolation (Python / Pyodide)**:
   - Pyodide executes in a dedicated Web Worker context.
   - Workers cannot access the parent application's DOM, `window`, `document`, or UI controls.
   - If an infinite loop or excessive computation occurs, the Execution Manager uses `Worker.prototype.terminate()` to destroy the uncooperative thread without freezing the React UI.

2. **Sandboxed Iframe Isolation (Web Playground)**:
   - The user application preview is hosted inside `<iframe sandbox="allow-scripts">`.
   - `allow-same-origin` is omitted so the iframe runs with a unique null origin, preventing access to the IDE's IndexedDB, localStorage, or cookies.
   - Message passing for console capture (`PREVIEW_CONSOLE`) sanitizes payloads before logging.
   - Blob URLs are strictly revoked upon each recompilation to prevent resource leaks.

---

## 3. Server Execution Boundary (FastAPI Backend)

1. **Out-of-Process Execution**:
   - The FastAPI web server **never executes untrusted code in its own process**.
   - All executions are launched in isolated subprocess workers with dedicated working directories (`tempfile.mkdtemp`).

2. **Environment Sanitization**:
   - Host secrets, API keys, and environment variables are stripped from the worker subprocess environment (`get_restricted_environment()`), passing only essential system paths (`PATH`, `SYSTEMROOT`, `TEMP`).

3. **No Shell Invocations**:
   - Subprocesses are spawned using list-based argument arrays without `shell=True` to eliminate shell injection vulnerabilities.

4. **Resource Constraints & Limits**:
   - Execution timeout: Clamped to a maximum of 25 seconds.
   - Output limits: Output buffers are truncated at 256 KB (`MAX_OUTPUT_BYTES`) to prevent memory exhaustion and terminal flooding attacks.
   - Payload limit: Request source code is rejected if exceeding 512 KB (`MAX_SOURCE_BYTES`).

5. **Container Sandbox (Docker)**:
   - When deployed via Docker, processes run as an unprivileged user (`ide_runner`, UID 1000).
   - `security_opt: no-new-privileges:true`, CPU quotas (`1.5`), memory ceiling (`512MB`), and process limit (`pids_limit: 100`) are applied.
