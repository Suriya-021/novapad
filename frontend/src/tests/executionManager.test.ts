import { describe, it, expect } from 'vitest';
import { ExecutionManager } from '../runtimes/executionManager';

describe('ExecutionManager', () => {
  it('rejects empty code buffers gracefully with clear syntax error', async () => {
    const manager = new ExecutionManager();
    const result = await manager.execute({
      projectId: 'proj-1',
      activeFile: 'empty.py',
      language: 'python',
      source: '',
    });

    expect(result.status).toBe('error');
    expect(result.errorCategory).toBe('syntax');
    expect(result.errorMessage).toBe('Empty code buffer');
  });

  it('returns clean actionable error for unsupported language without crashing', async () => {
    const manager = new ExecutionManager();
    const result = await manager.execute({
      projectId: 'proj-1',
      activeFile: 'code.xyz',
      language: 'unsupported_lang_123',
      source: 'some arbitrary code',
    });

    expect(result.status).toBe('error');
    expect(result.errorCategory).toBe('unsupported');
    expect(result.stderr).toContain('No runtime available');
  });
});
