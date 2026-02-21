"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import Link from "next/link";

interface FeatureGateProps {
  children: ReactNode;
  feature: string;
  requiredTier?: "pro" | "team" | "enterprise";
  hasAccess?: boolean;
}

export function FeatureGate({
  children,
  feature,
  requiredTier = "pro",
  hasAccess = true, // Default to true for development
}: FeatureGateProps) {
  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
        <div className="text-center max-w-sm px-4">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Crown className="h-6 w-6 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-[#1B2A4A]">
            Upgrade to {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Unlock {feature} and other advanced features.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Button className="bg-[#0D7377] hover:bg-[#0a5c5f]" asChild>
              <Link href="/pricing">Upgrade Now</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/pricing">See what you get</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
