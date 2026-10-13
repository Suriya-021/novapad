export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isDirty?: boolean;
}

export type CodingMode = 'text' | 'scratch' | 'block';

export interface Project {
  id: string;
  name: string;
  template: 'python' | 'sql' | 'web' | 'cpp' | 'scratch' | 'block' | 'custom';
  mode?: CodingMode;
  lessonId?: string;
  courseId?: string;
  files: ProjectFile[];
  activeFileId: string;
  openFileIds: string[];
  createdAt: number;
  updatedAt: number;
}
