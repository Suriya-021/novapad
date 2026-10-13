# Runtime Support & Capabilities Matrix

| Language / Runtime | Execution Engine | Execution Location | Features & Capabilities |
|---|---|---|---|
| **Python** (`.py`) | Pyodide WebAssembly in Web Worker | **Browser (Client-side)** | Runs in isolated background worker without blocking UI; Virtual File System (VFS) mounting with synchronous file reads/writes; Stdout/Stderr streaming; Unresponsive worker timeout recovery & cancellation. |
| **SQL** (`.sql`) | sql.js (SQLite WebAssembly) | **Browser (Client-side)** | Full SQLite 3 in-memory engine; Multi-statement support; Relational queries, table creation, joins, aggregations; Interactive tabular result visualization; IndexedDB persistence across refreshes; Database reset button. |
| **Web** (`.html`, `.css`, `.js`) | Sandboxed `<iframe>` | **Browser (Client-side)** | Instant preview composition; Dedicated `blob:` document delivery with resource cleanup; Safe console capture bridge (`console.log`, `console.error`) and runtime JavaScript errors; Responsive live preview window. |
| **C / C++** (`.c`, `.cpp`) | GCC / Clang via FastAPI Sandbox | **Server (Isolated Worker)** | Isolated scratch directories (`tempfile`); Sanitized execution environment; Process timeout enforcement; Direct compiler diagnostic capture; Output truncation prevention. |
| **Server Python** (`python_server`) | Python 3 Subprocess Sandbox | **Server (Isolated Worker)** | For advanced workloads requiring server-side compute or native packages; Sandboxed filesystem with project file mount. |

---

## Cancellation & Timeout Model

1. **Python (Browser)**:
   - Worker termination is cooperative when idle.
   - For infinite loops (e.g., `while True: pass`), the Execution Manager automatically aborts the worker process via `worker.terminate()`, reconstructs a clean worker instance, and reports `timed_out` or `cancelled`.

2. **Web Sandbox (Browser)**:
   - Untrusted user scripts run inside an `iframe` with `sandbox="allow-scripts"` (strictly avoiding `allow-same-origin`).
   - The main React application DOM and IndexedDB remain unreachable to the guest script.

3. **Backend Sandboxing (Server)**:
   - Code is **never executed inside the main API server process**.
   - Subprocesses are executed using explicit argument lists (no shell injection), with memory, output limits, and process timeouts.
