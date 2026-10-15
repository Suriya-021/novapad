import { describe, it, expect } from 'vitest';
import {
  validateLessonPage,
  validateLesson,
  validateCourse,
} from '../learning/storage/curriculumValidator';
import { Course, Lesson, LessonPage } from '../learning/types/curriculum';

describe('curriculumValidator', () => {
  describe('validateLessonPage', () => {
    it('passes for a valid lesson page', () => {
      const page: LessonPage = {
        pageNumber: 1,
        title: 'Introduction',
        content: 'Welcome to this lesson.',
      };
      const errors = validateLessonPage(page, 0);
      expect(errors).toHaveLength(0);
    });

    it('flags non-object inputs', () => {
      expect(validateLessonPage(null, 0)).toContain('Page [0] must be an object.');
      expect(validateLessonPage('invalid', 1)).toContain('Page [1] must be an object.');
    });

    it('identifies missing required fields', () => {
      const page = {
        // missing pageNumber, title, content
      };
      const errors = validateLessonPage(page, 2);
      expect(errors).toContain("Page [2] must have a numeric 'pageNumber'.");
      expect(errors).toContain("Page [2] is missing a string 'title'.");
      expect(errors).toContain("Page [2] is missing a string 'content'.");
    });
  });

  describe('validateLesson', () => {
    it('validates a complete lesson structure successfully', () => {
      const lesson: Lesson = {
        id: 'lesson-01',
        chapterId: 'ch-01',
        courseId: 'course-01',
        order: 1,
        title: 'Variables and Memory',
        summary: 'Learn about variables',
        estimatedMinutes: 15,
        pages: [
          {
            pageNumber: 1,
            title: 'What is a variable?',
            content: 'A named memory location.',
          },
          {
            pageNumber: 2,
            title: 'Declaring Variables',
            content: 'x = 10',
          },
        ],
      };

      const result = validateLesson(lesson);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects null or empty lessons', () => {
      expect(validateLesson(null).valid).toBe(false);
      expect(validateLesson({}).valid).toBe(false);
      const res = validateLesson({ id: '', title: '', pages: [] });
      expect(res.valid).toBe(false);
      expect(res.errors).toContain("Lesson is missing a valid string 'id'.");
      expect(res.errors).toContain("Lesson is missing a valid string 'title'.");
      expect(res.errors).toContain("Lesson must contain a non-empty 'pages' array.");
    });

    it('aggregates invalid nested page errors', () => {
      const lesson = {
        id: 'lesson-bad',
        title: 'Bad Lesson',
        pages: [{ pageNumber: 'not-a-number', title: 123 }],
      };
      const res = validateLesson(lesson);
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes('pageNumber'))).toBe(true);
    });
  });

  describe('validateCourse', () => {
    it('validates a well-formed course hierarchy', () => {
      const course: Course = {
        id: 'python-core',
        title: 'Core Python',
        gradeLevel: 'Grade 6-8',
        subject: 'Computer Science',
        description: 'Comprehensive Python Guide',
        badge: 'Python',
        chapters: [
          {
            id: 'ch-1',
            courseId: 'python-core',
            title: 'Basics',
            description: 'Basics chapter',
            order: 1,
            lessons: [
              {
                id: 'l-1',
                chapterId: 'ch-1',
                courseId: 'python-core',
                order: 1,
                title: 'Intro',
                summary: 'Intro summary',
                estimatedMinutes: 10,
                pages: [
                  {
                    pageNumber: 1,
                    title: 'Page 1',
                    content: 'Content 1',
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = validateCourse(course);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects missing chapters or invalid chapter definitions', () => {
      const emptyCourse = { id: 'test-c', title: 'Test Course', chapters: [] };
      const res = validateCourse(emptyCourse);
      expect(res.valid).toBe(false);
      expect(res.errors).toContain("Course must contain a non-empty 'chapters' array.");

      const invalidChCourse = {
        id: 'test-c2',
        title: 'Test Course 2',
        chapters: [{ id: '', lessons: [] }],
      };
      const res2 = validateCourse(invalidChCourse);
      expect(res2.valid).toBe(false);
      expect(res2.errors.some((e) => e.includes('missing an \'id\''))).toBe(true);
      expect(res2.errors.some((e) => e.includes('at least one lesson'))).toBe(true);
    });
  });

  describe('validateTestCase and validateCodingActivity', () => {
    it('validates coding activities with well-formed test cases', () => {
      const lessonWithTests: Lesson = {
        id: 'lesson-with-tests',
        chapterId: 'ch-01',
        courseId: 'course-01',
        order: 1,
        title: 'Calculator Lesson',
        summary: 'Math operations',
        estimatedMinutes: 20,
        pages: [{ pageNumber: 1, title: 'Intro', content: 'Intro' }],
        codingActivity: {
          enabled: true,
          mode: 'text',
          language: 'python',
          title: 'Calc Lab',
          instructions: 'Build calc',
          projectTemplateId: 'calc-temp',
          testCases: [
            { id: 'tc-1', title: 'Case 1', input: '10\n20\n', expectedOutput: '30' },
            { id: 'tc-2', title: 'Case 2', input: '0\n0\n', expectedOutput: '0', isHidden: true },
          ],
        },
      };

      const res = validateLesson(lessonWithTests);
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    it('rejects malformed test cases in coding activity', () => {
      const lessonWithBadTests = {
        id: 'lesson-bad-tests',
        title: 'Lesson Bad Tests',
        pages: [{ pageNumber: 1, title: 'Intro', content: 'Intro' }],
        codingActivity: {
          enabled: true,
          mode: 'text',
          testCases: [
            { id: '', input: 123 }, // missing id, input not string, missing expectedOutput
          ],
        },
      };

      const res = validateLesson(lessonWithBadTests);
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes("non-empty string 'id'"))).toBe(true);
      expect(res.errors.some((e) => e.includes("string 'input'"))).toBe(true);
      expect(res.errors.some((e) => e.includes("string 'expectedOutput'"))).toBe(true);
    });
  });
});
