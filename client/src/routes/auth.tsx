import { createFileRoute, useNavigate, Link, useSearch } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/",
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const search = useSearch({ from: "/auth" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: search.redirect, replace: true });
    }
  }, [user, loading, navigate, search.redirect]);

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);

    const res = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: data.get("email"),
        password: data.get("password"),
      }),
    });

    setBusy(false);

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.message);
      return;
    }

    toast.success("Welcome back");
  };
  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);

    const res = await fetch("http://localhost:5000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: data.get("full_name"),
        email: data.get("email"),
        password: data.get("password"),
      }),
    });

    setBusy(false);

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.message);
      return;
    }

    toast.success("Account created — you're in!");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-semibold">Welcome to Casalume</h1>
        <p className="text-muted-foreground mt-1">Sign in to book your next stay</p>
      </div>
      <Card className="shadow-card">
        <Tabs defaultValue="signin">
          <CardHeader>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="signin" className="mt-0">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input id="signin-email" name="email" type="email" required autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input id="signin-password" name="password" type="password" required autoComplete="current-password" minLength={6} />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="mt-0">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full name</Label>
                  <Input id="signup-name" name="full_name" type="text" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" name="email" type="email" required autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" name="password" type="password" required autoComplete="new-password" minLength={6} />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Creating…" : "Create account"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  The first account becomes the admin automatically.
                </p>
              </form>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
      <p className="text-center text-sm text-muted-foreground mt-6">
        <Link to="/" className="hover:text-foreground">← Back to stays</Link>
      </p>
    </div>
  );
}
