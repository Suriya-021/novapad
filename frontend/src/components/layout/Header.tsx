import React from 'react';
import {
  Play,
  Square,
  RotateCcw,
  Settings,
  FolderOpen,
  Plus,
  Download,
  Upload,
  Sun,
  Moon,
  Laptop,
  ListChecks,
} from 'lucide-react';
import { Project } from '../../types/project';
import { ExecutionStatus } from '../../types/execution';
import { IdeSettings } from '../../types/settings';

interface HeaderProps {
  currentProject: Project | null;
  projects: Project[];
  onSelectProject: (id: string) => void;
  onOpenNewProjectModal: () => void;
  onOpenProjectsModal: () => void;
  onOpenSettingsModal: () => void;
  onRun: () => void;
  onStop: () => void;
  onResetRuntime: () => void;
  onRunTests?: () => void;
  hasTestCases?: boolean;
  isValidating?: boolean;
  onExportZip: () => void;
  onImportZip: () => void;
  executionStatus: ExecutionStatus;
  isExecuting: boolean;
  settings: IdeSettings;
  onToggleTheme: () => void;
  isDirty?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  projects,
  onSelectProject,
  onOpenNewProjectModal,
  onOpenProjectsModal,
  onOpenSettingsModal,
  onRun,
  onStop,
  onResetRuntime,
  onRunTests,
  hasTestCases,
  isValidating,
  onExportZip,
  onImportZip,
  executionStatus,
  isExecuting,
  settings,
  onToggleTheme,
  isDirty,
}) => {
  return (
    <header style={{
      height: '42px',
      backgroundColor: 'var(--bg-header)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 12px',
      fontSize: '13px',
      zIndex: 10,
    }}>
      {/* Left: App Branding & Project Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--text-primary)' }}>
          <Laptop size={18} color="var(--accent)" />
          <span>NovaPad IDE</span>
        </div>

        <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-subtle)' }} />

        {/* Project Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select
            value={currentProject?.id || ''}
            onChange={(e) => onSelectProject(e.target.value)}
            style={{
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              outline: 'none',
              maxWidth: '180px',
            }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.template.toUpperCase()})
              </option>
            ))}
          </select>

          <button
            onClick={onOpenNewProjectModal}
            title="Create New Project"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Plus size={16} />
          </button>

          <button
            onClick={onOpenProjectsModal}
            title="Browse Projects"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <FolderOpen size={16} />
          </button>
        </div>

        {isDirty && (
          <span style={{ fontSize: '11px', color: 'var(--warning)', fontWeight: 500 }}>
            • Unsaved changes
          </span>
        )}
      </div>

      {/* Center: Run / Stop / Reset Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {!isExecuting ? (
          <button
            onClick={onRun}
            title="Execute Code (Ctrl+Enter)"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-text)',
              border: 'none',
              borderRadius: '4px',
              padding: '5px 14px',
              fontWeight: 600,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }}
          >
            <Play size={13} fill="currentColor" />
            <span>Run</span>
          </button>
        ) : (
          <button
            onClick={onStop}
            title="Stop Running Process"
            style={{
              backgroundColor: 'var(--error)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '5px 14px',
              fontWeight: 600,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Square size={13} fill="currentColor" />
            <span>Stop</span>
          </button>
        )}

        {hasTestCases && onRunTests && (
          <button
            onClick={onRunTests}
            disabled={isExecuting || isValidating}
            title="Run Automated Test Cases"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--success, #10b981)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '4px',
              padding: '5px 12px',
              fontWeight: 600,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: (isExecuting || isValidating) ? 'not-allowed' : 'pointer',
              opacity: (isExecuting || isValidating) ? 0.6 : 1,
            }}
          >
            <ListChecks size={13} />
            <span>{isValidating ? 'Testing...' : 'Run Tests'}</span>
          </button>
        )}

        <button
          onClick={onResetRuntime}
          title="Reset Active Runtime State"
          style={{
            background: 'var(--bg-button)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
            padding: '5px 10px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>

        {isExecuting && (
          <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 500 }}>
            {executionStatus === 'initializing' ? 'Initializing runtime...' : 'Executing...'}
          </span>
        )}
      </div>

      {/* Right: Import/Export, Settings & Theme */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={onImportZip}
          title="Import Project ZIP"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '5px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Upload size={16} />
        </button>

        <button
          onClick={onExportZip}
          title="Export Project as ZIP"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '5px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Download size={16} />
        </button>

        <button
          onClick={onToggleTheme}
          title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '5px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {settings.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          onClick={onOpenSettingsModal}
          title="Open Settings"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '5px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
};
