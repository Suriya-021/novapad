import React from 'react';
import { CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';
import { ExecutionStatus } from '../../types/execution';

interface StatusBarProps {
  language: string;
  runtimeName: string;
  status: ExecutionStatus;
  statusMessage?: string;
  durationMs?: number;
  isDirty?: boolean;
  cursorPos?: { line: number; column: number };
}

export const StatusBar: React.FC<StatusBarProps> = ({
  language,
  runtimeName,
  status,
  statusMessage,
  durationMs,
  isDirty,
  cursorPos = { line: 1, column: 1 },
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'running':
      case 'initializing':
        return <Zap size={12} color="var(--accent)" />;
      case 'success':
        return <CheckCircle2 size={12} color="var(--success)" />;
      case 'error':
        return <AlertCircle size={12} color="var(--error)" />;
      case 'timed_out':
      case 'cancelled':
        return <Clock size={12} color="var(--warning)" />;
      default:
        return null;
    }
  };

  return (
    <footer
      style={{
        height: '24px',
        backgroundColor: 'var(--bg-statusbar)',
        color: 'var(--text-secondary)',
        fontSize: '11px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        borderTop: '1px solid var(--border-subtle)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Left: Execution status & runtime info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {getStatusIcon()}
          <span style={{ textTransform: 'capitalize' }}>
            {statusMessage || status}
          </span>
        </div>

        {durationMs !== undefined && durationMs > 0 && (
          <span>({durationMs}ms)</span>
        )}
      </div>

      {/* Right: Language, Cursor position, and save status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span>{isDirty ? 'Unsaved' : 'Saved'}</span>
        <span>
          Ln {cursorPos.line}, Col {cursorPos.column}
        </span>
        <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>
          {language}
        </span>
        <span style={{ color: 'var(--text-muted)' }}>
          Runtime: {runtimeName}
        </span>
      </div>
    </footer>
  );
};
