import React from 'react';
import { Globe, RotateCw, ExternalLink } from 'lucide-react';

interface WebPreviewProps {
  previewUrl: string | null;
  onRefresh: () => void;
}

export const WebPreview: React.FC<WebPreviewProps> = ({ previewUrl, onRefresh }) => {
  if (!previewUrl) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'var(--text-muted)',
          fontSize: '13px',
          gap: '8px',
          backgroundColor: 'var(--bg-editor)',
        }}
      >
        <Globe size={24} />
        <span>No Web preview active. Click 'Run' on an HTML, CSS, or JS file to generate preview.</span>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      {/* Mini preview address bar */}
      <div
        style={{
          height: '30px',
          backgroundColor: 'var(--bg-panel)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          fontSize: '11px',
          color: 'var(--text-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={onRefresh}
            title="Refresh Preview"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
            }}
          >
            <RotateCw size={13} />
          </button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
            blob://sandboxed-preview
          </span>
        </div>

        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open preview in new tab"
          style={{
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
          }}
        >
          <ExternalLink size={13} />
        </a>
      </div>

      {/* Sandboxed iframe */}
      <iframe
        title="Web Sandbox Preview"
        src={previewUrl}
        sandbox="allow-scripts"
        style={{
          flex: 1,
          width: '100%',
          border: 'none',
          backgroundColor: '#ffffff',
        }}
      />
    </div>
  );
};
