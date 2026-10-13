import { ExecutionRuntime } from '../contracts/runtime';
import { ExecutionMode } from '../../types/execution';

export class RuntimeRegistry {
  private runtimes = new Map<string, ExecutionRuntime>();

  register(runtime: ExecutionRuntime): void {
    this.runtimes.set(runtime.id, runtime);
  }

  unregister(runtimeId: string): void {
    this.runtimes.delete(runtimeId);
  }

  get(runtimeId: string): ExecutionRuntime | undefined {
    return this.runtimes.get(runtimeId);
  }

  getAll(): ExecutionRuntime[] {
    return Array.from(this.runtimes.values());
  }

  resolveRuntime(language: string, preferredMode: ExecutionMode = 'auto'): ExecutionRuntime | undefined {
    const lang = language.toLowerCase();

    // Map common aliases
    const targetLang = lang === 'js' ? 'javascript' : lang === 'py' ? 'python' : lang;

    // Check specific preferences
    if (preferredMode === 'server') {
      const serverRuntime = Array.from(this.runtimes.values()).find(
        (r) => r.id === 'backend-remote' && (r.supportedLanguages.includes(targetLang) || targetLang === 'c' || targetLang === 'cpp')
      );
      if (serverRuntime) return serverRuntime;
    }

    // Default resolution: browser-first where available
    for (const runtime of this.runtimes.values()) {
      if (preferredMode === 'browser' && runtime.id === 'backend-remote') {
        continue;
      }
      if (runtime.supportedLanguages.includes(targetLang)) {
        return runtime;
      }
    }

    // Fallback to backend for languages requiring compiler (C/C++)
    if (targetLang === 'c' || targetLang === 'cpp') {
      return this.runtimes.get('backend-remote');
    }

    return undefined;
  }
}
