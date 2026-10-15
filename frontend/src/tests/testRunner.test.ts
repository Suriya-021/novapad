import { describe, it, expect, vi } from 'vitest';
import { normalizeOutput, compareOutput, runValidation } from '../validation/testRunner';
import { TestCase } from '../types/validation';
import { ExecutionManager } from '../runtimes/executionManager';

describe('normalizeOutput', () => {
  it('handles CRLF to LF and trims trailing spaces per line', () => {
    const raw = 'line 1   \r\nline 2\t  \r\n\nline 4  ';
    const norm = normalizeOutput(raw, 'trimmed');
    expect(norm).toBe('line 1\nline 2\n\nline 4');
  });

  it('preserves internal exact spacing in exact mode', () => {
    const raw = '  line 1  \r\nline 2  ';
    const norm = normalizeOutput(raw, 'exact');
    expect(norm).toBe('  line 1  \nline 2  ');
  });

  it('handles empty and nullish strings cleanly', () => {
    expect(normalizeOutput('', 'trimmed')).toBe('');
  });
});

describe('compareOutput', () => {
  it('correctly matches identical output in trimmed mode', () => {
    const result = compareOutput('  hello world \n', 'hello world', 'trimmed');
    expect(result.passed).toBe(true);
    expect(result.diff).toBeUndefined();
  });

  it('reports diff when output differs', () => {
    const result = compareOutput('result: 41', 'result: 42', 'trimmed');
    expect(result.passed).toBe(false);
    expect(result.diff).toEqual({
      expected: 'result: 42',
      actual: 'result: 41',
    });
  });

  it('supports contains mode', () => {
    const result = compareOutput('Server listening on port 8080 successfully', '8080', 'contains');
    expect(result.passed).toBe(true);
  });

  it('supports regex mode', () => {
    const result = compareOutput('Found 42 items in cache', 'Found \\d+ items', 'regex');
    expect(result.passed).toBe(true);
  });
});

describe('runValidation', () => {
  it('executes test cases sequentially and returns accurate summary', async () => {
    const testCases: TestCase[] = [
      { id: 'tc-1', title: 'Case 1: Positive', input: '10 20', expectedOutput: '30' },
      { id: 'tc-2', title: 'Case 2: Negative', input: '5 -2', expectedOutput: '3' },
      { id: 'tc-3', title: 'Case 3: Edge Zero', input: '0 0', expectedOutput: '0', isHidden: true },
    ];

    const mockExecManager = {
      execute: vi.fn().mockImplementation((req: { stdin: string }) => {
        const [a, b] = req.stdin.split(' ').map(Number);
        return Promise.resolve({
          requestId: 'mock-req',
          status: 'success',
          stdout: `${a + b}\n`,
          stderr: '',
          durationMs: 15,
        });
      }),
    } as unknown as ExecutionManager;

    const summary = await runValidation({
      executionManager: mockExecManager,
      projectId: 'proj-1',
      activeFile: 'main.py',
      language: 'python',
      source: 'print(...)',
      testCases,
      validationMode: 'trimmed',
    });

    expect(summary.totalTests).toBe(3);
    expect(summary.passedTests).toBe(3);
    expect(summary.failedTests).toBe(0);
    expect(summary.scorePercent).toBe(100);
    expect(summary.allPassed).toBe(true);
    expect(summary.results[0].status).toBe('passed');
    expect(summary.results[2].isHidden).toBe(true);
  });

  it('masks inputs and outputs for hidden failed test cases', async () => {
    const testCases: TestCase[] = [
      { id: 'tc-1', title: 'Sample 1', input: '1', expectedOutput: '1' },
      { id: 'tc-2', title: 'Hidden 2', input: '100', expectedOutput: '100', isHidden: true },
    ];

    const mockExecManager = {
      execute: vi.fn().mockImplementation((req: { stdin: string }) => {
        // Will fail test 2
        return Promise.resolve({
          requestId: 'mock-req',
          status: 'success',
          stdout: req.stdin === '1' ? '1' : 'WRONG',
          stderr: '',
          durationMs: 10,
        });
      }),
    } as unknown as ExecutionManager;

    const summary = await runValidation({
      executionManager: mockExecManager,
      projectId: 'proj-1',
      activeFile: 'main.py',
      language: 'python',
      source: '...',
      testCases,
    });

    expect(summary.passedTests).toBe(1);
    expect(summary.failedTests).toBe(1);
    expect(summary.scorePercent).toBe(50);
    expect(summary.allPassed).toBe(false);

    // Hidden test case 2 should have its details masked
    const hiddenResult = summary.results[1];
    expect(hiddenResult.status).toBe('failed');
    expect(hiddenResult.actualOutput).toBe('[Hidden]');
    expect(hiddenResult.expectedOutput).toBe('[Hidden]');
    expect(hiddenResult.input).toBe('[Hidden]');
    expect(hiddenResult.diff).toBeUndefined();
  });

  it('handles empty test case list gracefully', async () => {
    const mockExecManager = { execute: vi.fn() } as unknown as ExecutionManager;
    const summary = await runValidation({
      executionManager: mockExecManager,
      projectId: 'proj-1',
      activeFile: 'main.py',
      language: 'python',
      source: '...',
      testCases: [],
    });

    expect(summary.totalTests).toBe(0);
    expect(summary.allPassed).toBe(true);
    expect(mockExecManager.execute).not.toHaveBeenCalled();
  });
});
