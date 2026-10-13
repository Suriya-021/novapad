import { Project } from '../types/project';

export const STARTER_PYTHON_PROJECT: Project = {
  id: 'starter-python',
  name: 'Python Analytics & Algorithms',
  template: 'python',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  activeFileId: 'main-py',
  openFileIds: ['main-py', 'utils-py', 'data-txt'],
  files: [
    {
      id: 'main-py',
      name: 'main.py',
      path: 'main.py',
      language: 'python',
      content: `# Python Browser Execution via Pyodide Web Worker
# Reads local project file data.txt, runs algorithms and analytics

import math
from utils import calculate_stats

def run_demonstration():
    print("=== Pyodide Python Runner (In-Worker Execution) ===")
    
    # 1. Math calculations
    fib = [0, 1]
    for i in range(2, 10):
        fib.append(fib[-1] + fib[-2])
    print(f"Fibonacci Sequence: {fib}")

    # 2. Virtual File System Read
    try:
        with open("data.txt", "r") as f:
            raw_scores = [float(x.strip()) for x in f.readlines() if x.strip()]
            stats = calculate_stats(raw_scores)
            print(f"Read {len(raw_scores)} values from data.txt:")
            print(f" -> Mean: {stats['mean']:.2f}")
            print(f" -> Min: {stats['min']}")
            print(f" -> Max: {stats['max']}")
            print(f" -> StdDev: {stats['std_dev']:.2f}")
    except Exception as e:
        print(f"Error accessing VFS: {e}")

    print("\\nExecution finished successfully!")

if __name__ == "__main__":
    run_demonstration()
`,
    },
    {
      id: 'utils-py',
      name: 'utils.py',
      path: 'utils.py',
      language: 'python',
      content: `import math

def calculate_stats(numbers):
    if not numbers:
        return {"mean": 0, "min": 0, "max": 0, "std_dev": 0}
    mean = sum(numbers) / len(numbers)
    variance = sum((x - mean) ** 2 for x in numbers) / len(numbers)
    return {
        "mean": mean,
        "min": min(numbers),
        "max": max(numbers),
        "std_dev": math.sqrt(variance)
    }
`,
    },
    {
      id: 'data-txt',
      name: 'data.txt',
      path: 'data.txt',
      language: 'plaintext',
      content: `88.5
92.0
79.5
95.0
84.2
91.8
76.4
89.0
`,
    },
  ],
};

export const STARTER_SQL_PROJECT: Project = {
  id: 'starter-sql',
  name: 'SQLite Database Sandbox',
  template: 'sql',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  activeFileId: 'queries-sql',
  openFileIds: ['queries-sql', 'schema-sql'],
  files: [
    {
      id: 'queries-sql',
      name: 'queries.sql',
      path: 'queries.sql',
      language: 'sql',
      content: `-- Multi-statement SQLite query demo powered by sql.js (WebAssembly)
-- 1. Create tables and insert sample developer & project data
CREATE TABLE IF NOT EXISTS engineers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    experience_years INT NOT NULL,
    salary INT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    lead_id INT,
    status TEXT NOT NULL,
    budget INT NOT NULL,
    FOREIGN KEY(lead_id) REFERENCES engineers(id)
);

INSERT INTO engineers (name, role, experience_years, salary) VALUES
('Elena Rostova', 'Frontend Architect', 9, 145000),
('Marcus Chen', 'Backend Engineer', 7, 138000),
('Sophia Al-Mansoor', 'DevOps / Systems', 8, 142000),
('Liam O\\\'Connor', 'Compiler & WASM Specialist', 11, 160000),
('Aria Vance', 'Fullstack Engineer', 4, 115000);

INSERT INTO projects (title, lead_id, status, budget) VALUES
('Browser-First IDE', 1, 'In Progress', 85000),
('FastAPI Compiler Sandbox', 2, 'In Progress', 60000),
('WASM Pyodide Integration', 4, 'Completed', 45000),
('Distributed Cache Layer', 3, 'Planning', 50000);

-- 2. Query engineering budget allocations & leadership
SELECT 
    p.title AS project_name,
    p.status,
    p.budget,
    e.name AS lead_engineer,
    e.role AS lead_role,
    e.experience_years
FROM projects p
JOIN engineers e ON p.lead_id = e.id
ORDER BY p.budget DESC;

-- 3. Query role aggregations
SELECT 
    role,
    COUNT(*) AS engineer_count,
    ROUND(AVG(salary), 2) AS avg_salary,
    MAX(experience_years) AS max_exp
FROM engineers
GROUP BY role;
`,
    },
    {
      id: 'schema-sql',
      name: 'schema.sql',
      path: 'schema.sql',
      language: 'sql',
      content: `-- SQLite Schema Reference
-- You can run custom queries or inspect table definitions here.

SELECT name, sql FROM sqlite_master WHERE type='table';
`,
    },
  ],
};

