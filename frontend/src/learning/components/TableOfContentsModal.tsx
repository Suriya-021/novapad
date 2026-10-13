import React from 'react';
import { X, BookOpen, Clock, Code2, CheckCircle2, ChevronRight, UploadCloud } from 'lucide-react';
import { Course, Lesson } from '../types/curriculum';

interface TableOfContentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  currentCourse: Course;
  currentLesson: Lesson;
  onSelectLesson: (courseId: string, lessonId: string) => void;
  onJumpToPage?: (pageIndex: number) => void;
  currentPageIndex?: number;
  onOpenUpload?: () => void;
}

export const TableOfContentsModal: React.FC<TableOfContentsModalProps> = ({
  isOpen,
  onClose,
  courses,
  currentCourse,
  currentLesson,
  onSelectLesson,
  onJumpToPage,
  currentPageIndex = 0,
  onOpenUpload,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
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
          width: '640px',
          maxHeight: '85vh',
          backgroundColor: 'var(--bg-panel)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-tab)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={20} color="var(--accent)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Course Curriculum & Lessons</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onOpenUpload && (
              <button
                onClick={() => {
                  onClose();
                  onOpenUpload();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: 'var(--accent)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                title="Upload chapter from Word document (.docx)"
              >
                <UploadCloud size={13} />
                <span>Upload .docx Chapter</span>
              </button>
            )}
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {courses.map((course) => {
            const isCourseActive = course.id === currentCourse.id;
            return (
              <div key={course.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                      {course.title}
                    </span>
                    <span
                      style={{
                        padding: '1px 8px',
                        borderRadius: '999px',
                        fontSize: '10px',
                        fontWeight: 600,
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        color: 'var(--accent)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {course.badge}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {course.gradeLevel}
                  </span>
                </div>

                {course.chapters.map((ch) => (
                  <div
                    key={ch.id}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: 'var(--bg-sidebar)',
                    }}
                  >
                    <div
                      style={{
                        padding: '10px 14px',
                        backgroundColor: 'var(--bg-tab)',
                        borderBottom: '1px solid var(--border-subtle)',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {ch.title}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {ch.lessons.map((lesson) => {
                        const isLessonActive = isCourseActive && lesson.id === currentLesson.id;
                        return (
                          <div key={lesson.id} style={{ display: 'flex', flexDirection: 'column' }}>
                            {/* Lesson Header */}
                            <div
                              onClick={() => {
                                onSelectLesson(course.id, lesson.id);
                                onClose();
                              }}
                              style={{
                                padding: '12px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                backgroundColor: isLessonActive ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                                borderLeft: isLessonActive ? '3px solid var(--accent)' : '3px solid transparent',
                                borderBottom: '1px solid var(--border-subtle)',
                                transition: 'background 0.1s ease',
                              }}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontWeight: isLessonActive ? 700 : 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                                    {lesson.title}
                                  </span>
                                  <span
                                    style={{
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      fontSize: '10px',
                                      fontWeight: 600,
                                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                      color: 'var(--accent)',
                                    }}
                                  >
                                    {lesson.pages.length} Pages
                                  </span>
                                </div>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                  {lesson.summary}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                                  <Clock size={12} />
                                  <span>{lesson.estimatedMinutes}m</span>
                                </div>
                              </div>
                            </div>

                            {/* If Lesson defines continuous Sections, render them with 1-click jump! */}
                            {lesson.sections && lesson.sections.length > 0 && (
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  backgroundColor: 'rgba(0, 0, 0, 0.15)',
                                  borderBottom: '1px solid var(--border-subtle)',
                                }}
                              >
                                {lesson.sections.map((sec) => {
                                  const currentActiveSec =
                                    currentPageIndex !== undefined &&
                                    currentPageIndex + 1 >= sec.startPage &&
                                    currentPageIndex + 1 <= sec.endPage;
                                  return (
                                    <div
                                      key={sec.id}
                                      onClick={() => {
                                        if (isLessonActive && onJumpToPage) {
                                          onJumpToPage(sec.startPage - 1);
                                        } else {
                                          onSelectLesson(course.id, lesson.id);
                                          onJumpToPage?.(sec.startPage - 1);
                                        }
                                        onClose();
                                      }}
                                      style={{
                                        padding: '9px 16px 9px 26px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        backgroundColor: currentActiveSec ? 'rgba(59, 130, 246, 0.18)' : 'transparent',
                                        borderLeft: currentActiveSec ? '3px solid var(--accent)' : '3px solid transparent',
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                        transition: 'background 0.12s ease',
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span
                                          style={{
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            color: currentActiveSec ? 'var(--accent)' : 'var(--text-muted)',
                                            minWidth: '18px',
                                          }}
                                        >
                                          {sec.sectionNumber}.
                                        </span>
                                        <span
                                          style={{
                                            fontSize: '12.5px',
                                            fontWeight: currentActiveSec ? 650 : 500,
                                            color: currentActiveSec ? 'var(--text-primary)' : 'var(--text-secondary)',
                                          }}
                                        >
                                          {sec.title}
                                        </span>
                                        {sec.isCodingLab && (
                                          <span
                                            style={{
                                              padding: '1px 5px',
                                              borderRadius: '3px',
                                              fontSize: '9.5px',
                                              fontWeight: 700,
                                              backgroundColor: 'rgba(16, 185, 129, 0.18)',
                                              color: 'var(--success, #10b981)',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '3px',
                                            }}
                                          >
                                            <Code2 size={10} />
                                            <span>LAB</span>
                                          </span>
                                        )}
                                      </div>

                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span
                                          style={{
                                            fontSize: '11px',
                                            color: 'var(--text-muted)',
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontFamily: 'monospace',
                                          }}
                                        >
                                          p. {sec.startPage === sec.endPage ? sec.startPage : `${sec.startPage}-${sec.endPage}`}
                                        </span>
                                        <ChevronRight size={14} color="var(--text-muted)" />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
