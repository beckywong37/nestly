"use client";

import { useState, useRef } from "react";
import { Project } from "@/lib/types";
import { addMoodBoardItem, removeMoodBoardItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, ExternalLink, Upload, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface Props {
  project: Project;
  onRefresh: () => void;
}

export default function MoodBoardTab({ project, onRefresh }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ url: "", caption: "", source_url: "" });
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleAddUrl() {
    if (!form.url.trim()) return;
    addMoodBoardItem(project.id, {
      url: form.url.trim(),
      caption: form.caption.trim() || undefined,
      source_url: form.source_url.trim() || undefined,
    });
    setForm({ url: "", caption: "", source_url: "" });
    setAddOpen(false);
    onRefresh();
    toast.success("Added to mood board!");
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      addMoodBoardItem(project.id, { url, caption: file.name });
      onRefresh();
      toast.success("Image added to mood board!");
    };
    reader.readAsDataURL(file);
  }

  function handleRemove(id: string) {
    removeMoodBoardItem(project.id, id);
    onRefresh();
    toast.success("Removed from mood board.");
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground">Mood Board</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Collect inspiration images, paint swatches, material samples, and ideas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1.5" />
            Upload
          </Button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <LinkIcon className="h-4 w-4 mr-1.5" />
            Add URL
          </Button>
        </div>
      </div>

      {project.mood_board.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-2xl">
          <ImageIcon className="h-14 w-14 text-muted-foreground mb-4 opacity-40" />
          <h4 className="text-lg font-semibold text-foreground mb-2">Your mood board is empty</h4>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Add inspiration images, paint colors, tile samples, furniture ideas — anything that helps you visualize the finished space.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload image
            </Button>
            <Button onClick={() => setAddOpen(true)}>
              <LinkIcon className="h-4 w-4 mr-2" />
              Add from URL
            </Button>
          </div>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {project.mood_board.map((item) => (
            <div
              key={item.id}
              className="break-inside-avoid group relative rounded-xl overflow-hidden border border-border bg-muted cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setActiveImage(item.url)}
            >
              <img
                src={item.url}
                alt={item.caption || "mood board image"}
                className="w-full object-cover"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                <div className="p-2 w-full opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between">
                  {item.caption && (
                    <span className="text-xs text-white font-medium truncate max-w-[70%] drop-shadow">
                      {item.caption}
                    </span>
                  )}
                  <div className="flex gap-1 ml-auto" onClick={(e) => e.stopPropagation()}>
                    {item.source_url && (
                      <a href={item.source_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="secondary" size="icon" className="h-6 w-6">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemove(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add URL Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Mood Board</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="mb-url">Image URL *</Label>
              <Input
                id="mb-url"
                placeholder="https://example.com/image.jpg"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mb-caption">Caption</Label>
              <Input
                id="mb-caption"
                placeholder="e.g. Marble subway tile, warm white"
                value={form.caption}
                onChange={(e) => setForm({ ...form, caption: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mb-source">Source URL (optional)</Label>
              <Input
                id="mb-source"
                placeholder="Link to where you found this image"
                value={form.source_url}
                onChange={(e) => setForm({ ...form, source_url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddUrl} disabled={!form.url.trim()}>Add to Board</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setActiveImage(null)}
        >
          <img
            src={activeImage}
            alt="Preview"
            className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
}
