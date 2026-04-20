import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { format, differenceInCalendarDays } from "date-fns";
import { CalendarIcon, MapPin, Users, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/guesthouse/$id")({
  component: GuesthouseDetail,
});

type Room = {
  id: string;
  name: string;
  room_type: string;
  description: string | null;
  price_per_night: number;
  capacity: number;
  is_available: boolean;
};
type Guesthouse = {
  id: string;
  name: string;
  location: string;
  description: string | null;
  cover_image: string | null;
  price_from: number;
};

function GuesthouseDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [booking, setBooking] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["guesthouse", id],
    queryFn: async () => {
      const [{ data: gh, error: e1 }, { data: rooms, error: e2 }] = await Promise.all([
        supabase.from("guesthouses").select("*").eq("id", id).maybeSingle(),
        supabase.from("rooms").select("*").eq("guesthouse_id", id).order("price_per_night"),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      return { guesthouse: gh as Guesthouse | null, rooms: (rooms || []) as Room[] };
    },
  });

  const selectedRoom = useMemo(
    () => data?.rooms.find((r) => r.id === selectedRoomId) || null,
    [data, selectedRoomId]
  );
  const nights =
    checkIn && checkOut ? Math.max(0, differenceInCalendarDays(checkOut, checkIn)) : 0;
  const totalPrice = selectedRoom ? nights * Number(selectedRoom.price_per_night) : 0;

  const handleBook = async () => {
    if (!user) {
      navigate({ to: "/auth", search: { redirect: `/guesthouse/${id}` } });
      return;
    }
    if (!selectedRoom || !checkIn || !checkOut || nights <= 0) {
      toast.error("Pick a room and valid dates");
      return;
    }
    setBooking(true);

    // Conflict check
    const { data: conflicts, error: cErr } = await supabase
      .from("bookings")
      .select("id")
      .eq("room_id", selectedRoom.id)
      .neq("status", "cancelled")
      .lt("check_in", format(checkOut, "yyyy-MM-dd"))
      .gt("check_out", format(checkIn, "yyyy-MM-dd"));

    if (cErr) {
      setBooking(false);
      toast.error(cErr.message);
      return;
    }
    if (conflicts && conflicts.length > 0) {
      setBooking(false);
      toast.error("This room is already booked for those dates");
      return;
    }

    const { error } = await supabase.from("bookings").insert({
      room_id: selectedRoom.id,
      user_id: user.id,
      check_in: format(checkIn, "yyyy-MM-dd"),
      check_out: format(checkOut, "yyyy-MM-dd"),
      total_price: totalPrice,
      guests: 1,
      status: "confirmed",
    });
    setBooking(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Booked! See you soon.");
    qc.invalidateQueries({ queryKey: ["my-bookings"] });
    navigate({ to: "/bookings" });
  };

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-12 text-muted-foreground">Loading…</div>;
  }
  if (!data?.guesthouse) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h2 className="font-display text-2xl">Stay not found</h2>
        <Button asChild className="mt-4"><Link to="/">Back to stays</Link></Button>
      </div>
    );
  }
  const gh = data.guesthouse;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8">
        <div>
          <div className="aspect-[16/10] overflow-hidden rounded-3xl bg-muted shadow-card">
            <img
              src={gh.cover_image || "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&q=80"}
              alt={gh.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="mt-6">
            <h1 className="font-display text-4xl font-semibold">{gh.name}</h1>
            <div className="flex items-center gap-1 text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              <span>{gh.location}</span>
            </div>
            {gh.description && (
              <p className="mt-4 text-foreground/80 leading-relaxed">{gh.description}</p>
            )}
          </div>

          <div className="mt-10">
            <h2 className="font-display text-2xl font-semibold mb-4">Choose a room</h2>
            {data.rooms.length === 0 ? (
              <p className="text-muted-foreground">No rooms listed yet.</p>
            ) : (
              <div className="space-y-3">
                {data.rooms.map((room) => {
                  const isSelected = room.id === selectedRoomId;
                  return (
                    <button
                      key={room.id}
                      onClick={() => room.is_available && setSelectedRoomId(room.id)}
                      disabled={!room.is_available}
                      className={cn(
                        "w-full text-left rounded-2xl border-2 p-5 transition-smooth",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-warm"
                          : "border-border hover:border-primary/40 bg-card",
                        !room.is_available && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-display text-lg font-semibold">{room.name}</h3>
                            <Badge variant="secondary">{room.room_type}</Badge>
                            {!room.is_available && <Badge variant="destructive">Unavailable</Badge>}
                          </div>
                          {room.description && (
                            <p className="text-sm text-muted-foreground mt-1">{room.description}</p>
                          )}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                            <Users className="h-3 w-3" /> Sleeps {room.capacity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-xl font-semibold text-primary">
                            ${Number(room.price_per_night).toFixed(0)}
                          </div>
                          <div className="text-xs text-muted-foreground">per night</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Booking sidebar */}
        <div>
          <Card className="sticky top-20 shadow-card border-border/60">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-display text-xl font-semibold">Book your stay</h3>

              <div className="grid grid-cols-2 gap-2">
                <DateField label="Check-in" date={checkIn} onChange={setCheckIn} minDate={new Date()} />
                <DateField label="Check-out" date={checkOut} onChange={setCheckOut} minDate={checkIn || new Date()} />
              </div>

              {selectedRoom ? (
                <div className="rounded-xl bg-secondary p-3 text-sm">
                  <div className="font-medium">{selectedRoom.name}</div>
                  <div className="text-muted-foreground">${Number(selectedRoom.price_per_night).toFixed(0)} / night</div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Select a room above to continue.</p>
              )}

              {nights > 0 && selectedRoom && (
                <div className="border-t pt-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      ${Number(selectedRoom.price_per_night).toFixed(0)} × {nights} {nights === 1 ? "night" : "nights"}
                    </span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-display text-lg font-semibold pt-2">
                    <span>Total</span>
                    <span className="text-primary">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <Button
                size="lg"
                className="w-full"
                disabled={!selectedRoom || nights <= 0 || booking}
                onClick={handleBook}
              >
                {booking ? "Booking…" : user ? "Confirm booking" : "Sign in to book"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DateField({
  label, date, onChange, minDate,
}: { label: string; date?: Date; onChange: (d?: Date) => void; minDate?: Date }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "MMM d") : "Pick"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onChange}
            disabled={(d) => (minDate ? d < new Date(minDate.toDateString()) : false)}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
