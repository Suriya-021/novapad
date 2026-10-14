import React, { useState, useRef } from 'react';
import { X, UploadCloud, CheckCircle2, AlertCircle, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { Chapter } from '../types/curriculum';
import { saveUploadedChapter } from '../storage/curriculumRepository';

interface UploadChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCourseId: string;
  onChapterImported: (chapter: Chapter) => void;
  backendUrl: string;
}

export const UploadChapterModal: React.FC<UploadChapterModalProps> = ({
  isOpen,
  onClose,
  activeCourseId,
  onChapterImported,
  backendUrl,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedChapter, setParsedChapter] = useState<Chapter | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith('.docx')) {
        setError('Please select a valid Word document (.docx).');
        return;
      }
      setError(null);
      setFile(selected);
      setParsedChapter(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (!dropped.name.endsWith('.docx')) {
        setError('Please drop a valid Word document (.docx).');
        return;
      }
      setError(null);
      setFile(dropped);
      setParsedChapter(null);
    }
  };

  const handleUploadAndParse = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // Read file as base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = (err) => reject(err);
      });
      reader.readAsDataURL(file);

      const base64Content = await base64Promise;

      const endpoint = `${backendUrl || 'http://127.0.0.1:8000'}/api/v1/curriculum/upload-docx`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentBase64: base64Content,
          courseId: activeCourseId,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Upload failed with HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success' && data.chapter) {
        setParsedChapter(data.chapter);
      } else {
        throw new Error('Could not parse curriculum chapter from document.');
      }
    } catch (err: any) {
      console.error('Docx upload error:', err);
      setError(err.message || 'An unexpected error occurred while parsing the document.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedChapter) return;
    saveUploadedChapter(parsedChapter);
    onChapterImported(parsedChapter);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 60,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '580px',
          maxHeight: '85vh',
          backgroundColor: 'var(--bg-panel, #1e1e1e)',
          border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: 'var(--text-primary, #ffffff)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-tab, #181818)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={18} color="var(--accent, #3b82f6)" />
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
              Upload Curriculum Chapter (.docx)
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted, #94a3b8)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary, #cbd5e1)', lineHeight: 1.5 }}>
            Upload a chapter Word document (<code style={{ color: '#38bdf8' }}>.docx</code>). Our curriculum compiler automatically detects chapter titles, sections, pedagogical callout boxes (<code style={{ color: '#fbbf24' }}>⭐</code>, <code style={{ color: '#34d399' }}>💡</code>, <code style={{ color: '#fb7185' }}>🛠</code>), embedded diagrams, tables, and coding activities with starter templates.
          </p>

          {/* Drag & Drop Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--accent, #3b82f6)',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center',
              backgroundColor: 'rgba(59, 130, 246, 0.04)',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".docx"
              style={{ display: 'none' }}
            />
            <UploadCloud size={36} color="var(--accent, #3b82f6)" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
              {file ? file.name : 'Click to browse or drag and drop .docx file'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted, #94a3b8)' }}>
              {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Supports standard Grade/Curriculum chapter documents'}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#f87171',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Parsed Preview */}
          {parsedChapter && (
            <div
              style={{
                padding: '14px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 700, fontSize: '13px' }}>
                <CheckCircle2 size={16} />
                <span>Chapter Successfully Parsed!</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                {parsedChapter.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {parsedChapter.lessons.length} lessons detected • {parsedChapter.lessons.filter(l => !!l.codingActivity).length} hands-on coding labs ready
              </div>
              <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                {parsedChapter.lessons.map((l, idx) => (
                  <div key={idx} style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>•</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{l.title}</span>
                    <span>({l.pages.length} pages)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            backgroundColor: 'var(--bg-tab, #181818)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '7px 14px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle, rgba(255,255,255,0.15))',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary, #cbd5e1)',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Cancel
          </button>

          {!parsedChapter ? (
            <button
              onClick={handleUploadAndParse}
              disabled={!file || isUploading}
              style={{
                padding: '7px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'var(--accent, #3b82f6)',
                color: '#ffffff',
                cursor: !file || isUploading ? 'not-allowed' : 'pointer',
                opacity: !file || isUploading ? 0.6 : 1,
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {isUploading ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
              <span>{isUploading ? 'Compiling Document...' : 'Upload & Compile'}</span>
            </button>
          ) : (
            <button
              onClick={handleConfirmImport}
              style={{
                padding: '7px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#10b981',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CheckCircle2 size={14} />
              <span>Open in Flipbook</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
