"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProject, updateProject, getProjectStats } from "@/lib/store";
import { Project } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Home,
  DollarSign,
  CheckSquare,
  TrendingUp,
  MapPin,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";
import { format } from "date-fns";
import TasksTab from "@/components/TasksTab";
import MoodBoardTab from "@/components/MoodBoardTab";
import OverviewTab from "@/components/OverviewTab";
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

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);

  const refresh = useCallback(() => {
    const p = getProject(id);
    if (!p) router.push("/");
    else setProject(p);
  }, [id, router]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!project) return null;

  const stats = getProjectStats(project);

  function handleStatusChange(status: Project["status"] | null) {
    if (!project || !status) return;
    updateProject(project.id, { status });
    refresh();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" />
                  All Projects
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-5" />
              <div className="flex items-center gap-2">
              <div className="bg-primary rounded-lg p-1.5 shadow-sm">
                <Home className="h-4 w-4 text-primary-foreground" />
              </div>
                <span className="font-semibold text-foreground">
                <span className="text-primary font-bold">N</span>estly
              </span>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Project Hero */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">{project.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {project.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{project.location}</span>
                  </div>
                )}
                {project.start_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Started {format(new Date(project.start_date), "MMM d, yyyy")}</span>
                  </div>
                )}
                {project.target_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Target {format(new Date(project.target_date), "MMM d, yyyy")}</span>
                  </div>
                )}
              </div>
              {project.description && (
                <p className="text-muted-foreground mt-2">{project.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Select value={project.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-40">
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
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckSquare className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Tasks</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.doneTasks}<span className="text-sm font-normal text-muted-foreground">/{stats.totalTasks}</span></p>
              <p className="text-xs text-muted-foreground mt-0.5">{stats.inProgressTasks} in progress</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Progress</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.progress}%</p>
              <Progress value={stats.progress} className="h-1.5 mt-1.5" />
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Spent</span>
              </div>
              <p className="text-2xl font-bold text-foreground">${stats.totalSpent.toLocaleString()}</p>
              {project.budget > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">of ${project.budget.toLocaleString()} budget</p>
              )}
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Estimated</span>
              </div>
              <p className="text-2xl font-bold text-foreground">${stats.totalEstimated.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-0.5">across all tasks</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tasks">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">
              Tasks
              {stats.totalTasks > 0 && (
                <span className="ml-1.5 bg-primary/15 text-primary text-xs rounded-full px-1.5 py-0.5 font-medium">
                  {stats.totalTasks}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="moodboard">
              <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
              Mood Board
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab project={project} onRefresh={refresh} />
          </TabsContent>

          <TabsContent value="tasks">
            <TasksTab project={project} onRefresh={refresh} />
          </TabsContent>

          <TabsContent value="moodboard">
            <MoodBoardTab project={project} onRefresh={refresh} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
