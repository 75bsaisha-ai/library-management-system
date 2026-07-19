import { Link, useLocation } from "wouter";
import { BookOpen, Users, ArrowRightLeft, LayoutDashboard, Library, Sun, Moon, User, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Books Catalog", href: "/books", icon: BookOpen },
  { name: "Members", href: "/members", icon: Users },
  { name: "Borrowings", href: "/borrowings", icon: ArrowRightLeft },
];

export function Sidebar() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const isDark = theme === "dark";

  return (
    <div className="flex h-full w-72 flex-col bg-sidebar border-r border-sidebar-border relative z-20 shadow-2xl">
      <div className="flex h-24 items-center px-8 border-b border-sidebar-border/50">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Library className="h-5 w-5" />
          </div>
          <span className="text-3xl font-serif tracking-widest text-sidebar-foreground uppercase">Folio</span>
        </div>
      </div>

      <div className="px-8 pt-8 pb-4">
        <p className="text-[10px] font-sans font-bold tracking-[0.2em] text-muted-foreground uppercase mb-4">Command Center</p>
      </div>

      <nav className="flex-1 space-y-2 px-4">
        {navigation.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-4 py-3 text-sm rounded-sm transition-all duration-300 ease-out relative overflow-hidden",
                isActive
                  ? "text-primary font-medium"
                  : "text-sidebar-foreground hover:text-primary font-normal"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r-full" />
              )}
              {isActive && (
                <div className="absolute inset-0 bg-primary/5 translate-x-0" />
              )}
              <item.icon
                className={cn(
                  "flex-shrink-0 mr-4 h-4 w-4 transition-transform duration-300",
                  isActive ? "text-primary scale-110" : "text-muted-foreground group-hover:text-primary group-hover:scale-110"
                )}
                strokeWidth={isActive ? 2.5 : 2}
                aria-hidden="true"
              />
              <span className="tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto space-y-3">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm transition-all duration-300",
            "border border-sidebar-border text-muted-foreground",
            "hover:border-primary/40 hover:text-primary group"
          )}
          aria-label="Toggle theme"
        >
          <div className="relative w-4 h-4">
            <Sun
              className={cn(
                "absolute inset-0 h-4 w-4 transition-all duration-300",
                isDark ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 rotate-90"
              )}
            />
            <Moon
              className={cn(
                "absolute inset-0 h-4 w-4 transition-all duration-300",
                isDark ? "opacity-0 scale-50 -rotate-90" : "opacity-100 scale-100 rotate-0"
              )}
            />
          </div>
          <span className="tracking-wide text-xs uppercase font-medium">
            {isDark ? "Light Mode" : "Dark Mode"}
          </span>
        </button>

        {/* Profile & Logout Actions */}
        {user && (
          <>
            <Link href="/profile">
              <Button
                variant="outline"
                className="w-full gap-3 rounded-sm font-sans tracking-widest uppercase text-xs font-bold border-border/50 bg-background/50 hover:bg-primary hover:text-primary-foreground justify-start"
              >
                <User className="h-4 w-4" />
                Profile
              </Button>
            </Link>
            <Button
              onClick={logout}
              variant="outline"
              className="w-full gap-3 rounded-sm font-sans tracking-widest uppercase text-xs font-bold text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30 justify-start"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </>
        )}

        {/* User card */}
        {user && (
          <div className="glass-panel p-4 flex items-center gap-4 rounded-md mt-4">
            <div className="h-10 w-10 rounded-full border border-primary/20 bg-primary/10 flex items-center justify-center text-primary font-serif font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-serif text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground font-sans tracking-wide uppercase mt-0.5">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
