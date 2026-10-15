import { ExecutionRuntime } from '../contracts/runtime';
import { ExecutionRequest, ExecutionResult, RuntimeCapabilities } from '../../types/execution';

export class PythonRuntimeAdapter implements ExecutionRuntime {
  readonly id = 'browser-python';
  readonly name = 'Python (Pyodide Worker)';
  readonly supportedLanguages = ['python'];
  readonly capabilities: RuntimeCapabilities = {
    supportsCancellation: true,
    supportsVirtualFS: true,
    supportsStructuredOutput: false,
    maxExecutionTimeMs: 15000,
  };

  private worker: Worker | null = null;
  private currentRequestId: string | null = null;
  private activeReject: ((reason?: unknown) => void) | null = null;
  private isReady = false;
  private initPromise: Promise<void> | null = null;

  public onStatusChange?: (status: string, message: string) => void;
  public onOutputChunk?: (type: 'stdout' | 'stderr', text: string) => void;

  private createWorker(): Worker {
    const worker = new Worker(
      new URL('./python.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (e: MessageEvent) => {
      const { type, status, message, text } = e.data;

      if (type === 'STATUS') {
        this.onStatusChange?.(status, message);
      } else if (type === 'STDOUT_STREAM') {
        this.onOutputChunk?.('stdout', text);
      } else if (type === 'STDERR_STREAM') {
        this.onOutputChunk?.('stderr', text);
      }
    };

    worker.onerror = (err) => {
      console.error('Pyodide Worker Error:', err);
      this.onStatusChange?.('error', 'Pyodide worker encountered an unhandled error.');
    };

    return worker;
  }

  async initialize(): Promise<void> {
    if (this.isReady && this.worker) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise<void>((resolve, reject) => {
      try {
        if (!this.worker) {
          this.worker = this.createWorker();
        }

        const handler = (e: MessageEvent) => {
          if (e.data.type === 'INIT_OK') {
            this.isReady = true;
            this.worker?.removeEventListener('message', handler);
            resolve();
          } else if (e.data.type === 'INIT_ERROR') {
            this.worker?.removeEventListener('message', handler);
            this.initPromise = null;
            reject(new Error(e.data.message || 'Failed to initialize Pyodide worker'));
          }
        };

        const errHandler = (err: ErrorEvent) => {
          this.worker?.removeEventListener('error', errHandler);
          this.initPromise = null;
          reject(new Error(err.message || 'Failed to initialize Python worker thread'));
        };

        this.worker.addEventListener('message', handler);
        this.worker.addEventListener('error', errHandler);
        this.worker.postMessage({ type: 'INIT' });
      } catch (err) {
        this.initPromise = null;
        reject(err);
      }
    });

    return this.initPromise;
  }

  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    try {
      await this.initialize();
    } catch (initErr: unknown) {
      const msg = initErr instanceof Error ? initErr.message : String(initErr);
      return {
        requestId: request.requestId,
        status: 'error',
        stdout: '',
        stderr: `Python Runtime Initialization Error:\n${msg}\n\nNote: Pyodide loads its WebAssembly engine from CDN. Verify internet connectivity, or run in Server mode via FastAPI.`,
        durationMs: 0,
        errorCategory: 'runtime',
        errorMessage: msg,
        runtimeMetadata: {
          runtimeId: this.id,
          runtimeName: this.name,
          environment: 'browser',
        },
      };
    }

    if (!this.worker) {
      throw new Error('Python worker is not available.');
    }

    this.currentRequestId = request.requestId;
    const timeoutMs = request.timeoutMs || this.capabilities.maxExecutionTimeMs;

    return new Promise((resolve) => {
      let isSettled = false;
      let timer: ReturnType<typeof setTimeout> | null = null;

      const cleanup = () => {
        if (timer) clearTimeout(timer);
        this.currentRequestId = null;
        this.activeReject = null;
      };

      // Handle worker message
      const messageListener = (e: MessageEvent) => {
        if (e.data.type === 'EXECUTE_RESULT' && e.data.payload.requestId === request.requestId) {
          if (isSettled) return;
          isSettled = true;
          this.worker?.removeEventListener('message', messageListener);
          cleanup();

          const res = e.data.payload;
          resolve({
            requestId: request.requestId,
            status: res.status,
            stdout: res.stdout || '',
            stderr: res.stderr || '',
            durationMs: res.durationMs,
            errorCategory: res.errorCategory,
            errorMessage: res.errorMessage,
            runtimeMetadata: {
              runtimeId: this.id,
              runtimeName: this.name,
              environment: 'browser',
            },
          });
        }
      };

      this.worker?.addEventListener('message', messageListener);

      // Handle timeout with worker kill & restart
      timer = setTimeout(() => {
        if (isSettled) return;
        isSettled = true;
        this.worker?.removeEventListener('message', messageListener);
        cleanup();

        this.terminateAndRecreateWorker();
        resolve({
          requestId: request.requestId,
          status: 'timed_out',
          stdout: '',
          stderr: `Execution timed out after ${timeoutMs / 1000} seconds. The worker was terminated to prevent locking the browser.`,
          durationMs: timeoutMs,
          errorCategory: 'timeout',
          errorMessage: `Execution exceeded time limit of ${timeoutMs}ms`,
          runtimeMetadata: {
            runtimeId: this.id,
            runtimeName: this.name,
            environment: 'browser',
          },
        });
      }, timeoutMs);

      this.activeReject = () => {
        if (isSettled) return;
        isSettled = true;
        this.worker?.removeEventListener('message', messageListener);
        cleanup();
        this.terminateAndRecreateWorker();
        resolve({
          requestId: request.requestId,
          status: 'cancelled',
          stdout: '',
          stderr: 'Execution was stopped by user.',
          errorCategory: 'system',
          runtimeMetadata: {
            runtimeId: this.id,
            runtimeName: this.name,
            environment: 'browser',
          },
        });
      };

      // Post execution request
      this.worker?.postMessage({
        type: 'EXECUTE',
        payload: {
          requestId: request.requestId,
          source: request.source,
          stdin: request.stdin,
          files: request.files,
        },
      });
    });
  }

  cancel(requestId: string): void {
    if (this.currentRequestId === requestId && this.activeReject) {
      this.activeReject();
    }
  }

  private terminateAndRecreateWorker(): void {
    if (this.worker) {
      try {
        this.worker.terminate();
      } catch (e) {
        console.warn('Worker terminate error', e);
      }
      this.worker = null;
    }
    this.isReady = false;
    this.initPromise = null;
    this.worker = this.createWorker();
  }

  async reset(): Promise<void> {
    if (this.worker && this.isReady) {
      this.worker.postMessage({ type: 'RESET' });
    } else {
      this.terminateAndRecreateWorker();
    }
  }

  async dispose(): Promise<void> {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.isReady = false;
    this.initPromise = null;
  }
}
