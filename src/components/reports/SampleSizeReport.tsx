"use client";

// ---------------------------------------------------------------------------
// SampleSizeReport — client component that renders a "Download PDF Report"
// button. Uses @react-pdf/renderer's BlobProvider to generate a PDF blob
// on-demand and triggers a browser download.
// ---------------------------------------------------------------------------

import { useState, useCallback } from "react";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReportData } from "./ReportTemplate";

export type { ReportData } from "./ReportTemplate";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SampleSizeReport({ data }: { data: ReportData }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = useCallback(async () => {
    setIsGenerating(true);

    try {
      // Dynamic import so @react-pdf/renderer is only loaded client-side
      // and only when the user actually requests a PDF.
      const [{ pdf }, { ReportTemplate }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./ReportTemplate"),
      ]);

      const blob = await pdf(<ReportTemplate data={data} />).toBlob();

      // Build a sanitised filename from the study title
      const safeName = data.studyTitle
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 60)
        .toLowerCase();

      const filename = `${safeName}-sample-size-report.pdf`;

      // Trigger download via a temporary anchor element
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate PDF report:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [data]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <FileText className="size-4" />
      )}
      {isGenerating ? "Generating..." : "Download PDF Report"}
    </Button>
  );
}
