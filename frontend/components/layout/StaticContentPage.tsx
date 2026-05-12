interface StaticContentPageProps {
  title: string;
  intro: string;
  contentHtml: string;
}

export default function StaticContentPage({ title, intro, contentHtml }: StaticContentPageProps) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-accent">
          roterdorn
        </p>
        <h1 className="text-3xl font-black text-text-primary sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary">{intro}</p>
      </header>

      <article
        className="prose-custom static-page-content glass-card p-6 sm:p-8"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </main>
  );
}
