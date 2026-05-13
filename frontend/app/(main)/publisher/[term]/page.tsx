import LegacyTaxonomyPage, { generateLegacyTaxonomyMetadata } from "@/components/taxonomy/LegacyTaxonomyPage";

const TAXONOMY = "publisher";

interface PageProps {
  params: Promise<{ term: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { term } = await params;
  return generateLegacyTaxonomyMetadata(TAXONOMY, term);
}

export default async function Page({ params }: PageProps) {
  const { term } = await params;
  return <LegacyTaxonomyPage taxonomy={TAXONOMY} term={term} />;
}
