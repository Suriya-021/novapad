import React, { useState } from 'react';
import { Sparkles, ArrowRight, Code2, Copy, Check } from 'lucide-react';
import { CodingActivityConfig } from '../types/curriculum';
import { copyToClipboard } from '../utils/clipboard';

interface CodingPromptBannerProps {
  activity: CodingActivityConfig;
  onLaunch: () => void;
  isSplitViewActive?: boolean;
}

export const CodingPromptBanner: React.FC<CodingPromptBannerProps> = ({
  activity,
  onLaunch,
  isSplitViewActive,
}) => {
  const [copiedStarter, setCopiedStarter] = useState(false);

  const handleCopyStarter = async () => {
    const starter = activity.starterFiles?.[0]?.content;
    if (!starter) return;
    const success = await copyToClipboard(starter);
    if (success) {
      setCopiedStarter(true);
      setTimeout(() => setCopiedStarter(false), 2000);
    }
  };

  const getModeBadge = () => {
    switch (activity.mode) {
      case 'text':
        return { label: `Text (${activity.language || 'Python'})`, bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' };
      case 'scratch':
        return { label: 'Scratch Visuals', bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' };
      case 'block':
        return { label: 'Block Algorithms', bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' };
    }
  };

  const badge = getModeBadge();

  return (
    <div
      style={{
        marginTop: '24px',
        padding: '16px 20px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)',
        border: '1.5px solid rgba(59, 130, 246, 0.35)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
            }}
          >
            <Sparkles size={16} />
          </span>
          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
            {activity.title}
          </span>
        </div>

        <span
          style={{
            padding: '2px 8px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            backgroundColor: badge.bg,
            color: badge.color,
          }}
        >
          {badge.label}
        </span>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
        Put what you just read into practice! Test your code live in the interactive coding environment side-by-side with this book.
      </p>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
        {activity.starterFiles && activity.starterFiles[0]?.content && (
          <button
            onClick={handleCopyStarter}
            title="Copy starter code to clipboard"
            style={{
              backgroundColor: copiedStarter ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              color: copiedStarter ? '#4ade80' : '#cbd5e1',
              border: copiedStarter ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              padding: '7px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            {copiedStarter ? <Check size={13} color="#4ade80" /> : <Copy size={13} />}
            <span>{copiedStarter ? 'Starter Code Copied!' : 'Copy Starter Code'}</span>
          </button>
        )}

        <button
          onClick={onLaunch}
          style={{
            backgroundColor: 'var(--accent)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
            transition: 'transform 0.15s ease, background 0.15s ease',
          }}
        >
          <Code2 size={15} />
          <span>{isSplitViewActive ? 'Focus Coding Lab (Right Side)' : 'Open Coding Lab (Side-by-Side) →'}</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
