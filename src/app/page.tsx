"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProjects, createProject, deleteProject, getProjectStats } from "@/lib/store";
import { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Plus,
  MoreVertical,
  Trash2,
  Home as HomeIcon,
  DollarSign,
  CheckSquare,
  Calendar,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ThemeToggle } from "@/components/ThemeToggle";

const STATUS_LABELS: Record<string, string> = {
  planning: "Planning",
  in_progress: "In Progress",
  on_hold: "On Hold",
  complete: "Complete",
};

const STATUS_COLORS: Record<string, string> = {
  planning: "bg-blue-100 text-blue-700 border-blue-200",
  in_progress: "bg-amber-100 text-amber-700 border-amber-200",
  on_hold: "bg-gray-100 text-gray-600 border-gray-200",
  complete: "bg-green-100 text-green-700 border-green-200",
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    status: "planning" as Project["status"],
    budget: "",
    start_date: "",
    target_date: "",
  });

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  function handleCreate() {
    if (!form.name.trim()) return;
    const project = createProject({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      location: form.location.trim() || undefined,
      status: form.status,
      budget: parseFloat(form.budget) || 0,
      start_date: form.start_date || undefined,
      target_date: form.target_date || undefined,
      tags: [],
    });
    setProjects(getProjects());
    setOpen(false);
    setForm({ name: "", description: "", location: "", status: "planning", budget: "", start_date: "", target_date: "" });
    toast.success(`Project "${project.name}" created!`);
  }

  function handleDelete(id: string, name: string) {
    deleteProject(id);
    setProjects(getProjects());
    toast.success(`"${name}" deleted.`);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-xl p-2 shadow-sm">
              <HomeIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                <span className="text-primary">N</span>estly
              </h1>
              <p className="text-xs text-muted-foreground">Home renovation tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-150" />
              <div className="relative bg-card border border-border rounded-2xl p-6 shadow-xl">
                <HomeIcon className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">No projects yet</h2>
            <p className="text-muted-foreground mb-8 max-w-sm text-base">
              Start tracking your first home renovation — tasks, costs, photos, and inspiration all in one place.
            </p>
            <Button size="lg" onClick={() => setOpen(true)} className="shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" />
              Create your first project
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Your Projects</h2>
                <p className="text-muted-foreground text-sm mt-1">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const stats = getProjectStats(project);
                return (
                  <Card key={project.id} className="group hover:shadow-lg transition-all duration-200 overflow-hidden border-border bg-card hover:-translate-y-0.5 cursor-pointer" onClick={() => window.location.href = `/projects/${project.id}`}>
                    {/* Cover / color band */}
                    <div className="h-1.5 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-lg leading-tight truncate">
                            {project.name}
                          </h3>
                          {project.location && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{project.location}</span>
                            </div>
                          )}
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex items-center justify-center h-7 w-7 rounded-md opacity-0 group-hover:opacity-100 transition-opacity -mr-1 hover:bg-accent">
                              <MoreVertical className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDelete(project.id, project.name)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete project
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {project.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                      )}

                      <div className="flex items-center gap-2 mb-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${STATUS_COLORS[project.status]}`}>
                          {STATUS_LABELS[project.status]}
                        </span>
                      </div>

                      {/* Progress */}
                      {stats.totalTasks > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>{stats.doneTasks}/{stats.totalTasks} tasks done</span>
                            <span>{stats.progress}%</span>
                          </div>
                          <Progress value={stats.progress} className="h-1.5" />
                        </div>
                      )}

                      {/* Stats row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted rounded-lg p-2.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <CheckSquare className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Tasks</span>
                          </div>
                          <p className="font-semibold text-sm text-foreground">{stats.totalTasks}</p>
                        </div>
                        <div className="bg-muted rounded-lg p-2.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Spent</span>
                          </div>
                          <p className="font-semibold text-sm text-foreground">
                            ${stats.totalSpent.toLocaleString()}
                            {project.budget > 0 && (
                              <span className="text-xs font-normal text-muted-foreground"> / ${project.budget.toLocaleString()}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="px-5 py-3 bg-muted/50 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Created {format(new Date(project.created_at), "MMM d, yyyy")}</span>
                      </div>
                      <span className="text-xs font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                        Open <ArrowRight className="h-3 w-3" />
                      </span>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* New Project Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Renovation Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Project name *</Label>
              <Input
                id="name"
                placeholder="e.g. Kitchen Remodel 2026"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What are you renovating?"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location / Room</Label>
              <Input
                id="location"
                placeholder="e.g. Kitchen, Master Bath, Basement"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => v && setForm({ ...form, status: v as Project["status"] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="0"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="start_date">Start date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="target_date">Target date</Label>
                <Input
                  id="target_date"
                  type="date"
                  value={form.target_date}
                  onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.name.trim()}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
