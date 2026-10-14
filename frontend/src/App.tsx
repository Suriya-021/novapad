import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { NavigationHeader, PlatformViewMode } from './app/NavigationHeader';
import { FlipbookReader } from './learning/components/FlipbookReader';
import { TableOfContentsModal } from './learning/components/TableOfContentsModal';
import { UploadChapterModal } from './learning/components/UploadChapterModal';
import { TextCodingEnv } from './coding/environments/TextCodingEnv';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const ScratchCodingEnv = lazy(() =>
  import('./coding/environments/ScratchCodingEnv').then((m) => ({ default: m.ScratchCodingEnv }))
);
const BlockCodingEnv = lazy(() =>
  import('./coding/environments/BlockCodingEnv').then((m) => ({ default: m.BlockCodingEnv }))
);

import { Course, Chapter, Lesson, CodingActivityConfig } from './learning/types/curriculum';
import { getAllCourses, getCourseById, getLessonById, getLessonProgress, saveLessonProgress } from './learning/storage/curriculumRepository';
import { launchCodingActivity } from './coding/launcher/CodingLauncher';

import { Project } from './types/project';
import { IdeSettings, DEFAULT_SETTINGS } from './types/settings';
import { ExecutionManager } from './runtimes/executionManager';
import {
  initStorageWithDefaults,
  getActiveProjectId,
  setActiveProjectId,
  getSavedSettings,
  saveSettings,
} from './storage/db';
import {
  listProjects,
  saveProject,
  deleteProject,
  createProject,
} from './storage/projectRepository';

