import type {
  DetailComponent,
  BookDetails,
  MovieDetails,
  GameDetails,
  MusicDetails,
  EventDetails,
} from "@/lib/types";

interface DetailSectionProps {
  details: DetailComponent[];
}

// Lookup map instead of switch statement.
// Adding a new detail type = add one entry here, nothing else changes.
const DETAIL_RENDERERS: Record<string, (d: DetailComponent) => React.ReactNode> = {
  "details.book-details": (d) => {
    const { id, isbn, pages, publisher, publishedDate } = d as BookDetails;
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

export default function DetailSection({ details }: DetailSectionProps) {
  if (!details || details.length === 0) return null;

  return (
    <div className="space-y-4">
      {details.map((detail) => {
        const renderer = DETAIL_RENDERERS[detail.__component];
        return renderer ? renderer(detail) : null;
      })}
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
