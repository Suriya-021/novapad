// Dedicated Web Worker for Pyodide Python execution
/* eslint-disable no-restricted-globals */

interface WorkerExecutePayload {
  requestId: string;
  source: string;
  stdin?: string;
  files?: Record<string, string>;
}

// Global Pyodide interface
interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (options: { batched?: (text: string) => void }) => void;
  setStderr: (options: { batched?: (text: string) => void }) => void;
  FS: {
    writeFile: (path: string, data: string, opts?: { encoding: string }) => void;
    mkdir: (path: string) => void;
    unlink: (path: string) => void;
    analyzePath: (path: string) => { exists: boolean };
    cwd: () => string;
    chdir: (path: string) => void;
  };
}

let pyodideInstance: PyodideInterface | null = null;
let isInitializing = false;

async function loadPyodideRuntime(): Promise<PyodideInterface> {
  if (pyodideInstance) return pyodideInstance;
  if (isInitializing) {
    while (isInitializing) {
      await new Promise((r) => setTimeout(r, 100));
    }
    if (pyodideInstance) return pyodideInstance;
  }

  isInitializing = true;
  self.postMessage({ type: 'STATUS', status: 'initializing', message: 'Loading Pyodide WebAssembly runtime from CDN...' });

  try {
    const cdnUrl = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.mjs';
    const dynamicImport = new Function('url', 'return import(url)') as (
      url: string
    ) => Promise<{
      loadPyodide: (cfg: { indexURL: string }) => Promise<PyodideInterface>;
    }>;
    const pyodideModule = await dynamicImport(cdnUrl);

    const pyodide = await pyodideModule.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
    });

    // Configure Pyodide filesystem & Python import path
    await pyodide.runPythonAsync(`
import sys, os
cwd = os.getcwd()
if cwd not in sys.path:
    sys.path.insert(0, cwd)
if '/home/pyodide' not in sys.path:
    sys.path.insert(0, '/home/pyodide')
`);

    pyodideInstance = pyodide;
    isInitializing = false;
    self.postMessage({ type: 'STATUS', status: 'ready', message: 'Pyodide runtime initialized.' });
    return pyodide;
  } catch (err: unknown) {
    isInitializing = false;
    const msg = err instanceof Error ? err.message : String(err);
    self.postMessage({
      type: 'INIT_ERROR',
      message: `Failed to load Pyodide WebAssembly module (${msg}). Please verify internet access or firewall permissions.`,
    });
    throw err;
  }
}

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  if (type === 'INIT') {
    try {
      await loadPyodideRuntime();
      self.postMessage({ type: 'INIT_OK' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      self.postMessage({ type: 'INIT_ERROR', message: msg });
    }
    return;
  }

  if (type === 'EXECUTE') {
    const { requestId, source, stdin, files } = payload as WorkerExecutePayload;
    const startTime = performance.now();
    let stdoutBuffer = '';
    let stderrBuffer = '';

    try {
      const pyodide = await loadPyodideRuntime();

      // Setup output capture
      pyodide.setStdout({
        batched: (text: string) => {
          stdoutBuffer += text + '\n';
          self.postMessage({ type: 'STDOUT_STREAM', requestId, text });
        },
      });

      pyodide.setStderr({
        batched: (text: string) => {
          stderrBuffer += text + '\n';
          self.postMessage({ type: 'STDERR_STREAM', requestId, text });
        },
      });

      // Synchronize project files to virtual filesystem in both current dir and /home/pyodide
      if (files) {
        for (const [filePath, content] of Object.entries(files)) {
          const safeName = filePath.replace(/^[/\\]+/, '');
          try {
            pyodide.FS.writeFile(safeName, content, { encoding: 'utf8' });
          } catch {
            // ignore
          }
          try {
            pyodide.FS.writeFile(`/home/pyodide/${safeName}`, content, { encoding: 'utf8' });
          } catch {
            // ignore
          }
        }
      }

      // Inject standard input stream (stdin)
      const stdinData = typeof stdin === 'string' ? stdin : '';
      await pyodide.runPythonAsync(`
import sys, io, json
sys.stdin = io.StringIO(json.loads(${JSON.stringify(JSON.stringify(stdinData))}))
`);

      // Execute Python source
      await pyodide.runPythonAsync(source);

      const durationMs = Math.round(performance.now() - startTime);
      self.postMessage({
        type: 'EXECUTE_RESULT',
        payload: {
          requestId,
          status: 'success',
          stdout: stdoutBuffer,
          stderr: stderrBuffer,
          durationMs,
        },
      });
    } catch (err: unknown) {
      const durationMs = Math.round(performance.now() - startTime);
      const rawError = err instanceof Error ? err.message : String(err);

      let errorCategory: 'syntax' | 'runtime' = 'runtime';
      if (rawError.includes('SyntaxError:')) {
        errorCategory = 'syntax';
      }

      self.postMessage({
        type: 'EXECUTE_RESULT',
        payload: {
          requestId,
          status: 'error',
          stdout: stdoutBuffer,
          stderr: stderrBuffer,
          durationMs,
          errorCategory,
          errorMessage: rawError,
        },
      });
    }
    return;
  }

  if (type === 'RESET') {
    if (pyodideInstance) {
      try {
        await pyodideInstance.runPythonAsync(`
import sys
modules_to_del = [m for m in list(sys.modules.keys()) if m not in sys.builtin_module_names and not m.startswith('_')]
for m in modules_to_del:
    try:
        del sys.modules[m]
    except Exception:
        pass
`);
      } catch (err) {
        console.warn('Reset warning:', err);
      }
    }
    self.postMessage({ type: 'RESET_OK' });
  }
};
