import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getRezensionBySlug, getStrapiMediaUrl } from "@/lib/strapi";
import { TYPE_SLUG_MAP, TYPE_LABELS, TYPE_REVERSE_MAP } from "@/lib/types";
import RatingBadge from "@/components/ui/RatingBadge";
import TypeBadge from "@/components/ui/TypeBadge";
import DetailSection from "@/components/rezension/DetailSection";
import CommentSection from "@/components/comments/CommentSection";

interface PageProps {
  params: Promise<{ type: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const response = await getRezensionBySlug(slug);
    const rezension = response.data?.[0];
    if (!rezension) return {};

    return {
      title: rezension.title,
      description: `Rezension: ${rezension.title} — Bewertung: ${rezension.rating}/10`,
      openGraph: {
        title: rezension.title,
        description: `Rezension: ${rezension.title} — Bewertung: ${rezension.rating}/10`,
        images: rezension.cover
          ? [{ url: getStrapiMediaUrl(rezension.cover.url) }]
          : [],
      },
    };
  } catch {
    return {};
  }
}

export default async function RezensionPage({ params }: PageProps) {
  const { type, slug } = await params;

  // Validate type
  if (!TYPE_SLUG_MAP[type]) notFound();

  let rezension;
  try {
    const response = await getRezensionBySlug(slug);
    rezension = response.data?.[0];
  } catch {
    notFound();
  }

  if (!rezension) notFound();

  const coverUrl = getStrapiMediaUrl(rezension.cover?.url);
  const publishDate = new Date(rezension.publishedAt).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="animate-fade-in-up">
      {/* ─── Hero / Cover ────────────────── */}
      <div className="relative h-[40vh] sm:h-[50vh] overflow-hidden">
        {rezension.cover ? (
          <Image
            src={coverUrl}
            alt={rezension.cover.alternativeText || rezension.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: "var(--bg-tertiary)" }}
          />
        )}
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, var(--bg-primary) 0%, rgba(10, 10, 15, 0.6) 50%, rgba(10, 10, 15, 0.3) 100%)",
          }}
        />
      </div>

      {/* ─── Content ─────────────────────── */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-20">
        {/* Meta bar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <TypeBadge type={rezension.type} />
          <RatingBadge rating={rezension.rating} size="lg" />
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            {publishDate}
          </span>
        </div>

        {/* Title */}
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          {rezension.title}
        </h1>

        {/* Author */}
        {rezension.autor && (
          <div className="flex items-center gap-3 mb-8">
            {rezension.autor.avatar && (
              <Image
                src={getStrapiMediaUrl(rezension.autor.avatar.url)}
                alt={rezension.autor.name}
                width={40}
                height={40}
                className="rounded-full object-cover"
                style={{ border: "2px solid var(--border-subtle)" }}
              />
            )}
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {rezension.autor.name}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Autor
              </p>
            </div>
          </div>
        )}

        {/* Genres */}
        {rezension.genres && rezension.genres.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {rezension.genres.map((genre) => (
              <span
                key={genre.id}
                className="text-xs px-3 py-1 rounded-full font-medium"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {genre.name}
              </span>
            ))}
          </div>
        )}

        {/* Details (Dynamic Zone) */}
        {rezension.details && rezension.details.length > 0 && (
          <div className="mb-10">
            <DetailSection details={rezension.details} />
          </div>
        )}

        {/* Rich Text Content */}
        <div
          className="prose-custom mb-16"
          dangerouslySetInnerHTML={{ __html: rezension.content || "" }}
        />

        {/* Divider */}
        <hr
          className="mb-12"
          style={{ borderColor: "var(--border-subtle)" }}
        />

        {/* Comments */}
        <CommentSection
          rezensionId={rezension.documentId}
          kommentare={
            rezension.kommentare?.filter((k) => k.isApproved) || []
          }
        />

        {/* Back link */}
        <div className="mt-12">
          <Link
            href={`/${TYPE_REVERSE_MAP[rezension.type]}`}
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200"
            style={{ color: "var(--text-accent)" }}
          >
            ← Zurück zu {TYPE_LABELS[rezension.type]}
          </Link>
        </div>
      </div>

      {/* JSON-LD Schema.org Review Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Review",
            itemReviewed: {
              "@type": "CreativeWork",
              name: rezension.title,
              image: coverUrl,
            },
            reviewRating: rezension.rating ? {
              "@type": "Rating",
              ratingValue: rezension.rating,
              bestRating: "10",
              worstRating: "1",
            } : undefined,
            author: {
              "@type": "Person",
              name: rezension.autor?.name || "Roterdorn",
            },
            publisher: {
              "@type": "Organization",
              name: "Roterdorn",
            },
            datePublished: rezension.publishedAt,
          }),
        }}
      />
    </article>
  );
}
