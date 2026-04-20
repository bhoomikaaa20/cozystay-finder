import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { format } from "date-fns";
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
    guesthouses: {
      id: string;
      name: string;
      location: string;
      cover_image: string | null;
    } | null;
  } | null;
};

const API = "http://localhost:5000";

function BookingsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", search: { redirect: "/bookings" } });
    }
  }, [user, loading]);

  const { data: bookings = [], isLoading } = useQuery({
    enabled: !!user,
    queryKey: ["my-bookings"],
    queryFn: async () => {
      const res = await fetch(`${API}/bookings`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch");

      return res.json();
    },
  });

  const today = new Date().toISOString().slice(0, 10);

  const upcoming = bookings.filter(
    (b: BookingRow) =>
      b.check_out >= today && b.status !== "cancelled"
  );

  const past = bookings.filter(
    (b: BookingRow) =>
      b.check_out < today || b.status === "cancelled"
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold">My Trips</h1>

      {isLoading ? (
        <p className="mt-6">Loading...</p>
      ) : bookings.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="p-10 text-center">
            <p>No bookings yet</p>
            <Button asChild className="mt-4">
              <Link to="/">Explore stays</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 space-y-8">
          <Section title="Upcoming" items={upcoming} />
          <Section title="Past & Cancelled" items={past} />
        </div>
      )}
    </div>
  );
}

function Section({ title, items }: { title: string; items: BookingRow[] }) {
  if (items.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">{title}</h2>

      <div className="space-y-3">
        {items.map((b) => {
          const gh = b.rooms?.guesthouses;

          return (
            <Card key={b.id}>
              <div className="grid sm:grid-cols-[180px_1fr]">
                <div className="bg-muted">
                  {gh?.cover_image && (
                    <img
                      src={gh.cover_image}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold">{gh?.name || "Stay"}</h3>

                      {gh?.location && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin size={12} /> {gh.location}
                        </div>
                      )}
                    </div>

                    <Badge>{b.status}</Badge>
                  </div>

                  <div className="mt-2 flex items-center text-sm">
                    <CalendarDays size={14} />
                    {format(new Date(b.check_in), "MMM d")} →{" "}
                    {format(new Date(b.check_out), "MMM d, yyyy")}
                  </div>

                  <div className="mt-2 text-sm">
                    Room: <b>{b.rooms?.name}</b> · $
                    {Number(b.total_price).toFixed(2)}
                  </div>

                  {gh && (
                    <Link
                      to="/guesthouse/$id"
                      params={{ id: gh.id }}
                      className="text-primary text-sm mt-2 block"
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
    </div>
  );
}