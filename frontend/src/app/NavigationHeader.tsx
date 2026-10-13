import React from 'react';
import {
  BookOpen,
  Columns,
  Code2,
  List,
  Sun,
  Moon,
  Laptop,
  UploadCloud,
} from 'lucide-react';
import { Course, Lesson, ChapterSection } from '../learning/types/curriculum';

export type PlatformViewMode = 'book-only' | 'split' | 'code-only';

interface NavigationHeaderProps {
  course: Course;
  lesson: Lesson;
  sections?: ChapterSection[];
  currentSectionIndex?: number;
  onJumpToSection?: (sectionIndex: number) => void;
  currentPageNumber?: number;
  totalPages?: number;
  viewMode: PlatformViewMode;
  onChangeViewMode: (mode: PlatformViewMode) => void;
  onOpenTableOfContents: () => void;
  onOpenUpload?: () => void;
  onToggleTheme: () => void;
  currentTheme: 'dark' | 'light';
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  course,
  lesson,
  sections,
  currentSectionIndex,
  onJumpToSection,
  currentPageNumber,
  totalPages,
  viewMode,
  onChangeViewMode,
  onOpenTableOfContents,
  onOpenUpload,
  onToggleTheme,
  currentTheme,
}) => {
  const currentSection = sections && currentSectionIndex !== undefined ? sections[currentSectionIndex] : undefined;

  return (
    <header
      style={{
        height: '46px',
        backgroundColor: 'var(--bg-header)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        fontSize: '13px',
        zIndex: 20,
        boxSizing: 'border-box',
      }}
    >
      {/* Left: Branding & Section Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: 'var(--text-primary)' }}>
          <Laptop size={19} color="var(--accent)" />
          <span style={{ letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>NovaPad</span>
        </div>

        <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-subtle)' }} />

        {/* Table of Contents Modal trigger */}
        <button
          onClick={onOpenTableOfContents}
          title="Open Course Table of Contents"
          style={{
            background: 'var(--bg-button)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '5px 9px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '12px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          <List size={14} color="var(--accent)" />
          <span>Curriculum</span>
        </button>

        {/* Section Dropdown Selector */}
        {sections && sections.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 650,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}
            >
              Topic:
            </span>
            <select
              value={currentSectionIndex ?? 0}
              onChange={(e) => onJumpToSection?.(Number(e.target.value))}
              title="Jump directly to any section in Chapter 1"
              style={{
                backgroundColor: 'var(--bg-input, #1e293b)',
                color: 'var(--text-primary, #f8fafc)',
                border: '1px solid var(--border-subtle, rgba(255,255,255,0.18))',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
                maxWidth: '280px',
                textOverflow: 'ellipsis',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              {sections.map((sec, idx) => (
                <option key={sec.id} value={idx}>
                  {sec.sectionNumber}. {sec.title} (p. {sec.startPage}) {sec.isCodingLab ? '⚡ Lab' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Active Coding Lab Badge */}
        {currentSection?.isCodingLab && (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 650,
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--success, #10b981)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <span>⚡ Interactive Lab</span>
          </span>
        )}
      </div>

      {/* Center: View Switcher (Book Only | Split View | Code Only) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '2px',
        }}
      >
        <button
          onClick={() => onChangeViewMode('book-only')}
          title="Full Book Reading View"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: viewMode === 'book-only' ? 'var(--accent)' : 'transparent',
            color: viewMode === 'book-only' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all 0.15s ease',
          }}
        >
          <BookOpen size={14} />
          <span>Book View</span>
        </button>

        <button
          onClick={() => onChangeViewMode('split')}
          title="Side-by-Side: Book on Left, Coding IDE on Right"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 14px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: viewMode === 'split' ? 'var(--accent)' : 'transparent',
            color: viewMode === 'split' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all 0.15s ease',
          }}
        >
          <Columns size={14} />
          <span>Side-by-Side (Split)</span>
        </button>

        <button
          onClick={() => onChangeViewMode('code-only')}
          title="Full IDE Coding View"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: viewMode === 'code-only' ? 'var(--accent)' : 'transparent',
            color: viewMode === 'code-only' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all 0.15s ease',
          }}
        >
          <Code2 size={14} />
          <span>Code Only</span>
        </button>
      </div>

      {/* Right: Upload Chapter & Theme Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {onOpenUpload && (
          <button
            onClick={onOpenUpload}
            title="Upload chapter from Word document (.docx)"
            style={{
              background: 'var(--bg-button)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '5px 10px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
          >
            <UploadCloud size={14} color="var(--accent)" />
            <span>Upload Chapter</span>
          </button>
        )}

        <button
          onClick={onToggleTheme}
          title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Theme`}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {currentTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
};
