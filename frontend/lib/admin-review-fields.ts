import type { RezensionType } from "@/lib/types";

export type AdminDetailField = {
  name: string;
  label: string;
  input?: "text" | "number" | "date" | "textarea" | "select" | "url";
  options?: string[];
  mapsToComponent?: boolean;
};

export const DETAIL_FIELDS: Record<RezensionType, AdminDetailField[]> = {
  Buch: [
    { name: "kategorie", label: "Kategorie" },
    { name: "buchautor", label: "Buchautor" },
    { name: "herausgeber", label: "Herausgeber" },
    { name: "zeichner", label: "Zeichner" },
    { name: "sprecher", label: "Sprecher" },
    { name: "publisher", label: "Verlag", mapsToComponent: true },
    { name: "genre", label: "Genre" },
    { name: "isbn", label: "ISBN", mapsToComponent: true },
    { name: "pages", label: "Seiten", input: "number", mapsToComponent: true },
    { name: "publishedDate", label: "Erscheinungsdatum", input: "date", mapsToComponent: true },
    { name: "sprache", label: "Sprache" },
    { name: "format", label: "Format / Ausgabe" },
    { name: "uebersetzer", label: "Übersetzer" },
    { name: "originaltitel", label: "Originaltitel" },
    { name: "reihe", label: "Reihe" },
  ],
  Film: [
    { name: "kategorie", label: "Kategorie" },
    { name: "darsteller", label: "Darsteller", input: "textarea" },
    { name: "director", label: "Regie", mapsToComponent: true },
    { name: "drehbuch", label: "Drehbuch" },
    { name: "studio", label: "Studio" },
    { name: "genre", label: "Filmgenre" },
    { name: "serie", label: "Serie" },
    { name: "fsk", label: "FSK", input: "select", options: ["", "0", "6", "12", "16", "18"], mapsToComponent: true },
    { name: "duration", label: "Dauer in Minuten", input: "number", mapsToComponent: true },
    { name: "releaseYear", label: "Erscheinungsjahr", input: "number", mapsToComponent: true },
    { name: "land", label: "Land" },
    { name: "sprache", label: "Sprache" },
    { name: "trailerUrl", label: "Trailer-URL", input: "url" },
  ],
  Musik: [
    { name: "artist", label: "Musiker", mapsToComponent: true },
    { name: "label", label: "Label", mapsToComponent: true },
    { name: "genre", label: "Musikgenre" },
    { name: "tracklist", label: "Tracklist", input: "textarea" },
    { name: "laufzeit", label: "Laufzeit" },
    { name: "tracks", label: "Tracks", input: "number", mapsToComponent: true },
    { name: "releaseYear", label: "Erscheinungsjahr", input: "number", mapsToComponent: true },
    { name: "erscheinungsdatum", label: "Erscheinungsdatum", input: "date" },
    { name: "sprache", label: "Sprache" },
    { name: "format", label: "Format" },
  ],
  Spiel: [
    { name: "kategorie", label: "Kategorie" },
    { name: "autor", label: "Autor" },
    { name: "publisher", label: "Verlag / Publisher", mapsToComponent: true },
    { name: "developer", label: "Entwickler", mapsToComponent: true },
    { name: "genre", label: "Genre" },
    { name: "serie", label: "Serie" },
    { name: "erscheinungsdatum", label: "Erscheinungsdatum", input: "date" },
    { name: "sprache", label: "Sprache" },
    { name: "spieler", label: "Spieler" },
    { name: "alter", label: "Alter" },
    { name: "spieldauer", label: "Spieldauer" },
    { name: "platform", label: "Plattform", mapsToComponent: true },
    { name: "releaseYear", label: "Erscheinungsjahr", input: "number", mapsToComponent: true },
    { name: "material", label: "Material", input: "textarea" },
  ],
  Event: [
    { name: "kategorie", label: "Kategorie" },
    { name: "organizer", label: "Veranstalter", mapsToComponent: true },
    { name: "location", label: "Ort", mapsToComponent: true },
    { name: "adresse", label: "Adresse" },
    { name: "eventDate", label: "Datum", input: "date", mapsToComponent: true },
    { name: "website", label: "Website", input: "url" },
    { name: "reihe", label: "Veranstaltungsreihe" },
    { name: "genre", label: "Eventgenre" },
  ],
};
