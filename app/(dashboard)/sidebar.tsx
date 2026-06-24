import Link from "next/link";
import { BarChart3, FileQuestion, ListTodo } from "lucide-react";

const navItems = [
  { href: "/interviews", label: "Interviews", icon: ListTodo },
  { href: "/questions", label: "Questions", icon: FileQuestion },
  { href: "/settings", label: "Settings", icon: BarChart3 },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r bg-sidebar md:flex">
      <div className="flex h-14 items-center border-b px-6 font-semibold">
        <Link href="/interviews">Kaizen Interviews</Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
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
    </aside>
  );
}
