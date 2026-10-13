# Changelog

All notable changes to **NovaPad** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-13

### Added
- **Interactive Dual-Page Flipbook Reader**:
  - Realistic two-page open book reading experience with 3D turning leaf animations and realistic sound effects.
  - Bidirectional lockstep scroll synchronization ensuring left and right pages move simultaneously with proportional alignment.
  - Multi-theme book typography engine (High-contrast Modern Dark, Authentic Paper, Warm Reading Sepia).
  - High-visibility typography system with configurable font scaling (Normal 16.5px, Large 19px, X-Large 22px) and font families (Inter, Merriweather).
  - Curriculum chapter selection dropdown and Course Table of Contents jump modal.
  - Interactive callout banners for pedagogical moments (Key Takeaways, Try It Yourself, Good Programming Habits, Watch Out warnings, Level-Up Challenges).
  - One-click copyable inline code chips and syntax-highlighted code blocks with "Insert into IDE" shortcuts.
  - Zoomable high-resolution technical diagrams with modal inspection.

- **Unified Multi-Language Web IDE**:
  - Full-featured Monaco Editor integration with multi-tab workspace, line numbers, folding, and syntax highlighting.
  - Browser-first client-side Python execution via **Pyodide WebAssembly** inside an isolated Web Worker with live stdout/stderr streaming.
  - Browser-first relational SQL execution via **sql.js WebAssembly** with interactive tabular result rendering and CSV export.
  - Sandboxed Web Playground (`HTML/CSS/JavaScript`) running inside a secure null-origin `<iframe>` with bidirectional console bridging.
  - Central **Execution Manager** featuring intelligent language routing, timeout management, uncooperative worker cancellation, and normalized response contracts.
  - Offline-ready persistence powered by IndexedDB (`idb`) for projects, files, user preferences, and lesson progress.
  - Complete project import and export using JSZip (.zip).

- **Isolated Backend Execution Service**:
  - FastAPI backend service providing REST endpoints for health checks and sandboxed server workloads.
  - Isolated subprocess execution runner with scratch directory sandboxing and environment variable sanitization.
  - C/C++ compilation and execution pipeline with automatic toolchain discovery and compiler diagnostic capture.
  - Docker containerization configuration with unprivileged user restrictions and resource limits.

- **Repository & Engineering Architecture**:
  - Comprehensive unit test suites across frontend (Vitest) and backend (pytest) with 100% passing tests.
  - Modular documentation suite covering system architecture, development guide, API reference, runtime matrix, security controls, and troubleshooting.
  - GitHub Actions CI workflow for continuous automated testing and build validation.
