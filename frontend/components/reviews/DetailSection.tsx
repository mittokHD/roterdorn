import Image from "next/image";
import Link from "next/link";
import type {
  DetailComponent,
  BookDetails,
  MovieDetails,
  GameDetails,
  MusicDetails,
  EventDetails,
  RezensionType,
} from "@/lib/types";
import { TYPE_META } from "@/lib/constants";
import type { LegacyReviewDetails, LegacyReviewDetailRow } from "@/lib/legacy-review-details.generated";

interface DetailSectionProps {
  details: DetailComponent[];
  type: RezensionType;
  legacyDetails?: LegacyReviewDetails;
  customRows?: LegacyReviewDetailRow[];
  coverUrl?: string;
  coverAlt?: string;
}

// Lookup map instead of switch statement.
// Adding a new detail type = add one entry here, nothing else changes.
const DETAIL_RENDERERS: Record<string, (d: DetailComponent) => React.ReactNode> = {
  "details.book-details": (d) => {
    const { id, isbn, pages, publisher, publishedDate } = d as BookDetails;
    if (![isbn, pages, publisher, publishedDate].some(Boolean)) return null;

    return (
      <DetailCard key={id} title="Buchdetails" icon="📖">
        <DetailRow label="ISBN" value={isbn} />
        <DetailRow label="Seiten" value={pages?.toString()} />
        <DetailRow label="Verlag" value={publisher} />
        <DetailRow
          label="Erschienen"
          value={publishedDate ? new Date(publishedDate).toLocaleDateString("de-DE") : null}
        />
      </DetailCard>
    );
  },

  "details.movie-details": (d) => {
    const { id, fsk, duration, director, releaseYear } = d as MovieDetails;
    if (![fsk, duration, director, releaseYear].some(Boolean)) return null;

    return (
      <DetailCard key={id} title="Filmdetails" icon="🎬">
        <DetailRow label="FSK" value={fsk ? `FSK ${fsk}` : null} />
        <DetailRow label="Dauer" value={duration ? `${duration} Min.` : null} />
        <DetailRow label="Regie" value={director} />
        <DetailRow label="Jahr" value={releaseYear?.toString()} />
      </DetailCard>
    );
  },

  "details.game-details": (d) => {
    const { id, platform, developer, publisher, releaseYear } = d as GameDetails;
    if (![platform, developer, publisher, releaseYear].some(Boolean)) return null;

    return (
      <DetailCard key={id} title="Spieldetails" icon="🎮">
        <DetailRow label="Plattform" value={platform} />
        <DetailRow label="Entwickler" value={developer} />
        <DetailRow label="Publisher" value={publisher} />
        <DetailRow label="Jahr" value={releaseYear?.toString()} />
      </DetailCard>
    );
  },

  "details.music-details": (d) => {
    const { id, artist, label, tracks, releaseYear } = d as MusicDetails;
    if (![artist, label, tracks, releaseYear].some(Boolean)) return null;

    return (
      <DetailCard key={id} title="Musikdetails" icon="🎵">
        <DetailRow label="Künstler" value={artist} />
        <DetailRow label="Label" value={label} />
        <DetailRow label="Tracks" value={tracks?.toString()} />
        <DetailRow label="Jahr" value={releaseYear?.toString()} />
      </DetailCard>
    );
  },

  "details.event-details": (d) => {
    const { id, location, eventDate, organizer } = d as EventDetails;
    if (![location, eventDate, organizer].some(Boolean)) return null;

    return (
      <DetailCard key={id} title="Eventdetails" icon="🎪">
        <DetailRow label="Ort" value={location} />
        <DetailRow
          label="Datum"
          value={
            eventDate
              ? new Date(eventDate).toLocaleDateString("de-DE", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : null
          }
        />
        <DetailRow label="Veranstalter" value={organizer} />
      </DetailCard>
    );
  },
};

export default function DetailSection({
  details,
  type,
  legacyDetails,
  customRows = [],
  coverUrl,
  coverAlt,
}: DetailSectionProps) {
  const mergedRows = mergeDetailRows(legacyDetails?.rows || [], customRows);

  if (mergedRows.length) {
    return (
      <LegacyDetailCard
        type={type}
        rows={mergedRows}
        coverUrl={coverUrl}
        coverAlt={coverAlt}
      />
    );
  }

  if (!details || details.length === 0) return null;

  const renderedDetails = details
    .map((detail) => {
      const renderer = DETAIL_RENDERERS[detail.__component];
      return renderer ? renderer(detail) : null;
    })
    .filter(Boolean);

  if (renderedDetails.length === 0) return null;

  return (
    <div className="space-y-4">
      {renderedDetails}
    </div>
  );
}

function mergeDetailRows(baseRows: LegacyReviewDetailRow[], customRows: LegacyReviewDetailRow[]) {
  const rows = [...baseRows];

  for (const customRow of customRows) {
    if (!customRow.values?.length) continue;
    const existingIndex = rows.findIndex((row) => row.label.toLowerCase() === customRow.label.toLowerCase());
    if (existingIndex >= 0) {
      rows[existingIndex] = customRow;
    } else {
      rows.push(customRow);
    }
  }

  return rows;
}

function LegacyDetailCard({
  type,
  rows,
  coverUrl,
  coverAlt,
}: {
  type: RezensionType;
  rows: LegacyReviewDetailRow[];
  coverUrl?: string;
  coverAlt?: string;
}) {
  const meta = TYPE_META[type];

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-tertiary p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-text-secondary">
        <span>{meta.icon}</span>
        {meta.label}details
      </h3>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_180px]">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rows.map((row) => (
            <LegacyDetailRow key={row.label} row={row} />
          ))}
        </dl>
        {coverUrl && (
          <Image
            src={coverUrl}
            alt={coverAlt || ""}
            width={180}
            height={240}
            className="hidden aspect-[3/4] w-full rounded-lg border border-border-subtle object-cover lg:block"
          />
        )}
      </div>
    </div>
  );
}

function LegacyDetailRow({ row }: { row: LegacyReviewDetailRow }) {
  const text = row.values.map((value) => value.label).join(", ");
  const preservesLines = row.values.some((value) => value.label.includes("\n"));
  const isLong = preservesLines || row.values.length > 2 || text.length > 42;

  return (
    <div className={isLong ? "sm:col-span-2" : undefined}>
      <dt className="mb-0.5 text-xs text-text-muted">{row.label}</dt>
      <dd className={`text-sm font-medium leading-6 text-text-primary ${preservesLines ? "whitespace-pre-line" : ""}`}>
        {row.values.map((value, index) => (
          <span key={`${value.label}-${value.href || index}`}>
            {index > 0 && ", "}
            {value.href ? (
              <Link
                href={value.href}
                target={value.href.startsWith("http") ? "_blank" : undefined}
                rel={value.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="text-text-accent underline-offset-2 transition-colors hover:text-brand-400 hover:underline"
              >
                {value.label}
              </Link>
            ) : (
              value.label
            )}
          </span>
        ))}
      </dd>
    </div>
  );
}

function DetailCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl p-5 bg-surface-tertiary border border-border-subtle">
      <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2 text-text-secondary">
        <span>{icon}</span>
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;

  return (
    <div>
      <dt className="text-xs mb-0.5 text-text-muted">{label}</dt>
      <dd className="text-sm font-medium text-text-primary">{value}</dd>
    </div>
  );
}
