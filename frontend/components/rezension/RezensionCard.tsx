import Image from "next/image";
import Link from "next/link";
import type { Rezension } from "@/lib/types";
import { TYPE_REVERSE_MAP } from "@/lib/types";
import { getStrapiMediaUrl } from "@/lib/strapi";
import RatingBadge from "@/components/ui/RatingBadge";
import TypeBadge from "@/components/ui/TypeBadge";

interface RezensionCardProps {
  rezension: Rezension;
}

export default function RezensionCard({ rezension }: RezensionCardProps) {
  const typeSlug = TYPE_REVERSE_MAP[rezension.type];
  const href = `/${typeSlug}/${rezension.slug}`;
  const coverUrl = getStrapiMediaUrl(rezension.cover?.url);

  return (
    <Link href={href} className="group block" id={`rezension-${rezension.slug}`}>
      <article className="glass-card overflow-hidden h-full flex flex-col">
        {/* Cover Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {rezension.cover ? (
            <Image
              src={coverUrl}
              alt={rezension.cover.alternativeText || rezension.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center text-4xl"
              style={{ background: "var(--bg-tertiary)" }}
            >
              {rezension.type === "Buch"
                ? "📚"
                : rezension.type === "Film"
                ? "🎬"
                : rezension.type === "Musik"
                ? "🎵"
                : rezension.type === "Spiel"
                ? "🎮"
                : "🎪"}
            </div>
          )}

          {/* Rating overlay */}
          <div className="absolute top-3 right-3">
            <RatingBadge rating={rezension.rating} size="md" />
          </div>

          {/* Gradient overlay at bottom */}
          <div
            className="absolute inset-x-0 bottom-0 h-24"
            style={{
              background:
                "linear-gradient(to top, var(--bg-glass) 0%, transparent 100%)",
            }}
          />
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="mb-2">
            <TypeBadge type={rezension.type} size="sm" />
          </div>

          <h3
            className="font-bold text-base leading-snug mb-1 line-clamp-2 transition-colors duration-200 group-hover:text-[var(--text-accent)]"
            style={{ color: "var(--text-primary)" }}
          >
            {rezension.title}
          </h3>

          {rezension.autor && (
            <p
              className="text-sm mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              von {rezension.autor.name}
            </p>
          )}

          {/* Genres */}
          {rezension.genres && rezension.genres.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
              {rezension.genres.slice(0, 3).map((genre) => (
                <span
                  key={genre.id}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--bg-tertiary)",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
