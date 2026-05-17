import { Link, useLocation } from "wouter";
import { Plane, BarChart2, User, BookOpen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: BarChart2 },
    { href: "/flights", label: "Logbook", icon: BookOpen },
    { href: "/stats", label: "Statistics", icon: Plane },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border md:min-h-screen flex flex-col px-4 py-6 shrink-0">
        <div className="flex items-center gap-2 px-2 mb-8">
          <Plane className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg tracking-tight">SkyLog</span>
        </div>
        
        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer group",
                  location === item.href || (item.href !== "/" && location.startsWith(item.href))
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
