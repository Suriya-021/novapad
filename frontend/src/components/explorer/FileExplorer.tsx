import React, { useState } from 'react';
import {
  FileCode,
  FileText,
  FilePlus,
  Trash2,
  Edit2,
  Database,
  Code2,
  Check,
  X,
} from 'lucide-react';
import { Project, ProjectFile } from '../../types/project';

interface FileExplorerProps {
  project: Project;
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (fileName: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  onDeleteFile: (fileId: string) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  project,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const getFileIcon = (file: ProjectFile) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'py':
        return <FileCode size={15} color="#38bdf8" />;
      case 'sql':
        return <Database size={15} color="#fbbf24" />;
      case 'html':
        return <Code2 size={15} color="#f97316" />;
      case 'css':
        return <Code2 size={15} color="#38bdf8" />;
      case 'js':
      case 'ts':
        return <Code2 size={15} color="#facc15" />;
      case 'c':
      case 'cpp':
        return <FileCode size={15} color="#a855f7" />;
      default:
        return <FileText size={15} color="var(--text-muted)" />;
    }
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setNewFileName('');
  };

  const handleConfirmCreate = () => {
    if (newFileName.trim()) {
      onCreateFile(newFileName.trim());
      setIsCreating(false);
      setNewFileName('');
    }
  };

  const handleStartRename = (file: ProjectFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFileId(file.id);
    setEditingName(file.name);
  };

  const handleConfirmRename = (fileId: string) => {
    if (editingName.trim()) {
      onRenameFile(fileId, editingName.trim());
      setEditingFileId(null);
    }
  };

  return (
    <div
      style={{
        width: '240px',
        height: '100%',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        fontSize: '12px',
      }}
    >
      {/* Explorer Header */}
      <div
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            letterSpacing: '0.05em',
          }}
        >
          Files
        </span>

        <button
          onClick={handleStartCreate}
          title="New File"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <FilePlus size={16} />
        </button>
      </div>

      {/* File List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {isCreating && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '4px 10px',
              gap: '6px',
            }}
          >
            <input
              type="text"
              autoFocus
              placeholder="filename.ext"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmCreate();
                if (e.key === 'Escape') setIsCreating(false);
              }}
              style={{
                flex: 1,
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--accent)',
                borderRadius: '3px',
                padding: '2px 6px',
                fontSize: '12px',
                outline: 'none',
              }}
            />
            <button
              onClick={handleConfirmCreate}
              style={{ background: 'transparent', border: 'none', color: 'var(--success)', cursor: 'pointer' }}
            >
              <Check size={14} />
            </button>
            <button
              onClick={() => setIsCreating(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {project.files.map((file) => {
          const isActive = file.id === activeFileId;
          const isRenaming = editingFileId === file.id;

          return (
            <div
              key={file.id}
              onClick={() => onSelectFile(file.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 12px',
                cursor: 'pointer',
                backgroundColor: isActive ? 'var(--bg-tab-active)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
                {getFileIcon(file)}

                {isRenaming ? (
                  <input
                    type="text"
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfirmRename(file.id);
                      if (e.key === 'Escape') setEditingFileId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      flex: 1,
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--accent)',
                      borderRadius: '3px',
                      padding: '2px 4px',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />
                ) : (
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {file.name}
                  </span>
                )}

                {file.isDirty && (
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--warning)',
                    }}
                  />
                )}
              </div>

              {/* Action buttons (rename & delete) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: isActive ? 1 : 0.6 }}>
                {!isRenaming && (
                  <>
                    <button
                      onClick={(e) => handleStartRename(file, e)}
                      title="Rename"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '2px',
                      }}
                    >
                      <Edit2 size={12} />
                    </button>
                    {project.files.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete '${file.name}'?`)) {
                            onDeleteFile(file.id);
                          }
                        }}
                        title="Delete"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
