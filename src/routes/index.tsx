import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GuesthouseCard } from "@/components/guesthouse-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: HomePage,
});

type Guesthouse = {
  id: string;
  name: string;
  location: string;
  cover_image: string | null;
  price_from: number;
};

function HomePage() {
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const { data: guesthouses = [], isLoading } = useQuery({
    queryKey: ["guesthouses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guesthouses")
        .select("id,name,location,cover_image,price_from")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Guesthouse[];
    },
  });

  const filtered = useMemo(() => {
    return guesthouses.filter((g) => {
      const q = search.trim().toLowerCase();
      const matchesQ = !q || g.name.toLowerCase().includes(q) || g.location.toLowerCase().includes(q);
      const matchesPrice = !maxPrice || Number(g.price_from) <= Number(maxPrice);
      return matchesQ && matchesPrice;
    });
  }, [guesthouses, search, maxPrice]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Boutique guest house at golden hour"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 backdrop-blur-sm px-3 py-1 text-xs font-medium text-foreground shadow-soft">
              <Sparkles className="h-3 w-3 text-primary" />
              Curated boutique stays
            </span>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] text-foreground">
              Find your next <em className="italic text-primary">slow</em> escape.
            </h1>
            <p className="mt-4 text-lg text-foreground/80 max-w-lg">
              Hand-picked guest houses with real character. Real-time availability,
              instant confirmation, no surprises.
            </p>
          </div>

          {/* Search bar */}
          <div className="mt-8 max-w-3xl rounded-2xl bg-card/95 backdrop-blur-md p-3 shadow-card border border-border/60">
            <div className="grid sm:grid-cols-[1fr_180px_auto] gap-2">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Where are you going?"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-11 bg-background border-input"
                />
              </div>
              <Input
                type="number"
                placeholder="Max $ / night"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-11 bg-background border-input"
              />
              <Button size="lg" className="h-11 gap-2">
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-semibold">
              {search || maxPrice ? "Matching stays" : "Featured stays"}
            </h2>
            <p className="text-muted-foreground mt-1">
              {filtered.length} {filtered.length === 1 ? "place" : "places"} to call home
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <h3 className="font-display text-xl">No stays match yet</h3>
            <p className="text-muted-foreground mt-2">
              {guesthouses.length === 0
                ? "An admin can add the first guest house from the Admin panel."
                : "Try widening your search."}
            </p>
            {guesthouses.length === 0 && (
              <Button asChild className="mt-4">
                <Link to="/admin">Open admin panel</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((g) => (
              <GuesthouseCard key={g.id} {...g} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
