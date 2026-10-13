# NovaPad Backend REST API Reference

The NovaPad FastAPI backend provides endpoints for backend code execution, health checks, compiler discovery, and curriculum exploration.

Base URL: `http://127.0.0.1:8000`

---

## 1. System & Health Endpoints

### `GET /health`
Returns the operational health of the backend service and auto-detected system compiler toolchains.

#### Response (`200 OK`)
```json
{
  "status": "ok",
  "app": "NovaPad Execution Service",
  "version": "1.0.0",
  "compilers": {
    "gcc": true,
    "g++": true,
    "clang": false,
    "python": "3.11.8"
  }
}
```

---

## 2. Code Execution Endpoints

### `POST /api/v1/execute`
Executes user-submitted source code in a sandboxed subprocess with strict resource constraints.

#### Request Headers
- `Content-Type: application/json`

#### Request Body
```json
{
  "requestId": "req-9872-abc",
  "language": "python_server",
  "activeFile": "main.py",
  "source": "import math\nprint(f'Pi is approx {math.pi:.4f}')",
  "files": {
    "data.txt": "optional file content mounted into the sandbox"
  },
  "timeoutSeconds": 5
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `requestId` | `string` | Yes | Unique client-generated correlation ID. |
| `language` | `string` | Yes | Runtime identifier: `python_server`, `c`, or `cpp`. |
| `activeFile` | `string` | Yes | Entrypoint file name (e.g. `main.py`, `solution.cpp`). |
| `source` | `string` | Yes | Source code string (maximum size: 512 KB). |
| `files` | `object` | No | Additional files to mount in the isolated scratch directory. |
| `timeoutSeconds` | `integer` | No | Execution timeout ceiling (clamped between 1 and 25 seconds; default: 10s). |

#### Response (`200 OK` — Success)
```json
{
  "requestId": "req-9872-abc",
  "status": "success",
  "stdout": "Pi is approx 3.1416\n",
  "stderr": "",
  "exitCode": 0,
  "duration": 0.084
}
```

#### Response (`200 OK` — Execution / Compiler Error)
```json
{
  "requestId": "req-9872-abc",
  "status": "error",
  "stdout": "",
  "stderr": "solution.cpp: In function 'int main()':\nsolution.cpp:2:5: error: 'cout' was not declared in this scope\n",
  "exitCode": 1,
  "duration": 0.215,
  "error": "Compilation failed"
}
```

#### Response (`400 Bad Request` — Payload Exceeds Maximum Size)
```json
{
  "detail": "Source code exceeds maximum allowable size of 524288 bytes"
}
```

---

## 3. Curriculum Endpoints

### `GET /api/v1/curriculum/courses`
Retrieves available learning tracks and structured textbook chapters.

#### Response (`200 OK`)
```json
[
  {
    "id": "grade8-python",
    "title": "Grade 8: Introduction to Python Programming",
    "description": "Comprehensive interactive textbook covering Python basics from variables to algorithms.",
    "chapters": [
      {
        "id": "ch1-python-foundations",
        "title": "Chapter 1: Python Basics & Foundations",
        "totalPages": 26,
        "totalSections": 12
      }
    ]
  }
]
```
