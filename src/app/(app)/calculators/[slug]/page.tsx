"use client";

import { use } from "react";
import { TwoSampleTTest } from "@/components/calculators/calculators/TwoSampleTTest";
import { TwoProportions } from "@/components/calculators/calculators/TwoProportions";
import { PairedTTest } from "@/components/calculators/calculators/PairedTTest";
import { OneProportion } from "@/components/calculators/calculators/OneProportion";
import { LogRankTest } from "@/components/calculators/calculators/LogRankTest";
import { NonInferiorityMeans } from "@/components/calculators/calculators/NonInferiorityMeans";
import { NonInferiorityProportions } from "@/components/calculators/calculators/NonInferiorityProportions";
import { OneWayAnova } from "@/components/calculators/calculators/OneWayAnova";
import { Correlation } from "@/components/calculators/calculators/Correlation";
import { ClusterRCT } from "@/components/calculators/calculators/ClusterRCT";
import { Crossover2x2 } from "@/components/calculators/calculators/Crossover2x2";
import { McNemarTest } from "@/components/calculators/calculators/McNemarTest";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const calculatorMap: Record<string, React.ComponentType> = {
  "two-sample-ttest": TwoSampleTTest,
  "two-proportions": TwoProportions,
  "paired-ttest": PairedTTest,
  "one-proportion": OneProportion,
  "log-rank-test": LogRankTest,
  "non-inferiority-means": NonInferiorityMeans,
  "non-inferiority-proportions": NonInferiorityProportions,
  "one-way-anova": OneWayAnova,
  "correlation": Correlation,
  "cluster-rct": ClusterRCT,
  "crossover-2x2": Crossover2x2,
  "mcnemar-test": McNemarTest,
};

export default function CalculatorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const CalculatorComponent = calculatorMap[slug];

  if (!CalculatorComponent) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h1
          className="text-2xl font-bold text-[#1B2A4A] mb-2"
          style={{ fontFamily: "var(--font-heading-custom)" }}
        >
          Calculator Not Found
        </h1>
        <p className="text-muted-foreground mb-6">
          The calculator &ldquo;{slug}&rdquo; does not exist. Please check the URL or browse available calculators.
        </p>
        <Link href="/calculators">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Calculators
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Link href="/calculators" className="inline-flex items-center text-sm text-muted-foreground hover:text-[#0D7377] transition-colors">
          <ArrowLeft className="mr-1 h-4 w-4" />
          All Calculators
        </Link>
      </div>
      <CalculatorComponent />
    </div>
  );
}
