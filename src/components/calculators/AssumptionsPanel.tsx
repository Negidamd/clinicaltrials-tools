"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Info } from "lucide-react";

interface AssumptionsPanelProps {
  assumptions: string[];
  defaultOpen?: boolean;
}

export function AssumptionsPanel({
  assumptions,
  defaultOpen = true,
}: AssumptionsPanelProps) {
  if (assumptions.length === 0) return null;

  return (
    <Collapsible defaultOpen={defaultOpen}>
      <Card>
        <CardHeader className="pb-3">
          <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Assumptions</CardTitle>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {assumptions.map((assumption, i) => (
                <li
                  key={i}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-[#0D7377] mt-0.5 flex-shrink-0">&#8226;</span>
                  <span>{assumption}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
