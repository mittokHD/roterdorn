import LegacyEditorialArchive, {
  generateLegacyEditorialArchiveMetadata,
} from "@/components/editorial/LegacyEditorialArchive";

const SECTION = "artikel";

export const metadata = generateLegacyEditorialArchiveMetadata(SECTION);

export default function ArtikelPage() {
  return <LegacyEditorialArchive section={SECTION} />;
}
