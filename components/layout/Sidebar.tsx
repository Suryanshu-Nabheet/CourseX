"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  Download,
  DollarSign,
  ShoppingBag,
  Plus,
} from "lucide-react";

interface SidebarProps {
  role: "STUDENT" | "INSTRUCTOR";
  isAdmin?: boolean;
}

export function Sidebar({ role, isAdmin }: SidebarProps) {
  const pathname = usePathname();

  const studentLinks = [
    {
      name: "My Courses",
      href: "/dashboard/student",
      icon: BookOpen,
    },
    {
      name: "My Purchases",
      href: "/dashboard/student/purchases",
      icon: ShoppingBag,
    },
  ];

  const instructorLinks = [
    {
      name: "Dashboard",
      href: "/dashboard/instructor",
      icon: LayoutDashboard,
    },
    {
      name: "My Courses",
      href: "/dashboard/instructor/courses",
      icon: BookOpen,
    },
    {
      name: "Create Course",
      href: "/dashboard/instructor/create",
      icon: BookOpen,
    },
    {
      name: "Analytics",
      href: "/dashboard/instructor/analytics",
      icon: BarChart3,
    },
    {
      name: "Revenue",
      href: "/dashboard/instructor/revenue",
      icon: DollarSign,
    },
    {
      name: "Export Data",
      href: "/dashboard/instructor/export",
      icon: Download,
    },
  ];

  const adminLinks = [
    {
      name: "Admin Panel",
      href: "/admin",
      icon: Settings,
    },
  ];

  let links = role === "STUDENT" ? studentLinks : instructorLinks;

  // If Admin, show unified navigation
  if (isAdmin) {
    links = [
      {
        name: "Overview",
        href: "/admin",
        icon: LayoutDashboard,
      },
      {
        name: "My Teaching",
        href: "/dashboard/instructor",
        icon: Users,
      },
      {
        name: "Create Course",
        href: "/dashboard/instructor/create",
        icon: Plus,
      },
      {
        name: "My Learning",
        href: "/courses",
        icon: BookOpen,
      },
    ];
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 sm:p-6 shadow-sm">
      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href || pathname?.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
