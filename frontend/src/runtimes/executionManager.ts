import { RuntimeRegistry } from './registry/runtimeRegistry';
import { PythonRuntimeAdapter } from './python/pythonAdapter';
import { SqlRuntimeAdapter } from './sql/sqlAdapter';
import { WebRuntimeAdapter } from './web/webAdapter';
import { RemoteBackendAdapter } from './remote/remoteAdapter';
import { ExecutionRequest, ExecutionResult, ExecutionStatus } from '../types/execution';

export class ExecutionManager {
  private registry: RuntimeRegistry;
  private currentRequestId: string | null = null;
  private activeRuntimeId: string | null = null;
  private executionCounter = 0;

  // Runtime instances
  public readonly pythonAdapter: PythonRuntimeAdapter;
  public readonly sqlAdapter: SqlRuntimeAdapter;
  public readonly webAdapter: WebRuntimeAdapter;
  public readonly remoteAdapter: RemoteBackendAdapter;

  // Status and Output listeners
  public onStatusUpdate?: (status: ExecutionStatus, message?: string) => void;
  public onOutputUpdate?: (result: ExecutionResult) => void;
  public onOutputChunk?: (stream: 'stdout' | 'stderr', chunk: string) => void;

  constructor(backendUrl = 'http://localhost:8000') {
    this.registry = new RuntimeRegistry();

    this.pythonAdapter = new PythonRuntimeAdapter();
    this.sqlAdapter = new SqlRuntimeAdapter();
    this.webAdapter = new WebRuntimeAdapter();
    this.remoteAdapter = new RemoteBackendAdapter(backendUrl);

    // Wire streaming listeners
    this.pythonAdapter.onOutputChunk = (type, chunk) => {
      this.onOutputChunk?.(type, chunk);
    };
    this.pythonAdapter.onStatusChange = (status, msg) => {
      if (status === 'initializing') {
        this.onStatusUpdate?.('initializing', msg);
      }
    };

    // Register all runtimes
    this.registry.register(this.pythonAdapter);
    this.registry.register(this.sqlAdapter);
    this.registry.register(this.webAdapter);
    this.registry.register(this.remoteAdapter);
  }

  setBackendUrl(url: string): void {
    this.remoteAdapter.setBackendUrl(url);
  }

  getRegistry(): RuntimeRegistry {
    return this.registry;
  }

  isExecuting(): boolean {
    return this.currentRequestId !== null;
  }

  async execute(request: Omit<ExecutionRequest, 'requestId'>): Promise<ExecutionResult> {
    this.executionCounter += 1;
    const requestId = `req-${Date.now()}-${this.executionCounter}`;
    this.currentRequestId = requestId;

    // Validation
    if (!request.source && request.language !== 'html') {
      const emptyResult: ExecutionResult = {
        requestId,
        status: 'error',
        stdout: '',
        stderr: 'No code to execute. The active file is empty.',
        errorCategory: 'syntax',
        errorMessage: 'Empty code buffer',
      };
      this.currentRequestId = null;
      this.onStatusUpdate?.('error', 'Empty code');
      this.onOutputUpdate?.(emptyResult);
      return emptyResult;
    }

    const fullRequest: ExecutionRequest = {
      ...request,
      requestId,
    };

    // Resolve runtime
    const runtime = this.registry.resolveRuntime(request.language, request.mode || 'auto');

    if (!runtime) {
      const unsupportedResult: ExecutionResult = {
        requestId,
        status: 'error',
        stdout: '',
        stderr: `No runtime available for language '${request.language}'. Supported browser runtimes: Python (.py), SQL (.sql), Web (.html, .css, .js). Server runtime: C/C++ (.c, .cpp).`,
        errorCategory: 'unsupported',
        errorMessage: `Unsupported language: ${request.language}`,
      };
      this.currentRequestId = null;
      this.onStatusUpdate?.('error', 'Unsupported language');
      this.onOutputUpdate?.(unsupportedResult);
      return unsupportedResult;
    }

    this.activeRuntimeId = runtime.id;
    this.onStatusUpdate?.('running', `Executing with ${runtime.name}...`);

    try {
      const result = await runtime.execute(fullRequest);

      // Stale execution check: if a new execution began while this was running, ignore older result
      if (this.currentRequestId !== requestId) {
        console.warn(`Execution result for ${requestId} discarded because newer request ${this.currentRequestId} is active.`);
        return result;
      }

      this.currentRequestId = null;
      this.activeRuntimeId = null;
      this.onStatusUpdate?.(result.status, result.status === 'success' ? 'Finished successfully' : result.errorMessage);
      this.onOutputUpdate?.(result);
      return result;
    } catch (err: unknown) {
      if (this.currentRequestId !== requestId) {
        console.warn(`Execution error for ${requestId} discarded.`);
        throw err;
      }

      this.currentRequestId = null;
      this.activeRuntimeId = null;
      const msg = err instanceof Error ? err.message : String(err);

      const errorResult: ExecutionResult = {
        requestId,
        status: 'error',
        stdout: '',
        stderr: `Execution system failure: ${msg}`,
        errorCategory: 'system',
        errorMessage: msg,
        runtimeMetadata: {
          runtimeId: runtime.id,
          runtimeName: runtime.name,
          environment: runtime.id === 'backend-remote' ? 'backend' : 'browser',
        },
      };

      this.onStatusUpdate?.('error', msg);
      this.onOutputUpdate?.(errorResult);
      return errorResult;
    }
  }

  async stopCurrent(): Promise<void> {
    if (!this.currentRequestId || !this.activeRuntimeId) return;

    const runtime = this.registry.get(this.activeRuntimeId);
    if (runtime && runtime.cancel) {
      await runtime.cancel(this.currentRequestId);
    }

    this.onStatusUpdate?.('cancelled', 'Execution stopped by user.');
    this.currentRequestId = null;
    this.activeRuntimeId = null;
  }

  async resetRuntime(runtimeId?: string): Promise<void> {
    if (runtimeId) {
      const r = this.registry.get(runtimeId);
      if (r && r.reset) await r.reset();
    } else {
      await this.pythonAdapter.reset();
      await this.sqlAdapter.reset();
    }
  }

  async dispose(): Promise<void> {
    await Promise.all(this.registry.getAll().map((r) => r.dispose()));
  }
}
