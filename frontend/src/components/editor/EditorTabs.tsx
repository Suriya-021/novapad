import React from 'react';
import { X, FileCode, Database, Code2, FileText } from 'lucide-react';
import { ProjectFile } from '../../types/project';

interface EditorTabsProps {
  files: ProjectFile[];
  openFileIds: string[];
  activeFileId: string;
  onSelectTab: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  files,
  openFileIds,
  activeFileId,
  onSelectTab,
  onCloseTab,
}) => {
  const getTabIcon = (file: ProjectFile) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'py':
        return <FileCode size={13} color="#38bdf8" />;
      case 'sql':
        return <Database size={13} color="#fbbf24" />;
      case 'html':
      case 'css':
      case 'js':
        return <Code2 size={13} color="#f97316" />;
      case 'c':
      case 'cpp':
        return <FileCode size={13} color="#a855f7" />;
      default:
        return <FileText size={13} color="var(--text-muted)" />;
    }
  };

  const openFiles = openFileIds
    .map((id) => files.find((f) => f.id === id))
    .filter((f): f is ProjectFile => f !== undefined);

  return (
    <div
      style={{
        height: '35px',
        backgroundColor: 'var(--bg-tab)',
        display: 'flex',
        alignItems: 'flex-end',
        overflowX: 'auto',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {openFiles.map((file) => {
        const isActive = file.id === activeFileId;
        return (
          <div
            key={file.id}
            onClick={() => onSelectTab(file.id)}
            style={{
              height: '34px',
              padding: '0 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              backgroundColor: isActive ? 'var(--bg-tab-active)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderTop: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              borderRight: '1px solid var(--border-subtle)',
              whiteSpace: 'nowrap',
              position: 'relative',
            }}
          >
            {getTabIcon(file)}
            <span>{file.name}</span>

            {file.isDirty ? (
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--warning)',
                  marginLeft: '4px',
                }}
              />
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(file.id);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '4px',
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
