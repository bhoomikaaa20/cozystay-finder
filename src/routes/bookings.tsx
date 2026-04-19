import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin } from "lucide-react";

export const Route = createFileRoute("/bookings")({
  component: BookingsPage,
});

type BookingRow = {
  id: string;
  check_in: string;
  check_out: string;
  total_price: number;
  status: string;
  created_at: string;
  rooms: {
    name: string;
    room_type: string;
    guesthouses: { id: string; name: string; location: string; cover_image: string | null } | null;
  } | null;
};

function BookingsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/bookings" } });
  }, [user, loading, navigate]);

  const { data: bookings = [], isLoading } = useQuery({
    enabled: !!user,
    queryKey: ["my-bookings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id,check_in,check_out,total_price,status,created_at,rooms(name,room_type,guesthouses(id,name,location,cover_image))")
        .order("check_in", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as BookingRow[];
    },
  });

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter((b) => b.check_out >= today && b.status !== "cancelled");
  const past = bookings.filter((b) => b.check_out < today || b.status === "cancelled");

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl font-semibold">My trips</h1>
      <p className="text-muted-foreground mt-1">All your bookings in one place.</p>

      {isLoading ? (
        <p className="mt-8 text-muted-foreground">Loading…</p>
      ) : bookings.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No bookings yet.</p>
            <Button asChild className="mt-4"><Link to="/">Find a stay</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 space-y-10">
          <Section title="Upcoming" items={upcoming} empty="No upcoming trips." />
          <Section title="Past & cancelled" items={past} empty="Nothing here yet." />
        </div>
      )}
    </div>
  );
}

function Section({ title, items, empty }: { title: string; items: BookingRow[]; empty: string }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-4">{title}</h2>
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">{empty}</p>
      ) : (
        <div className="space-y-3">
          {items.map((b) => {
            const gh = b.rooms?.guesthouses;
            return (
              <Card key={b.id} className="overflow-hidden shadow-soft">
                <div className="grid sm:grid-cols-[180px_1fr] gap-0">
                  <div className="aspect-video sm:aspect-auto bg-muted">
                    {gh?.cover_image && (
                      <img src={gh.cover_image} alt={gh.name} className="h-full w-full object-cover" loading="lazy" />
                    )}
                  </div>
                  <CardContent className="p-5 flex flex-col justify-center">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="font-display text-lg font-semibold">{gh?.name || "Stay"}</h3>
                        {gh?.location && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" /> {gh.location}
                          </div>
                        )}
                      </div>
                      <Badge variant={b.status === "cancelled" ? "destructive" : "secondary"}>{b.status}</Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-sm">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      {format(new Date(b.check_in), "MMM d")} → {format(new Date(b.check_out), "MMM d, yyyy")}
                    </div>
                    <div className="mt-2 text-sm">
                      Room: <span className="font-medium">{b.rooms?.name}</span> · Total{" "}
                      <span className="font-display font-semibold text-primary">${Number(b.total_price).toFixed(2)}</span>
                    </div>
                    {gh && (
                      <Link
                        to="/guesthouse/$id"
                        params={{ id: gh.id }}
                        className="text-sm text-primary hover:underline mt-2"
                      >
                        View stay →
                      </Link>
                    )}
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
