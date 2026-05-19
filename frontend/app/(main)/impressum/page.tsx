import type { Metadata } from "next";
import StaticContentPage from "@/components/layout/StaticContentPage";
import { STATIC_PAGE_CONTENT } from "@/lib/static-page-content";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum und Anbieterkennzeichnung von roterdorn.",
};

export default function ImpressumPage() {
  return (
    <StaticContentPage
      title="Impressum"
      intro="Anbieterkennzeichnung, Kontakt, Redaktion und rechtliche Hinweise."
      contentHtml={STATIC_PAGE_CONTENT.impressum}
    />
  );
}
