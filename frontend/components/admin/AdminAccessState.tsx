import Link from "next/link";

interface AdminAccessStateProps {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}

export default function AdminAccessState({
  title,
  description,
  href,
  linkLabel,
}: AdminAccessStateProps) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col justify-center px-4 py-12 text-center sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-text-muted">{description}</p>
      <Link
        href={href}
        className="mt-6 inline-flex justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
      >
        {linkLabel}
      </Link>
    </main>
  );
}
