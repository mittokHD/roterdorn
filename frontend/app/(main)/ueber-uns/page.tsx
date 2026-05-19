import type { Metadata } from "next";
import StaticContentPage from "@/components/layout/StaticContentPage";
import { STATIC_PAGE_CONTENT } from "@/lib/static-page-content";

export const metadata: Metadata = {
  title: "Über uns",
  description: "Das Team hinter roterdorn.",
};

export default function UeberUnsPage() {
  return (
    <StaticContentPage
      title="Über uns"
      intro="Die Menschen hinter der Redaktion und ihren Rezensionen."
      contentHtml={STATIC_PAGE_CONTENT.ueberUns}
    />
  );
}
