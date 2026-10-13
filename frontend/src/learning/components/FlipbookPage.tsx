import React, { useState } from 'react';
import { LessonPage, CodingActivityConfig } from '../types/curriculum';
import { CodingPromptBanner } from './CodingPromptBanner';
import {
  Copy,
  Check,
  Terminal,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  Wrench,
  Globe,
  Brain,
  Zap,
  CheckCircle2,
  ZoomIn,
  X,
  Code2,
  HelpCircle,
  ArrowUpRight,
} from 'lucide-react';
import {
  BookTheme,
  BOOK_THEMES,
  BookFontSize,
  BookFontFamily,
  FONT_SIZE_TOKENS,
  FONT_FAMILY_STACKS,
} from '../types/bookTheme';
import { copyToClipboard } from '../utils/clipboard';
export type { BookTheme, BookFontSize, BookFontFamily };
export { BOOK_THEMES, FONT_SIZE_TOKENS, FONT_FAMILY_STACKS };


interface FlipbookPageProps {
  page: LessonPage;
  totalPages: number;
  lessonTitle: string;
  codingActivity?: CodingActivityConfig;
  onLaunchCoding?: (activityOverride?: CodingActivityConfig) => void;
  isSplitViewActive?: boolean;
  side?: 'left' | 'right' | 'single';
  chapterTitle?: string;
  onFlipCorner?: () => void;
  onFlipPrevCorner?: () => void;
  onInsertCode?: (code: string) => void;
  bookTheme?: BookTheme;
  fontSize?: BookFontSize;
  fontFamily?: BookFontFamily;
  scrollRef?: React.Ref<HTMLDivElement>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

// Interactive copyable inline code chip
const InlineCode: React.FC<{ code: string; bookTheme: BookTheme }> = ({ code, bookTheme }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <code
      onClick={handleCopy}
      title={copied ? 'Copied to clipboard!' : `Click to copy: ${code}`}
      style={{
        padding: '2px 7px',
        borderRadius: '4px',
        backgroundColor: copied
          ? 'rgba(34, 197, 94, 0.22)'
          : bookTheme === 'dark'
          ? 'rgba(59, 130, 246, 0.18)'
          : 'rgba(59, 130, 246, 0.1)',
        color: copied
          ? '#4ade80'
          : bookTheme === 'dark'
          ? '#38bdf8'
          : '#0284c7',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '0.92em',
        fontWeight: 600,
        border: copied
          ? '1px solid rgba(34, 197, 94, 0.55)'
          : '1px solid rgba(59, 130, 246, 0.25)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        transition: 'all 0.15s ease',
        userSelect: 'all',
        verticalAlign: 'baseline',
      }}
    >
      <span>{code}</span>
      {copied ? (
        <Check size={11} color="#4ade80" style={{ flexShrink: 0 }} />
      ) : (
        <Copy size={10} style={{ opacity: 0.45, flexShrink: 0 }} />
      )}
    </code>
  );
};

