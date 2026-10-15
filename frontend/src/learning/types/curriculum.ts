import { TestCase, ValidationMode } from '../../types/validation';

export type CodingMode = 'text' | 'scratch' | 'block';

export interface CodingActivityConfig {
  enabled: boolean;
  mode: CodingMode;
  language?: 'python' | 'sql' | 'html' | 'javascript' | 'cpp';
  title: string;
  instructions: string;
  projectTemplateId: string;
  starterFiles?: {
    name: string;
    content: string;
    language: string;
  }[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  hints?: string[];
  testCases?: TestCase[];
  validationMode?: ValidationMode;
}

export interface ChapterSection {
  id: string;
  sectionNumber: number;
  title: string;
  startPage: number; // 1-based page number in chapter
  endPage: number;   // 1-based page number in chapter
  summary?: string;
  isCodingLab?: boolean;
  codingActivity?: CodingActivityConfig;
}

export interface LessonPage {
  pageNumber: number;
  title: string;
  sectionTitle?: string;
  sectionIndex?: number;
  content: string; // Markdown or rich text
  imageUrl?: string;
  imageCaption?: string;
  codeSnippet?: {
    language: string;
    code: string;
    explanation?: string;
  };
  hasCodingPrompt?: boolean;
  codingActivity?: CodingActivityConfig;
}

export interface Lesson {
  id: string;
  chapterId: string;
  courseId: string;
  order: number;
  title: string;
  summary: string;
  estimatedMinutes: number;
  pages: LessonPage[];
  codingActivity?: CodingActivityConfig;
  sections?: ChapterSection[];
}

export interface Chapter {
  id: string;
  courseId: string;
  order: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  gradeLevel: string;
  subject: string;
  description: string;
  badge: string;
  chapters: Chapter[];
}

export interface StudentLessonProgress {
  lessonId: string;
  lastVisitedPage: number;
  totalPages: number;
  isCompleted: boolean;
  completedAt?: number;
  projectId?: string; // Connected coding project ID
}
