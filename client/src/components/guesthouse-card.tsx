import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";

type Props = {
  id: string;
  name: string;
  location: string;
  cover_image: string | null;
  price_from: number;
};

const FALLBACK = "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=80";

export function GuesthouseCard({ id, name, location, cover_image, price_from }: Props) {
  return (
    <Link
      to="/guesthouse/$id"
      params={{ id }}
      className="group block overflow-hidden rounded-2xl bg-card shadow-soft transition-smooth hover:shadow-card hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={cover_image || FALLBACK}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-smooth group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl font-semibold text-foreground line-clamp-1">{name}</h3>
        <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="line-clamp-1">{location}</span>
        </div>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-sm text-muted-foreground">from</span>
          <span className="font-display text-lg font-semibold text-primary">${Number(price_from).toFixed(0)}</span>
          <span className="text-sm text-muted-foreground">/night</span>
        </div>
      </div>
    </Link>
  );
}
