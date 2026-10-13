# NovaPad Runtime Capabilities Matrix

NovaPad supports both client-side WebAssembly runtimes (zero-install) and isolated server-side execution runners.

---

## 1. Capabilities Matrix

| Language / Environment | Extension | Execution Engine | Execution Location | Stdout/Stderr | Structured Result | Worker Timeout Recovery |
|---|---|---|---|:---:|:---:|:---:|
| **Python 3** | `.py` | Pyodide WebAssembly | **Browser (Client Web Worker)** | :white_check_mark: Live Stream | — | :white_check_mark: Automated |
| **SQLite 3** | `.sql` | sql.js (WebAssembly) | **Browser (Client In-Memory)** | :white_check_mark: Captured | :white_check_mark: Interactive Table Grid & CSV | :white_check_mark: Immediate |
| **Web Playground** | `.html`, `.css`, `.js` | Sandboxed Null-Origin `<iframe>` | **Browser (Client DOM Sandbox)** | :white_check_mark: Console Bridge | :white_check_mark: Live Rendered View | :white_check_mark: Non-blocking |
| **C / C++** | `.c`, `.cpp` | GCC / Clang via FastAPI Runner | **Server (Isolated Subprocess)** | :white_check_mark: Process Capture | — | :white_check_mark: 25s Ceiling |
| **Server Python** | `python_server` | Native Python 3 Subprocess | **Server (Isolated Subprocess)** | :white_check_mark: Process Capture | — | :white_check_mark: 25s Ceiling |
| **Scratch Visual Programming** | Visual Blocks | Canvas Stage + Interpreter | **Planned (Phase 2)** | — | — | — |
| **Blockly / Block Coding** | Visual Blocks | Blockly Engine | **Planned (Phase 3)** | — | — | — |

---

## 2. Execution Boundaries & Isolation Details

### Python (Pyodide in Dedicated Web Worker)
- Runs in a background Web Worker (`frontend/src/runtimes/python/python.worker.ts`).
- Maintains an in-memory Virtual File System (VFS) synchronized with active project files.
- If user code triggers an infinite loop (e.g. `while True:`), the Execution Manager automatically aborts the worker after the timeout threshold (default: 10s) using `worker.terminate()`, reconstructs a fresh worker instance, and restores responsiveness.

### SQL (sql.js SQLite WebAssembly)
- In-memory database initialization from SQLite 3 WebAssembly binary (`sql-wasm.wasm`).
- Executes multi-statement queries, table creation, joins, aggregations, and data modifications.
- Persists binary database state across user sessions in IndexedDB, with a one-click "Reset Database" action.

### Web Playground (HTML/CSS/JS)
- Sandboxed iframe with `sandbox="allow-scripts"` (strictly omitting `allow-same-origin`).
- Opaque null origin prevents reading or writing parent localStorage, IndexedDB, or cookies.
- Bidirectional messaging bridge intercepts `console.log`, `console.warn`, `console.error`, and runtime uncaught exceptions, redirecting them to the IDE's bottom output panel.

### C/C++ & Server Python (FastAPI Backend Sandbox)
- Spawns subprocesses in temporary scratch directories with sanitized environments.
- Enforces strict process timeouts (default: 10s, max: 25s) and maximum output buffers (256 KB) to prevent memory exhaustion attacks.
