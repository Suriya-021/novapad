import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { IdeSettings, DEFAULT_SETTINGS } from '../../types/settings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: IdeSettings;
  onSaveSettings: (settings: IdeSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  if (!isOpen) return null;

  const handleChange = <K extends keyof IdeSettings>(key: K, value: IdeSettings[K]) => {
    onSaveSettings({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '480px',
          backgroundColor: 'var(--bg-panel)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ fontSize: '15px', fontWeight: 600 }}>IDE Preferences & Settings</h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
          {/* Theme */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Color Theme</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Choose light or dark workspace appearance</div>
            </div>
            <select
              value={settings.theme}
              onChange={(e) => handleChange('theme', e.target.value as 'dark' | 'light')}
              style={{
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '4px 8px',
              }}
            >
              <option value="dark">Dark Theme</option>
              <option value="light">Light Theme</option>
            </select>
          </div>

          {/* Font Size */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Editor Font Size ({settings.fontSize}px)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Monaco Editor font size in pixels</div>
            </div>
            <input
              type="range"
              min="11"
              max="24"
              value={settings.fontSize}
              onChange={(e) => handleChange('fontSize', Number(e.target.value))}
              style={{ cursor: 'pointer' }}
            />
          </div>

          {/* Tab Size */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Tab Size</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Number of spaces per indentation level</div>
            </div>
            <select
              value={settings.tabSize}
              onChange={(e) => handleChange('tabSize', Number(e.target.value))}
              style={{
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '4px 8px',
              }}
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
            </select>
          </div>

          {/* Word Wrap */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Word Wrap</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Wrap long lines in editor</div>
            </div>
            <select
              value={settings.wordWrap}
              onChange={(e) => handleChange('wordWrap', e.target.value as 'on' | 'off')}
              style={{
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '4px 8px',
              }}
            >
              <option value="on">On</option>
              <option value="off">Off</option>
            </select>
          </div>

          {/* Auto Save */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Auto Save</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Automatically save files to IndexedDB</div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => handleChange('autoSave', e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
          </div>

          {/* Backend URL */}
          <div>
            <div style={{ fontWeight: 500, marginBottom: '4px' }}>Backend Execution Service URL</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>
              Endpoint for server-side C/C++ compilation and isolated workers
            </div>
            <input
              type="text"
              value={settings.backendUrl}
              onChange={(e) => handleChange('backendUrl', e.target.value)}
              placeholder="http://localhost:8000"
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '6px 8px',
                fontSize: '12px',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            onClick={() => onSaveSettings(DEFAULT_SETTINGS)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={onClose}
            style={{
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
