# Contributing to NovaPad

Thank you for your interest in contributing to NovaPad! We welcome bug reports, documentation enhancements, feature requests, and code contributions.

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and respectful environment for everyone. Please treat all contributors with kindness, empathy, and professional courtesy.

---

## Development Setup

### Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **Python**: 3.10 or higher
- Optional: **GCC / Clang** (for native C/C++ backend compilation) or **Docker**

### Step-by-Step Local Setup

1. **Fork and Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/novapad.git
   cd novapad
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The frontend will be accessible at `http://localhost:5173`.

3. **Backend Setup (Optional for C/C++ & Server Workloads)**:
   ```bash
   # From repository root
   python -m venv venv
   .\venv\Scripts\activate      # Windows PowerShell
   # source venv/bin/activate    # Linux / macOS

   pip install -r backend/requirements.txt
   $env:PYTHONPATH = "backend"   # Windows
   # export PYTHONPATH="backend" # Linux / macOS

   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

---

## Coding Standards & Quality Gates

Before submitting a Pull Request, verify that all quality gates pass:

1. **Run Frontend Tests**:
   ```bash
   cd frontend
   npm test
   ```

2. **Run Frontend Linter & Typecheck**:
   ```bash
   cd frontend
   npm run lint
   npm run build
   ```

3. **Run Backend Tests**:
   ```bash
   # In repository root with virtual environment activated
   pytest backend/tests
   ```

---

## Pull Request Guidelines

1. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Commit Conventions**:
   Follow Conventional Commits:
   - `feat: add interactive quiz block to flipbook`
   - `fix: resolve scroll desync on high refresh rate monitors`
   - `docs: update backend setup instructions`
   - `test: add unit tests for execution manager timeout`

3. **Submit Your Pull Request**:
   - Provide a clear description of the changes and motivation.
   - Reference any related issue numbers (e.g., `Fixes #42`).
   - Confirm that all existing tests pass and new tests cover added functionality.
