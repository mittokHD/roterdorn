import LegacyEditorialDetail, {
  generateLegacyEditorialDetailMetadata,
} from "@/components/editorial/LegacyEditorialDetail";

const SECTION = "artikel";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return generateLegacyEditorialDetailMetadata(SECTION, slug);
}

export default async function ArtikelDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return <LegacyEditorialDetail section={SECTION} slug={slug} />;
}
