import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  List,
  BookOpen,
  Code2,
  Volume2,
  VolumeX,
  FileText,
  Columns2,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  Type,
} from 'lucide-react';
import { Lesson, Course, CodingActivityConfig, ChapterSection } from '../types/curriculum';
import { FlipbookPage } from './FlipbookPage';
import { FlipbookEndPage } from './FlipbookEndPage';
import {
  BookTheme,
  BookFontSize,
  BookFontFamily,
} from '../types/bookTheme';
import { playPageFlipSound } from '../utils/soundEffects';
import './FlipbookReader.css';

interface FlipbookReaderProps {
  course: Course;
  lesson: Lesson;
  currentPageIndex: number;
  onPageChange: (newPageIndex: number) => void;
  onOpenTableOfContents: () => void;
  onLaunchCoding: (activityOverride?: CodingActivityConfig) => void;
  isSplitViewActive?: boolean;
  onNextLesson?: () => void;
  onPrevLesson?: () => void;
  nextLessonTitle?: string;
  prevLessonTitle?: string;
  onToggleFocusMode?: () => void;
  isFocusMode?: boolean;
  onInsertCodeToEditor?: (code: string) => void;
}

export const FlipbookReader: React.FC<FlipbookReaderProps> = ({
  course,
  lesson,
  currentPageIndex,
  onPageChange,
  onOpenTableOfContents,
  onLaunchCoding,
  isSplitViewActive,
  onNextLesson,
  onPrevLesson,
  nextLessonTitle,
  prevLessonTitle,
  onToggleFocusMode,
  isFocusMode,
  onInsertCodeToEditor,
}) => {
  const totalPages = lesson.pages.length;

  // View Layout Mode: 'spread' (Two-Page Book in full view) vs 'single' (Single Page in side-by-side view)
  const [layoutMode, setLayoutMode] = useState<'spread' | 'single'>(() => {
    return isSplitViewActive ? 'single' : 'spread';
  });

  // Automatically adapt layout mode when toggling between side-by-side split view and full book view
  useEffect(() => {
    setLayoutMode(isSplitViewActive ? 'single' : 'spread');
  }, [isSplitViewActive]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [bookTheme, setBookTheme] = useState<BookTheme>(() => {
    return (localStorage.getItem('flipbook_theme') as BookTheme) || 'dark';
  });

  const handleThemeChange = (newTheme: BookTheme) => {
    setBookTheme(newTheme);
    try {
      localStorage.setItem('flipbook_theme', newTheme);
    } catch {
      // ignore local storage restrictions if any
    }
  };

  // Font Size: 'normal' (16.5px) | 'large' (19px) | 'xlarge' (22px)
  const [fontSize, setFontSize] = useState<BookFontSize>(() => {
    return (localStorage.getItem('flipbook_font_size') as BookFontSize) || 'normal';
  });

  const handleFontSizeChange = (size: BookFontSize) => {
    setFontSize(size);
    try {
      localStorage.setItem('flipbook_font_size', size);
    } catch {
      // ignore
    }
  };

  // Font Family: 'sans' (Modern crisp Inter) | 'serif' (Classic book Merriweather)
  const [fontFamily, setFontFamily] = useState<BookFontFamily>(() => {
    return (localStorage.getItem('flipbook_font_family') as BookFontFamily) || 'sans';
  });

  const handleFontFamilyChange = (fam: BookFontFamily) => {
    setFontFamily(fam);
    try {
      localStorage.setItem('flipbook_font_family', fam);
    } catch {
      // ignore
    }
  };

  // Flip Animation State: 'forward' | 'backward' | null
  const [flipAnimation, setFlipAnimation] = useState<'forward' | 'backward' | null>(null);
  const isFlippingRef = useRef(false);

  // Synchronized scrolling refs and lock flag for two-page spread mode
  const leftScrollRef = useRef<HTMLDivElement | null>(null);
  const rightScrollRef = useRef<HTMLDivElement | null>(null);
  const isSyncingSpreadScrollRef = useRef<boolean>(false);

  // Bidirectional synchronized scroll handler for left page
  const handleLeftScroll = useCallback(() => {
    if (isSyncingSpreadScrollRef.current) return;
    const left = leftScrollRef.current;
    const right = rightScrollRef.current;
    if (!left || !right) return;

    const maxLeft = left.scrollHeight - left.clientHeight;
    const maxRight = right.scrollHeight - right.clientHeight;

    if (maxLeft > 0 && maxRight > 0) {
      const ratio = left.scrollTop / maxLeft;
      const targetY = Math.round(ratio * maxRight);
      if (Math.abs(right.scrollTop - targetY) > 1) {
        isSyncingSpreadScrollRef.current = true;
        right.scrollTop = targetY;
        requestAnimationFrame(() => {
          isSyncingSpreadScrollRef.current = false;
        });
      }
    } else if (maxRight > 0) {
      isSyncingSpreadScrollRef.current = true;
      right.scrollTop = left.scrollTop;
      requestAnimationFrame(() => {
        isSyncingSpreadScrollRef.current = false;
      });
    }
  }, []);

  // Bidirectional synchronized scroll handler for right page
  const handleRightScroll = useCallback(() => {
    if (isSyncingSpreadScrollRef.current) return;
    const left = leftScrollRef.current;
    const right = rightScrollRef.current;
    if (!left || !right) return;

    const maxLeft = left.scrollHeight - left.clientHeight;
    const maxRight = right.scrollHeight - right.clientHeight;

    if (maxLeft > 0 && maxRight > 0) {
      const ratio = right.scrollTop / maxRight;
      const targetY = Math.round(ratio * maxLeft);
      if (Math.abs(left.scrollTop - targetY) > 1) {
        isSyncingSpreadScrollRef.current = true;
        left.scrollTop = targetY;
        requestAnimationFrame(() => {
          isSyncingSpreadScrollRef.current = false;
        });
      }
    } else if (maxLeft > 0) {
      isSyncingSpreadScrollRef.current = true;
      left.scrollTop = right.scrollTop;
      requestAnimationFrame(() => {
        isSyncingSpreadScrollRef.current = false;
      });
    }
  }, []);

  // Synchronized mouse-wheel handler over the entire two-page spread (including spine/gutters)
  const handleBookWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const left = leftScrollRef.current;
    const right = rightScrollRef.current;
    if (!left || !right) return;

    const target = e.target as HTMLElement;
    const isOverLeft = left.contains(target);
    const isOverRight = right.contains(target);

    const maxLeft = left.scrollHeight - left.clientHeight;
    const maxRight = right.scrollHeight - right.clientHeight;

    // When hovering over spine or outer margins
    if (!isOverLeft && !isOverRight) {
      if (maxLeft > 0) {
        left.scrollTop += e.deltaY;
      } else if (maxRight > 0) {
        right.scrollTop += e.deltaY;
      }
      return;
    }

    // If hovering over left, but left cannot scroll further in this direction
    if (isOverLeft) {
      const cannotScrollDown = e.deltaY > 0 && left.scrollTop >= maxLeft - 1;
      const cannotScrollUp = e.deltaY < 0 && left.scrollTop <= 1;
      if ((maxLeft <= 0 || cannotScrollDown || cannotScrollUp) && maxRight > 0) {
        right.scrollTop += e.deltaY;
      }
    }

    // If hovering over right, but right cannot scroll further in this direction
    if (isOverRight) {
      const cannotScrollDown = e.deltaY > 0 && right.scrollTop >= maxRight - 1;
      const cannotScrollUp = e.deltaY < 0 && right.scrollTop <= 1;
      if ((maxRight <= 0 || cannotScrollDown || cannotScrollUp) && maxLeft > 0) {
        left.scrollTop += e.deltaY;
      }
    }
  }, []);

  // Calculate spreads (2 pages per spread in book mode)
  // Spread 0: Pages 0 & 1 (Page 1 & 2 in 1-indexed)
  // Spread 1: Pages 2 & 3 (Page 3 & 4 in 1-indexed)
  const currentSpreadIndex = Math.floor(currentPageIndex / 2);
  const totalSpreads = Math.ceil(totalPages / 2);

  // Reset scroll to top on spread change or lesson change
  useEffect(() => {
    if (leftScrollRef.current) {
      leftScrollRef.current.scrollTop = 0;
    }
    if (rightScrollRef.current) {
      rightScrollRef.current.scrollTop = 0;
    }
  }, [currentSpreadIndex, currentPageIndex, lesson.id]);

  const leftPageIndex = currentSpreadIndex * 2;
  const rightPageIndex = currentSpreadIndex * 2 + 1;

  const leftPage = lesson.pages[leftPageIndex];
  const rightPage = lesson.pages[rightPageIndex]; // may be undefined if totalPages is odd

  const currentSectionIndex = lesson.sections && lesson.sections.length > 0
    ? lesson.sections.findIndex((s) => {
        const pageNum = currentPageIndex + 1;
        return pageNum >= s.startPage && pageNum <= s.endPage;
      })
    : -1;

  const activeCodingActivity =
    lesson.pages[currentPageIndex]?.codingActivity ||
    leftPage?.codingActivity ||
    rightPage?.codingActivity ||
    (currentSectionIndex >= 0 && lesson.sections ? lesson.sections[currentSectionIndex]?.codingActivity : undefined) ||
    lesson.codingActivity;

  // Handle Turn to Next Spread
  const handleFlipNext = useCallback(() => {
    if (isFlippingRef.current) return;

    if (currentSpreadIndex < totalSpreads - 1) {
      isFlippingRef.current = true;
      setFlipAnimation('forward');
      playPageFlipSound(soundEnabled);

      setTimeout(() => {
        const nextSpread = currentSpreadIndex + 1;
        onPageChange(nextSpread * 2);
        setFlipAnimation(null);
        isFlippingRef.current = false;
      }, 500);
    } else if (onNextLesson) {
      // Reached end of current lesson -> turn to next lesson!
      playPageFlipSound(soundEnabled);
      onNextLesson();
    }
  }, [currentSpreadIndex, totalSpreads, onPageChange, onNextLesson, soundEnabled]);

  // Handle Turn to Previous Spread
  const handleFlipPrev = useCallback(() => {
    if (isFlippingRef.current) return;

    if (currentSpreadIndex > 0) {
      isFlippingRef.current = true;
      setFlipAnimation('backward');
      playPageFlipSound(soundEnabled);

      setTimeout(() => {
        const prevSpread = currentSpreadIndex - 1;
        onPageChange(prevSpread * 2);
        setFlipAnimation(null);
        isFlippingRef.current = false;
      }, 500);
    } else if (onPrevLesson) {
      // At beginning of current lesson -> turn back to previous lesson!
      playPageFlipSound(soundEnabled);
      onPrevLesson();
    }
  }, [currentSpreadIndex, onPageChange, onPrevLesson, soundEnabled]);

  // Single page mode handlers
  const handleSinglePrev = useCallback(() => {
    if (currentPageIndex > 0) {
      playPageFlipSound(soundEnabled);
      onPageChange(currentPageIndex - 1);
    } else if (onPrevLesson) {
      playPageFlipSound(soundEnabled);
      onPrevLesson();
    }
  }, [currentPageIndex, onPageChange, onPrevLesson, soundEnabled]);

  const handleSingleNext = useCallback(() => {
    if (currentPageIndex < totalPages - 1) {
      playPageFlipSound(soundEnabled);
      onPageChange(currentPageIndex + 1);
    } else if (onNextLesson) {
      playPageFlipSound(soundEnabled);
      onNextLesson();
    }
  }, [currentPageIndex, totalPages, onPageChange, onNextLesson, soundEnabled]);

  // Keyboard navigation (ArrowLeft & ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if ((e.target as HTMLElement).closest('.monaco-editor')) return;

      if (e.key === 'ArrowLeft') {
        if (layoutMode === 'spread') {
          handleFlipPrev();
        } else {
          handleSinglePrev();
        }
      } else if (e.key === 'ArrowRight') {
        if (layoutMode === 'spread') {
          handleFlipNext();
        } else {
          handleSingleNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [layoutMode, handleFlipPrev, handleFlipNext, handleSinglePrev, handleSingleNext]);

  // Helper for current spread page numbers label (e.g. "Pages 1-2 of 4")
  const getSpreadLabel = () => {
    if (layoutMode === 'single') {
      return `Page ${currentPageIndex + 1} of ${totalPages}`;
    }
    const p1 = leftPageIndex + 1;
    const p2 = rightPage ? rightPageIndex + 1 : 'End';
    return `Pages ${p1}-${p2} of ${totalPages}`;
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#121214',
        borderRight: isSplitViewActive ? '1px solid var(--border-subtle)' : 'none',
        overflow: 'hidden',
      }}
    >
      {/* Top Reader Sub-Header */}
      <div
        style={{
          height: '42px',
          backgroundColor: 'var(--bg-tab, #181818)',
          borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          fontSize: '12px',
          zIndex: 20,
        }}
      >
        {/* Left: Contents & Course/Chapter Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onOpenTableOfContents}
            title="Open Table of Contents"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary, #cbd5e1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'background 0.15s ease',
            }}
          >
            <List size={15} color="var(--accent, #3b82f6)" />
            <span>Contents</span>
          </button>

          <span style={{ color: 'var(--border-subtle, rgba(255,255,255,0.15))' }}>|</span>

          {lesson.sections && lesson.sections.length > 0 ? (
            <select
              value={currentSectionIndex >= 0 ? currentSectionIndex : 0}
              onChange={(e) => {
                const sec = lesson.sections?.[Number(e.target.value)];
                if (sec) {
                  onPageChange(sec.startPage - 1);
                }
              }}
              title="Jump directly to any section"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-primary, #f8fafc)',
                border: '1px solid var(--border-subtle, rgba(255,255,255,0.15))',
                borderRadius: '5px',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
                maxWidth: isSplitViewActive ? '200px' : '340px',
                textOverflow: 'ellipsis',
              }}
            >
              {lesson.sections.map((sec, idx) => (
                <option key={sec.id} value={idx}>
                  {sec.sectionNumber}. {sec.title} (p. {sec.startPage}) {sec.isCodingLab ? '⚡ Lab' : ''}
                </option>
              ))}
            </select>
          ) : (
            <span
              style={{
                color: 'var(--text-muted, #94a3b8)',
                maxWidth: isSplitViewActive ? '180px' : '360px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: 500,
              }}
            >
              {lesson.title}
            </span>
          )}
        </div>

        {/* Right: Layout Switcher, Font Controls, Audio Toggle, and Coding Lab Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Font Size Selector (A / A+ / A++) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '6px',
              padding: '2px',
              border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
            }}
          >
            <button
              onClick={() => handleFontSizeChange('normal')}
              title="Standard Font Size (16.5px)"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '3px 8px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '11px',
                fontWeight: 650,
                cursor: 'pointer',
                backgroundColor: fontSize === 'normal' ? 'var(--accent, #3b82f6)' : 'transparent',
                color: fontSize === 'normal' ? '#ffffff' : 'var(--text-muted, #94a3b8)',
              }}
            >
              A
            </button>
            <button
              onClick={() => handleFontSizeChange('large')}
              title="Large Font Size (19px) - Highly Legible"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '3px 8px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 750,
                cursor: 'pointer',
                backgroundColor: fontSize === 'large' ? 'var(--accent, #3b82f6)' : 'transparent',
                color: fontSize === 'large' ? '#ffffff' : 'var(--text-muted, #94a3b8)',
              }}
            >
              A+
            </button>
            <button
              onClick={() => handleFontSizeChange('xlarge')}
              title="Extra Large Font Size (22px) - Maximum Comfort"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '3px 8px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 850,
                cursor: 'pointer',
                backgroundColor: fontSize === 'xlarge' ? 'var(--accent, #3b82f6)' : 'transparent',
                color: fontSize === 'xlarge' ? '#ffffff' : 'var(--text-muted, #94a3b8)',
              }}
            >
              A++
            </button>
          </div>

          {/* Font Family (Sans vs Serif) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '6px',
              padding: '2px',
              border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
            }}
          >
            <button
              onClick={() => handleFontFamilyChange('sans')}
              title="Clean Modern Sans Font"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '3px 7px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'sans-serif',
                cursor: 'pointer',
                backgroundColor: fontFamily === 'sans' ? 'var(--accent, #3b82f6)' : 'transparent',
                color: fontFamily === 'sans' ? '#ffffff' : 'var(--text-muted, #94a3b8)',
              }}
            >
              <span>Sans</span>
            </button>
            <button
              onClick={() => handleFontFamilyChange('serif')}
              title="Classic Editorial Book Serif"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '3px 7px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'serif',
                cursor: 'pointer',
                backgroundColor: fontFamily === 'serif' ? 'var(--accent, #3b82f6)' : 'transparent',
                color: fontFamily === 'serif' ? '#ffffff' : 'var(--text-muted, #94a3b8)',
              }}
            >
              <span>Serif</span>
            </button>
          </div>

          {/* Theme Selector (Dark / Paper / Sepia) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '6px',
              padding: '2px',
              border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
            }}
          >
            <button
              onClick={() => handleThemeChange('dark')}
              title="Crisp Dark Theme"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 7px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: bookTheme === 'dark' ? 'var(--accent, #3b82f6)' : 'transparent',
                color: bookTheme === 'dark' ? '#ffffff' : 'var(--text-muted, #94a3b8)',
              }}
            >
              <Moon size={12} />
              <span>Dark</span>
            </button>

            <button
              onClick={() => handleThemeChange('paper')}
              title="Authentic Paper Book Theme"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 7px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: bookTheme === 'paper' ? 'var(--accent, #3b82f6)' : 'transparent',
                color: bookTheme === 'paper' ? '#ffffff' : 'var(--text-muted, #94a3b8)',
              }}
            >
              <Sun size={12} />
              <span>Paper</span>
            </button>

            <button
              onClick={() => handleThemeChange('sepia')}
              title="Warm Sepia Theme"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 7px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: bookTheme === 'sepia' ? 'var(--accent, #3b82f6)' : 'transparent',
                color: bookTheme === 'sepia' ? '#ffffff' : 'var(--text-muted, #94a3b8)',
              }}
            >
              <span>Sepia</span>
            </button>
          </div>

          {/* Two-Page Spread vs Single Page Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '6px',
              padding: '2px',
              border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
            }}
          >
            <button
              onClick={() => setLayoutMode('spread')}
              title="Two-Page Open Book Spread"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: layoutMode === 'spread' ? 'var(--accent, #3b82f6)' : 'transparent',
                color: layoutMode === 'spread' ? '#ffffff' : 'var(--text-muted, #94a3b8)',
              }}
            >
              <Columns2 size={13} />
              <span>Two Pages</span>
            </button>

            <button
              onClick={() => setLayoutMode('single')}
              title="Single Page Reader View"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: layoutMode === 'single' ? 'var(--accent, #3b82f6)' : 'transparent',
                color: layoutMode === 'single' ? '#ffffff' : 'var(--text-muted, #94a3b8)',
              }}
            >
              <FileText size={13} />
              <span>Single</span>
            </button>
          </div>

          {/* Focus / Maximize Book button */}
          {onToggleFocusMode && (
            <button
              onClick={onToggleFocusMode}
              title={isFocusMode ? 'Switch to Side-by-Side Split View' : 'Maximize Book (Full Screen Reading)'}
              style={{
                backgroundColor: isFocusMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: isFocusMode ? 'var(--accent, #3b82f6)' : 'var(--text-muted, #94a3b8)',
                border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {isFocusMode ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              <span>{isFocusMode ? 'Split' : 'Maximize'}</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            title={soundEnabled ? 'Page flip sound: ON' : 'Page flip sound: MUTED'}
            style={{
              background: 'transparent',
              border: 'none',
              color: soundEnabled ? 'var(--accent, #3b82f6)' : 'var(--text-muted, #64748b)',
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Quick Launch Button in Header if Coding is Available */}
          {activeCodingActivity?.enabled && (
            <button
              onClick={() => onLaunchCoding(activeCodingActivity)}
              title="Open Attached Coding Lab"
              style={{
                backgroundColor: isSplitViewActive ? 'rgba(59, 130, 246, 0.15)' : 'var(--accent, #3b82f6)',
                color: isSplitViewActive ? 'var(--accent, #3b82f6)' : '#ffffff',
                border: isSplitViewActive ? '1px solid var(--accent, #3b82f6)' : 'none',
                borderRadius: '5px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Code2 size={13} />
              <span>{isSplitViewActive ? 'Lab Active' : '⚡ Coding Lab'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Book Reading Stage */}
      <div
        className="flipbook-stage"
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: isSplitViewActive ? '8px 36px' : '14px 44px',
          position: 'relative',
        }}
      >
        {/* Floating Left Margin Navigation Button */}
        <button
          onClick={layoutMode === 'spread' ? handleFlipPrev : handleSinglePrev}
          disabled={
            layoutMode === 'spread'
              ? currentSpreadIndex === 0 && !onPrevLesson
              : currentPageIndex === 0 && !onPrevLesson
          }
          className="flipbook-margin-nav left"
          title={layoutMode === 'spread' ? 'Flip to previous pages' : 'Flip to previous page'}
          style={{
            visibility:
              (layoutMode === 'spread'
                ? currentSpreadIndex === 0 && !onPrevLesson
                : currentPageIndex === 0 && !onPrevLesson)
                ? 'hidden'
                : 'visible',
          }}
        >
          <ChevronLeft size={20} />
        </button>

        {/* Floating Right Margin Navigation Button */}
        <button
          onClick={layoutMode === 'spread' ? handleFlipNext : handleSingleNext}
          disabled={
            layoutMode === 'spread'
              ? currentSpreadIndex >= totalSpreads - 1 && !onNextLesson
              : currentPageIndex >= totalPages - 1 && !onNextLesson
          }
          className="flipbook-margin-nav right"
          title={layoutMode === 'spread' ? 'Flip to next pages' : 'Flip to next page'}
          style={{
            visibility:
              (layoutMode === 'spread'
                ? currentSpreadIndex >= totalSpreads - 1 && !onNextLesson
                : currentPageIndex >= totalPages - 1 && !onNextLesson)
                ? 'hidden'
                : 'visible',
          }}
        >
          <ChevronRight size={20} />
        </button>

        {/* ============================================================== */}
        {/* TWO-PAGE SPREAD BOOK MODE */}
        {/* ============================================================== */}
        {layoutMode === 'spread' ? (
          <div
            className={`flipbook-book theme-${bookTheme}`}
            onWheel={handleBookWheel}
            style={{
              maxWidth: isSplitViewActive ? '100%' : '1600px',
              height: '100%',
            }}
          >
            {/* LEFT PAGE (Verso) */}
            <div className="flipbook-half-page">
              {leftPage && (
                <FlipbookPage
                  scrollRef={leftScrollRef}
                  onScroll={handleLeftScroll}
                  page={leftPage}
                  totalPages={totalPages}
                  lessonTitle={lesson.title}
                  chapterTitle={course.title}
                  side="left"
                  onFlipCorner={currentSpreadIndex > 0 || onPrevLesson ? handleFlipPrev : undefined}
                  onInsertCode={onInsertCodeToEditor}
                  codingActivity={leftPage.codingActivity || activeCodingActivity}
                  onLaunchCoding={onLaunchCoding}
                  isSplitViewActive={isSplitViewActive}
                  bookTheme={bookTheme}
                  fontSize={fontSize}
                  fontFamily={fontFamily}
                />
              )}
            </div>

            {/* AUTHENTIC CENTER BOOK SPINE */}
            <div className="flipbook-spine" />

            {/* RIGHT PAGE (Recto) */}
            <div className="flipbook-half-page">
              {rightPage ? (
                <FlipbookPage
                  scrollRef={rightScrollRef}
                  onScroll={handleRightScroll}
                  page={rightPage}
                  totalPages={totalPages}
                  lessonTitle={lesson.title}
                  chapterTitle={course.title}
                  side="right"
                  onFlipCorner={currentSpreadIndex < totalSpreads - 1 || onNextLesson ? handleFlipNext : undefined}
                  onInsertCode={onInsertCodeToEditor}
                  codingActivity={rightPage.codingActivity || activeCodingActivity}
                  onLaunchCoding={onLaunchCoding}
                  isSplitViewActive={isSplitViewActive}
                  bookTheme={bookTheme}
                  fontSize={fontSize}
                  fontFamily={fontFamily}
                />
              ) : (
                <FlipbookEndPage
                  scrollRef={rightScrollRef}
                  onScroll={handleRightScroll}
                  lesson={lesson}
                  nextLessonTitle={nextLessonTitle}
                  onGoToNextLesson={onNextLesson}
                  onLaunchCoding={onLaunchCoding}
                  isSplitViewActive={isSplitViewActive}
                  bookTheme={bookTheme}
                  fontSize={fontSize}
                  fontFamily={fontFamily}
                />
              )}
            </div>

            {/* ========================================================== */}
            {/* 3D TURNING LEAF DURING PAGE FLIP ANIMATION */}
            {/* ========================================================== */}
            {flipAnimation === 'forward' && (
              <div className="flipbook-turning-leaf forward">
                {/* Front of leaf: current right page turning away */}
                <div className="flipbook-leaf-face front">
                  {rightPage ? (
                    <FlipbookPage
                      page={rightPage}
                      totalPages={totalPages}
                      lessonTitle={lesson.title}
                      chapterTitle={course.title}
                      side="right"
                      bookTheme={bookTheme}
                      fontSize={fontSize}
                      fontFamily={fontFamily}
                    />
                  ) : (
                    <FlipbookEndPage lesson={lesson} bookTheme={bookTheme} fontSize={fontSize} fontFamily={fontFamily} />
                  )}
                </div>
                {/* Back of leaf: incoming next left page appearing */}
                <div className="flipbook-leaf-face back">
                  {lesson.pages[(currentSpreadIndex + 1) * 2] && (
                    <FlipbookPage
                      page={lesson.pages[(currentSpreadIndex + 1) * 2]}
                      totalPages={totalPages}
                      lessonTitle={lesson.title}
                      chapterTitle={course.title}
                      side="left"
                      bookTheme={bookTheme}
                      fontSize={fontSize}
                      fontFamily={fontFamily}
                    />
                  )}
                </div>
              </div>
            )}

            {flipAnimation === 'backward' && (
              <div className="flipbook-turning-leaf backward">
                {/* Front of leaf: current left page turning back */}
                <div className="flipbook-leaf-face front">
                  {leftPage && (
                    <FlipbookPage
                      page={leftPage}
                      totalPages={totalPages}
                      lessonTitle={lesson.title}
                      chapterTitle={course.title}
                      side="left"
                      bookTheme={bookTheme}
                      fontSize={fontSize}
                      fontFamily={fontFamily}
                    />
                  )}
                </div>
                {/* Back of leaf: incoming previous right page appearing */}
                <div className="flipbook-leaf-face back">
                  {lesson.pages[(currentSpreadIndex - 1) * 2 + 1] && (
                    <FlipbookPage
                      page={lesson.pages[(currentSpreadIndex - 1) * 2 + 1]}
                      totalPages={totalPages}
                      lessonTitle={lesson.title}
                      chapterTitle={course.title}
                      side="right"
                      bookTheme={bookTheme}
                      fontSize={fontSize}
                      fontFamily={fontFamily}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ============================================================== */
          /* SINGLE PAGE MODE */
          /* ============================================================== */
          <div
            className={`theme-${bookTheme}`}
            style={{
              width: '100%',
              maxWidth: isSplitViewActive ? '1080px' : '1080px',
              height: '100%',
              backgroundColor: bookTheme === 'dark' ? '#12151f' : bookTheme === 'paper' ? '#fbfbf9' : '#f6efe0',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {lesson.pages[currentPageIndex] && (
              <FlipbookPage
                key={`single-p${currentPageIndex}`}
                page={lesson.pages[currentPageIndex]}
                totalPages={totalPages}
                lessonTitle={lesson.title}
                chapterTitle={course.title}
                side="single"
                onFlipCorner={currentPageIndex < totalPages - 1 || onNextLesson ? handleSingleNext : undefined}
                onFlipPrevCorner={currentPageIndex > 0 || onPrevLesson ? handleSinglePrev : undefined}
                onInsertCode={onInsertCodeToEditor}
                codingActivity={lesson.pages[currentPageIndex]?.codingActivity || activeCodingActivity}
                onLaunchCoding={onLaunchCoding}
                isSplitViewActive={isSplitViewActive}
                bookTheme={bookTheme}
                fontSize={fontSize}
                fontFamily={fontFamily}
              />
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation & Scrubber Bar */}
      <div
        style={{
          height: '48px',
          backgroundColor: 'var(--bg-tab, #181818)',
          borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          fontSize: '12px',
          zIndex: 20,
        }}
      >
        {/* Left: Previous Pages Button */}
        <button
          onClick={layoutMode === 'spread' ? handleFlipPrev : handleSinglePrev}
          disabled={layoutMode === 'spread' ? currentSpreadIndex === 0 && !onPrevLesson : currentPageIndex === 0 && !onPrevLesson}
          style={{
            background: 'transparent',
            border: 'none',
            color:
              (layoutMode === 'spread' ? currentSpreadIndex === 0 : currentPageIndex === 0) && !onPrevLesson
                ? 'var(--text-muted, #64748b)'
                : 'var(--text-primary, #ffffff)',
            cursor:
              (layoutMode === 'spread' ? currentSpreadIndex === 0 : currentPageIndex === 0) && !onPrevLesson
                ? 'not-allowed'
                : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 600,
            opacity:
              (layoutMode === 'spread' ? currentSpreadIndex === 0 : currentPageIndex === 0) && !onPrevLesson
                ? 0.4
                : 1,
            padding: '6px 10px',
            borderRadius: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <ChevronLeft size={16} />
          <span>
            {layoutMode === 'spread'
              ? currentSpreadIndex === 0 && onPrevLesson
                ? 'Previous Lesson'
                : 'Previous Pages'
              : currentPageIndex === 0 && onPrevLesson
              ? 'Previous Lesson'
              : 'Previous'}
          </span>
        </button>

        {/* Center: Slider & Spread / Page Counter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            maxWidth: '360px',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <input
            type="range"
            min={0}
            max={layoutMode === 'spread' ? Math.max(0, totalSpreads - 1) : Math.max(0, totalPages - 1)}
            value={layoutMode === 'spread' ? currentSpreadIndex : currentPageIndex}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (layoutMode === 'spread') {
                onPageChange(val * 2);
              } else {
                onPageChange(val);
              }
            }}
            style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent, #3b82f6)' }}
          />
          <span
            style={{
              fontSize: '11px',
              color: 'var(--text-secondary, #cbd5e1)',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              padding: '3px 8px',
              borderRadius: '10px',
            }}
          >
            {getSpreadLabel()}
          </span>
        </div>

        {/* Right: Next Pages Button */}
        <button
          onClick={layoutMode === 'spread' ? handleFlipNext : handleSingleNext}
          disabled={layoutMode === 'spread' ? currentSpreadIndex >= totalSpreads - 1 && !onNextLesson : currentPageIndex >= totalPages - 1 && !onNextLesson}
          style={{
            background: 'transparent',
            border: 'none',
            color:
              (layoutMode === 'spread' ? currentSpreadIndex >= totalSpreads - 1 : currentPageIndex >= totalPages - 1) && !onNextLesson
                ? 'var(--text-muted, #64748b)'
                : 'var(--text-primary, #ffffff)',
            cursor:
              (layoutMode === 'spread' ? currentSpreadIndex >= totalSpreads - 1 : currentPageIndex >= totalPages - 1) && !onNextLesson
                ? 'not-allowed'
                : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 600,
            opacity:
              (layoutMode === 'spread' ? currentSpreadIndex >= totalSpreads - 1 : currentPageIndex >= totalPages - 1) && !onNextLesson
                ? 0.4
                : 1,
            padding: '6px 10px',
            borderRadius: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <span>
            {layoutMode === 'spread'
              ? currentSpreadIndex >= totalSpreads - 1 && onNextLesson
                ? 'Next Lesson'
                : 'Next Pages'
              : currentPageIndex >= totalPages - 1 && onNextLesson
              ? 'Next Lesson'
              : 'Next'}
          </span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
