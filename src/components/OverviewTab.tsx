"use client";

import { Project } from "@/lib/types";
import { getProjectStats } from "@/lib/store";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle2, Clock, Circle } from "lucide-react";

interface Props {
  project: Project;
  onRefresh: () => void;
}

export default function OverviewTab({ project }: Props) {
  const stats = getProjectStats(project);
  const overBudget = project.budget > 0 && stats.totalSpent > project.budget;
  const budgetPercent = project.budget > 0 ? Math.min((stats.totalSpent / project.budget) * 100, 100) : 0;

  const tasksByStatus = {
    todo: project.tasks.filter((t) => t.status === "todo"),
    in_progress: project.tasks.filter((t) => t.status === "in_progress"),
    done: project.tasks.filter((t) => t.status === "done"),
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Budget breakdown */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          Budget Overview
        </h3>

        {project.budget > 0 ? (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  ${stats.totalSpent.toLocaleString()} spent
                </span>
                <span className={overBudget ? "text-destructive font-medium" : "text-muted-foreground"}>
                  of ${project.budget.toLocaleString()}
                </span>
              </div>
              <Progress
                value={budgetPercent}
                className={`h-3 ${overBudget ? "[&>div]:bg-destructive" : ""}`}
              />
              {overBudget && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Over budget by ${(stats.totalSpent - project.budget).toLocaleString()}
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total budget</span>
                <span className="font-medium">${project.budget.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total estimated</span>
                <span className="font-medium">${stats.totalEstimated.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total spent</span>
                <span className="font-medium">${stats.totalSpent.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Remaining budget</span>
                <span className={`font-semibold ${overBudget ? "text-destructive" : "text-green-600"}`}>
                  ${Math.max(project.budget - stats.totalSpent, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No budget set for this project.</p>
          </div>
        )}
      </div>

      {/* Task summary */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Task Progress
        </h3>

        {project.tasks.length > 0 ? (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">{stats.doneTasks} of {stats.totalTasks} complete</span>
                <span className="font-semibold text-foreground">{stats.progress}%</span>
              </div>
              <Progress value={stats.progress} className="h-3" />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">To Do</span>
                </div>
                <span className="text-sm font-medium">{tasksByStatus.todo.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-muted-foreground">In Progress</span>
                </div>
                <span className="text-sm font-medium">{tasksByStatus.in_progress.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-muted-foreground">Done</span>
                </div>
                <span className="text-sm font-medium">{tasksByStatus.done.length}</span>
              </div>
            </div>

            {/* Cost per task summary */}
            {project.tasks.some(t => t.expenses.length > 0) && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Cost by task</p>
                  <div className="space-y-2">
                    {project.tasks
                      .filter(t => t.expenses.length > 0 || t.estimated_cost > 0)
                      .map(task => {
                        const spent = task.expenses.reduce((s, e) => s + e.amount, 0);
                        return (
                          <div key={task.id} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground truncate max-w-[60%]">{task.title}</span>
                            <span className="font-medium">${spent.toLocaleString()}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No tasks yet. Add tasks to track progress.</p>
          </div>
        )}
      </div>
    </div>
  );
}
