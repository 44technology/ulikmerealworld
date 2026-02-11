/**
 * Class lesson progress – per user, persisted in localStorage.
 * Used on both web and mobile so the user sees how many lessons they've completed.
 */

const STORAGE_KEY_PREFIX = 'class_lesson_progress';

function storageKey(classId: string, userId: string): string {
  return `${STORAGE_KEY_PREFIX}_${userId}_${classId}`;
}

export function getCompletedLessonIds(classId: string, userId: string | undefined): string[] {
  if (!classId || !userId) return [];
  try {
    const raw = localStorage.getItem(storageKey(classId, userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : parsed?.completedLessonIds ?? [];
  } catch {
    return [];
  }
}

export function setLessonCompleted(
  classId: string,
  lessonId: string,
  userId: string | undefined,
  completed: boolean
): void {
  if (!classId || !userId) return;
  const key = storageKey(classId, userId);
  const current = getCompletedLessonIds(classId, userId);
  const next = completed
    ? (current.includes(lessonId) ? current : [...current, lessonId])
    : current.filter((id) => id !== lessonId);
  try {
    localStorage.setItem(key, JSON.stringify(next));
  } catch (e) {
    console.error('Failed to save lesson progress', e);
  }
}

export function isLessonCompleted(
  classId: string,
  lessonId: string,
  userId: string | undefined,
  fromSyllabus?: boolean
): boolean {
  if (fromSyllabus !== undefined) return !!fromSyllabus;
  return getCompletedLessonIds(classId, userId).includes(lessonId);
}

/** Get all lesson ids from class syllabus (modules[].lessons[].id). */
export function getTotalLessonsFromClass(classItem: { syllabus?: Array<{ lessons?: Array<{ id?: string }> }> } | null): number {
  if (!classItem?.syllabus || !Array.isArray(classItem.syllabus)) return 0;
  return classItem.syllabus.reduce(
    (sum, mod) => sum + (Array.isArray(mod.lessons) ? mod.lessons.length : 0),
    0
  );
}

export interface ClassLessonProgress {
  total: number;
  completed: number;
  completedIds: string[];
  percent: number;
}

export function getClassLessonProgress(
  classItem: { id?: string; syllabus?: Array<{ lessons?: Array<{ id?: string; completed?: boolean }> }> } | null,
  userId: string | undefined
): ClassLessonProgress {
  const total = getTotalLessonsFromClass(classItem);
  const classId = classItem && 'id' in classItem ? (classItem as { id: string }).id : '';
  if (total === 0) {
    return { total: 0, completed: 0, completedIds: [], percent: 0 };
  }
  const fromStorage = getCompletedLessonIds(classId, userId);
  const allLessonIds: string[] = [];
  (classItem?.syllabus || []).forEach((mod) => {
    (mod.lessons || []).forEach((l) => {
      if (l.id) allLessonIds.push(l.id);
    });
  });
  const completedFromSyllabus = (classItem?.syllabus || []).flatMap((m) => m.lessons || [])
    .filter((l) => l.id && l.completed)
    .map((l) => l.id!);
  const completedSet = new Set([...fromStorage, ...completedFromSyllabus]);
  const completedIds = allLessonIds.filter((id) => completedSet.has(id));
  const completed = completedIds.length;
  return {
    total,
    completed,
    completedIds,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}
