import { Course, Chapter, Lesson, StudentLessonProgress } from '../types/curriculum';
import { SAMPLE_COURSES } from '../data/sampleCourses';

const PROGRESS_STORE_KEY = 'learning_progress_records';
const CUSTOM_CHAPTERS_KEY = 'custom_curriculum_chapters';

export function getAllCourses(): Course[] {
  // Clone to avoid mutating static array
  const baseCourses: Course[] = JSON.parse(JSON.stringify(SAMPLE_COURSES));
  try {
    const raw = localStorage.getItem(CUSTOM_CHAPTERS_KEY);
    if (raw) {
      const customChapters: Chapter[] = JSON.parse(raw);
      for (const ch of customChapters) {
        const targetCourse = baseCourses.find((c) => c.id === ch.courseId) || baseCourses[0];
        if (targetCourse && !targetCourse.chapters.some((existing) => existing.id === ch.id)) {
          targetCourse.chapters.push(ch);
        }
      }
    }
  } catch (e) {
    console.warn('Failed to load custom chapters:', e);
  }
  return baseCourses;
}

export function saveUploadedChapter(chapter: Chapter): void {
  try {
    const raw = localStorage.getItem(CUSTOM_CHAPTERS_KEY);
    const existing: Chapter[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((c) => c.id !== chapter.id);
    filtered.push(chapter);
    localStorage.setItem(CUSTOM_CHAPTERS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('Failed to save uploaded chapter:', e);
  }
}

export function getCourseById(courseId: string): Course | undefined {
  const all = getAllCourses();
  return all.find((c) => c.id === courseId);
}

export function getLessonById(lessonId: string): { lesson: Lesson; course: Course } | undefined {
  const all = getAllCourses();
  for (const course of all) {
    for (const chapter of course.chapters) {
      const lesson = chapter.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        return { lesson, course };
      }
    }
  }
  return undefined;
}

export async function getLessonProgress(lessonId: string): Promise<StudentLessonProgress | null> {
  try {
    const raw = localStorage.getItem(`${PROGRESS_STORE_KEY}_${lessonId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Progress read error:', e);
  }
  return null;
}

export async function saveLessonProgress(progress: StudentLessonProgress): Promise<void> {
  try {
    localStorage.setItem(`${PROGRESS_STORE_KEY}_${progress.lessonId}`, JSON.stringify(progress));
  } catch (e) {
    console.warn('Progress write error:', e);
  }
}

export async function linkLessonToProject(lessonId: string, projectId: string): Promise<void> {
  const existing = (await getLessonProgress(lessonId)) || {
    lessonId,
    lastVisitedPage: 1,
    totalPages: 1,
    isCompleted: false,
  };
  existing.projectId = projectId;
  await saveLessonProgress(existing);
}
