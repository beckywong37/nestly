"use client";

import { useState } from "react";
import { Project, Task, TaskStatus } from "@/lib/types";
import { createTask, deleteTask, updateTask } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  MoreVertical,
  Trash2,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Camera,
  ClipboardList,
  Wrench,
  ShoppingCart,
  StickyNote,
  Check,
  Circle,
  Clock,
  CheckCircle2,
  Tag as TagIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import TaskDetailDrawer from "@/components/TaskDetailDrawer";

interface Props {
  project: Project;
  onRefresh: () => void;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: React.ReactNode; color: string }> = {
  todo: {
    label: "To Do",
    icon: <Circle className="h-3.5 w-3.5" />,
    color: "text-muted-foreground bg-muted border-border",
  },
  in_progress: {
    label: "In Progress",
    icon: <Clock className="h-3.5 w-3.5" />,
    color: "text-amber-700 bg-amber-50 border-amber-200",
  },
  done: {
    label: "Done",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    color: "text-green-700 bg-green-50 border-green-200",
  },
};

const TAG_COLORS = [
  { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", value: "red" },
  { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200", value: "orange" },
  { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", value: "amber" },
  { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", value: "blue" },
  { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", value: "green" },
  { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", value: "purple" },
  { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200", value: "pink" },
];

function getTagStyle(color: string) {
  return TAG_COLORS.find(c => c.value === color) || TAG_COLORS[3];
}

export default function TasksTab({ project, onRefresh }: Props) {
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "todo" as TaskStatus,
    estimated_cost: "",
    tags: [] as { id: string; name: string; color: string }[],
    tagInput: "",
  });

  const allTags = Array.from(
    new Map(project.tasks.flatMap(t => t.tags).map(t => [t.id, t])).values()
  );

  const filteredTasks = project.tasks.filter(t => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterTag !== "all" && !t.tags.some(tag => tag.id === filterTag)) return false;
    return true;
  });

  function handleCreate() {
    if (!form.title.trim()) return;
    createTask(project.id, {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      status: form.status,
      estimated_cost: parseFloat(form.estimated_cost) || 0,
      tags: form.tags,
      expenses: [],
      checklist: [],
      photos: [],
      tools_needed: [],
      materials_needed: [],
    });
    onRefresh();
    setNewTaskOpen(false);
    setForm({ title: "", description: "", status: "todo", estimated_cost: "", tags: [], tagInput: "" });
    toast.success("Task created!");
  }

  function handleDelete(taskId: string, title: string) {
    deleteTask(project.id, taskId);
    onRefresh();
    toast.success(`"${title}" deleted.`);
  }

  function handleStatusChange(taskId: string, status: TaskStatus) {
    updateTask(project.id, taskId, { status });
    onRefresh();
  }

  function addTagToForm() {
    const name = form.tagInput.trim();
    if (!name) return;
    const existing = form.tags.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (existing) return;
    const color = TAG_COLORS[form.tags.length % TAG_COLORS.length].value;
    const newTag = { id: `${Date.now()}`, name, color };
    setForm({ ...form, tags: [...form.tags, newTag], tagInput: "" });
  }

  function openTask(task: Task) {
    setSelectedTask(task);
  }

  const taskGroups: { status: TaskStatus; tasks: Task[] }[] = [
    { status: "in_progress", tasks: filteredTasks.filter(t => t.status === "in_progress") },
    { status: "todo", tasks: filteredTasks.filter(t => t.status === "todo") },
    { status: "done", tasks: filteredTasks.filter(t => t.status === "done") },
  ];

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filterStatus} onValueChange={(v) => v && setFilterStatus(v as TaskStatus | "all")}>
            <SelectTrigger className="w-36 h-8 text-sm">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
          {allTags.length > 0 && (
            <Select value={filterTag} onValueChange={(v) => v && setFilterTag(v)}>
              <SelectTrigger className="w-36 h-8 text-sm">
                <SelectValue placeholder="All tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tags</SelectItem>
                {allTags.map(tag => (
                  <SelectItem key={tag.id} value={tag.id}>{tag.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <Button onClick={() => setNewTaskOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Task
        </Button>
      </div>

      {/* Task groups */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
          <p className="text-muted-foreground">No tasks yet. Add your first task to get started.</p>
          <Button className="mt-4" onClick={() => setNewTaskOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {taskGroups.map(group => {
            if (group.tasks.length === 0) return null;
            const config = STATUS_CONFIG[group.status];
            return (
              <div key={group.status}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full border ${config.color}`}>
                    {config.icon}
                    {config.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{group.tasks.length}</span>
                </div>
                <div className="space-y-2">
                  {group.tasks.map(task => {
                    const spent = task.expenses.reduce((s, e) => s + e.amount, 0);
                    const checkDone = task.checklist.length > 0
                      ? task.checklist.filter(i => i.checked).length
                      : null;
                    return (
                      <div
                        key={task.id}
                        className="group bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow cursor-pointer"
                        onClick={() => openTask(task)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`font-medium text-sm ${task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                {task.title}
                              </span>
                              {task.tags.map(tag => {
                                const style = getTagStyle(tag.color);
                                return (
                                  <span key={tag.id} className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${style.bg} ${style.text} ${style.border}`}>
                                    {tag.name}
                                  </span>
                                );
                              })}
                            </div>
                            {task.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{task.description}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                              {(spent > 0 || task.estimated_cost > 0) && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  ${spent.toLocaleString()}
                                  {task.estimated_cost > 0 && <span className="opacity-60">/ ${task.estimated_cost.toLocaleString()}</span>}
                                </span>
                              )}
                              {checkDone !== null && (
                                <span className="flex items-center gap-1">
                                  <Check className="h-3 w-3" />
                                  {checkDone}/{task.checklist.length}
                                </span>
                              )}
                              {task.photos.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Camera className="h-3 w-3" />
                                  {task.photos.length}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                            <Select value={task.status} onValueChange={(v) => v && handleStatusChange(task.id, v as TaskStatus)}>
                              <SelectTrigger className="h-7 w-[120px] text-xs border-dashed">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="todo">To Do</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="done">Done</SelectItem>
                              </SelectContent>
                            </Select>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="inline-flex items-center justify-center h-7 w-7 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent">
                                <MoreVertical className="h-3.5 w-3.5" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleDelete(task.id, task.title)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete task
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Task Dialog */}
      <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="task-title">Task name *</Label>
              <Input
                id="task-title"
                placeholder="e.g. Install recessed lights in kitchen"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-desc">Description</Label>
              <Textarea
                id="task-desc"
                placeholder="What needs to be done?"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => v && setForm({ ...form, status: v as TaskStatus })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="est-cost">Estimated cost ($)</Label>
                <Input
                  id="est-cost"
                  type="number"
                  placeholder="0"
                  value={form.estimated_cost}
                  onChange={(e) => setForm({ ...form, estimated_cost: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag (e.g. Electrical)"
                  value={form.tagInput}
                  onChange={(e) => setForm({ ...form, tagInput: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTagToForm(); } }}
                />
                <Button type="button" variant="outline" size="sm" onClick={addTagToForm}>Add</Button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {form.tags.map(tag => {
                    const style = getTagStyle(tag.color);
                    return (
                      <span key={tag.id} className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${style.bg} ${style.text} ${style.border}`}>
                        {tag.name}
                        <button onClick={() => setForm({ ...form, tags: form.tags.filter(t => t.id !== tag.id) })}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTaskOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.title.trim()}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Detail Drawer */}
      {selectedTask && (
        <TaskDetailDrawer
          project={project}
          task={selectedTask}
          onClose={() => { setSelectedTask(null); onRefresh(); }}
          onRefresh={() => {
            onRefresh();
            const updated = project.tasks.find(t => t.id === selectedTask.id);
            if (updated) setSelectedTask({ ...updated });
          }}
        />
      )}
    </div>
  );
}