export const App: React.FC = () => {
  // Curriculum state
  const [coursesList, setCoursesList] = useState<Course[]>(() => getAllCourses());
  const [currentCourse, setCurrentCourse] = useState<Course>(() => getAllCourses()[0]);
  const [currentLesson, setCurrentLesson] = useState<Lesson>(() => getAllCourses()[0].chapters[0].lessons[0]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Platform View: 'book-only' | 'split' | 'code-only'
  // When 'split', Flipbook is on the LEFT, Coding IDE is on the RIGHT!
  const [viewMode, setViewMode] = useState<PlatformViewMode>('split');
  const [splitRatio, setSplitRatio] = useState<number>(53); // percentage for left pane (40-65%)

  // Coding & IDE State
  const [settings, setSettings] = useState<IdeSettings>(DEFAULT_SETTINGS);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [executionManager] = useState<ExecutionManager>(() => new ExecutionManager(DEFAULT_SETTINGS.backendUrl));

  // Split Divider Dragging State
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);

  // Initialize Application
  useEffect(() => {
    (async () => {
      await initStorageWithDefaults();
      const savedPrefs = await getSavedSettings();
      setSettings(savedPrefs);
      document.documentElement.setAttribute('data-theme', savedPrefs.theme);
      executionManager.setBackendUrl(savedPrefs.backendUrl);

      const allProjs = await listProjects();
      setProjects(allProjs);

      // Check URL hash for deep-linking (e.g., #/lesson/lesson-py-var-01)
      const hash = window.location.hash;
      const defaultCourse = getAllCourses()[0];
      const defaultLesson = defaultCourse?.chapters[0]?.lessons[0];
      let initialLesson = defaultLesson;

      if (hash.includes('lesson=')) {
        const targetLessonId = hash.split('lesson=')[1]?.split('&')[0];
        const found = getLessonById(targetLessonId);
        if (found) {
          initialLesson = found.lesson;
          setCurrentCourse(found.course);
          setCurrentLesson(found.lesson);
        } else if (defaultLesson && defaultCourse) {
          initialLesson = defaultLesson;
          setCurrentCourse(defaultCourse);
          setCurrentLesson(defaultLesson);
          window.location.hash = `#/lesson=${defaultLesson.id}`;
        }
      }

      if (initialLesson) {
        // Check saved progress for initial lesson
        const savedProgress = await getLessonProgress(initialLesson.id);
        if (savedProgress) {
          setCurrentPageIndex(Math.min(savedProgress.lastVisitedPage - 1, initialLesson.pages.length - 1));
        }

        // Determine initial active project
        const activeId = await getActiveProjectId();
        const matchingProj = allProjs.find((p: Project) => p.lessonId === initialLesson.id) ||
                             allProjs.find((p: Project) => p.id === activeId) ||
                             allProjs[0];
        if (matchingProj) {
          setCurrentProject(matchingProj);
        }
      }
    })();

    return () => {
      executionManager.dispose();
    };
  }, [executionManager]);

  // Update theme token when setting changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Track and save page reading progress
  const handlePageChange = useCallback(async (newPageIndex: number) => {
    setCurrentPageIndex(newPageIndex);
    await saveLessonProgress({
      lessonId: currentLesson.id,
      lastVisitedPage: newPageIndex + 1,
      totalPages: currentLesson.pages.length,
      isCompleted: newPageIndex >= currentLesson.pages.length - 1,
      projectId: currentProject?.id,
    });
  }, [currentLesson, currentProject]);

  // Switch Lesson from Table of Contents
  const handleSelectLesson = useCallback(async (courseId: string, lessonId: string) => {
    const course = getCourseById(courseId);
    if (!course) return;

    for (const ch of course.chapters) {
      const lesson = ch.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        setCurrentCourse(course);
        setCurrentLesson(lesson);
        window.location.hash = `#/lesson=${lesson.id}`;

        const progress = await getLessonProgress(lesson.id);
        const targetPage = progress ? Math.min(progress.lastVisitedPage - 1, lesson.pages.length - 1) : 0;
        setCurrentPageIndex(targetPage);

        // If lesson has a project, switch or prepare it
        const matchingProject = projects.find((p) => p.lessonId === lesson.id);
        if (matchingProject) {
          setCurrentProject(matchingProject);
          await setActiveProjectId(matchingProject.id);
        }
        break;
      }
    }
  }, [projects]);

  // Handle newly uploaded docx curriculum chapter
  const handleChapterImported = useCallback((chapter: Chapter) => {
    const updated = getAllCourses();
    setCoursesList(updated);
    const targetCourse = updated.find((c) => c.id === chapter.courseId) || updated[0];
    setCurrentCourse(targetCourse);
    if (chapter.lessons.length > 0) {
      const firstLesson = chapter.lessons[0];
      setCurrentLesson(firstLesson);
      setCurrentPageIndex(0);
      window.location.hash = `#/lesson=${firstLesson.id}`;
    }
  }, []);

  // Compute neighboring lessons across current course
  const allCourseLessons = React.useMemo(() => {
    const list: Lesson[] = [];
    for (const ch of currentCourse.chapters) {
      for (const l of ch.lessons) {
        list.push(l);
      }
    }
    return list;
  }, [currentCourse]);

  const currentLessonIndex = allCourseLessons.findIndex((l) => l.id === currentLesson.id);
  const prevLesson = currentLessonIndex > 0 ? allCourseLessons[currentLessonIndex - 1] : undefined;
  const nextLesson = currentLessonIndex !== -1 && currentLessonIndex < allCourseLessons.length - 1 ? allCourseLessons[currentLessonIndex + 1] : undefined;

  const handleNextLesson = useCallback(() => {
    if (nextLesson) {
      handleSelectLesson(currentCourse.id, nextLesson.id);
    }
  }, [nextLesson, currentCourse, handleSelectLesson]);

  const handlePrevLesson = useCallback(() => {
    if (prevLesson) {
      handleSelectLesson(currentCourse.id, prevLesson.id);
    }
  }, [prevLesson, currentCourse, handleSelectLesson]);

  // Sections within current lesson
  const sections = useMemo(() => currentLesson.sections || [], [currentLesson.sections]);
  const currentPageNumber = currentPageIndex + 1;
  const currentSectionIndex = useMemo(() => {
    return sections.findIndex(
      (s) => currentPageNumber >= s.startPage && currentPageNumber <= s.endPage
    );
  }, [sections, currentPageNumber]);

  const handleJumpToSection = useCallback((sectionIndex: number) => {
    const sec = currentLesson.sections?.[sectionIndex];
    if (sec) {
      handlePageChange(sec.startPage - 1);
    }
  }, [currentLesson, handlePageChange]);

  // Launch Coding Activity (Called from in-page callout banner or top header)
  const handleLaunchCodingActivity = useCallback(async (activityOverride?: CodingActivityConfig) => {
    const activeActivity =
      activityOverride ||
      currentLesson.pages[currentPageIndex]?.codingActivity ||
      (currentSectionIndex >= 0 && sections ? sections[currentSectionIndex]?.codingActivity : undefined) ||
      currentLesson.codingActivity;

    if (!activeActivity || !activeActivity.enabled) return;

    try {
      const result = await launchCodingActivity(currentLesson, activeActivity);

      // Ensure project is registered in state
      setProjects((prev) => {
        const exists = prev.some((p) => p.id === result.project.id);
        return exists ? prev.map((p) => p.id === result.project.id ? result.project : p) : [result.project, ...prev];
      });

      setCurrentProject(result.project);
      await setActiveProjectId(result.project.id);

      // Automatically open in Side-by-Side (Split) mode: Book on Left, IDE on Right!
      setViewMode('split');
    } catch (err) {
      alert(`Could not launch coding activity: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [currentLesson, currentPageIndex, currentSectionIndex, sections]);

  // Project updating & saving
  const handleUpdateProject = useCallback(async (updated: Project) => {
    setCurrentProject(updated);
    await saveProject(updated);
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  const handleSelectProject = useCallback(async (projectId: string) => {
    const found = projects.find((p) => p.id === projectId);
    if (found) {
      setCurrentProject(found);
      await setActiveProjectId(projectId);
    }
  }, [projects]);

  const handleCreateProject = useCallback(async (name: string, template: Project['template']) => {
    const newProj = await createProject(name, template);
    setProjects((prev) => [newProj, ...prev]);
    setCurrentProject(newProj);
    await setActiveProjectId(newProj.id);
  }, []);

  const handleDeleteProject = useCallback(async (projectId: string) => {
    await deleteProject(projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (currentProject?.id === projectId) {
      const remaining = projects.filter((p) => p.id !== projectId);
      if (remaining.length > 0) {
        setCurrentProject(remaining[0]);
        await setActiveProjectId(remaining[0].id);
      }
    }
  }, [currentProject, projects]);

  const handleSaveSettings = useCallback((newSettings: IdeSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    executionManager?.setBackendUrl(newSettings.backendUrl);
  }, [executionManager]);

  // Insert code snippet directly into the active editor file
  const handleInsertCodeToEditor = useCallback((code: string) => {
    if (!currentProject) return;
    const activeFile = currentProject.files.find((f) => f.id === currentProject.activeFileId) || currentProject.files[0];
    if (!activeFile) return;

    const separator = activeFile.content.endsWith('\n') || activeFile.content.length === 0 ? '' : '\n\n';
    const updatedContent = `${activeFile.content}${separator}${code}\n`;
    const updatedProj: Project = {
      ...currentProject,
      files: currentProject.files.map((f) =>
        f.id === activeFile.id ? { ...f, content: updatedContent, isDirty: true } : f
      ),
      updatedAt: Date.now(),
    };
    handleUpdateProject(updatedProj);

    // If currently in book-only mode, automatically switch to split view so the student sees the code in the editor!
    if (viewMode === 'book-only') {
      setViewMode('split');
    }
  }, [currentProject, handleUpdateProject, viewMode]);

  // Split Divider Dragging handler
  const handleMouseDownDivider = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingDivider(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const totalWidth = window.innerWidth;
      const newRatio = (moveEvent.clientX / totalWidth) * 100;
      if (newRatio >= 25 && newRatio <= 75) {
        setSplitRatio(Math.round(newRatio));
      }
    };

    const handleMouseUp = () => {
      setIsDraggingDivider(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Top Application Navigation Bar */}
      <NavigationHeader
        course={currentCourse}
        lesson={currentLesson}
        sections={sections}
        currentSectionIndex={currentSectionIndex >= 0 ? currentSectionIndex : 0}
        onJumpToSection={handleJumpToSection}
        currentPageNumber={currentPageNumber}
        totalPages={currentLesson.pages.length}
        viewMode={viewMode}
        onChangeViewMode={(mode) => setViewMode(mode)}
        onOpenTableOfContents={() => setTocOpen(true)}
        onOpenUpload={() => setUploadModalOpen(true)}
        onToggleTheme={() => handleSaveSettings({ ...settings, theme: settings.theme === 'dark' ? 'light' : 'dark' })}
        currentTheme={settings.theme}
      />

      {/* Main Content Area: Supports Book-Only, Side-by-Side Split, or Code-Only */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* LEFT PANE: Flipbook Reader (Visible in 'book-only' or 'split') */}
        {(viewMode === 'book-only' || viewMode === 'split') && (
          <div
            style={{
              width: viewMode === 'book-only' ? '100%' : `${splitRatio}%`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transition: isDraggingDivider ? 'none' : 'width 0.15s ease',
            }}
          >
            <ErrorBoundary name="FlipbookReader">
              <FlipbookReader
                course={currentCourse}
                lesson={currentLesson}
                currentPageIndex={currentPageIndex}
                onPageChange={handlePageChange}
                onOpenTableOfContents={() => setTocOpen(true)}
                onLaunchCoding={handleLaunchCodingActivity}
                isSplitViewActive={viewMode === 'split'}
                onNextLesson={nextLesson ? handleNextLesson : undefined}
                onPrevLesson={prevLesson ? handlePrevLesson : undefined}
                nextLessonTitle={nextLesson?.title}
                prevLessonTitle={prevLesson?.title}
                onToggleFocusMode={() => setViewMode(viewMode === 'split' ? 'book-only' : 'split')}
                isFocusMode={viewMode === 'book-only'}
                onInsertCodeToEditor={handleInsertCodeToEditor}
              />
            </ErrorBoundary>
          </div>
        )}

        {/* DRAGGABLE RESIZER DIVIDER (Visible in 'split' mode) */}
        {viewMode === 'split' && (
          <div
            onMouseDown={handleMouseDownDivider}
            title="Drag to resize split panes"
            style={{
              width: '6px',
              cursor: 'col-resize',
              backgroundColor: 'var(--border-subtle)',
              zIndex: 15,
              position: 'relative',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--border-subtle)')}
          />
        )}

        {/* RIGHT PANE: Coding Environment (Visible in 'split' or 'code-only') */}
        {(viewMode === 'code-only' || viewMode === 'split') && (
          <div
            style={{
              width: viewMode === 'code-only' ? '100%' : `${100 - splitRatio}%`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transition: isDraggingDivider ? 'none' : 'width 0.15s ease',
            }}
          >
            {/* Dispatch to appropriate environment mode */}
            {currentLesson.codingActivity?.mode === 'scratch' ? (
              <Suspense
                fallback={
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading Scratch Environment...
                  </div>
                }
              >
                <ScratchCodingEnv
                  lesson={currentLesson}
                  onReturnToBook={() => setViewMode('book-only')}
                />
              </Suspense>
            ) : currentLesson.codingActivity?.mode === 'block' ? (
              <Suspense
                fallback={
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading Block Environment...
                  </div>
                }
              >
                <BlockCodingEnv
                  lesson={currentLesson}
                  onReturnToBook={() => setViewMode('book-only')}
                />
              </Suspense>
            ) : currentProject && executionManager ? (
              /* Default / Text Coding Environment (Monaco IDE) */
              <ErrorBoundary name="TextCodingEnv">
                <TextCodingEnv
                  project={currentProject}
                  onUpdateProject={handleUpdateProject}
                  projects={projects}
                  onSelectProject={handleSelectProject}
                  onCreateProject={handleCreateProject}
                  onDeleteProject={handleDeleteProject}
                  settings={settings}
                  onSaveSettings={handleSaveSettings}
                  executionManager={executionManager}
                  lesson={currentLesson}
                  isCompact={viewMode === 'split'}
                />
              </ErrorBoundary>
            ) : (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--bg-editor)',
                  color: 'var(--text-muted)',
                }}
              >
                No active project loaded. Click &apos;Click for Coding&apos; to open this lesson&apos;s lab.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table of Contents Modal */}
      <TableOfContentsModal
        isOpen={tocOpen}
        onClose={() => setTocOpen(false)}
        courses={coursesList}
        currentCourse={currentCourse}
        currentLesson={currentLesson}
        onSelectLesson={handleSelectLesson}
        onJumpToPage={(targetIndex) => handlePageChange(targetIndex)}
        currentPageIndex={currentPageIndex}
        onOpenUpload={() => setUploadModalOpen(true)}
      />

      {/* Upload Curriculum Chapter (.docx) Modal */}
      <UploadChapterModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        activeCourseId={currentCourse.id}
        onChapterImported={handleChapterImported}
        backendUrl={settings.backendUrl}
      />
    </div>
  );
};

export default App;
