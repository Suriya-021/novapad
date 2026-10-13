export type ExecutionStatus =
  | 'idle'
  | 'queued'
  | 'initializing'
  | 'running'
  | 'success'
  | 'error'
  | 'timed_out'
  | 'cancelled';

export type ExecutionMode = 'browser' | 'server' | 'auto';

export interface ExecutionRequest {
  requestId: string;
  projectId: string;
  activeFile: string;
  language: string;
  source: string;
  files?: Record<string, string>;
  mode?: ExecutionMode;
  timeoutMs?: number;
}

export interface SqlQueryResult {
  columns: string[];
  values: (string | number | boolean | null)[][];
}

export interface ExecutionResult {
  requestId: string;
  status: ExecutionStatus;
  stdout: string;
  stderr: string;
  structuredResults?: SqlQueryResult[];
  exitCode?: number;
  durationMs?: number;
  errorCategory?: 'syntax' | 'runtime' | 'timeout' | 'security' | 'unsupported' | 'network' | 'system';
  errorMessage?: string;
  runtimeMetadata?: {
    runtimeId: string;
    runtimeName: string;
    environment: 'browser' | 'backend';
    [key: string]: unknown;
  };
}

export interface RuntimeCapabilities {
  supportsCancellation: boolean;
  supportsVirtualFS: boolean;
  supportsStructuredOutput: boolean;
  maxExecutionTimeMs: number;
}
