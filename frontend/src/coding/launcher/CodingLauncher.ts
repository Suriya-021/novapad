import { Lesson, CodingActivityConfig } from '../../learning/types/curriculum';
import { Project } from '../../types/project';
import { findProjectByLessonId, createProjectForLesson, saveProject } from '../../storage/projectRepository';
import { linkLessonToProject } from '../../learning/storage/curriculumRepository';

export interface LaunchResult {
  project: Project;
  mode: 'text' | 'scratch' | 'block';
  isNew: boolean;
  lesson: Lesson;
}

export async function launchCodingActivity(
  lesson: Lesson,
  activityOverride?: CodingActivityConfig
): Promise<LaunchResult> {
  const activity = activityOverride || lesson.codingActivity;
  if (!activity || !activity.enabled) {
    throw new Error(`Lesson '${lesson.title}' does not have an active coding exercise.`);
  }

  const mode = activity.mode;
  const activityId = activity.projectTemplateId || lesson.id;
  const projectTitle = activity.title || lesson.title;

  let existingProject = await findProjectByLessonId(activityId);
  let isNew = false;

  if (!existingProject) {
    isNew = true;
    existingProject = await createProjectForLesson(
      activityId,
      projectTitle,
      mode,
      activity.starterFiles,
      activity.projectTemplateId
    );
  } else {
    // Touch timestamp
    existingProject.updatedAt = Date.now();
    await saveProject(existingProject);
  }

  // Link in student progress tracker
  await linkLessonToProject(activityId, existingProject.id);

  return {
    project: existingProject,
    mode,
    isNew,
    lesson,
  };
}
