"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calculator,
  Sparkles,
  Target,
  FolderOpen,
  FileText,
  GraduationCap,
  Settings,
  ChevronDown,
  Crown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/shared/Logo";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const calculatorSubItems = [
  { href: "/calculators", label: "All Calculators" },
  { href: "/calculators/two-sample-ttest", label: "Two-Sample T-Test" },
  { href: "/calculators/two-proportions", label: "Two Proportions" },
  { href: "/calculators/paired-ttest", label: "Paired T-Test" },
  { href: "/calculators/log-rank-test", label: "Log-Rank (Survival)" },
  { href: "/calculators/non-inferiority-means", label: "Non-Inferiority (Means)" },
  { href: "/calculators/cluster-rct", label: "Cluster RCT" },
];

const mainNavItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/design-advisor",
    label: "Design Advisor",
    icon: Sparkles,
    badge: "AI",
  },
  {
    href: "/endpoints",
    label: "Endpoints",
    icon: Target,
  },
  {
    href: "/projects",
    label: "Projects",
    icon: FolderOpen,
  },
  {
    href: "/reports",
    label: "Reports",
    icon: FileText,
  },
  {
    href: "/education",
    label: "Education",
    icon: GraduationCap,
    badge: "Soon",
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/dashboard">
          <Logo size="sm" />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Calculators with submenu */}
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={pathname.startsWith("/calculators")}>
                      <Calculator className="h-4 w-4" />
                      <span>Calculators</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {calculatorSubItems.map((item) => (
                        <SidebarMenuSubItem key={item.href}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === item.href}
                          >
                            <Link href={item.href}>{item.label}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Other nav items */}
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className={`ml-auto text-[10px] px-1.5 py-0 ${
                            item.badge === "AI"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/settings"}>
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="bg-gradient-to-r from-[#0D7377] to-[#0a5c5f] text-white hover:from-[#0a5c5f] hover:to-[#08504f] hover:text-white">
              <Crown className="h-4 w-4" />
              <span>Upgrade to Pro</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
