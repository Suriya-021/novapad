import React from 'react';
import { Cat, Play, RotateCcw, Sparkles } from 'lucide-react';
import { Lesson } from '../../learning/types/curriculum';

interface ScratchCodingEnvProps {
  lesson: Lesson;
  onReturnToBook?: () => void;
}

export const ScratchCodingEnv: React.FC<ScratchCodingEnvProps> = ({ lesson }) => {
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
      {/* Scratch Top Header */}
      <div
        style={{
          height: '42px',
          backgroundColor: '#4c97ff',
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
          <Cat size={20} />
          <span>Scratch Visual Environment</span>
          <span style={{ fontSize: '11px', fontWeight: 500, opacity: 0.85 }}>
            • {lesson.title}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            title="Start Green Flag"
            style={{
              backgroundColor: '#46b944',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600,
            }}
          >
            <Play size={13} fill="currentColor" />
            <span>Go</span>
          </button>
          <button
            title="Stop Scripts"
            style={{
              backgroundColor: '#ff4c4c',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600,
            }}
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Placeholder Workspace Area for Phase 2 */}
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
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={24} />
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
            Scratch Visual Programming (Phase 2)
          </h3>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            This lesson is configured for **Scratch Visual Programming**. The architecture has properly identified the lesson mode, starter template, and stage configuration.
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
