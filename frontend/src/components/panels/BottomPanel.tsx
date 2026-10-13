import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Table,
  Globe,
  AlertTriangle,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ExecutionResult } from '../../types/execution';
import { SqlResultTable } from './SqlResultTable';
import { WebPreview } from './WebPreview';

export type BottomTab = 'terminal' | 'sql' | 'preview' | 'problems';

interface BottomPanelProps {
  currentResult: ExecutionResult | null;
  streamingLogs: { type: 'stdout' | 'stderr'; text: string }[];
  previewUrl: string | null;
  onClearOutput: () => void;
  onRefreshPreview: () => void;
  activeTab: BottomTab;
  onSelectTab: (tab: BottomTab) => void;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({
  currentResult,
  streamingLogs,
  previewUrl,
  onClearOutput,
  onRefreshPreview,
  activeTab,
  onSelectTab,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [streamingLogs, currentResult]);

  const copyTerminalOutput = () => {
    let text = '';
    if (streamingLogs.length > 0) {
      text = streamingLogs.map((l) => l.text).join('\n');
    } else if (currentResult) {
      text = [currentResult.stdout, currentResult.stderr].filter(Boolean).join('\n');
    }
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sqlRowCount = currentResult?.structuredResults?.reduce((acc, r) => acc + r.values.length, 0) || 0;

  return (
    <div
      style={{
        height: isMinimized ? '32px' : '260px',
        backgroundColor: 'var(--bg-panel)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'height 0.2s ease',
        zIndex: 5,
      }}
    >
      {/* Top Bar / Tab Headers */}
      <div
        style={{
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          backgroundColor: 'var(--bg-tab)',
          borderBottom: isMinimized ? 'none' : '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => { onSelectTab('terminal'); setIsMinimized(false); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: activeTab === 'terminal' && !isMinimized ? 'var(--bg-tab-active)' : 'transparent',
              color: activeTab === 'terminal' && !isMinimized ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Terminal size={13} />
            <span>Terminal / Output</span>
          </button>

          <button
            onClick={() => { onSelectTab('sql'); setIsMinimized(false); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: activeTab === 'sql' && !isMinimized ? 'var(--bg-tab-active)' : 'transparent',
              color: activeTab === 'sql' && !isMinimized ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Table size={13} />
            <span>SQL Results</span>
            {sqlRowCount > 0 && (
              <span
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#fff',
                  borderRadius: '999px',
                  padding: '1px 5px',
                  fontSize: '9px',
                }}
              >
                {sqlRowCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { onSelectTab('preview'); setIsMinimized(false); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: activeTab === 'preview' && !isMinimized ? 'var(--bg-tab-active)' : 'transparent',
              color: activeTab === 'preview' && !isMinimized ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Globe size={13} />
            <span>Web Preview</span>
            {previewUrl && (
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
            )}
          </button>

          <button
            onClick={() => { onSelectTab('problems'); setIsMinimized(false); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: activeTab === 'problems' && !isMinimized ? 'var(--bg-tab-active)' : 'transparent',
              color: activeTab === 'problems' && !isMinimized ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <AlertTriangle size={13} />
            <span>Problems</span>
            {currentResult?.status === 'error' && (
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--error)' }} />
            )}
          </button>
        </div>

        {/* Action Controls & Minimize/Expand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={copyTerminalOutput}
            title="Copy Output"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {copied ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
          </button>

          <button
            onClick={onClearOutput}
            title="Clear Output"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Trash2 size={13} />
          </button>

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Expand Panel' : 'Minimize Panel'}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Panel Content (only when not minimized) */}
      {!isMinimized && (
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {activeTab === 'terminal' && (
            <div
              style={{
                height: '100%',
                backgroundColor: 'var(--code-bg)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                padding: '10px 14px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.5',
              }}
            >
              {streamingLogs.length === 0 && !currentResult && (
                <span style={{ color: 'var(--text-muted)' }}>
                  Ready. Press 'Run' (or Ctrl+Enter) to execute the active file.
                </span>
              )}

              {/* Streaming chunks */}
              {streamingLogs.map((log, index) => (
                <div
                  key={index}
                  style={{
                    color: log.type === 'stderr' ? 'var(--error)' : 'var(--text-primary)',
                  }}
                >
                  {log.text}
                </div>
              ))}

              {/* Static result output if not streamed */}
              {streamingLogs.length === 0 && currentResult && currentResult.stdout && (
                <div style={{ color: 'var(--text-primary)' }}>{currentResult.stdout}</div>
              )}

              {/* Show stderr / errors if present */}
              {currentResult && currentResult.stderr && (streamingLogs.length === 0 || !streamingLogs.some(l => l.text.includes(currentResult.stderr))) && (
                <div style={{ color: 'var(--error)', marginTop: '4px' }}>
                  {currentResult.stderr}
                </div>
              )}

              {/* Execution metadata footer */}
              {currentResult && currentResult.runtimeMetadata && (
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '10px' }}>
                  — Executed in {currentResult.runtimeMetadata.environment} via{' '}
                  {currentResult.runtimeMetadata.runtimeName}
                  {currentResult.durationMs !== undefined ? ` (${currentResult.durationMs}ms)` : ''}
                  {currentResult.exitCode !== undefined ? ` [Exit code: ${currentResult.exitCode}]` : ''}
                </div>
              )}

              <div ref={terminalEndRef} />
            </div>
          )}

          {activeTab === 'sql' && (
            <SqlResultTable results={currentResult?.structuredResults} />
          )}

          {activeTab === 'preview' && (
            <WebPreview previewUrl={previewUrl} onRefresh={onRefreshPreview} />
          )}

          {activeTab === 'problems' && (
            <div
              style={{
                height: '100%',
                backgroundColor: 'var(--bg-editor)',
                padding: '12px',
                overflowY: 'auto',
                fontSize: '12px',
              }}
            >
              {currentResult?.status === 'error' ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '10px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid var(--error)',
                    borderRadius: '6px',
                  }}
                >
                  <AlertTriangle size={18} color="var(--error)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: 'var(--error)', textTransform: 'capitalize' }}>
                      {currentResult.errorCategory || 'Runtime'} Error
                    </strong>
                    <div style={{ marginTop: '4px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {currentResult.errorMessage || currentResult.stderr}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px' }}>
                  No problems or errors detected in the current execution.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
