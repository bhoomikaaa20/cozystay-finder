import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, Sparkles } from "lucide-react";

export function SiteHeader() {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-warm shadow-warm transition-smooth group-hover:scale-105">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">GuestHub</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">Stays</Link>
          </Button>
          {user && (
            <Button asChild variant="ghost" size="sm">
              <Link to="/bookings">My Bookings</Link>
            </Button>
          )}
          {isAdmin && (
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin">Admin</Link>
            </Button>
          )}
          {user ? (
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          ) : (
            <Button asChild size="sm" className="gap-2">
              <Link to="/auth">
                <UserIcon className="h-4 w-4" />
                Sign in
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
