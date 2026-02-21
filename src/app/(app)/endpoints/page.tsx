"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Target, ExternalLink } from "lucide-react";

const endpointData = [
  {
    name: "Overall Survival (OS)",
    area: "Oncology",
    type: "Primary",
    description: "Time from randomization to death from any cause.",
    typicalEffect: "HR 0.70–0.85",
    typicalEndpoint: "Median OS improvement of 2–6 months",
    references: "ICH E9(R1), FDA Oncology Guidance",
  },
  {
    name: "Progression-Free Survival (PFS)",
    area: "Oncology",
    type: "Primary",
    description: "Time from randomization to disease progression or death.",
    typicalEffect: "HR 0.50–0.75",
    typicalEndpoint: "Median PFS improvement of 3–8 months",
    references: "EMA Anticancer Guideline",
  },
  {
    name: "HbA1c Change from Baseline",
    area: "Diabetes",
    type: "Primary",
    description: "Mean change in glycated hemoglobin from baseline to 24-26 weeks.",
    typicalEffect: "Difference: -0.3% to -0.7%",
    typicalEndpoint: "SD typically 0.8–1.2%",
    references: "FDA Guidance for Diabetes",
  },
  {
    name: "ACR20/50/70 Response",
    area: "Rheumatology",
    type: "Primary",
    description: "Proportion achieving 20/50/70% improvement in ACR criteria.",
    typicalEffect: "Difference: 15–25% (ACR20)",
    typicalEndpoint: "Control rate: 25–40%",
    references: "ACR Guidelines",
  },
  {
    name: "MACE (Major Adverse Cardiovascular Events)",
    area: "Cardiology",
    type: "Primary",
    description: "Composite of CV death, MI, and stroke.",
    typicalEffect: "HR 0.80–0.90 (NI margin: 1.30)",
    typicalEndpoint: "Event rate: 3–5%/year",
    references: "FDA CV Safety Guidance",
  },
  {
    name: "Objective Response Rate (ORR)",
    area: "Oncology",
    type: "Secondary",
    description: "Proportion with complete or partial tumor response per RECIST.",
    typicalEffect: "Difference: 10–30%",
    typicalEndpoint: "Control rate varies widely",
    references: "RECIST 1.1 Guidelines",
  },
  {
    name: "FEV1 Change from Baseline",
    area: "Respiratory",
    type: "Primary",
    description: "Change in forced expiratory volume in 1 second.",
    typicalEffect: "Difference: 100–200 mL",
    typicalEndpoint: "SD: 200–300 mL",
    references: "ATS/ERS Standards",
  },
  {
    name: "PANSS Total Score Change",
    area: "Psychiatry",
    type: "Primary",
    description: "Change in Positive and Negative Syndrome Scale total score.",
    typicalEffect: "Difference: 5–10 points",
    typicalEndpoint: "SD: 15–20 points",
    references: "FDA Psychiatry Guidance",
  },
];

const areas = ["All", "Oncology", "Diabetes", "Cardiology", "Rheumatology", "Respiratory", "Psychiatry"];

export default function EndpointsPage() {
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("All");

  const filtered = endpointData.filter((ep) => {
    const matchesSearch =
      ep.name.toLowerCase().includes(search.toLowerCase()) ||
      ep.description.toLowerCase().includes(search.toLowerCase());
    const matchesArea = area === "All" || ep.area === area;
    return matchesSearch && matchesArea;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-[#1B2A4A]"
          style={{ fontFamily: "var(--font-heading-custom)" }}
        >
          Endpoint Library
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse common clinical trial endpoints with typical effect sizes and references.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search endpoints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={area} onValueChange={setArea}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {areas.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((ep) => (
          <Card key={ep.name} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-[#0D7377]" />
                  <h3 className="font-semibold text-[#1B2A4A]">{ep.name}</h3>
                </div>
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-[10px]">{ep.area}</Badge>
                  <Badge variant="secondary" className="text-[10px]">{ep.type}</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{ep.description}</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Typical Effect:</span>
                  <span className="font-mono font-medium">{ep.typicalEffect}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Typical Parameters:</span>
                  <span className="font-mono font-medium">{ep.typicalEndpoint}</span>
                </div>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">{ep.references}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
