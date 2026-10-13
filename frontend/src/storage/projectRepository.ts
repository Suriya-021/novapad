import JSZip from 'jszip';
import { getIdeDatabase } from './db';
import { Project, ProjectFile } from '../types/project';
import { STARTER_PYTHON_PROJECT, STARTER_SQL_PROJECT, STARTER_WEB_PROJECT, STARTER_CPP_PROJECT } from './starterProjects';

export async function listProjects(): Promise<Project[]> {
  const db = await getIdeDatabase();
  return db.getAllFromIndex('projects', 'by-updated');
}

export async function getProject(id: string): Promise<Project | undefined> {
  const db = await getIdeDatabase();
  return db.get('projects', id);
}

export async function saveProject(project: Project): Promise<void> {
  const db = await getIdeDatabase();
  const updated: Project = {
    ...project,
    updatedAt: Date.now(),
  };
  await db.put('projects', updated);
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getIdeDatabase();
  await db.delete('projects', id);
}

export async function createProject(name: string, template: Project['template']): Promise<Project> {
  let base: Project;
  switch (template) {
    case 'python':
      base = STARTER_PYTHON_PROJECT;
      break;
    case 'sql':
      base = STARTER_SQL_PROJECT;
      break;
    case 'web':
      base = STARTER_WEB_PROJECT;
      break;
    case 'cpp':
      base = STARTER_CPP_PROJECT;
      break;
    default:
      base = {
        id: `custom-${Date.now()}`,
        name,
        template: 'custom',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        activeFileId: 'main-txt',
        openFileIds: ['main-txt'],
        files: [
          {
            id: 'main-txt',
            name: 'main.txt',
            path: 'main.txt',
            language: 'plaintext',
            content: 'Hello World',
          },
        ],
      };
      break;
  }

  const newId = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const newProject: Project = {
    ...base,
    id: newId,
    name: name.trim() || base.name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await saveProject(newProject);
  return newProject;
}

export async function exportProjectAsZip(project: Project): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder(project.name) || zip;
  
  for (const file of project.files) {
    folder.file(file.name, file.content);
  }

  folder.file('project.json', JSON.stringify({
    name: project.name,
    template: project.template,
    exportedAt: new Date().toISOString(),
  }, null, 2));

  return zip.generateAsync({ type: 'blob' });
}

export async function importProjectFromZip(file: File): Promise<Project> {
  const zip = await JSZip.loadAsync(file);
  const files: ProjectFile[] = [];

  for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
    if (zipEntry.dir) continue;
    if (relativePath.endsWith('project.json')) continue;
    
    const content = await zipEntry.async('string');
    const fileName = relativePath.split('/').pop() || relativePath;
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    let language = 'plaintext';
    if (ext === 'py') language = 'python';
    else if (ext === 'sql') language = 'sql';
    else if (ext === 'html') language = 'html';
    else if (ext === 'css') language = 'css';
    else if (ext === 'js' || ext === 'ts') language = 'javascript';
    else if (ext === 'cpp' || ext === 'c' || ext === 'h') language = 'cpp';
    else if (ext === 'json') language = 'json';

    files.push({
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: fileName,
      path: fileName,
      content,
      language,
    });
  }

  if (files.length === 0) {
    throw new Error('No valid files found in ZIP archive');
  }

  const projName = file.name.replace(/\.zip$/i, '') || 'Imported Project';
  const newProject: Project = {
    id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: projName,
    template: 'custom',
    files,
    activeFileId: files[0].id,
    openFileIds: [files[0].id],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await saveProject(newProject);
  return newProject;
}

export async function findProjectByLessonId(lessonId: string): Promise<Project | undefined> {
  const all = await listProjects();
  return all.find((p) => p.lessonId === lessonId);
}

export async function createProjectForLesson(
  lessonId: string,
  lessonTitle: string,
  mode: 'text' | 'scratch' | 'block',
  starterFiles?: { name: string; content: string; language: string }[],
  templateId?: string
): Promise<Project> {
  const projectId = `proj-lesson-${lessonId}`;

  const files: ProjectFile[] = (starterFiles && starterFiles.length > 0)
    ? starterFiles.map((sf, idx) => ({
        id: `file-${lessonId}-${idx}`,
        name: sf.name,
        path: sf.name,
        content: sf.content,
        language: sf.language,
      }))
    : [
        {
          id: `file-${lessonId}-main`,
          name: mode === 'text' ? 'main.py' : 'project.json',
          path: mode === 'text' ? 'main.py' : 'project.json',
          content: mode === 'text' ? '# Write your solution here\n' : '{}',
          language: mode === 'text' ? 'python' : 'json',
        },
      ];

  const templateType = (templateId === 'starter-sql' ? 'sql' : templateId === 'starter-web' ? 'web' : templateId === 'starter-cpp' ? 'cpp' : 'python') as Project['template'];

  const newProj: Project = {
    id: projectId,
    name: `${lessonTitle} (Lab)`,
    template: templateType,
    mode,
    lessonId,
    files,
    activeFileId: files[0].id,
    openFileIds: files.map((f) => f.id),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await saveProject(newProj);
  return newProj;
}
