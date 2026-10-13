import React, { useState } from 'react';
import { X, FileCode, Database, Globe, Terminal, Sparkles } from 'lucide-react';
import { Project } from '../../types/project';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (name: string, template: Project['template']) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [name, setName] = useState('');
  const [template, setTemplate] = useState<Project['template']>('python');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateProject(name.trim(), template);
    setName('');
    onClose();
  };

  const templates: { id: Project['template']; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'python',
      title: 'Python (Pyodide Worker)',
      desc: 'Local browser-first Python with virtual filesystem and Pyodide WebAssembly worker.',
      icon: <FileCode size={20} color="#38bdf8" />,
    },
    {
      id: 'sql',
      title: 'SQLite Database Sandbox',
      desc: 'In-memory SQL with sql.js, relational queries, structured table visualization, and schema.',
      icon: <Database size={20} color="#fbbf24" />,
    },
    {
      id: 'web',
      title: 'Web Playground (HTML/CSS/JS)',
      desc: 'Interactive live frontend playground with sandboxed iframe and safe console bridge.',
      icon: <Globe size={20} color="#f97316" />,
    },
    {
      id: 'cpp',
      title: 'C/C++ Systems & Algorithms',
      desc: 'Native systems programming executed via the isolated FastAPI backend sandbox.',
      icon: <Terminal size={20} color="#a855f7" />,
    },
    {
      id: 'custom',
      title: 'Empty / Custom Workspace',
      desc: 'Start with a clean blank slate.',
      icon: <Sparkles size={20} color="var(--text-muted)" />,
    },
  ];

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
          width: '520px',
          backgroundColor: 'var(--bg-panel)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ fontSize: '15px', fontWeight: 600 }}>Create New Project</h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              Project Name
            </label>
            <input
              type="text"
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Algorithm Sandbox"
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '8px 10px',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              Select Starter Template
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {templates.map((t) => {
                const isSelected = template === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    <div>{t.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {t.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'var(--bg-button)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              style={{
                backgroundColor: 'var(--accent)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 16px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: name.trim() ? 'pointer' : 'not-allowed',
                opacity: name.trim() ? 1 : 0.6,
              }}
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
