import { Course, Lesson, LessonPage, CodingActivityConfig } from '../types/curriculum';
import { TestCase } from '../../types/validation';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a test case object
 */
export function validateTestCase(tc: unknown, index: number): string[] {
  const errors: string[] = [];
  if (!tc || typeof tc !== 'object') {
    errors.push(`Test Case [${index}] must be an object.`);
    return errors;
  }
  const t = tc as Partial<TestCase>;
  if (typeof t.id !== 'string' || !t.id.trim()) {
    errors.push(`Test Case [${index}] must have a non-empty string 'id'.`);
  }
  if (typeof t.input !== 'string') {
    errors.push(`Test Case [${index}] must have a string 'input'.`);
  }
  if (typeof t.expectedOutput !== 'string') {
    errors.push(`Test Case [${index}] must have a string 'expectedOutput'.`);
  }
  return errors;
}

/**
 * Validates a coding activity configuration
 */
export function validateCodingActivity(activity: unknown): string[] {
  const errors: string[] = [];
  if (!activity || typeof activity !== 'object') {
    return errors;
  }
  const act = activity as Partial<CodingActivityConfig>;
  if (act.testCases) {
    if (!Array.isArray(act.testCases)) {
      errors.push("'testCases' must be an array.");
    } else {
      act.testCases.forEach((tc, idx) => {
        errors.push(...validateTestCase(tc, idx));
      });
    }
  }
  return errors;
}

/**
 * Validates a lesson page object at runtime
 */
export function validateLessonPage(page: unknown, pageIndex: number): string[] {
  const errors: string[] = [];
  if (!page || typeof page !== 'object') {
    errors.push(`Page [${pageIndex}] must be an object.`);
    return errors;
  }

  const p = page as Partial<LessonPage>;
  if (typeof p.pageNumber !== 'number') {
    errors.push(`Page [${pageIndex}] must have a numeric 'pageNumber'.`);
  }
  if (typeof p.title !== 'string') {
    errors.push(`Page [${pageIndex}] is missing a string 'title'.`);
  }
  if (typeof p.content !== 'string') {
    errors.push(`Page [${pageIndex}] is missing a string 'content'.`);
  }

  return errors;
}

/**
 * Validates a lesson object at runtime
 */
export function validateLesson(lesson: unknown): ValidationResult {
  const errors: string[] = [];
  if (!lesson || typeof lesson !== 'object') {
    return { valid: false, errors: ['Lesson must be a non-null object.'] };
  }

  const l = lesson as Partial<Lesson>;
  if (typeof l.id !== 'string' || !l.id.trim()) {
    errors.push("Lesson is missing a valid string 'id'.");
  }
  if (typeof l.title !== 'string' || !l.title.trim()) {
    errors.push("Lesson is missing a valid string 'title'.");
  }
  if (!Array.isArray(l.pages) || l.pages.length === 0) {
    errors.push("Lesson must contain a non-empty 'pages' array.");
  } else {
    l.pages.forEach((page, idx) => {
      errors.push(...validateLessonPage(page, idx));
    });
  }

  if (l.codingActivity) {
    errors.push(...validateCodingActivity(l.codingActivity));
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a full course object at runtime
 */
export function validateCourse(course: unknown): ValidationResult {
  const errors: string[] = [];
  if (!course || typeof course !== 'object') {
    return { valid: false, errors: ['Course must be a non-null object.'] };
  }

  const c = course as Partial<Course>;
  if (typeof c.id !== 'string' || !c.id.trim()) {
    errors.push("Course is missing a valid string 'id'.");
  }
  if (typeof c.title !== 'string' || !c.title.trim()) {
    errors.push("Course is missing a valid string 'title'.");
  }
  if (!Array.isArray(c.chapters) || c.chapters.length === 0) {
    errors.push("Course must contain a non-empty 'chapters' array.");
  } else {
    c.chapters.forEach((ch, chIdx) => {
      if (!ch || typeof ch !== 'object') {
        errors.push(`Chapter [${chIdx}] must be an object.`);
        return;
      }
      if (typeof ch.id !== 'string' || !ch.id.trim()) {
        errors.push(`Chapter [${chIdx}] is missing an 'id'.`);
      }
      if (!Array.isArray(ch.lessons) || ch.lessons.length === 0) {
        errors.push(`Chapter [${chIdx}] must contain at least one lesson.`);
      } else {
        ch.lessons.forEach((l) => {
          const res = validateLesson(l);
          if (!res.valid) {
            errors.push(...res.errors.map((e) => `Chapter [${ch.title || chIdx}]: ${e}`));
          }
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
