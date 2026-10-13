import React from 'react';
import { Files, FolderGit2, Cpu, Settings as SettingsIcon } from 'lucide-react';

export type ActivityView = 'explorer' | 'projects' | 'runtimes' | 'settings';

interface ActivityBarProps {
  activeView: ActivityView;
  onSelectView: (view: ActivityView) => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({ activeView, onSelectView }) => {
  const items: { id: ActivityView; label: string; icon: React.ReactNode }[] = [
    { id: 'explorer', label: 'File Explorer', icon: <Files size={20} /> },
    { id: 'projects', label: 'Projects Manager', icon: <FolderGit2 size={20} /> },
    { id: 'runtimes', label: 'Runtime Environments', icon: <Cpu size={20} /> },
    { id: 'settings', label: 'IDE Preferences', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div
      style={{
        width: '48px',
        backgroundColor: 'var(--bg-activity)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '8px',
        gap: '4px',
        zIndex: 5,
      }}
    >
      {items.map((item) => {
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            title={item.label}
            onClick={() => onSelectView(item.id)}
            style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'color 0.15s ease',
            }}
          >
            {item.icon}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  left: '-4px',
                  top: '10px',
                  bottom: '10px',
                  width: '3px',
                  backgroundColor: 'var(--accent)',
                  borderRadius: '0 2px 2px 0',
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
