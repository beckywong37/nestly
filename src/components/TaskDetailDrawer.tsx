"use client";

import { useState, useRef } from "react";
import { Project, Task, TaskStatus, Expense, ChecklistItem, Photo } from "@/lib/types";
import {
  updateTask,
  addExpense,
  removeExpense,
  addChecklistItem,
  toggleChecklistItem,
  addPhoto,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  DollarSign,
  Check,
  Plus,
  Trash2,
  Camera,
  Wrench,
  ShoppingCart,
  StickyNote,
  CheckSquare,
  Square,
  Upload,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Props {
  project: Project;
  task: Task;
  onClose: () => void;
  onRefresh: () => void;
}

const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  red: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  orange: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  amber: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  blue: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  green: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  purple: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  pink: { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200" },
};

function getTagStyle(color: string) {
  return TAG_COLORS[color] || TAG_COLORS.blue;
}

export default function TaskDetailDrawer({ project, task, onClose, onRefresh }: Props) {
  const [activeSection, setActiveSection] = useState<string | null>("notes");

  // Expense form
  const [expForm, setExpForm] = useState({ description: "", amount: "", date: new Date().toISOString().split("T")[0] });

  // Checklist form
  const [checkInput, setCheckInput] = useState("");

  // Tools/Materials
  const [toolInput, setToolInput] = useState("");
  const [materialInput, setMaterialInput] = useState("");

  // Photo
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoType, setPhotoType] = useState<Photo["type"]>("general");
  const fileRef = useRef<HTMLInputElement>(null);

  const totalSpent = task.expenses.reduce((s, e) => s + e.amount, 0);
  const checkDone = task.checklist.filter(i => i.checked).length;

  function handleStatusChange(status: TaskStatus | null) {
    if (!status) return;
    updateTask(project.id, task.id, { status });
    onRefresh();
  }

  function handleNotesChange(notes: string) {
    updateTask(project.id, task.id, { notes });
    onRefresh();
  }

  function handleAddExpense() {
    if (!expForm.description.trim() || !expForm.amount) return;
    addExpense(project.id, task.id, {
      description: expForm.description.trim(),
      amount: parseFloat(expForm.amount),
      date: expForm.date,
    });
    setExpForm({ description: "", amount: "", date: new Date().toISOString().split("T")[0] });
    onRefresh();
    toast.success("Expense added.");
  }

  function handleRemoveExpense(expenseId: string) {
    removeExpense(project.id, task.id, expenseId);
    onRefresh();
  }

  function handleAddChecklist() {
    if (!checkInput.trim()) return;
    addChecklistItem(project.id, task.id, checkInput.trim());
    setCheckInput("");
    onRefresh();
  }

  function handleToggleCheck(itemId: string) {
    toggleChecklistItem(project.id, task.id, itemId);
    onRefresh();
  }

  function handleAddTool() {
    if (!toolInput.trim()) return;
    const updated = [...task.tools_needed, toolInput.trim()];
    updateTask(project.id, task.id, { tools_needed: updated });
    setToolInput("");
    onRefresh();
  }

  function handleRemoveTool(tool: string) {
    updateTask(project.id, task.id, { tools_needed: task.tools_needed.filter(t => t !== tool) });
    onRefresh();
  }

  function handleAddMaterial() {
    if (!materialInput.trim()) return;
    const updated = [...task.materials_needed, materialInput.trim()];
    updateTask(project.id, task.id, { materials_needed: updated });
    setMaterialInput("");
    onRefresh();
  }

  function handleRemoveMaterial(mat: string) {
    updateTask(project.id, task.id, { materials_needed: task.materials_needed.filter(m => m !== mat) });
    onRefresh();
  }

  function handleAddPhotoUrl() {
    if (!photoUrl.trim()) return;
    addPhoto(project.id, task.id, { url: photoUrl.trim(), caption: photoCaption.trim() || undefined, type: photoType });
    setPhotoUrl("");
    setPhotoCaption("");
    setPhotoType("general");
    onRefresh();
    toast.success("Photo added.");
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      addPhoto(project.id, task.id, { url, caption: file.name, type: photoType });
      onRefresh();
      toast.success("Photo uploaded.");
    };
    reader.readAsDataURL(file);
  }

  function toggleSection(section: string) {
    setActiveSection(prev => prev === section ? null : section);
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-2xl bg-background border-l border-border flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Select value={task.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-7 w-[130px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
              {task.tags.map(tag => {
                const style = getTagStyle(tag.color);
                return (
                  <span key={tag.id} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${style.bg} ${style.text} ${style.border}`}>
                    {tag.name}
                  </span>
                );
              })}
            </div>
            <h2 className="text-xl font-bold text-foreground">{task.title}</h2>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-6 px-6 py-3 bg-muted/50 border-b border-border text-sm">
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Spent:</span>
            <span className="font-semibold text-foreground">${totalSpent.toLocaleString()}</span>
            {task.estimated_cost > 0 && (
              <span className="text-muted-foreground">/ ${task.estimated_cost.toLocaleString()} est.</span>
            )}
          </div>
          {task.checklist.length > 0 && (
            <div className="flex items-center gap-1.5">
              <CheckSquare className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Checklist:</span>
              <span className="font-semibold text-foreground">{checkDone}/{task.checklist.length}</span>
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Notes */}
          <Section
            id="notes"
            label="Notes"
            icon={<StickyNote className="h-4 w-4" />}
            active={activeSection === "notes"}
            onToggle={() => toggleSection("notes")}
          >
            <Textarea
              placeholder="Add notes, instructions, wiring details, how-to info..."
              rows={5}
              className="resize-none text-sm"
              defaultValue={task.notes || ""}
              onBlur={(e) => handleNotesChange(e.target.value)}
            />
          </Section>

          <Separator />

          {/* Expenses */}
          <Section
            id="expenses"
            label={`Expenses${task.expenses.length > 0 ? ` (${task.expenses.length})` : ""}`}
            icon={<DollarSign className="h-4 w-4" />}
            active={activeSection === "expenses"}
            onToggle={() => toggleSection("expenses")}
            badge={totalSpent > 0 ? `$${totalSpent.toLocaleString()}` : undefined}
          >
            <div className="space-y-3">
              {task.expenses.map(exp => (
                <div key={exp.id} className="flex items-center justify-between bg-muted/60 rounded-lg px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{exp.description}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(exp.date), "MMM d, yyyy")}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold text-foreground">${exp.amount.toLocaleString()}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveExpense(exp.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="bg-muted/40 rounded-lg p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Description (e.g. LED lights)"
                    value={expForm.description}
                    onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                    className="text-sm h-8"
                  />
                  <Input
                    type="number"
                    placeholder="Amount ($)"
                    value={expForm.amount}
                    onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })}
                    className="text-sm h-8"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={expForm.date}
                    onChange={(e) => setExpForm({ ...expForm, date: e.target.value })}
                    className="text-sm h-8 flex-1"
                  />
                  <Button size="sm" onClick={handleAddExpense} className="h-8" disabled={!expForm.description.trim() || !expForm.amount}>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </Section>

          <Separator />

          {/* Checklist */}
          <Section
            id="checklist"
            label={`Checklist${task.checklist.length > 0 ? ` (${checkDone}/${task.checklist.length})` : ""}`}
            icon={<CheckSquare className="h-4 w-4" />}
            active={activeSection === "checklist"}
            onToggle={() => toggleSection("checklist")}
          >
            <div className="space-y-2">
              {task.checklist.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-2.5 cursor-pointer group"
                  onClick={() => handleToggleCheck(item.id)}
                >
                  <div className={`shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${item.checked ? "bg-primary border-primary" : "border-border group-hover:border-primary/60"}`}>
                    {item.checked && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                  </div>
                  <span className={`text-sm ${item.checked ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {item.text}
                  </span>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add checklist item..."
                  value={checkInput}
                  onChange={(e) => setCheckInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddChecklist(); }}
                  className="text-sm h-8"
                />
                <Button size="sm" onClick={handleAddChecklist} className="h-8 shrink-0" disabled={!checkInput.trim()}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Section>

          <Separator />

          {/* Tools needed */}
          <Section
            id="tools"
            label={`Tools Needed${task.tools_needed.length > 0 ? ` (${task.tools_needed.length})` : ""}`}
            icon={<Wrench className="h-4 w-4" />}
            active={activeSection === "tools"}
            onToggle={() => toggleSection("tools")}
          >
            <div className="space-y-2">
              {task.tools_needed.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {task.tools_needed.map(tool => (
                    <span key={tool} className="flex items-center gap-1 text-xs bg-muted border border-border rounded-full px-2.5 py-1">
                      {tool}
                      <button className="text-muted-foreground hover:text-destructive" onClick={() => handleRemoveTool(tool)}>
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Drill, Wire stripper..."
                  value={toolInput}
                  onChange={(e) => setToolInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddTool(); }}
                  className="text-sm h-8"
                />
                <Button size="sm" onClick={handleAddTool} className="h-8 shrink-0" disabled={!toolInput.trim()}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Section>

          <Separator />

          {/* Materials needed */}
          <Section
            id="materials"
            label={`Materials to Buy${task.materials_needed.length > 0 ? ` (${task.materials_needed.length})` : ""}`}
            icon={<ShoppingCart className="h-4 w-4" />}
            active={activeSection === "materials"}
            onToggle={() => toggleSection("materials")}
          >
            <div className="space-y-2">
              {task.materials_needed.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {task.materials_needed.map(mat => (
                    <span key={mat} className="flex items-center gap-1 text-xs bg-muted border border-border rounded-full px-2.5 py-1">
                      {mat}
                      <button className="text-muted-foreground hover:text-destructive" onClick={() => handleRemoveMaterial(mat)}>
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. 6x recessed lights, 14/2 wire..."
                  value={materialInput}
                  onChange={(e) => setMaterialInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddMaterial(); }}
                  className="text-sm h-8"
                />
                <Button size="sm" onClick={handleAddMaterial} className="h-8 shrink-0" disabled={!materialInput.trim()}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Section>

          <Separator />

          {/* Photos */}
          <Section
            id="photos"
            label={`Photos${task.photos.length > 0 ? ` (${task.photos.length})` : ""}`}
            icon={<Camera className="h-4 w-4" />}
            active={activeSection === "photos"}
            onToggle={() => toggleSection("photos")}
          >
            <div className="space-y-3">
              {task.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {task.photos.map(photo => (
                    <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                      <img src={photo.url} alt={photo.caption || "photo"} className="w-full h-full object-cover" />
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                          {photo.caption}
                        </div>
                      )}
                      <span className="absolute top-1 left-1 text-xs bg-black/50 text-white px-1.5 py-0.5 rounded capitalize">{photo.type}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="bg-muted/40 rounded-lg p-3 space-y-2">
                <div className="flex gap-2">
                  <Select value={photoType} onValueChange={(v) => v && setPhotoType(v as Photo["type"])}>
                    <SelectTrigger className="h-8 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before">Before</SelectItem>
                      <SelectItem value="during">During</SelectItem>
                      <SelectItem value="after">After</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Caption (optional)"
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                    className="text-sm h-8 flex-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste image URL..."
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddPhotoUrl(); }}
                    className="text-sm h-8 flex-1"
                  />
                  <Button size="sm" onClick={handleAddPhotoUrl} className="h-8 shrink-0" disabled={!photoUrl.trim()}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => fileRef.current?.click()}>
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Upload file
                  </Button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  <span className="text-xs text-muted-foreground">or paste a URL above</span>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  id,
  label,
  icon,
  active,
  onToggle,
  badge,
  children,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onToggle: () => void;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-muted/50 transition-colors text-left"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2.5 text-sm font-medium text-foreground">
          <span className="text-primary">{icon}</span>
          {label}
          {badge && (
            <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-semibold">{badge}</span>
          )}
        </div>
        {active ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {active && <div className="px-6 pb-4">{children}</div>}
    </div>
  );
}
