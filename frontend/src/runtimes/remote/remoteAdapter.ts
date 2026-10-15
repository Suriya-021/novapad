import { ExecutionRuntime } from '../contracts/runtime';
import { ExecutionRequest, ExecutionResult, RuntimeCapabilities } from '../../types/execution';

export class RemoteBackendAdapter implements ExecutionRuntime {
  readonly id = 'backend-remote';
  readonly name = 'FastAPI Isolated Sandbox';
  readonly supportedLanguages = ['c', 'cpp', 'python_server'];
  readonly capabilities: RuntimeCapabilities = {
    supportsCancellation: true,
    supportsVirtualFS: true,
    supportsStructuredOutput: false,
    maxExecutionTimeMs: 20000,
  };

  private backendUrl: string;
  private activeAbortController: AbortController | null = null;
  private currentRequestId: string | null = null;

  constructor(backendUrl = 'http://localhost:8000') {
    this.backendUrl = backendUrl;
  }

  setBackendUrl(url: string): void {
    this.backendUrl = url.replace(/\/+$/, '');
  }

  async initialize(): Promise<void> {
    // Optionally check health, but don't block unless requested
  }

  async checkHealth(): Promise<{ status: string; compilers: Record<string, boolean> }> {
    try {
      const res = await fetch(`${this.backendUrl}/health`, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      throw new Error(`Backend unavailable at ${this.backendUrl}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    this.currentRequestId = request.requestId;
    this.activeAbortController = new AbortController();

    const startTime = performance.now();
    try {
      const payload = {
        requestId: request.requestId,
        projectId: request.projectId,
        language: request.language,
        activeFile: request.activeFile,
        source: request.source,
        stdin: request.stdin || '',
        files: request.files || {},
        timeoutSeconds: Math.min(20, Math.round((request.timeoutMs || 15000) / 1000)),
      };

      const res = await fetch(`${this.backendUrl}/api/v1/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: this.activeAbortController.signal,
      });

      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);

      if (!res.ok) {
        return {
          requestId: request.requestId,
          status: 'error',
          stdout: data.stdout || '',
          stderr: data.detail || data.stderr || `Backend returned HTTP ${res.status}`,
          durationMs,
          errorCategory: 'system',
          errorMessage: data.detail || 'Server execution failed',
          runtimeMetadata: {
            runtimeId: this.id,
            runtimeName: this.name,
            environment: 'backend',
          },
        };
      }

      return {
        requestId: request.requestId,
        status: data.status || 'success',
        stdout: data.stdout || '',
        stderr: data.stderr || '',
        exitCode: data.exitCode,
        durationMs: data.durationMs || durationMs,
        errorCategory: data.errorCategory,
        errorMessage: data.errorMessage,
        runtimeMetadata: {
          runtimeId: this.id,
          runtimeName: this.name,
          environment: 'backend',
          compilerOutput: data.compilerOutput,
        },
      };
    } catch (err: unknown) {
      const durationMs = Math.round(performance.now() - startTime);

      if (err instanceof DOMException && err.name === 'AbortError') {
        return {
          requestId: request.requestId,
          status: 'cancelled',
          stdout: '',
          stderr: 'Execution cancelled by user.',
          durationMs,
          errorCategory: 'system',
          runtimeMetadata: {
            runtimeId: this.id,
            runtimeName: this.name,
            environment: 'backend',
          },
        };
      }

      const msg = err instanceof Error ? err.message : String(err);
      return {
        requestId: request.requestId,
        status: 'error',
        stdout: '',
        stderr: `Failed to connect to backend execution service (${this.backendUrl}):\n${msg}\n\nMake sure the FastAPI backend is running via 'uvicorn app.main:app'.`,
        durationMs,
        errorCategory: 'network',
        errorMessage: msg,
        runtimeMetadata: {
          runtimeId: this.id,
          runtimeName: this.name,
          environment: 'backend',
        },
      };
    } finally {
      this.currentRequestId = null;
      this.activeAbortController = null;
    }
  }

  cancel(requestId: string): void {
    if (this.currentRequestId === requestId && this.activeAbortController) {
      this.activeAbortController.abort();
    }
  }

  async dispose(): Promise<void> {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
  }
}
