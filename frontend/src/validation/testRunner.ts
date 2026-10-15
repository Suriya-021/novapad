import { ExecutionManager } from '../runtimes/executionManager';
import { TestCase, TestCaseResult, ValidationMode, ValidationSummary } from '../types/validation';

/**
 * Normalizes output string for fair comparison across different operating systems and runners.
 * - Converts CRLF to LF
 * - Trims trailing whitespace from each line
 * - Normalizes leading/trailing blank lines
 */
export function normalizeOutput(text: string, mode: ValidationMode = 'trimmed'): string {
  if (typeof text !== 'string') return '';

  // Standardize newlines
  let normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  if (mode === 'exact') {
    return normalized;
  }

  // Remove trailing whitespace from each individual line
  const lines = normalized.split('\n').map((line) => line.trimEnd());
  normalized = lines.join('\n');

  if (mode === 'trimmed' || mode === 'contains') {
    return normalized.trim();
  }

  return normalized;
}

/**
 * Compares actual stdout against expected output based on validation mode.
 */
export function compareOutput(
  actual: string,
  expected: string,
  mode: ValidationMode = 'trimmed'
): { passed: boolean; diff?: { expected: string; actual: string } } {
  const normActual = normalizeOutput(actual, mode);
  const normExpected = normalizeOutput(expected, mode);

  if (mode === 'contains') {
    const passed = normActual.includes(normExpected);
    return {
      passed,
      diff: passed ? undefined : { expected: normExpected, actual: normActual },
    };
  }

  if (mode === 'regex') {
    try {
      const reg = new RegExp(normExpected);
      const passed = reg.test(normActual);
      return {
        passed,
        diff: passed ? undefined : { expected: normExpected, actual: normActual },
      };
    } catch {
      return {
        passed: false,
        diff: { expected: `[Invalid Regex: ${normExpected}]`, actual: normActual },
      };
    }
  }

  // Default: exact or trimmed
  const passed = normActual === normExpected;
  return {
    passed,
    diff: passed ? undefined : { expected: normExpected, actual: normActual },
  };
}

export interface RunValidationOptions {
  executionManager: ExecutionManager;
  projectId: string;
  activeFile: string;
  language: string;
  source: string;
  files?: Record<string, string>;
  testCases: TestCase[];
  validationMode?: ValidationMode;
  timeoutMs?: number;
  onProgress?: (completed: number, total: number, latestResult: TestCaseResult) => void;
}

/**
 * Executes student code against a suite of test cases (HackerRank / MyCodeCamp style).
 */
export async function runValidation(options: RunValidationOptions): Promise<ValidationSummary> {
  const {
    executionManager,
    projectId,
    activeFile,
    language,
    source,
    files,
    testCases,
    validationMode = 'trimmed',
    timeoutMs = 6000,
    onProgress,
  } = options;

  const total = testCases.length;
  if (total === 0) {
    return {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      scorePercent: 100,
      allPassed: true,
      durationMs: 0,
      results: [],
    };
  }

  const startTime = performance.now();
  const results: TestCaseResult[] = [];
  let passedCount = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const caseTitle = tc.title || `Test Case #${i + 1}${tc.isHidden ? ' (Hidden)' : ''}`;

    try {
      const execResult = await executionManager.execute({
        projectId,
        activeFile,
        language,
        source,
        stdin: tc.input,
        files,
        timeoutMs,
      });

      if (execResult.status === 'timed_out') {
        const result: TestCaseResult = {
          testCaseId: tc.id,
          title: caseTitle,
          status: 'timed_out',
          actualOutput: tc.isHidden ? '[Hidden]' : (execResult.stdout || ''),
          expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
          input: tc.isHidden ? '[Hidden]' : tc.input,
          isHidden: !!tc.isHidden,
          durationMs: execResult.durationMs || timeoutMs,
          errorMessage: 'Time limit exceeded.',
        };
        results.push(result);
        onProgress?.(results.length, total, result);
        continue;
      }

      if (execResult.status === 'error' && !execResult.stdout) {
        const result: TestCaseResult = {
          testCaseId: tc.id,
          title: caseTitle,
          status: 'error',
          actualOutput: tc.isHidden ? '[Hidden]' : '',
          expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
          input: tc.isHidden ? '[Hidden]' : tc.input,
          isHidden: !!tc.isHidden,
          durationMs: execResult.durationMs || 0,
          errorMessage: execResult.errorMessage || execResult.stderr || 'Runtime error during execution.',
        };
        results.push(result);
        onProgress?.(results.length, total, result);
        continue;
      }

      const { passed, diff } = compareOutput(execResult.stdout || '', tc.expectedOutput, validationMode);

      if (passed) {
        passedCount++;
      }

      const result: TestCaseResult = {
        testCaseId: tc.id,
        title: caseTitle,
        status: passed ? 'passed' : 'failed',
        actualOutput: tc.isHidden ? '[Hidden]' : (execResult.stdout || ''),
        expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
        input: tc.isHidden ? '[Hidden]' : tc.input,
        isHidden: !!tc.isHidden,
        durationMs: execResult.durationMs || 0,
        errorMessage: passed ? undefined : (execResult.stderr || undefined),
        diff: tc.isHidden ? undefined : diff,
      };

      results.push(result);
      onProgress?.(results.length, total, result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const result: TestCaseResult = {
        testCaseId: tc.id,
        title: caseTitle,
        status: 'error',
        actualOutput: tc.isHidden ? '[Hidden]' : '',
        expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
        input: tc.isHidden ? '[Hidden]' : tc.input,
        isHidden: !!tc.isHidden,
        durationMs: 0,
        errorMessage: msg,
      };
      results.push(result);
      onProgress?.(results.length, total, result);
    }
  }

  const durationMs = Math.round(performance.now() - startTime);
  const scorePercent = Math.round((passedCount / total) * 100);

  return {
    totalTests: total,
    passedTests: passedCount,
    failedTests: total - passedCount,
    scorePercent,
    allPassed: passedCount === total,
    durationMs,
    results,
  };
}
