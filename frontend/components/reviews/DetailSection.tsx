import type { DetailComponent } from "@/lib/types";

interface DetailSectionProps {
  details: DetailComponent[];
}

export default function DetailSection({ details }: DetailSectionProps) {
  if (!details || details.length === 0) return null;

  return (
    <div className="space-y-4">
      {details.map((detail) => {
        switch (detail.__component) {
          case "details.book-details":
            return (
              <DetailCard key={detail.id} title="Buchdetails" icon="📖">
                <DetailRow label="ISBN" value={detail.isbn} />
                <DetailRow
                  label="Seiten"
                  value={detail.pages?.toString()}
                />
                <DetailRow label="Verlag" value={detail.publisher} />
                <DetailRow
                  label="Erschienen"
                  value={
                    detail.publishedDate
                      ? new Date(detail.publishedDate).toLocaleDateString(
                          "de-DE"
                        )
                      : null
                  }
                />
              </DetailCard>
            );

          case "details.movie-details":
            return (
              <DetailCard key={detail.id} title="Filmdetails" icon="🎬">
                <DetailRow label="FSK" value={detail.fsk ? `FSK ${detail.fsk}` : null} />
                <DetailRow
                  label="Dauer"
                  value={
                    detail.duration ? `${detail.duration} Min.` : null
                  }
                />
                <DetailRow label="Regie" value={detail.director} />
                <DetailRow
                  label="Jahr"
                  value={detail.releaseYear?.toString()}
                />
              </DetailCard>
            );

          case "details.game-details":
            return (
              <DetailCard key={detail.id} title="Spieldetails" icon="🎮">
                <DetailRow label="Plattform" value={detail.platform} />
                <DetailRow label="Entwickler" value={detail.developer} />
                <DetailRow label="Publisher" value={detail.publisher} />
                <DetailRow
                  label="Jahr"
                  value={detail.releaseYear?.toString()}
                />
              </DetailCard>
            );

          case "details.music-details":
            return (
              <DetailCard key={detail.id} title="Musikdetails" icon="🎵">
                <DetailRow label="Künstler" value={detail.artist} />
                <DetailRow label="Label" value={detail.label} />
                <DetailRow
                  label="Tracks"
                  value={detail.tracks?.toString()}
                />
                <DetailRow
                  label="Jahr"
                  value={detail.releaseYear?.toString()}
                />
              </DetailCard>
            );

          case "details.event-details":
            return (
              <DetailCard key={detail.id} title="Eventdetails" icon="🎪">
                <DetailRow label="Ort" value={detail.location} />
                <DetailRow
                  label="Datum"
                  value={
                    detail.eventDate
                      ? new Date(detail.eventDate).toLocaleDateString(
                          "de-DE",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )
                      : null
                  }
                />
                <DetailRow label="Veranstalter" value={detail.organizer} />
              </DetailCard>
            );

          default:
            return null;
        }
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
      <dt className="text-xs mb-0.5 text-text-muted">
        {label}
      </dt>
      <dd className="text-sm font-medium text-text-primary">
        {value}
      </dd>
    </div>
  );
}
