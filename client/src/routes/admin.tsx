import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
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
import { Plus, Trash2, Upload } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth", search: { redirect: "/admin" } });
    else if (!isAdmin) navigate({ to: "/" });
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user || !isAdmin) {
    return <div className="mx-auto max-w-7xl px-4 py-12 text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl font-semibold">Admin</h1>
      <p className="text-muted-foreground mt-1">Manage stays, rooms, and bookings.</p>

      <Tabs defaultValue="guesthouses" className="mt-8">
        <TabsList>
          <TabsTrigger value="guesthouses">Guest houses</TabsTrigger>
          <TabsTrigger value="bookings">All bookings</TabsTrigger>
        </TabsList>
        <TabsContent value="guesthouses" className="mt-6">
          <GuesthousesAdmin />
        </TabsContent>
        <TabsContent value="bookings" className="mt-6">
          <BookingsAdmin />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------- GUESTHOUSES ---------- */

type Guesthouse = {
  id: string; name: string; location: string; description: string | null;
  cover_image: string | null; price_from: number;
};

function GuesthousesAdmin() {
  const qc = useQueryClient();
  const { data: guesthouses = [], isLoading } = useQuery({
    queryKey: ["admin-guesthouses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guesthouses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Guesthouse[];
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this guest house and all its rooms?")) return;
    const { error } = await supabase.from("guesthouses").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-guesthouses"] });
      qc.invalidateQueries({ queryKey: ["guesthouses"] });
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddGuesthouseDialog onAdded={() => {
          qc.invalidateQueries({ queryKey: ["admin-guesthouses"] });
          qc.invalidateQueries({ queryKey: ["guesthouses"] });
        }} />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : guesthouses.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No guest houses yet.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {guesthouses.map((g) => (
            <Card key={g.id} className="shadow-soft">
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                <div className="h-16 w-24 rounded-lg overflow-hidden bg-muted shrink-0">
                  {g.cover_image && <img src={g.cover_image} alt={g.name} className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1">
                  <CardTitle className="font-display">{g.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{g.location}</p>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/guesthouse/$id" params={{ id: g.id }}>View</Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(g.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <RoomsManager guesthouseId={g.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AddGuesthouseDialog({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    let coverUrl: string | null = null;

    if (coverFile) {
      const path = `${crypto.randomUUID()}-${coverFile.name}`;
      const { error: upErr } = await supabase.storage.from("guesthouse-images").upload(path, coverFile);
      if (upErr) {
        setBusy(false);
        toast.error(upErr.message);
        return;
      }
      coverUrl = supabase.storage.from("guesthouse-images").getPublicUrl(path).data.publicUrl;
    }

    const { error } = await supabase.from("guesthouses").insert({
      name: String(fd.get("name")),
      location: String(fd.get("location")),
      description: String(fd.get("description") || "") || null,
      price_from: Number(fd.get("price_from") || 0),
      cover_image: coverUrl,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Guest house added");
    setOpen(false);
    setCoverFile(null);
    setCoverPreview(null);
    onAdded();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add guest house</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">New guest house</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div><Label>Name</Label><Input name="name" required /></div>
          <div><Label>Location</Label><Input name="location" required placeholder="e.g. Tuscany, Italy" /></div>
          <div><Label>Description</Label><Textarea name="description" rows={3} /></div>
          <div><Label>Price from ($/night)</Label><Input type="number" name="price_from" required min="0" step="0.01" /></div>
          <div>
            <Label>Cover image</Label>
            <div className="mt-1 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm cursor-pointer hover:bg-secondary">
                <Upload className="h-4 w-4" />
                <span>Choose file</span>
                <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
              </label>
              {coverPreview && <img src={coverPreview} alt="" className="h-12 w-16 object-cover rounded" />}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- ROOMS ---------- */

type Room = {
  id: string; name: string; room_type: string; description: string | null;
  price_per_night: number; capacity: number; is_available: boolean;
};

function RoomsManager({ guesthouseId }: { guesthouseId: string }) {
  const qc = useQueryClient();
  const { data: rooms = [] } = useQuery({
    queryKey: ["admin-rooms", guesthouseId],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("*").eq("guesthouse_id", guesthouseId);
      if (error) throw error;
      return data as Room[];
    },
  });

  const toggleAvail = async (room: Room) => {
    const { error } = await supabase.from("rooms").update({ is_available: !room.is_available }).eq("id", room.id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["admin-rooms", guesthouseId] });
  };

  const removeRoom = async (id: string) => {
    if (!confirm("Delete this room?")) return;
    const { error } = await supabase.from("rooms").delete().eq("id", id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["admin-rooms", guesthouseId] });
  };

  const addRoom = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("rooms").insert({
      guesthouse_id: guesthouseId,
      name: String(fd.get("name")),
      room_type: String(fd.get("room_type")),
      description: String(fd.get("description") || "") || null,
      price_per_night: Number(fd.get("price_per_night")),
      capacity: Number(fd.get("capacity") || 2),
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    (e.target as HTMLFormElement).reset();
    toast.success("Room added");
    qc.invalidateQueries({ queryKey: ["admin-rooms", guesthouseId] });
  };

  return (
    <div className="border-t pt-4">
      <h4 className="font-medium mb-3">Rooms</h4>
      {rooms.length === 0 ? (
        <p className="text-sm text-muted-foreground mb-3">No rooms yet.</p>
      ) : (
        <div className="space-y-2 mb-4">
          {rooms.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{r.name}</span>
                  <Badge variant="secondary">{r.room_type}</Badge>
                  <span className="text-sm text-muted-foreground">${Number(r.price_per_night).toFixed(0)}/night · {r.capacity} guests</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={r.is_available} onCheckedChange={() => toggleAvail(r)} />
                <span className="text-xs text-muted-foreground hidden sm:inline">{r.is_available ? "Available" : "Off"}</span>
                <Button variant="ghost" size="icon" onClick={() => removeRoom(r.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={addRoom} className="grid sm:grid-cols-[1fr_1fr_120px_100px_auto] gap-2 items-end">
        <div><Label className="text-xs">Name</Label><Input name="name" required placeholder="Garden Suite" /></div>
        <div><Label className="text-xs">Type</Label><Input name="room_type" required placeholder="Suite" /></div>
        <div><Label className="text-xs">$/night</Label><Input name="price_per_night" type="number" required min="0" step="0.01" /></div>
        <div><Label className="text-xs">Sleeps</Label><Input name="capacity" type="number" defaultValue={2} min="1" /></div>
        <Button type="submit" size="sm" className="gap-1"><Plus className="h-3 w-3" />Add</Button>
        <Input name="description" placeholder="Description (optional)" className="sm:col-span-5" />
      </form>
    </div>
  );
}

/* ---------- BOOKINGS ---------- */

type AdminBooking = {
  id: string; check_in: string; check_out: string; total_price: number; status: string; user_id: string;
  rooms: { name: string; guesthouses: { name: string } | null } | null;
};

function BookingsAdmin() {
  const qc = useQueryClient();
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id,check_in,check_out,total_price,status,user_id,rooms(name,guesthouses(name))")
        .order("check_in", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as AdminBooking[];
    },
  });

  const setStatus = async (id: string, status: "confirmed" | "completed" | "cancelled" | "pending") => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (bookings.length === 0) return <Card><CardContent className="p-8 text-center text-muted-foreground">No bookings yet.</CardContent></Card>;

  return (
    <div className="space-y-2">
      {bookings.map((b) => (
        <Card key={b.id} className="shadow-soft">
          <CardContent className="p-4 flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="font-display font-semibold">{b.rooms?.guesthouses?.name || "—"}</div>
              <div className="text-sm text-muted-foreground">{b.rooms?.name} · {format(new Date(b.check_in), "MMM d")} → {format(new Date(b.check_out), "MMM d")}</div>
            </div>
            <div className="font-display font-semibold text-primary">${Number(b.total_price).toFixed(2)}</div>
            <Badge variant={b.status === "cancelled" ? "destructive" : "secondary"}>{b.status}</Badge>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => setStatus(b.id, "confirmed")}>Confirm</Button>
              <Button size="sm" variant="outline" onClick={() => setStatus(b.id, "completed")}>Complete</Button>
              <Button size="sm" variant="outline" onClick={() => setStatus(b.id, "cancelled")}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
