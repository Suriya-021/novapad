import React from 'react';
import { Blocks, Play, Sparkles } from 'lucide-react';
import { Lesson } from '../../learning/types/curriculum';

interface BlockCodingEnvProps {
  lesson: Lesson;
  onReturnToBook?: () => void;
}

export const BlockCodingEnv: React.FC<BlockCodingEnvProps> = ({ lesson }) => {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-editor)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Block Top Header */}
      <div
        style={{
          height: '42px',
          backgroundColor: '#8b5cf6',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          fontWeight: 700,
          fontSize: '13px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Blocks size={20} />
          <span>Block Coding Environment</span>
          <span style={{ fontSize: '11px', fontWeight: 500, opacity: 0.85 }}>
            • {lesson.title}
          </span>
        </div>

        <button
          title="Execute Block Sequence"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 600,
          }}
        >
          <Play size={13} fill="currentColor" />
          <span>Run Blocks</span>
        </button>
      </div>

      {/* Placeholder Workspace Area for Phase 3 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '460px',
            padding: '32px',
            borderRadius: '12px',
            border: '1.5px dashed var(--border-subtle)',
            backgroundColor: 'var(--bg-tab)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              color: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={24} />
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
            Block Coding Environment (Phase 3)
          </h3>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            This lesson is configured for **Block Coding & Computational Thinking**. The architecture has properly passed the lesson context and target workspace.
          </p>

          <div
            style={{
              padding: '12px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-editor)',
              border: '1px solid var(--border-subtle)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <div><strong>Lesson ID:</strong> {lesson.id}</div>
            <div><strong>Mode:</strong> {lesson.codingActivity?.mode}</div>
            <div><strong>Template:</strong> {lesson.codingActivity?.projectTemplateId}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
