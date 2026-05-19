import { NextResponse, type NextRequest } from "next/server";
import { LEGACY_REVIEW_SLUG_TARGETS } from "@/lib/legacy-review-aliases.generated";

const TYPE_SLUG_BY_LABEL = {
  Buch: "buch",
  Film: "film",
  Musik: "musik",
  Spiel: "spiel",
  Event: "event",
} as const;

const VALID_TYPE_SLUGS: Set<string> = new Set(Object.values(TYPE_SLUG_BY_LABEL));
const EVENT_ARCHIVE_ALIASES: Record<string, string> = {
  events: "/event",
  veranstaltung: "/event?genre=Veranstaltungen",
  veranstaltungen: "/event?genre=Veranstaltungen",
  konzert: "/event?genre=Konzert",
  lesung: "/event?genre=Lesung",
  theater: "/event?genre=Theater",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const [firstSegment, secondSegment] = segments;

  if (firstSegment && EVENT_ARCHIVE_ALIASES[firstSegment]) {
    if (secondSegment) {
      return redirectTo(request, `/event/${secondSegment}`);
    }

    return redirectTo(request, EVENT_ARCHIVE_ALIASES[firstSegment]);
  }

  if (!firstSegment || !secondSegment || !VALID_TYPE_SLUGS.has(firstSegment)) {
    return NextResponse.next();
  }

  const target = LEGACY_REVIEW_SLUG_TARGETS[secondSegment];
  if (!target) return NextResponse.next();

  const targetTypeSlug = TYPE_SLUG_BY_LABEL[target.type];
  const targetPath = `/${targetTypeSlug}/${target.slug}`;

  if (pathname === targetPath) return NextResponse.next();

  return redirectTo(request, targetPath);
}

function redirectTo(request: NextRequest, targetPath: string) {
  const url = request.nextUrl.clone();
  const [pathname, query = ""] = targetPath.split("?");
  url.pathname = pathname;
  url.search = query ? `?${query}` : "";
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/((?!api|_next|uploads|favicon.ico|robots.txt|sitemap.xml).*)"],
};
