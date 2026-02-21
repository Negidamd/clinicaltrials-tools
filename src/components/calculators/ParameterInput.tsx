"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface ParameterInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  tooltip?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
}

export function ParameterInput({
  label,
  value,
  onChange,
  tooltip,
  min,
  max,
  step = 0.01,
  unit,
  disabled = false,
}: ParameterInputProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label className="text-sm font-medium">{label}</Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="text-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {unit && (
          <span className="text-xs text-muted-foreground ml-auto">{unit}</span>
        )}
      </div>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="font-mono"
        style={{ fontFamily: "var(--font-mono-custom)" }}
      />
    </div>
  );
}
