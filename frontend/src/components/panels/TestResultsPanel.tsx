import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Lock,
  Copy,
  Check,
  Play,
  RotateCw,
} from 'lucide-react';
import { TestCase, TestCaseResult, ValidationSummary } from '../../types/validation';

interface TestResultsPanelProps {
  testCases: TestCase[];
  summary: ValidationSummary | null;
  isValidating: boolean;
  validationProgress?: { completed: number; total: number };
  onRunTests: () => void;
}

export const TestResultsPanel: React.FC<TestResultsPanelProps> = ({
  testCases,
  summary,
  isValidating,
  validationProgress,
  onRunTests,
}) => {
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  if (testCases.length === 0) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontSize: '12px',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <AlertTriangle size={24} style={{ marginBottom: '8px', opacity: 0.7 }} />
        <p style={{ margin: 0, fontWeight: 500 }}>No test cases defined for this activity.</p>
        <p style={{ margin: '4px 0 0', fontSize: '11px' }}>
          Use the 'Terminal / Output' tab to run and test code freely.
        </p>
      </div>
    );
  }

  // Loading / Running state
  if (isValidating) {
    const completed = validationProgress?.completed ?? 0;
    const total = validationProgress?.total ?? testCases.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: 'var(--bg-editor)',
        }}
      >
        <RotateCw size={24} className="spin" color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
        <div style={{ marginTop: '12px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Validating Test Cases ({completed}/{total})...
        </div>
        <div
          style={{
            width: '240px',
            height: '6px',
            backgroundColor: 'var(--bg-tab)',
            borderRadius: '999px',
            marginTop: '12px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${percent}%`,
              backgroundColor: 'var(--accent)',
              transition: 'width 0.2s ease',
            }}
          />
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
          Evaluating output against expected test fixtures...
        </span>
      </div>
    );
  }

  // Not yet run (Idle) state
  if (!summary) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: 'var(--bg-editor)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px',
          }}
        >
          <Play size={20} color="var(--accent)" fill="var(--accent)" />
        </div>
        <h4 style={{ margin: '0 0 6px', fontSize: '14px', color: 'var(--text-primary)' }}>
          Ready to Validate Your Code
        </h4>
        <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '380px' }}>
          This activity includes <strong>{testCases.length} test case{testCases.length > 1 ? 's' : ''}</strong>{' '}
          ({testCases.filter((t) => !t.isHidden).length} sample, {testCases.filter((t) => t.isHidden).length} hidden).
        </p>
        <button
          onClick={onRunTests}
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-text)',
            border: 'none',
            borderRadius: '6px',
            padding: '7px 18px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          }}
        >
          <Play size={13} fill="currentColor" />
          <span>Run All Tests</span>
        </button>
      </div>
    );
  }

  // Results state
  const results = summary.results;
  const currentResult: TestCaseResult | undefined = results[selectedCaseIndex] || results[0];
  const currentCase: TestCase | undefined = testCases[selectedCaseIndex] || testCases[0];

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-editor)',
        overflow: 'hidden',
      }}
    >
      {/* Top Summary Banner */}
      <div
        style={{
          padding: '8px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: summary.allPassed
            ? 'rgba(16, 185, 129, 0.08)'
            : 'rgba(239, 68, 68, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {summary.allPassed ? (
            <CheckCircle2 size={18} color="var(--success, #10b981)" />
          ) : (
            <XCircle size={18} color="var(--error, #ef4444)" />
          )}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {summary.allPassed
                ? 'All Test Cases Passed! 🎉'
                : `${summary.passedTests} of ${summary.totalTests} Test Cases Passed (${summary.scorePercent}%)`}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Total Duration: {summary.durationMs}ms</span>
              <span>•</span>
              <span>Passing: {summary.passedTests}/{summary.totalTests}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onRunTests}
          style={{
            backgroundColor: 'var(--bg-button)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <RotateCw size={12} />
          <span>Re-run Tests</span>
        </button>
      </div>

      {/* Main Body: Tabs on left, details on right */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Test Case Selector List (Left Side) */}
        <div
          style={{
            width: '180px',
            borderRight: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-tab)',
            overflowY: 'auto',
            padding: '6px 4px',
          }}
        >
          {results.map((res, idx) => {
            const isSelected = selectedCaseIndex === idx;
            const isPassed = res.status === 'passed';

            return (
              <button
                key={res.testCaseId || idx}
                onClick={() => setSelectedCaseIndex(idx)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: '4px',
                  border: isSelected ? '1px solid var(--accent)' : '1px solid transparent',
                  backgroundColor: isSelected ? 'var(--bg-tab-active)' : 'transparent',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: isSelected ? 600 : 500,
                  marginBottom: '2px',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                  {isPassed ? (
                    <CheckCircle2 size={13} color="var(--success, #10b981)" style={{ flexShrink: 0 }} />
                  ) : res.status === 'timed_out' ? (
                    <Clock size={13} color="var(--warning, #f59e0b)" style={{ flexShrink: 0 }} />
                  ) : (
                    <XCircle size={13} color="var(--error, #ef4444)" style={{ flexShrink: 0 }} />
                  )}
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {res.title || `Test #${idx + 1}`}
                  </span>
                </div>

                {res.isHidden && (
                  <Lock size={10} color="var(--text-muted)" style={{ flexShrink: 0, marginLeft: '4px' }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Test Case Detail (Right Side) */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 16px',
            backgroundColor: 'var(--code-bg, #1e1e1e)',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '12px',
          }}
        >
          {currentResult ? (
            <div>
              {/* Header Status Line */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {currentResult.title}
                  </span>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      backgroundColor:
                        currentResult.status === 'passed'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : currentResult.status === 'timed_out'
                          ? 'rgba(245, 158, 11, 0.2)'
                          : 'rgba(239, 68, 68, 0.2)',
                      color:
                        currentResult.status === 'passed'
                          ? 'var(--success, #10b981)'
                          : currentResult.status === 'timed_out'
                          ? 'var(--warning, #f59e0b)'
                          : 'var(--error, #ef4444)',
                    }}
                  >
                    {currentResult.status === 'passed'
                      ? 'Passed'
                      : currentResult.status === 'timed_out'
                      ? 'Time Limit Exceeded'
                      : 'Wrong Answer'}
                  </span>
                </div>

                <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                  Duration: {currentResult.durationMs}ms
                </span>
              </div>

              {/* Hidden Test Case Banner */}
              {currentResult.isHidden ? (
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    lineHeight: '1.6',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <Lock size={16} color="var(--accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Hidden Test Case</strong>
                    <p style={{ margin: '4px 0 0' }}>
                      Input and expected output are locked to prevent hardcoding solutions and assess algorithmic edge cases.
                    </p>
                    <p style={{ margin: '6px 0 0', color: currentResult.status === 'passed' ? 'var(--success, #10b981)' : 'var(--error, #ef4444)' }}>
                      Verdict: <strong>{currentResult.status.toUpperCase()}</strong>
                    </p>
                  </div>
                </div>
              ) : (
                /* Public / Sample Test Case Details */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Explanation if any */}
                  {currentCase?.explanation && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontStyle: 'italic' }}>
                      {currentCase.explanation}
                    </div>
                  )}

                  {/* Standard Input */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>
                        INPUT (STDIN)
                      </span>
                      {currentResult.input && (
                        <button
                          onClick={() => copyToClipboard(currentResult.input, 'input')}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {copiedSection === 'input' ? <Check size={11} color="var(--success)" /> : <Copy size={11} />}
                          <span>{copiedSection === 'input' ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        padding: '8px 10px',
                        backgroundColor: 'var(--bg-editor, #141414)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        whiteSpace: 'pre-wrap',
                        minHeight: '28px',
                      }}
                    >
                      {currentResult.input || '<empty input>'}
                    </pre>
                  </div>

                  {/* Expected Output */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>
                        EXPECTED OUTPUT
                      </span>
                      {currentResult.expectedOutput && (
                        <button
                          onClick={() => copyToClipboard(currentResult.expectedOutput, 'expected')}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {copiedSection === 'expected' ? <Check size={11} color="var(--success)" /> : <Copy size={11} />}
                          <span>{copiedSection === 'expected' ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        padding: '8px 10px',
                        backgroundColor: 'var(--bg-editor, #141414)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        color: 'var(--success, #10b981)',
                        whiteSpace: 'pre-wrap',
                        minHeight: '28px',
                      }}
                    >
                      {currentResult.expectedOutput}
                    </pre>
                  </div>

                  {/* Actual Output */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>
                        YOUR OUTPUT (STDOUT)
                      </span>
                      {currentResult.actualOutput && (
                        <button
                          onClick={() => copyToClipboard(currentResult.actualOutput, 'actual')}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {copiedSection === 'actual' ? <Check size={11} color="var(--success)" /> : <Copy size={11} />}
                          <span>{copiedSection === 'actual' ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        padding: '8px 10px',
                        backgroundColor: 'var(--bg-editor, #141414)',
                        border: currentResult.status === 'passed'
                          ? '1px solid rgba(16, 185, 129, 0.4)'
                          : '1px solid rgba(239, 68, 68, 0.5)',
                        borderRadius: '4px',
                        color: currentResult.status === 'passed'
                          ? 'var(--text-primary)'
                          : 'var(--error, #ef4444)',
                        whiteSpace: 'pre-wrap',
                        minHeight: '28px',
                      }}
                    >
                      {currentResult.actualOutput || '<no output>'}
                    </pre>
                  </div>

                  {/* Error Message if any */}
                  {currentResult.errorMessage && (
                    <div
                      style={{
                        padding: '8px 10px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid var(--error, #ef4444)',
                        borderRadius: '4px',
                        color: 'var(--error, #ef4444)',
                        fontSize: '11px',
                      }}
                    >
                      <strong>Error:</strong> {currentResult.errorMessage}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>Select a test case to inspect details.</div>
          )}
        </div>
      </div>
    </div>
  );
};
