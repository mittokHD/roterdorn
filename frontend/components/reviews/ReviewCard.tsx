import Image from "next/image";
import Link from "next/link";
import type { Rezension } from "@/lib/types";
import { TYPE_META } from "@/lib/constants";
import { getStrapiMediaUrl } from "@/lib/strapi";
import { LEGACY_REVIEW_DETAILS } from "@/lib/legacy-review-details.generated";
import RatingBadge from "@/components/ui/RatingBadge";
import TypeBadge from "@/components/ui/TypeBadge";

interface ReviewCardProps {
  rezension: Rezension;
}

interface CardTag {
  label: string;
  title?: string;
}

const MUSIC_DETAIL_TAG_ORDER = ["Label", "Genre", "Musiker"];

export default function ReviewCard({ rezension }: ReviewCardProps) {
  const meta = TYPE_META[rezension.type];
  const href = `/${meta.slug}/${rezension.slug}`;
  const coverUrl = getStrapiMediaUrl(rezension.cover?.url);
  const tags = getCardTags(rezension);

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
              className="absolute inset-0 flex items-center justify-center text-4xl bg-surface-tertiary"
            >
              {meta.icon}
            </div>
          )}

          {/* Rating overlay */}
          {rezension.rating != null && (
            <div className="absolute top-3 right-3">
              <RatingBadge rating={rezension.rating} size="md" />
            </div>
          )}

          {/* Gradient overlay at bottom */}
          <div
            className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--bg-glass)] to-transparent"
          />
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="mb-2">
            <TypeBadge type={rezension.type} size="sm" />
          </div>

          <h3
            className="font-bold text-base leading-snug mb-1 line-clamp-2 transition-colors duration-200 group-hover:text-text-accent text-text-primary"
          >
            {rezension.title}
          </h3>

          {rezension.autor && (
            <p
              className="text-sm mb-3 text-text-muted"
            >
              von {rezension.autor.name}
            </p>
          )}

          {/* Genres */}
          {tags.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
              {tags.map((tag) => (
                <span
                  key={`${rezension.slug}-${tag.title || tag.label}`}
                  title={tag.title}
                  className="text-xs px-2 py-0.5 rounded-full bg-surface-tertiary text-text-muted border border-border-subtle"
                >
                  {tag.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

function getCardTags(rezension: Rezension): CardTag[] {
  if (rezension.type !== "Musik") {
    return (rezension.genres || []).slice(0, 3).map((genre) => ({
      label: genre.name,
      title: genre.name,
    }));
  }

  const legacyDetails = LEGACY_REVIEW_DETAILS[rezension.slug];
  const tags = MUSIC_DETAIL_TAG_ORDER.flatMap((detailLabel) => {
    const row = legacyDetails?.rows.find((detailRow) => detailRow.label === detailLabel);
    return (row?.values || []).map((value) => ({
      label: value.label,
      title: `${detailLabel}: ${value.label}`,
    }));
  });

  if (tags.length > 0) return dedupeTags(tags);

  return (rezension.genres || []).map((genre) => ({
    label: genre.name,
    title: genre.name,
  }));
}

function dedupeTags(tags: CardTag[]) {
  const seen = new Set<string>();
  return tags.filter((tag) => {
    const key = `${tag.title || ""}:${tag.label}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
