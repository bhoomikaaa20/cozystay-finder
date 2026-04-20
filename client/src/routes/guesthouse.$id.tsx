import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import { MapPin, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/guesthouse/$id")({
  component: GuesthouseDetail,
});

const API = "http://localhost:5000";

function GuesthouseDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [booking, setBooking] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["guesthouse", id],
    queryFn: async () => {
      const res = await fetch(`${API}/guesthouse/${id}`);
      return res.json();
    },
  });

  const selectedRoom = useMemo(
    () => data?.rooms?.find((r: any) => r._id === selectedRoomId),
    [data, selectedRoomId]
  );

  const nights =
    checkIn && checkOut
      ? Math.max(0, differenceInCalendarDays(checkOut, checkIn))
      : 0;

  const totalPrice = selectedRoom
    ? nights * selectedRoom.price_per_night
    : 0;

  const handleBook = async () => {
    if (!user) {
      navigate({ to: "/auth", search: { redirect: `/guesthouse/${id}` } });
      return;
    }

    if (!selectedRoom || !checkIn || !checkOut || nights <= 0) {
      toast.error("Select room & valid dates");
      return;
    }

    setBooking(true);

    const res = await fetch(`${API}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        room_id: selectedRoom._id,
        check_in: checkIn,
        check_out: checkOut,
        total_price: totalPrice,
      }),
    });

    setBooking(false);

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.message);
      return;
    }

    toast.success("Booking confirmed!");
    qc.invalidateQueries({ queryKey: ["my-bookings"] });
    navigate({ to: "/bookings" });
  };

  if (isLoading) return <div className="p-10">Loading...</div>;

  const gh = data?.guesthouse;

  if (!gh) return <div>Not found</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Back */}
      <Link to="/" className="flex items-center gap-1 text-sm mb-4">
        <ArrowLeft size={14} /> Back
      </Link>

      {/* Image */}
      <img src={gh.cover_image} className="rounded-xl mb-4" />

      {/* Title */}
      <h1 className="text-3xl font-bold">{gh.name}</h1>
      <p className="text-muted-foreground flex items-center gap-1">
        <MapPin size={14} /> {gh.location}
      </p>

      {/* Rooms */}
      <div className="mt-6 space-y-3">
        {data.rooms.map((room: any) => (
          <div
            key={room._id}
            onClick={() => room.is_available && setSelectedRoomId(room._id)}
            className={`border p-3 rounded cursor-pointer ${selectedRoomId === room._id ? "border-primary" : ""
              }`}
          >
            <div className="flex justify-between">
              <div>
                <h3>{room.name}</h3>
                <Badge>{room.room_type}</Badge>
                <p className="text-sm">Sleeps {room.capacity}</p>
              </div>
              <p>${room.price_per_night}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ DATE INPUTS ADDED HERE */}
      <div className="mt-6 flex gap-4">
        <div>
          <label className="text-sm">Check-in</label>
          <input
            type="date"
            className="border p-2 rounded"
            onChange={(e) => setCheckIn(new Date(e.target.value))}
          />
        </div>

        <div>
          <label className="text-sm">Check-out</label>
          <input
            type="date"
            className="border p-2 rounded"
            onChange={(e) => setCheckOut(new Date(e.target.value))}
          />
        </div>
      </div>

      {/* Booking summary (optional but nice) */}
      {selectedRoom && nights > 0 && (
        <div className="mt-4 text-sm">
          <p>
            {nights} nights × ${selectedRoom.price_per_night} ={" "}
            <strong>${totalPrice}</strong>
          </p>
        </div>
      )}

      {/* Button */}
      <div className="mt-6">
        <Button onClick={handleBook}>
          {booking ? "Booking..." : "Book Now"}
        </Button>
      </div>
    </div>
  );
}