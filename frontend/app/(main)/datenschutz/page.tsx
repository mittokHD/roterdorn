import type { Metadata } from "next";
import StaticContentPage from "@/components/layout/StaticContentPage";
import { STATIC_PAGE_CONTENT } from "@/lib/static-page-content";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Datenschutzerklärung von roterdorn.",
};

export default function DatenschutzPage() {
  return (
    <StaticContentPage
      title="Datenschutz"
      intro="Informationen zur Verarbeitung personenbezogener Daten auf roterdorn."
      contentHtml={STATIC_PAGE_CONTENT.datenschutz}
    />
  );
}
