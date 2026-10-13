import React, { useState, useCallback, useRef } from 'react';
import { Header } from '../../components/layout/Header';
import { ActivityBar, ActivityView } from '../../components/layout/ActivityBar';
import { StatusBar } from '../../components/layout/StatusBar';
import { FileExplorer } from '../../components/explorer/FileExplorer';
import { EditorTabs } from '../../components/editor/EditorTabs';
import { CodeEditor } from '../../components/editor/CodeEditor';
import { BottomPanel, BottomTab } from '../../components/panels/BottomPanel';
import { SettingsModal } from '../../components/dialogs/SettingsModal';
import { NewProjectModal } from '../../components/dialogs/NewProjectModal';
import { ProjectsListModal } from '../../components/dialogs/ProjectsListModal';
import { RuntimesModal } from '../../components/dialogs/RuntimesModal';

import { Project, ProjectFile } from '../../types/project';
import { ExecutionResult, ExecutionStatus } from '../../types/execution';
import { IdeSettings } from '../../types/settings';
import { ExecutionManager } from '../../runtimes/executionManager';
import { Lesson } from '../../learning/types/curriculum';
import { exportProjectAsZip, importProjectFromZip } from '../../storage/projectRepository';

interface TextCodingEnvProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onCreateProject: (name: string, template: Project['template']) => void;
  onDeleteProject: (projectId: string) => void;
  settings: IdeSettings;
  onSaveSettings: (settings: IdeSettings) => void;
  executionManager: ExecutionManager;
  lesson?: Lesson;
  isCompact?: boolean;
}

