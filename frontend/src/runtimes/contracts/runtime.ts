import { ExecutionRequest, ExecutionResult, RuntimeCapabilities } from '../../types/execution';

export interface ExecutionRuntime {
  readonly id: string;
  readonly name: string;
  readonly supportedLanguages: string[];
  readonly capabilities: RuntimeCapabilities;

  initialize(): Promise<void>;
  execute(request: ExecutionRequest): Promise<ExecutionResult>;
  cancel?(requestId: string): Promise<void> | void;
  reset?(): Promise<void> | void;
  dispose(): Promise<void> | void;
}
