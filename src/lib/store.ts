import { Project, Task, Tag, Expense, ChecklistItem, Photo, MoodBoardItem } from "./types";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "nestly_projects";

function now() {
  return new Date().toISOString();
}

export function getProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProjects(projects: Project[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function getProject(id: string): Project | undefined {
  return getProjects().find((p) => p.id === id);
}

export function createProject(data: Omit<Project, "id" | "tasks" | "mood_board" | "created_at" | "updated_at">): Project {
  const projects = getProjects();
  const project: Project = {
    ...data,
    id: uuidv4(),
    tasks: [],
    mood_board: [],
    created_at: now(),
    updated_at: now(),
  };
  saveProjects([...projects, project]);
  return project;
}

export function updateProject(id: string, data: Partial<Project>): Project {
  const projects = getProjects();
  const updated = projects.map((p) =>
    p.id === id ? { ...p, ...data, updated_at: now() } : p
  );
  saveProjects(updated);
  return updated.find((p) => p.id === id)!;
}

export function deleteProject(id: string) {
  saveProjects(getProjects().filter((p) => p.id !== id));
}

export function createTask(projectId: string, data: Omit<Task, "id" | "project_id" | "created_at" | "updated_at">): Task {
  const projects = getProjects();
  const task: Task = {
    ...data,
    id: uuidv4(),
    project_id: projectId,
    created_at: now(),
    updated_at: now(),
  };
  const updated = projects.map((p) =>
    p.id === projectId
      ? { ...p, tasks: [...p.tasks, task], updated_at: now() }
      : p
  );
  saveProjects(updated);
  return task;
}

export function updateTask(projectId: string, taskId: string, data: Partial<Task>): Task {
  const projects = getProjects();
  let updatedTask: Task | undefined;
  const updated = projects.map((p) => {
    if (p.id !== projectId) return p;
    const tasks = p.tasks.map((t) => {
      if (t.id !== taskId) return t;
      updatedTask = { ...t, ...data, updated_at: now() };
      return updatedTask;
    });
    return { ...p, tasks, updated_at: now() };
  });
  saveProjects(updated);
  return updatedTask!;
}

export function deleteTask(projectId: string, taskId: string) {
  const projects = getProjects();
  const updated = projects.map((p) =>
    p.id === projectId
      ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId), updated_at: now() }
      : p
  );
  saveProjects(updated);
}

export function addExpense(projectId: string, taskId: string, expense: Omit<Expense, "id">): Expense {
  const e: Expense = { ...expense, id: uuidv4() };
  const task = getProjects().find(p => p.id === projectId)?.tasks.find(t => t.id === taskId);
  if (!task) throw new Error("Task not found");
  updateTask(projectId, taskId, { expenses: [...task.expenses, e] });
  return e;
}

export function removeExpense(projectId: string, taskId: string, expenseId: string) {
  const task = getProjects().find(p => p.id === projectId)?.tasks.find(t => t.id === taskId);
  if (!task) return;
  updateTask(projectId, taskId, { expenses: task.expenses.filter(e => e.id !== expenseId) });
}

export function addChecklistItem(projectId: string, taskId: string, text: string): ChecklistItem {
  const item: ChecklistItem = { id: uuidv4(), text, checked: false };
  const task = getProjects().find(p => p.id === projectId)?.tasks.find(t => t.id === taskId);
  if (!task) throw new Error("Task not found");
  updateTask(projectId, taskId, { checklist: [...task.checklist, item] });
  return item;
}

export function toggleChecklistItem(projectId: string, taskId: string, itemId: string) {
  const task = getProjects().find(p => p.id === projectId)?.tasks.find(t => t.id === taskId);
  if (!task) return;
  updateTask(projectId, taskId, {
    checklist: task.checklist.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i)
  });
}

export function addPhoto(projectId: string, taskId: string, photo: Omit<Photo, "id">): Photo {
  const p: Photo = { ...photo, id: uuidv4() };
  const task = getProjects().find(proj => proj.id === projectId)?.tasks.find(t => t.id === taskId);
  if (!task) throw new Error("Task not found");
  updateTask(projectId, taskId, { photos: [...task.photos, p] });
  return p;
}

export function addMoodBoardItem(projectId: string, item: Omit<MoodBoardItem, "id">): MoodBoardItem {
  const mbi: MoodBoardItem = { ...item, id: uuidv4() };
  const project = getProject(projectId);
  if (!project) throw new Error("Project not found");
  updateProject(projectId, { mood_board: [...project.mood_board, mbi] });
  return mbi;
}

export function removeMoodBoardItem(projectId: string, itemId: string) {
  const project = getProject(projectId);
  if (!project) return;
  updateProject(projectId, { mood_board: project.mood_board.filter(i => i.id !== itemId) });
}

export function getProjectStats(project: Project) {
  const totalTasks = project.tasks.length;
  const doneTasks = project.tasks.filter(t => t.status === "done").length;
  const inProgressTasks = project.tasks.filter(t => t.status === "in_progress").length;
  const totalEstimated = project.tasks.reduce((sum, t) => sum + (t.estimated_cost || 0), 0);
  const totalSpent = project.tasks.reduce(
    (sum, t) => sum + t.expenses.reduce((s, e) => s + e.amount, 0),
    0
  );
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  return { totalTasks, doneTasks, inProgressTasks, totalEstimated, totalSpent, progress };
}

export function getAllTags(projects: Project[]): Tag[] {
  const tagMap = new Map<string, Tag>();
  projects.forEach(p => {
    p.tags.forEach(t => tagMap.set(t.id, t));
    p.tasks.forEach(task => task.tags.forEach(t => tagMap.set(t.id, t)));
  });
  return Array.from(tagMap.values());
}