export const TextCodingEnv: React.FC<TextCodingEnvProps> = ({
  project,
  onUpdateProject,
  projects,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  settings,
  onSaveSettings,
  executionManager,
  isCompact,
}) => {
  const [activeFileId, setActiveFileId] = useState<string>(project.activeFileId || project.files[0]?.id || '');
  const [openFileIds, setOpenFileIds] = useState<string[]>(project.openFileIds || [project.files[0]?.id].filter(Boolean));
  const [cursorPos, setCursorPos] = useState({ line: 1, column: 1 });

  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('Ready');
  const [currentResult, setCurrentResult] = useState<ExecutionResult | null>(null);
  const [streamingLogs, setStreamingLogs] = useState<{ type: 'stdout' | 'stderr'; text: string }[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [activityView, setActivityView] = useState<ActivityView>('explorer');
  const [bottomTab, setBottomTab] = useState<BottomTab>('terminal');

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [projectsListOpen, setProjectsListOpen] = useState(false);
  const [runtimesOpen, setRuntimesOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wire Execution Manager callbacks
  React.useEffect(() => {
    executionManager.onStatusUpdate = (status, msg) => {
      setExecutionStatus(status);
      if (msg) setStatusMessage(msg);
    };

    executionManager.onOutputChunk = (type, text) => {
      setStreamingLogs((prev) => [...prev, { type, text }]);
    };

    executionManager.onOutputUpdate = (result) => {
      setCurrentResult(result);
      if (result.runtimeMetadata?.previewUrl) {
        setPreviewUrl(result.runtimeMetadata.previewUrl as string);
      }
    };
  }, [executionManager]);

  const activeFile = project.files.find((f) => f.id === activeFileId) || project.files[0];

  const handleContentChange = useCallback((fileId: string, newContent: string) => {
    const updatedFiles = project.files.map((file) =>
      file.id === fileId ? { ...file, content: newContent, isDirty: true } : file
    );
    const updatedProj: Project = {
      ...project,
      files: updatedFiles,
      updatedAt: Date.now(),
    };
    onUpdateProject(updatedProj);
  }, [project, onUpdateProject]);

  const handleRun = useCallback(async () => {
    if (!activeFile) return;

    setStreamingLogs([]);
    setExecutionStatus('running');
    setStatusMessage('Starting execution...');

    const lang = activeFile.language.toLowerCase();
    if (lang === 'sql') {
      setBottomTab('sql');
    } else if (lang === 'html' || lang === 'css' || lang === 'javascript') {
      setBottomTab('preview');
    } else {
      setBottomTab('terminal');
    }

    const filesMap: Record<string, string> = {};
    for (const f of project.files) {
      filesMap[f.name] = f.content;
    }

    const res = await executionManager.execute({
      projectId: project.id,
      activeFile: activeFile.name,
      language: activeFile.language,
      source: activeFile.content,
      files: filesMap,
    });

    if (res.status === 'success') {
      if (lang === 'sql' && res.structuredResults && res.structuredResults.length > 0) {
        setBottomTab('sql');
      } else if (res.runtimeMetadata?.previewUrl) {
        setBottomTab('preview');
      }
    }
  }, [activeFile, project, executionManager]);

  const handleStop = useCallback(() => {
    executionManager.stopCurrent();
  }, [executionManager]);

  const handleResetRuntime = useCallback(async () => {
    setStatusMessage('Resetting runtime environment...');
    await executionManager.resetRuntime();
    setStatusMessage('Runtime reset complete.');
    setStreamingLogs((prev) => [...prev, { type: 'stdout', text: '— Runtime environment reset successfully.' }]);
  }, [executionManager]);

  // File management
  const handleSelectFile = useCallback((fileId: string) => {
    setActiveFileId(fileId);
    if (!openFileIds.includes(fileId)) {
      setOpenFileIds((prev) => [...prev, fileId]);
    }
  }, [openFileIds]);

  const handleCloseTab = useCallback((fileId: string) => {
    const nextOpen = openFileIds.filter((id) => id !== fileId);
    setOpenFileIds(nextOpen);
    if (activeFileId === fileId && nextOpen.length > 0) {
      setActiveFileId(nextOpen[nextOpen.length - 1]);
    }
  }, [openFileIds, activeFileId]);

  const handleCreateFile = useCallback((fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    let language = 'plaintext';
    if (ext === 'py') language = 'python';
    else if (ext === 'sql') language = 'sql';
    else if (ext === 'html') language = 'html';
    else if (ext === 'css') language = 'css';
    else if (ext === 'js' || ext === 'ts') language = 'javascript';
    else if (ext === 'cpp' || ext === 'c') language = 'cpp';

    const newFile: ProjectFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: fileName,
      path: fileName,
      content: '',
      language,
    };

    const updated: Project = {
      ...project,
      files: [...project.files, newFile],
      activeFileId: newFile.id,
      openFileIds: [...project.openFileIds, newFile.id],
    };

    onUpdateProject(updated);
    setActiveFileId(newFile.id);
    setOpenFileIds(updated.openFileIds);
  }, [project, onUpdateProject]);

  const handleRenameFile = useCallback((fileId: string, newName: string) => {
    const ext = newName.split('.').pop()?.toLowerCase() || '';
    let language = 'plaintext';
    if (ext === 'py') language = 'python';
    else if (ext === 'sql') language = 'sql';
    else if (ext === 'html') language = 'html';
    else if (ext === 'css') language = 'css';
    else if (ext === 'js' || ext === 'ts') language = 'javascript';
    else if (ext === 'cpp' || ext === 'c') language = 'cpp';

    const updatedFiles = project.files.map((f) =>
      f.id === fileId ? { ...f, name: newName, path: newName, language } : f
    );
    onUpdateProject({ ...project, files: updatedFiles });
  }, [project, onUpdateProject]);

  const handleDeleteFile = useCallback((fileId: string) => {
    const updatedFiles = project.files.filter((f) => f.id !== fileId);
    const updatedOpen = openFileIds.filter((id) => id !== fileId);
    const nextActive = activeFileId === fileId ? (updatedFiles[0]?.id || '') : activeFileId;

    const updated: Project = {
      ...project,
      files: updatedFiles,
      activeFileId: nextActive,
      openFileIds: updatedOpen,
    };

    onUpdateProject(updated);
    setActiveFileId(nextActive);
    setOpenFileIds(updatedOpen);
  }, [project, openFileIds, activeFileId, onUpdateProject]);

  // Export / Import ZIP
  const handleExportZip = useCallback(async () => {
    const blob = await exportProjectAsZip(project);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }, [project]);

  const handleImportZip = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileImportChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importProjectFromZip(file);
      onSelectProject(imported.id);
    } catch (err) {
      alert(`Failed to import ZIP: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [onSelectProject]);

  const handleActivitySelect = useCallback((view: ActivityView) => {
    setActivityView(view);
    if (view === 'projects') setProjectsListOpen(true);
    else if (view === 'settings') setSettingsOpen(true);
    else if (view === 'runtimes') setRuntimesOpen(true);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        onChange={handleFileImportChange}
        style={{ display: 'none' }}
      />

      {/* IDE Header */}
      <Header
        currentProject={project}
        projects={projects}
        onSelectProject={onSelectProject}
        onOpenNewProjectModal={() => setNewProjectOpen(true)}
        onOpenProjectsModal={() => setProjectsListOpen(true)}
        onOpenSettingsModal={() => setSettingsOpen(true)}
        onRun={handleRun}
        onStop={handleStop}
        onResetRuntime={handleResetRuntime}
        onExportZip={handleExportZip}
        onImportZip={handleImportZip}
        executionStatus={executionStatus}
        isExecuting={executionStatus === 'running' || executionStatus === 'initializing'}
        settings={settings}
        onToggleTheme={() => onSaveSettings({ ...settings, theme: settings.theme === 'dark' ? 'light' : 'dark' })}
        isDirty={project.files.some((f) => f.isDirty)}
      />

      {/* Main Workspace Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Activity Bar */}
        <ActivityBar activeView={activityView} onSelectView={handleActivitySelect} />

        {/* File Explorer (collapsible or hidden in compact mode if desired) */}
        {activityView === 'explorer' && !isCompact && (
          <FileExplorer
            project={project}
            activeFileId={activeFileId}
            onSelectFile={handleSelectFile}
            onCreateFile={handleCreateFile}
            onRenameFile={handleRenameFile}
            onDeleteFile={handleDeleteFile}
          />
        )}

        {/* Editor Workspace & Panels */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <EditorTabs
            files={project.files}
            openFileIds={openFileIds}
            activeFileId={activeFileId}
            onSelectTab={(id) => setActiveFileId(id)}
            onCloseTab={handleCloseTab}
          />

          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <CodeEditor
              file={activeFile}
              settings={settings}
              onChangeContent={handleContentChange}
              onRunShortcut={handleRun}
              onCursorChange={(line, column) => setCursorPos({ line, column })}
            />
          </div>

          <BottomPanel
            currentResult={currentResult}
            streamingLogs={streamingLogs}
            previewUrl={previewUrl}
            onClearOutput={() => {
              setStreamingLogs([]);
              setCurrentResult(null);
            }}
            onRefreshPreview={handleRun}
            activeTab={bottomTab}
            onSelectTab={setBottomTab}
          />
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        language={activeFile?.language || 'plaintext'}
        runtimeName={
          activeFile?.language === 'python'
            ? 'Pyodide Worker'
            : activeFile?.language === 'sql'
            ? 'sql.js WASM'
            : activeFile?.language === 'html' || activeFile?.language === 'css' || activeFile?.language === 'javascript'
            ? 'Web Sandbox'
            : activeFile?.language === 'cpp' || activeFile?.language === 'c'
            ? 'FastAPI Sandbox'
            : 'None'
        }
        status={executionStatus}
        statusMessage={statusMessage}
        durationMs={currentResult?.durationMs}
        isDirty={activeFile?.isDirty}
        cursorPos={cursorPos}
      />

      {/* Modals */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSaveSettings={onSaveSettings}
      />

      <NewProjectModal
        isOpen={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
        onCreateProject={onCreateProject}
      />

      <ProjectsListModal
        isOpen={projectsListOpen}
        onClose={() => setProjectsListOpen(false)}
        projects={projects}
        activeProjectId={project.id}
        onSelectProject={onSelectProject}
        onDeleteProject={onDeleteProject}
      />

      <RuntimesModal
        isOpen={runtimesOpen}
        onClose={() => setRuntimesOpen(false)}
        runtimes={executionManager.getRegistry().getAll()}
        onResetRuntime={(id) => executionManager.resetRuntime(id)}
      />
    </div>
  );
};