export const STARTER_WEB_PROJECT: Project = {
  id: 'starter-web',
  name: 'Interactive Web Playground',
  template: 'web',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  activeFileId: 'index-html',
  openFileIds: ['index-html', 'styles-css', 'script-js'],
  files: [
    {
      id: 'index-html',
      name: 'index.html',
      path: 'index.html',
      language: 'html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Browser-First IDE Preview</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="card">
    <div class="badge">Sandboxed Preview</div>
    <h1>⚡ Real-time Web Playground</h1>
    <p>This document is rendered securely in an isolated, sandboxed iframe.</p>
    
    <div class="counter-box">
      <div class="count-display" id="count">0</div>
      <div class="button-group">
        <button id="decrement">-</button>
        <button id="increment" class="primary">+</button>
        <button id="reset">Reset</button>
      </div>
    </div>

    <div class="log-box">
      <strong>Event Feed:</strong>
      <div id="log-text">Click the buttons to trigger real JavaScript events.</div>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>
`,
    },
    {
      id: 'styles-css',
      name: 'styles.css',
      path: 'styles.css',
      language: 'css',
      content: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

body {
  background: #0f172a;
  color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 32px;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
  font-size: 11px;
  font-weight: 600;
  border-radius: 9999px;
  text-transform: uppercase;
  margin-bottom: 16px;
}

h1 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #ffffff;
}

p {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 24px;
}

.counter-box {
  background: #090d16;
  border: 1px solid #283548;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  margin-bottom: 20px;
}

.count-display {
  font-size: 42px;
  font-weight: 800;
  color: #38bdf8;
  margin-bottom: 16px;
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
}

button {
  background: #334155;
  color: #f8fafc;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

button:hover {
  background: #475569;
}

button.primary {
  background: #0284c7;
  color: #ffffff;
}

button.primary:hover {
  background: #0369a1;
}

.log-box {
  background: #111827;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  color: #9ca3af;
  border-left: 3px solid #38bdf8;
}
`,
    },
    {
      id: 'script-js',
      name: 'script.js',
      path: 'script.js',
      language: 'javascript',
      content: `let count = 0;
const countEl = document.getElementById('count');
const logEl = document.getElementById('log-text');

console.log("Interactive Web Playground loaded successfully!");

function update(newVal, action) {
  count = newVal;
  countEl.textContent = count;
  const msg = \`Action: \${action} -> Value is now \${count} at \${new Date().toLocaleTimeString()}\`;
  logEl.textContent = msg;
  console.log(msg);
}

document.getElementById('increment').addEventListener('click', () => {
  update(count + 1, 'INCREMENT');
});

document.getElementById('decrement').addEventListener('click', () => {
  update(count - 1, 'DECREMENT');
});

document.getElementById('reset').addEventListener('click', () => {
  update(0, 'RESET');
});
`,
    },
  ],
};

export const STARTER_CPP_PROJECT: Project = {
  id: 'starter-cpp',
  name: 'C/C++ Systems & Algorithms',
  template: 'cpp',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  activeFileId: 'main-cpp',
  openFileIds: ['main-cpp'],
  files: [
    {
      id: 'main-cpp',
      name: 'main.cpp',
      path: 'main.cpp',
      language: 'cpp',
      content: `// C++ Execution via Isolated Backend Runner
#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>

int main() {
    std::cout << "=== C++ Backend Sandbox Execution ===" << std::endl;
    
    std::vector<int> numbers = {12, 45, 78, 23, 56, 89, 90, 34};
    std::cout << "Original vector: ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << std::endl;
    
    std::sort(numbers.begin(), numbers.end());
    std::cout << "Sorted vector:   ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << std::endl;
    
    long long sum = std::accumulate(numbers.begin(), numbers.end(), 0LL);
    double avg = static_cast<double>(sum) / numbers.size();
    
    std::cout << "Sum: " << sum << ", Average: " << avg << std::endl;
    std::cout << "Program exited successfully with code 0." << std::endl;
    return 0;
}
`,
    },
  ],
};

export const DEFAULT_PROJECTS = [
  STARTER_PYTHON_PROJECT,
  STARTER_SQL_PROJECT,
  STARTER_WEB_PROJECT,
  STARTER_CPP_PROJECT,
];
