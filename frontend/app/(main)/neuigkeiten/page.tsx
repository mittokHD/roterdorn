import LegacyEditorialArchive, {
  generateLegacyEditorialArchiveMetadata,
} from "@/components/editorial/LegacyEditorialArchive";

const SECTION = "neuigkeiten";

export const metadata = generateLegacyEditorialArchiveMetadata(SECTION);

export default function NeuigkeitenPage() {
  return <LegacyEditorialArchive section={SECTION} />;
}
