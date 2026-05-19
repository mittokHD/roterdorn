import Link from "next/link";
import {
  MUSIC_TAXONOMIES,
  MUSIC_TAXONOMY_LABELS,
  type MusicTaxonomySlug,
  type MusicTaxonomyTerm,
} from "@/lib/music-taxonomies.generated";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const FILTER_KEYS = ["#", ...ALPHABET];

const isMusicTaxonomySlug = (value: string | undefined): value is MusicTaxonomySlug =>
  value === "label" || value === "musikgenre" || value === "musiker";

export const getMusicTaxonomySlug = (value: string | undefined) =>
  isMusicTaxonomySlug(value) ? value : null;

const normalizeLetter = (value: string | undefined) => {
  if (!value) return null;
  const upper = value.toUpperCase();
  if (upper === "#") return "#";
  return ALPHABET.includes(upper) ? upper : null;
};

const letterKey = (name: string) => {
  const first = name
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .charAt(0)
    .toUpperCase();

  return ALPHABET.includes(first) ? first : "#";
};

const groupTerms = (terms: MusicTaxonomyTerm[]) => {
  const groups = new Map<string, MusicTaxonomyTerm[]>();

  for (const term of terms) {
    const key = letterKey(term.name);
    const current = groups.get(key) || [];
    current.push(term);
    groups.set(key, current);
  }

  return groups;
};

const filterHref = (taxonomy: MusicTaxonomySlug, letter: string | null) => {
  const params = new URLSearchParams({ liste: taxonomy });
  if (letter) params.set("buchstabe", letter);
  return `/musik?${params.toString()}`;
};

const termHref = (taxonomy: MusicTaxonomySlug, term: MusicTaxonomyTerm) =>
  `/${taxonomy}/${term.slug}`;

interface MusicTaxonomyDirectoryProps {
  taxonomy: MusicTaxonomySlug;
  currentLetter?: string;
}

export default function MusicTaxonomyDirectory({
  taxonomy,
  currentLetter,
}: MusicTaxonomyDirectoryProps) {
  const selectedLetter = normalizeLetter(currentLetter);
  const title = MUSIC_TAXONOMY_LABELS[taxonomy];
  const terms = MUSIC_TAXONOMIES[taxonomy];
  const visibleTerms = selectedLetter
    ? terms.filter((term) => letterKey(term.name) === selectedLetter)
    : terms;
  const groups = groupTerms(visibleTerms);
  const groupOrder = FILTER_KEYS.filter((key) => groups.has(key));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-text-muted">
        <Link href="/" className="transition-colors hover:text-text-accent">
          Startseite
        </Link>
        <span>›</span>
        <Link href="/musik" className="transition-colors hover:text-text-accent">
          Musik
        </Link>
        <span>›</span>
        <span className="text-text-primary">{title}</span>
      </nav>

      <div className="mb-8 border border-border-subtle bg-surface-secondary px-5 py-4">
        <h1 className="text-xl font-black uppercase tracking-wide text-text-primary">
          {title}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {terms.length} Einträge
        </p>
      </div>

      <div className="mb-8 overflow-x-auto border border-border-subtle bg-surface-tertiary p-2">
        <div className="flex min-w-max items-center gap-1">
          <Link
            href={filterHref(taxonomy, null)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedLetter === null
                ? "bg-brand-500 text-white"
                : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
            }`}
          >
            Alle
          </Link>
          {FILTER_KEYS.map((letter) => (
            <Link
              key={letter}
              href={filterHref(taxonomy, letter)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedLetter === letter
                  ? "bg-brand-500 text-white"
                  : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
              }`}
            >
              {letter}
            </Link>
          ))}
        </div>
      </div>

      {groupOrder.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
          {groupOrder.map((letter) => (
            <section key={letter}>
              <h2 className="mb-3 border-b border-border-default pb-2 text-sm font-black text-text-primary">
                {letter}
              </h2>
              <ul className="space-y-2">
                {groups.get(letter)?.map((term) => (
                  <li key={term.slug}>
                    <Link
                      href={termHref(taxonomy, term)}
                      className="text-sm text-text-accent underline-offset-2 transition-colors hover:text-brand-400 hover:underline"
                    >
                      {term.name}
                    </Link>
                    <span className="ml-1 text-sm text-text-secondary">
                      ({term.count})
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border-subtle bg-surface-secondary p-8 text-sm text-text-muted">
          Keine Einträge für diesen Buchstaben.
        </div>
      )}
    </div>
  );
}
