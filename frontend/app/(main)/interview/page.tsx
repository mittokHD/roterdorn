import LegacyEditorialArchive, {
  generateLegacyEditorialArchiveMetadata,
} from "@/components/editorial/LegacyEditorialArchive";

const SECTION = "interview";

export const metadata = generateLegacyEditorialArchiveMetadata(SECTION);

export default function InterviewPage() {
  return <LegacyEditorialArchive section={SECTION} />;
}
