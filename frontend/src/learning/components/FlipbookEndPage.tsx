import React from 'react';
import { Lesson, CodingActivityConfig } from '../types/curriculum';
import {
  BookTheme,
  BOOK_THEMES,
  BookFontSize,
  BookFontFamily,
  FONT_SIZE_TOKENS,
  FONT_FAMILY_STACKS,
} from '../types/bookTheme';
import { CheckCircle2, Code2, ArrowRight, BookOpen, Sparkles, Terminal } from 'lucide-react';

interface FlipbookEndPageProps {
  lesson: Lesson;
  nextLessonTitle?: string;
  onGoToNextLesson?: () => void;
  onLaunchCoding?: () => void;
  isSplitViewActive?: boolean;
  bookTheme?: BookTheme;
  fontSize?: BookFontSize;
  fontFamily?: BookFontFamily;
  scrollRef?: React.Ref<HTMLDivElement>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export const FlipbookEndPage: React.FC<FlipbookEndPageProps> = ({
  lesson,
  nextLessonTitle,
  onGoToNextLesson,
  onLaunchCoding,
  isSplitViewActive,
  bookTheme = 'dark',
  fontSize = 'normal',
  fontFamily = 'sans',
  scrollRef,
  onScroll,
}) => {
  const theme = BOOK_THEMES[bookTheme] || BOOK_THEMES.dark;
  const fontTokens = FONT_SIZE_TOKENS[fontSize] || FONT_SIZE_TOKENS.normal;
  const currentFontFamily = FONT_FAMILY_STACKS[fontFamily] || FONT_FAMILY_STACKS.sans;
  const isLightMode = bookTheme === 'paper' || bookTheme === 'sepia';

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className={`flipbook-page-scroll theme-${bookTheme}`}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.pageBg,
        color: theme.textBody,
        fontFamily: currentFontFamily,
        padding: '28px 34px 28px 28px',
        overflowY: 'auto',
        boxSizing: 'border-box',
        boxShadow: isLightMode
          ? 'inset 14px 0 16px -10px rgba(0, 0, 0, 0.1)'
          : 'inset 14px 0 16px -10px rgba(0, 0, 0, 0.45)',
        borderLeft: `1px solid ${theme.borderSubtle}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.borderSubtle}`,
          paddingBottom: '12px',
          marginBottom: '24px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: theme.textMuted,
            fontWeight: 700,
          }}
        >
          {lesson.title}
        </span>
        <span
          style={{
            fontSize: '11px',
            color: '#16a34a',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: isLightMode ? 'rgba(22, 163, 74, 0.12)' : 'rgba(34, 197, 94, 0.15)',
            padding: '3px 8px',
            borderRadius: '12px',
          }}
        >
          <CheckCircle2 size={12} />
          <span>Lesson Complete</span>
        </span>
      </div>

      {/* Main Card Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: 'var(--accent, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <Sparkles size={24} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px', color: theme.textPrimary }}>
            Lesson Wrap-Up
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: theme.textBody, lineHeight: 1.5 }}>
            You have completed all reading pages in <strong style={{ color: theme.textPrimary }}>{lesson.title}</strong>.
          </p>
        </div>

        {/* Lesson Summary Card */}
        <div
          style={{
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${theme.borderSubtle}`,
            fontSize: '13px',
            lineHeight: 1.6,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: theme.textMuted, marginBottom: '8px' }}>
            Concepts Mastered:
          </div>
          <div style={{ color: theme.textBody }}>
            {lesson.summary}
          </div>
        </div>

        {/* Coding Activity CTA Banner if available */}
        {lesson.codingActivity && lesson.codingActivity.enabled && onLaunchCoding && (
          <div
            style={{
              padding: '18px',
              borderRadius: '10px',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              backgroundColor: isLightMode ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={18} color="var(--accent, #3b82f6)" />
              <div style={{ fontWeight: 700, fontSize: '14px', color: theme.textPrimary }}>
                {lesson.codingActivity.title}
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', color: theme.textBody, lineHeight: 1.5 }}>
              Apply what you just learned directly in the interactive coding environment on the right.
            </p>
            <button
              onClick={onLaunchCoding}
              style={{
                alignSelf: 'flex-start',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '6px',
                backgroundColor: 'var(--accent, #3b82f6)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '12px',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
              }}
            >
              <Code2 size={14} />
              <span>{isSplitViewActive ? 'Coding Lab Active in Right Pane' : 'Open Hands-On Coding Lab'}</span>
            </button>
          </div>
        )}

        {/* Next Lesson Action */}
        {nextLessonTitle && onGoToNextLesson && (
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              border: `1px dashed ${theme.borderSubtle}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginTop: 'auto',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: theme.textMuted, fontWeight: 600 }}>
                Next in Course:
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: theme.textPrimary, marginTop: '2px' }}>
                {nextLessonTitle}
              </div>
            </div>
            <button
              onClick={onGoToNextLesson}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '6px',
                backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)',
                color: theme.textPrimary,
                border: `1px solid ${theme.borderSubtle}`,
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              <span>Continue</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: '24px',
          borderTop: `1px solid ${theme.borderSubtle}`,
          paddingTop: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: theme.textMuted,
        }}
      >
        <span>Interactive Learning Platform</span>
        <span>• End of Lesson •</span>
      </div>
    </div>
  );
};

