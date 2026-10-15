export type ValidationStatus = 'idle' | 'running' | 'passed' | 'failed' | 'timed_out' | 'error';

export type ValidationMode = 'exact' | 'trimmed' | 'contains' | 'regex';

export interface TestCase {
  id: string;
  title?: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
  explanation?: string;
  weight?: number;
}

export interface TestCaseResult {
  testCaseId: string;
  title: string;
  status: 'passed' | 'failed' | 'timed_out' | 'error';
  actualOutput: string;
  expectedOutput: string;
  input: string;
  isHidden: boolean;
  durationMs: number;
  errorMessage?: string;
  diff?: {
    expected: string;
    actual: string;
  };
}

export interface ValidationSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  scorePercent: number;
  allPassed: boolean;
  durationMs: number;
  results: TestCaseResult[];
}
