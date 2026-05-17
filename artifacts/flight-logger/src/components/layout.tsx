import { Link, useLocation } from "wouter";
import { Plane, BarChart2, User, BookOpen, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClerk, useUser } from "@clerk/react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart2 },
    { href: "/flights", label: "Logbook", icon: BookOpen },
    { href: "/stats", label: "Statistics", icon: Plane },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.firstName
    ? user.firstName.slice(0, 2)
    : user?.emailAddresses?.[0]?.emailAddress?.slice(0, 2).toUpperCase()
    ?? "AV";

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
                data-testid={`nav-${item.label.toLowerCase()}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                  location === item.href ||
                  (item.href !== "/dashboard" && location.startsWith(item.href))
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

        {/* User section */}
        <div className="mt-auto pt-4 border-t border-border">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div
              data-testid="avatar-user"
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs"
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p data-testid="text-username" className="text-sm font-medium truncate">
                {user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress ?? "Pilot"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.emailAddresses?.[0]?.emailAddress}
              </p>
            </div>
          </div>
          <button
            data-testid="button-signout"
            onClick={() => signOut({ redirectUrl: basePath || "/" })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
