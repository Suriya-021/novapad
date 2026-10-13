import React from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { ProjectFile } from '../../types/project';
import { IdeSettings } from '../../types/settings';

interface CodeEditorProps {
  file: ProjectFile | undefined;
  settings: IdeSettings;
  onChangeContent: (fileId: string, newContent: string) => void;
  onRunShortcut: () => void;
  onCursorChange?: (line: number, column: number) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  file,
  settings,
  onChangeContent,
  onRunShortcut,
  onCursorChange,
}) => {
  if (!file) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-editor)',
          color: 'var(--text-muted)',
          fontSize: '14px',
        }}
      >
        No file selected. Open or create a file from the explorer.
      </div>
    );
  }

  const getMonacoLanguage = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'py':
        return 'python';
      case 'sql':
        return 'sql';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'js':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'c':
      case 'cpp':
      case 'h':
      case 'hpp':
        return 'cpp';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      default:
        return 'plaintext';
    }
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    // Register Ctrl+Enter / Cmd+Enter shortcut for execution
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRunShortcut();
    });

    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      onCursorChange?.(e.position.lineNumber, e.position.column);
    });
  };

  return (
    <div style={{ flex: 1, height: '100%', position: 'relative' }}>
      <Editor
        key={file.id}
        height="100%"
        width="100%"
        language={getMonacoLanguage(file.name)}
        value={file.content}
        theme={settings.theme === 'dark' ? 'vs-dark' : 'light'}
        onChange={(val) => onChangeContent(file.id, val || '')}
        onMount={handleEditorMount}
        options={{
          fontSize: settings.fontSize,
          tabSize: settings.tabSize,
          wordWrap: settings.wordWrap,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          fontFamily: 'var(--font-mono)',
          formatOnPaste: true,
          formatOnType: true,
          bracketPairColorization: { enabled: true },
          cursorBlinking: 'smooth',
          renderLineHighlight: 'all',
          padding: { top: 10, bottom: 10 },
        }}
      />
    </div>
  );
};