export const FlipbookPage: React.FC<FlipbookPageProps> = ({
  page,
  totalPages,
  lessonTitle,
  codingActivity,
  onLaunchCoding,
  isSplitViewActive,
  side = 'single',
  chapterTitle,
  onFlipCorner,
  onFlipPrevCorner,
  onInsertCode,
  bookTheme = 'dark',
  fontSize = 'normal',
  fontFamily = 'sans',
  scrollRef,
  onScroll,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [insertStatusId, setInsertStatusId] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const theme = BOOK_THEMES[bookTheme] || BOOK_THEMES.dark;
  const fontTokens = FONT_SIZE_TOKENS[fontSize] || FONT_SIZE_TOKENS.normal;
  const currentFontFamily = FONT_FAMILY_STACKS[fontFamily] || FONT_FAMILY_STACKS.sans;
  const isLeft = side === 'left';
  const isRight = side === 'right';

  const handleCopyCode = async (code: string, id: string) => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 2000);
    }
  };

  const handleInsert = (code: string, id: string) => {
    if (onInsertCode) {
      onInsertCode(code);
      setInsertStatusId(id);
      setTimeout(() => setInsertStatusId((curr) => (curr === id ? null : curr)), 2000);
    }
  };

  // Helper to render inline text with **bold**, `code`, *italic*
  const renderInlineFormattedText = (text: string): React.ReactNode => {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        const codeContent = part.slice(1, -1);
        return (
          <InlineCode
            key={i}
            code={codeContent}
            bookTheme={bookTheme}
          />
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} style={{ color: theme.textPrimary, fontWeight: 700 }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Helper to render table blocks from consecutive markdown table rows
  const renderTable = (tableLines: string[], key: string | number) => {
    if (tableLines.length < 2) return null;
    const headerRow = tableLines[0].split('|').map((s) => s.trim()).filter(Boolean);
    const dataRows = tableLines.slice(2).map((row) =>
      row.split('|').map((s) => s.trim()).filter(Boolean)
    );

    return (
      <div
        key={key}
        style={{
          margin: '20px 0',
          overflowX: 'auto',
          borderRadius: '8px',
          border: `1px solid ${theme.tableBorder}`,
          backgroundColor: theme.pageBg,
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: fontTokens.table, textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: theme.tableHeaderBg, borderBottom: `1px solid ${theme.tableBorder}` }}>
              {headerRow.map((h, i) => (
                <th key={i} style={{ padding: '10px 14px', fontWeight: 700, color: theme.textPrimary }}>
                  {renderInlineFormattedText(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((r, rowIdx) => (
              <tr
                key={rowIdx}
                style={{
                  borderBottom: rowIdx < dataRows.length - 1 ? `1px solid ${theme.tableBorder}` : 'none',
                  backgroundColor: rowIdx % 2 === 1 ? theme.tableAltRow : 'transparent',
                }}
              >
                {r.map((cell, cellIdx) => (
                  <td key={cellIdx} style={{ padding: '10px 14px', color: theme.textBody, lineHeight: 1.6 }}>
                    {renderInlineFormattedText(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Parse rich content into structured blocks (Headings, Callouts, Tables, Code, Paragraphs)
  const formatContent = (content: string) => {
    const rawLines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < rawLines.length) {
      const line = rawLines[i];

      // Markdown Table grouping
      if (line.trim().startsWith('|')) {
        const tableLines: string[] = [];
        while (i < rawLines.length && rawLines[i].trim().startsWith('|')) {
          tableLines.push(rawLines[i]);
          i++;
        }
        elements.push(renderTable(tableLines, `tbl-${i}`));
        continue;
      }

      // Fenced Code Block grouping
      if (line.trim().startsWith('```')) {
        const lang = line.trim().replace('```', '') || 'python';
        const codeLines: string[] = [];
        i++;
        while (i < rawLines.length && !rawLines[i].trim().startsWith('```')) {
          codeLines.push(rawLines[i]);
          i++;
        }
        if (i < rawLines.length) i++; // consume closing ```
        const codeText = codeLines.join('\n');
        const codeId = `code-block-${i}`;
        const isCopied = copiedId === codeId;
        const isInserted = insertStatusId === codeId;
        elements.push(
          <div
            key={`code-${i}`}
            className="flipbook-code-block"
            style={{
              margin: '18px 0',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backgroundColor: '#080b12',
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: fontTokens.meta,
                color: '#94a3b8',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={13} color="#38bdf8" />
                <span style={{ textTransform: 'uppercase', fontWeight: 700, color: '#38bdf8' }}>{lang}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {onInsertCode && (
                  <button
                    onClick={() => handleInsert(codeText, codeId)}
                    title="Insert this code directly into your active IDE editor"
                    style={{
                      background: isInserted ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.15)',
                      border: isInserted ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(59, 130, 246, 0.35)',
                      color: isInserted ? '#4ade80' : '#60a5fa',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: fontTokens.meta,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '5px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isInserted ? <Check size={12} color="#4ade80" /> : <ArrowUpRight size={12} />}
                    <span>{isInserted ? 'Inserted!' : 'Insert to Editor'}</span>
                  </button>
                )}
                <button
                  onClick={() => handleCopyCode(codeText, codeId)}
                  title={isCopied ? 'Copied to clipboard!' : 'Copy code to clipboard'}
                  style={{
                    background: isCopied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    border: isCopied ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
                    color: isCopied ? '#4ade80' : '#e2e8f0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: fontTokens.meta,
                    fontWeight: 600,
                    padding: '3px 9px',
                    borderRadius: '5px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isCopied ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
                  <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
            <pre
              style={{
                margin: 0,
                padding: '16px 18px',
                fontSize: fontTokens.code,
                fontFamily: 'var(--font-mono, monospace)',
                color: '#f8fafc',
                overflowX: 'auto',
                lineHeight: 1.6,
                userSelect: 'text',
              }}
            >
              <code>{codeText}</code>
            </pre>
          </div>
        );
        continue;
      }

      // Headings
      if (line.startsWith('### ')) {
        elements.push(
          <h3
            key={`h3-${i}`}
            style={{
              fontSize: fontTokens.h3,
              fontWeight: 700,
              margin: '26px 0 12px',
              color: theme.textPrimary,
              letterSpacing: '-0.01em',
              lineHeight: 1.35,
            }}
          >
            {renderInlineFormattedText(line.replace('### ', ''))}
          </h3>
        );
        i++;
        continue;
      }

      if (line.startsWith('#### ')) {
        elements.push(
          <h4
            key={`h4-${i}`}
            style={{
              fontSize: fontTokens.h4,
              fontWeight: 700,
              margin: '20px 0 10px',
              color: theme.textPrimary,
              lineHeight: 1.4,
            }}
          >
            {renderInlineFormattedText(line.replace('#### ', ''))}
          </h4>
        );
        i++;
        continue;
      }

      // Check for Callout Boxes (Pedagogical Banners)
      const calloutConfig = getCalloutStyle(line);
      if (calloutConfig) {
        elements.push(
          <div
            key={`callout-${i}`}
            style={{
              margin: '22px 0',
              padding: '18px 20px',
              borderRadius: '10px',
              borderLeft: `5px solid ${calloutConfig.borderColor}`,
              backgroundColor: calloutConfig.bgColor,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px',
                fontWeight: 750,
                fontSize: fontTokens.meta,
                color: calloutConfig.titleColor,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {calloutConfig.icon}
              <span>{calloutConfig.badgeText}</span>
            </div>
            <div style={{ fontSize: fontTokens.callout, lineHeight: 1.7, color: theme.textBody }}>
              {renderInlineFormattedText(calloutConfig.bodyText)}
            </div>
          </div>
        );
        i++;
        continue;
      }

      // Standard Blockquote
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote
            key={`quote-${i}`}
            style={{
              margin: '18px 0',
              padding: '14px 18px',
              borderLeft: `4px solid ${theme.quoteBorder}`,
              backgroundColor: theme.quoteBg,
              borderRadius: '0 8px 8px 0',
              fontSize: fontTokens.body,
              lineHeight: fontTokens.lineHeight,
              color: theme.textBody,
              fontStyle: fontFamily === 'serif' ? 'italic' : 'normal',
            }}
          >
            {renderInlineFormattedText(line.replace('> ', ''))}
          </blockquote>
        );
        i++;
        continue;
      }

      // Bullet List
      if (line.startsWith('- ')) {
        elements.push(
          <li
            key={`li-${i}`}
            style={{
              marginLeft: '26px',
              marginBottom: '10px',
              fontSize: fontTokens.list,
              lineHeight: fontTokens.lineHeight,
              color: theme.textBody,
            }}
          >
            {renderInlineFormattedText(line.replace('- ', ''))}
          </li>
        );
        i++;
        continue;
      }

      // Numbered List (1. 2. 3.)
      const numMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        elements.push(
          <div
            key={`num-${i}`}
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '12px',
              fontSize: fontTokens.list,
              lineHeight: fontTokens.lineHeight,
              color: theme.textBody,
            }}
          >
            <span
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'rgba(59, 130, 246, 0.16)',
                color: '#38bdf8',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: fontTokens.meta,
                fontWeight: 700,
                flexShrink: 0,
                marginTop: '3px',
              }}
            >
              {numMatch[1]}
            </span>
            <div style={{ flex: 1 }}>{renderInlineFormattedText(numMatch[2])}</div>
          </div>
        );
        i++;
        continue;
      }

      // Empty Line
      if (line.trim() === '') {
        elements.push(<div key={`sp-${i}`} style={{ height: '12px' }} />);
        i++;
        continue;
      }

      // Normal Paragraph - Crisp, high visibility, clean typography!
      elements.push(
        <p
          key={`p-${i}`}
          style={{
            margin: '0 0 18px',
            fontSize: fontTokens.body,
            lineHeight: fontTokens.lineHeight,
            color: theme.textBody,
            letterSpacing: fontFamily === 'serif' ? '0.01em' : '0.005em',
            fontWeight: 450,
          }}
        >
          {renderInlineFormattedText(line)}
        </p>
      );
      i++;
    }

    return elements;
  };

  // Helper to detect pedagogical callout tags and apply rich styling
  function getCalloutStyle(line: string) {
    const trimmed = line.trim();

    if (trimmed.startsWith('⭐ IMAGINE THIS...') || trimmed.startsWith('⭐ OPTIONAL CHALLENGE')) {
      const isOptional = trimmed.startsWith('⭐ OPTIONAL CHALLENGE');
      const badgeText = isOptional ? 'Optional Creative Challenge' : 'Imagine This...';
      const bodyText = trimmed.replace(isOptional ? '⭐ OPTIONAL CHALLENGE' : '⭐ IMAGINE THIS...', '').trim();
      return {
        badgeText,
        bodyText,
        borderColor: '#f59e0b',
        bgColor: bookTheme === 'dark' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.08)',
        titleColor: '#f59e0b',
        icon: <Sparkles size={16} color="#f59e0b" />,
      };
    }

    if (trimmed.startsWith('🔗 REAL-WORLD CONNECTION')) {
      return {
        badgeText: 'Real-World Connection',
        bodyText: trimmed.replace('🔗 REAL-WORLD CONNECTION', '').trim(),
        borderColor: '#8b5cf6',
        bgColor: bookTheme === 'dark' ? 'rgba(139, 92, 246, 0.12)' : 'rgba(139, 92, 246, 0.08)',
        titleColor: '#8b5cf6',
        icon: <Globe size={16} color="#8b5cf6" />,
      };
    }

    if (trimmed.startsWith('🧠 PREDICT THE OUTPUT') || trimmed.startsWith('🔮 PREDICT THE OUTPUT')) {
      const tag = trimmed.startsWith('🧠 PREDICT THE OUTPUT') ? '🧠 PREDICT THE OUTPUT' : '🔮 PREDICT THE OUTPUT';
      return {
        badgeText: 'Predict The Output',
        bodyText: trimmed.replace(tag, '').trim(),
        borderColor: '#06b6d4',
        bgColor: bookTheme === 'dark' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(6, 182, 212, 0.08)',
        titleColor: '#06b6d4',
        icon: <Brain size={16} color="#06b6d4" />,
      };
    }

    if (trimmed.startsWith('💭 WHAT WOULD HAPPEN IF...')) {
      return {
        badgeText: 'What Would Happen If...',
        bodyText: trimmed.replace('💭 WHAT WOULD HAPPEN IF...', '').trim(),
        borderColor: '#14b8a6',
        bgColor: bookTheme === 'dark' ? 'rgba(20, 184, 166, 0.12)' : 'rgba(20, 184, 166, 0.08)',
        titleColor: '#14b8a6',
        icon: <HelpCircle size={16} color="#14b8a6" />,
      };
    }

    if (trimmed.startsWith('💡 DID YOU KNOW?')) {
      return {
        badgeText: 'Did You Know?',
        bodyText: trimmed.replace('💡 DID YOU KNOW?', '').trim(),
        borderColor: '#10b981',
        bgColor: bookTheme === 'dark' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)',
        titleColor: '#10b981',
        icon: <Lightbulb size={16} color="#10b981" />,
      };
    }

    if (trimmed.startsWith('🛠 IF SOMETHING GOES WRONG')) {
      return {
        badgeText: 'If Something Goes Wrong (Troubleshooting)',
        bodyText: trimmed.replace('🛠 IF SOMETHING GOES WRONG', '').trim(),
        borderColor: '#f43f5e',
        bgColor: bookTheme === 'dark' ? 'rgba(244, 63, 94, 0.12)' : 'rgba(244, 63, 94, 0.08)',
        titleColor: '#f43f5e',
        icon: <Wrench size={16} color="#f43f5e" />,
      };
    }

    if (trimmed.startsWith('🔍 DEBUGGING CORNER')) {
      return {
        badgeText: 'Debugging Corner: Evidence & Clues',
        bodyText: trimmed.replace('🔍 DEBUGGING CORNER', '').trim(),
        borderColor: '#ef4444',
        bgColor: bookTheme === 'dark' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)',
        titleColor: '#ef4444',
        icon: <Wrench size={16} color="#ef4444" />,
      };
    }

    if (trimmed.startsWith('⚠️ WATCH OUT!')) {
      return {
        badgeText: 'Watch Out!',
        bodyText: trimmed.replace('⚠️ WATCH OUT!', '').trim(),
        borderColor: '#f97316',
        bgColor: bookTheme === 'dark' ? 'rgba(249, 115, 22, 0.12)' : 'rgba(249, 115, 22, 0.08)',
        titleColor: '#f97316',
        icon: <AlertTriangle size={16} color="#f97316" />,
      };
    }

    if (trimmed.startsWith('⚡ CHALLENGE')) {
      return {
        badgeText: 'Level-Up Challenge',
        bodyText: trimmed.replace('⚡ CHALLENGE', '').trim(),
        borderColor: '#a855f7',
        bgColor: bookTheme === 'dark' ? 'rgba(168, 85, 247, 0.12)' : 'rgba(168, 85, 247, 0.08)',
        titleColor: '#a855f7',
        icon: <Zap size={16} color="#a855f7" />,
      };
    }

    if (trimmed.startsWith('💻 TRY IT YOURSELF')) {
      return {
        badgeText: 'Try It Yourself',
        bodyText: trimmed.replace('💻 TRY IT YOURSELF', '').trim(),
        borderColor: '#38bdf8',
        bgColor: bookTheme === 'dark' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(56, 189, 248, 0.08)',
        titleColor: '#0284c7',
        icon: <Code2 size={16} color="#0284c7" />,
      };
    }

    if (trimmed.startsWith('✅ GOOD PROGRAMMING HABIT')) {
      return {
        badgeText: 'Good Programming Habit',
        bodyText: trimmed.replace('✅ GOOD PROGRAMMING HABIT', '').trim(),
        borderColor: '#22c55e',
        bgColor: bookTheme === 'dark' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.08)',
        titleColor: '#16a34a',
        icon: <CheckCircle2 size={16} color="#16a34a" />,
      };
    }

    if (trimmed.startsWith('KEY TAKEAWAYS')) {
      return {
        badgeText: 'Key Takeaways & Core Concepts',
        bodyText: trimmed.replace('KEY TAKEAWAYS', '').trim(),
        borderColor: '#6366f1',
        bgColor: bookTheme === 'dark' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.08)',
        titleColor: '#6366f1',
        icon: <Sparkles size={16} color="#6366f1" />,
      };
    }

    return null;
  }

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
        color: theme.textPrimary,
        fontFamily: currentFontFamily,
        padding: isSplitViewActive
          ? isLeft
            ? '20px 20px 18px 26px'
            : isRight
            ? '20px 26px 18px 20px'
            : '22px 28px 20px'
          : isLeft
          ? '32px 36px 26px 46px'
          : isRight
          ? '32px 46px 26px 36px'
          : '34px 44px 26px',
        overflowY: 'auto',
        boxSizing: 'border-box',
        boxShadow: isLeft
          ? `inset -14px 0 16px -10px ${theme.spineShadow}`
          : isRight
          ? `inset 14px 0 16px -10px ${theme.spineShadow}`
          : 'none',
        position: 'relative',
        transition: 'background-color 0.2s ease, color 0.2s ease',
      }}
    >
      {/* Corner dog-ear for interactive page turn to next (bottom-right) */}
      {onFlipCorner && (isRight || side === 'single') && (
        <div
          onClick={onFlipCorner}
          title={side === 'single' ? 'Click corner to flip to next page' : 'Click corner to flip to next spread'}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '28px',
            height: '28px',
            cursor: 'pointer',
            background: 'linear-gradient(-135deg, rgba(59, 130, 246, 0.45) 0%, rgba(255, 255, 255, 0.12) 50%, transparent 50%)',
            borderTopLeftRadius: '5px',
            zIndex: 10,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.15)';
            e.currentTarget.style.background = 'linear-gradient(-135deg, rgba(59, 130, 246, 0.7) 0%, rgba(255, 255, 255, 0.25) 50%, transparent 50%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = 'linear-gradient(-135deg, rgba(59, 130, 246, 0.45) 0%, rgba(255, 255, 255, 0.12) 50%, transparent 50%)';
          }}
        />
      )}

      {/* Corner dog-ear for interactive page turn to previous (bottom-left) */}
      {((isLeft && onFlipCorner) || (side === 'single' && onFlipPrevCorner)) && (
        <div
          onClick={isLeft ? onFlipCorner : onFlipPrevCorner}
          title={side === 'single' ? 'Click corner to flip to previous page' : 'Click corner to flip to previous spread'}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '28px',
            height: '28px',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.45) 0%, rgba(255, 255, 255, 0.12) 50%, transparent 50%)',
            borderTopRightRadius: '5px',
            zIndex: 10,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.15)';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.7) 0%, rgba(255, 255, 255, 0.25) 50%, transparent 50%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.45) 0%, rgba(255, 255, 255, 0.12) 50%, transparent 50%)';
          }}
        />
      )}

      {/* Page Header (Minimal, quiet running head without redundant title box) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.borderSubtle}`,
          paddingBottom: '10px',
          marginBottom: '20px',
        }}
      >
        <span
          style={{
            fontSize: fontTokens.meta,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: theme.textMuted,
            fontWeight: 650,
          }}
        >
          {isLeft ? (chapterTitle || 'Python Programming') : lessonTitle}
        </span>
        <span
          style={{
            fontSize: fontTokens.meta,
            color: theme.textMuted,
            fontWeight: 650,
          }}
        >
          Page {page.pageNumber} of {totalPages}
        </span>
      </div>

      {/* Page Content Body */}
      <div style={{ flex: 1 }}>
        <h2
          style={{
            fontSize: fontTokens.h2,
            fontWeight: 800,
            marginBottom: '20px',
            color: theme.textPrimary,
            letterSpacing: '-0.02em',
            lineHeight: 1.25,
          }}
        >
          {page.title}
        </h2>

        {/* Embedded Textbook Diagram Image (if present) */}
        {page.imageUrl && (
          <div
            style={{
              margin: '18px 0 24px',
              borderRadius: '10px',
              overflow: 'hidden',
              border: `1px solid ${theme.borderSubtle}`,
              backgroundColor: '#090d16',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'relative',
                cursor: 'pointer',
                overflow: 'hidden',
                maxHeight: '360px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#090d16',
              }}
              onClick={() => setZoomedImage(page.imageUrl!)}
              title="Click to zoom diagram"
            >
              <img
                src={page.imageUrl}
                alt={page.imageCaption || page.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '360px',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(4px)',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  pointerEvents: 'none',
                }}
              >
                <ZoomIn size={13} />
                <span>Click to Zoom</span>
              </div>
            </div>
            {page.imageCaption && (
              <div
                style={{
                  padding: '8px 14px',
                  fontSize: '12px',
                  color: theme.textMuted,
                  backgroundColor: bookTheme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                  borderTop: `1px solid ${theme.borderSubtle}`,
                  fontStyle: 'italic',
                }}
              >
                📊 {page.imageCaption}
              </div>
            )}
          </div>
        )}

        {/* Formatted Content with High-Visibility Typography */}
        <div>{formatContent(page.content)}</div>

        {/* Code Snippet Box */}
        {page.codeSnippet && (
          <div
            style={{
              margin: '22px 0',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backgroundColor: '#0d1117',
              boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px',
                backgroundColor: '#161b22',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '11px',
                color: '#94a3b8',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={12} color="#38bdf8" />
                <span style={{ textTransform: 'uppercase', fontWeight: 700, color: '#e2e8f0' }}>
                  {page.codeSnippet.language} Example
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {onInsertCode && (
                  <button
                    onClick={() => handleInsert(page.codeSnippet!.code, 'example-snippet')}
                    title="Insert this code snippet into your active IDE editor"
                    style={{
                      background: insertStatusId === 'example-snippet' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.15)',
                      border: insertStatusId === 'example-snippet' ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(59, 130, 246, 0.35)',
                      color: insertStatusId === 'example-snippet' ? '#4ade80' : '#60a5fa',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: fontTokens.meta,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '5px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {insertStatusId === 'example-snippet' ? <Check size={12} color="#4ade80" /> : <ArrowUpRight size={12} />}
                    <span>{insertStatusId === 'example-snippet' ? 'Inserted!' : 'Insert to Editor'}</span>
                  </button>
                )}
                <button
                  onClick={() => handleCopyCode(page.codeSnippet!.code, 'example-snippet')}
                  title={copiedId === 'example-snippet' ? 'Copied to clipboard!' : 'Copy code to clipboard'}
                  style={{
                    background: copiedId === 'example-snippet' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    border: copiedId === 'example-snippet' ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
                    color: copiedId === 'example-snippet' ? '#4ade80' : '#e2e8f0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: fontTokens.meta,
                    fontWeight: 600,
                    padding: '3px 9px',
                    borderRadius: '5px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {copiedId === 'example-snippet' ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
                  <span>{copiedId === 'example-snippet' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <pre
              style={{
                margin: 0,
                padding: '14px 16px',
                fontSize: '13.5px',
                fontFamily: 'var(--font-mono, monospace)',
                color: '#38bdf8',
                overflowX: 'auto',
                lineHeight: 1.55,
                userSelect: 'text',
              }}
            >
              <code>{page.codeSnippet.code}</code>
            </pre>

            {page.codeSnippet.explanation && (
              <div
                style={{
                  padding: '9px 14px',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '12.5px',
                  color: '#94a3b8',
                  lineHeight: 1.5,
                }}
              >
                💡 {page.codeSnippet.explanation}
              </div>
            )}
          </div>
        )}

        {/* In-Page Coding Prompt CTA Banner */}
        {page.hasCodingPrompt && (page.codingActivity || codingActivity) && onLaunchCoding && (
          <CodingPromptBanner
            activity={page.codingActivity || codingActivity!}
            onLaunch={() => onLaunchCoding(page.codingActivity || codingActivity)}
            isSplitViewActive={isSplitViewActive}
          />
        )}
      </div>

      {/* Page Footer */}
      <div
        style={{
          marginTop: '32px',
          borderTop: `1px solid ${theme.borderSubtle}`,
          paddingTop: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: theme.textMuted,
        }}
      >
        {isLeft ? (
          <>
            <span style={{ fontWeight: 700, color: theme.textPrimary }}>• Page {page.pageNumber} •</span>
            <span>{chapterTitle || 'Python Programming Foundations'}</span>
          </>
        ) : isRight ? (
          <>
            <span>{lessonTitle}</span>
            <span style={{ fontWeight: 700, color: theme.textPrimary }}>• Page {page.pageNumber} •</span>
          </>
        ) : (
          <>
            <span>Grade 8 Python Programming Foundations</span>
            <span>• Page {page.pageNumber} of {totalPages} •</span>
          </>
        )}
      </div>

      {/* Lightbox / Zoom Modal for Diagrams */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomedImage(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
            <img
              src={zoomedImage}
              alt="Zoomed diagram"
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            />
            {page.imageCaption && (
              <div style={{ marginTop: '12px', color: '#e2e8f0', fontSize: '13px', textAlign: 'center' }}>
                {page.imageCaption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
