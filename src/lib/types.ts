export type TaskStatus = "todo" | "in_progress" | "done";

export type Tag = {
  id: string;
  name: string;
  color: string;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  date: string;
  receipt_url?: string;
};

export type ChecklistItem = {
  id: string;
  text: string;
  checked: boolean;
};

export type Photo = {
  id: string;
  url: string;
  caption?: string;
  type: "before" | "during" | "after" | "general";
};

export type Task = {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  tags: Tag[];
  estimated_cost: number;
  expenses: Expense[];
  checklist: ChecklistItem[];
  photos: Photo[];
  notes?: string;
  tools_needed: string[];
  materials_needed: string[];
  created_at: string;
  updated_at: string;
};

export type MoodBoardItem = {
  id: string;
  url: string;
  caption?: string;
  source_url?: string;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  location?: string;
  status: "planning" | "in_progress" | "on_hold" | "complete";
  start_date?: string;
  target_date?: string;
  budget: number;
  cover_image?: string;
  tags: Tag[];
  tasks: Task[];
  mood_board: MoodBoardItem[];
  created_at: string;
  updated_at: string;
};
