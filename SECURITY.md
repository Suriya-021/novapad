# Security Policy

NovaPad takes the security of its interactive learning platform and multi-language code execution environment seriously.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Model & Boundary Controls

NovaPad executes arbitrary user-authored code. To ensure safety, all code execution is strictly segregated into three distinct security perimeters:

1. **Browser Web Worker Isolation (Python / Pyodide)**
   - Pyodide executes in an isolated Web Worker thread without access to the parent window, DOM, or local storage.
   - Long-running loops or malicious recursion are terminated cooperatively or preemptively via `Worker.terminate()`.

2. **Sandboxed Null-Origin Iframe (Web Playground)**
   - Web preview content (`HTML/CSS/JS`) runs inside an `<iframe>` configured with `sandbox="allow-scripts"`.
   - `allow-same-origin` is omitted, granting the guest preview a unique opaque null origin and preventing access to parent cookies, IndexedDB, or session data.

3. **Subprocess Isolation & Environment Sanitization (FastAPI Backend)**
   - The FastAPI API server **never** executes untrusted user code inside its own process.
   - Subprocesses are spawned in unique ephemeral directories with strict argument arrays (`shell=False`).
   - Host environment variables, API tokens, and sensitive system credentials are explicitly stripped via `get_restricted_environment()`.
   - Hard execution limits are enforced: 25-second maximum timeout, 256 KB output truncation ceiling, and 512 KB source size limit.

## Reporting a Vulnerability

If you discover a security vulnerability in NovaPad, please do **not** open a public issue. Instead, follow responsible disclosure:

1. Email our security team directly or use GitHub Private Vulnerability Reporting.
2. Provide a detailed description of the vulnerability, including:
   - Steps to reproduce or proof-of-concept code.
   - The affected component (Frontend Web Worker, Iframe Sandbox, or Backend Runner).
   - Potential impact.
3. We will acknowledge receipt within 48 hours and provide an estimated timeline for remediation.
4. Once a patch is released, you will be credited in the security advisory (unless you request anonymity).
