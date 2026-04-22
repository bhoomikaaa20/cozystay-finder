import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

const API = "http://localhost:5000/admin";

/* ================= MAIN ================= */

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth", search: { redirect: "/admin" } });
    else if (!isAdmin) navigate({ to: "/" });
  }, [user, isAdmin, loading]);

  if (loading || !user || !isAdmin) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold">Admin Panel</h1>

      <Tabs defaultValue="guesthouses" className="mt-6">
        <TabsList>
          <TabsTrigger value="guesthouses">Guesthouses</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="guesthouses">
          <GuesthousesAdmin />
        </TabsContent>

        <TabsContent value="bookings">
          <BookingsAdmin />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ================= GUESTHOUSES ================= */

function GuesthousesAdmin() {
  const qc = useQueryClient();

  const { data: guesthouses = [] } = useQuery({
    queryKey: ["admin-guesthouses"],
    queryFn: async () => {
      const res = await fetch(`${API}/guesthouses`, { credentials: "include" });
      return res.json();
    },
  });

  const handleDelete = async (id: string) => {
    await fetch(`${API}/guesthouses/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-guesthouses"] });
  };

  return (
    <div>
      <AddGuesthouseDialog onAdded={() => qc.invalidateQueries({ queryKey: ["admin-guesthouses"] })} />

      {guesthouses.map((g: any) => (
        <Card key={g._id} className="mt-4">
          <CardHeader className="flex justify-between">
            <CardTitle>{g.name}</CardTitle>
            <Button variant="ghost" onClick={() => handleDelete(g._id)}>
              <Trash2 size={16} />
            </Button>
          </CardHeader>

          <CardContent>
            <RoomsManager guesthouseId={g._id} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ================= ADD GUESTHOUSE ================= */

function AddGuesthouseDialog({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    await fetch(`${API}/guesthouses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: fd.get("name"),
        location: fd.get("location"),
        description: fd.get("description"),
        price_from: Number(fd.get("price_from")),
        cover_image: fd.get("cover_image"), // ✅ NEW
      }),
    });

    toast.success("Added");
    setOpen(false);
    onAdded();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4"><Plus size={14} /> Add Guesthouse</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Guesthouse</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3">

          <Input name="name" placeholder="Name" required />
          <Input name="location" placeholder="Location" required />

          {/* ✅ NEW IMAGE FIELD */}
          <Input
            name="cover_image"
            placeholder="Image URL (paste link)"
            required
          />

          <Textarea name="description" placeholder="Description" />
          <Input name="price_from" type="number" placeholder="Price" required />

          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ================= ROOMS ================= */

function RoomsManager({ guesthouseId }: { guesthouseId: string }) {
  const qc = useQueryClient();

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms", guesthouseId],
    queryFn: async () => {
      const res = await fetch(`${API}/rooms/${guesthouseId}`, { credentials: "include" });
      return res.json();
    },
  });

  const toggle = async (id: string) => {
    await fetch(`${API}/rooms/${id}`, {
      method: "PATCH",
      credentials: "include",
    });
    qc.invalidateQueries({ queryKey: ["rooms", guesthouseId] });
  };

  const remove = async (id: string) => {
    await fetch(`${API}/rooms/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    qc.invalidateQueries({ queryKey: ["rooms", guesthouseId] });
  };

  const addRoom = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    await fetch(`${API}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        guesthouse_id: guesthouseId,
        name: fd.get("name"),
        room_type: fd.get("room_type"),
        price_per_night: Number(fd.get("price")),
        capacity: Number(fd.get("capacity")),
      }),
    });

    (e.target as HTMLFormElement).reset();
    qc.invalidateQueries({ queryKey: ["rooms", guesthouseId] });
  };

  return (
    <div>
      {rooms.map((r: any) => (
        <div key={r._id} className="flex gap-2 items-center mt-2">
          <span>{r.name}</span>
          <Switch checked={r.is_available} onCheckedChange={() => toggle(r._id)} />
          <Button size="sm" onClick={() => remove(r._id)}>Delete</Button>
        </div>
      ))}

      <form onSubmit={addRoom} className="flex gap-2 mt-3">
        <Input name="name" placeholder="Room name" required />
        <Input name="room_type" placeholder="Type" required />
        <Input name="price" type="number" placeholder="Price" required />
        <Input name="capacity" type="number" placeholder="Capacity" required />
        <Button type="submit">Add</Button>
      </form>
    </div>
  );
}

/* ================= BOOKINGS ================= */

function BookingsAdmin() {
  const qc = useQueryClient();

  const { data: bookings = [] } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const res = await fetch(`${API}/bookings`, { credentials: "include" });
      return res.json();
    },
  });

  const updateStatus = async (id: string, status: string) => {
    await fetch(`${API}/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });

    qc.invalidateQueries({ queryKey: ["bookings"] });
  };

  return (
    <div>
      {bookings.map((b: any) => (
        <Card key={b._id} className="mt-3 p-3 flex justify-between">
          <div>
            <p>{b.room_id?.guesthouse_id?.name}</p>
            <p>{b.room_id?.name}</p>
            <p>{format(new Date(b.check_in), "MMM d")} → {format(new Date(b.check_out), "MMM d")}</p>
          </div>

          <div>
            <Badge>{b.status}</Badge>
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={() => updateStatus(b.id, "confirmed")}>Confirm</Button>
              <Button size="sm" onClick={() => updateStatus(b.id, "completed")}>Done</Button>
              <Button size="sm" onClick={() => updateStatus(b.id, "cancelled")}>Cancel</Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}