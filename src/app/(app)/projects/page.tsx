"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FolderOpen, Search, MoreVertical } from "lucide-react";

export default function ProjectsPage() {
  const [projects] = useState<Array<{
    id: string;
    name: string;
    indication: string;
    phase: string;
    status: string;
    calculations: number;
    updatedAt: string;
  }>>([]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[#1B2A4A]"
            style={{ fontFamily: "var(--font-heading-custom)" }}
          >
            Projects
          </h1>
          <p className="text-muted-foreground mt-1">
            Organize your calculations and designs into projects.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#0D7377] hover:bg-[#0a5c5f]">
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Organize related calculations under a single project.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input placeholder="e.g., KEYNOTE-001 Sample Size" />
              </div>
              <div className="space-y-2">
                <Label>Therapeutic Area</Label>
                <Input placeholder="e.g., Oncology, Cardiology" />
              </div>
              <div className="space-y-2">
                <Label>Phase</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="I">Phase I</SelectItem>
                    <SelectItem value="II">Phase II</SelectItem>
                    <SelectItem value="III">Phase III</SelectItem>
                    <SelectItem value="IV">Phase IV</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input placeholder="Brief description of the study" />
              </div>
            </div>
            <DialogFooter>
              <Button className="bg-[#0D7377] hover:bg-[#0a5c5f]">Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-semibold text-[#1B2A4A]">No projects yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Create a project to organize your sample size calculations, design decisions, and reports.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-4 bg-[#0D7377] hover:bg-[#0a5c5f]">
                  <Plus className="mr-2 h-4 w-4" /> Create First Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Project Name</Label>
                    <Input placeholder="e.g., KEYNOTE-001 Sample Size" />
                  </div>
                </div>
                <DialogFooter>
                  <Button className="bg-[#0D7377] hover:bg-[#0a5c5f]">Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <Badge variant="outline">{project.phase}</Badge>
                </div>
                <CardDescription>{project.indication}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{project.calculations} calculations</span>
                  <span>Updated {project.updatedAt}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
