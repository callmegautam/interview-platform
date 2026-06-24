"use client";

import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { BarChart3, FileQuestion, ListTodo } from "lucide-react";

const navItems = [
  { href: "/interviews", label: "Interviews", icon: ListTodo },
  { href: "/questions", label: "Questions", icon: FileQuestion },
  { href: "/settings", label: "Settings", icon: BarChart3 },
];

export function DashboardHeader({ companyName }: { companyName: string }) {
  return (
    <header className="flex h-14 items-center gap-4 border-b px-6">
      <Sheet>
        <SheetTrigger className="md:hidden inline-flex shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground size-9" data-slot="sheet-trigger">
          <Menu className="size-4" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <div className="flex h-14 items-center border-b px-6 font-semibold">
            Kaizen Interviews
          </div>
          <nav className="space-y-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted"
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <span className="text-sm text-muted-foreground">{companyName}</span>
      <div className="flex-1" />
      <form action={logout}>
        <Button variant="ghost" size="sm">
          <LogOut className="mr-2 size-4" />
          Logout
        </Button>
      </form>
    </header>
  );
}
