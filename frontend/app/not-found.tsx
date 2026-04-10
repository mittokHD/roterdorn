import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
        <h1 
          className="text-8xl font-black mb-4 tracking-tighter"
          style={{ color: "var(--brand-500)", textShadow: "var(--shadow-brand)" }}
        >
          404
        </h1>
        <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          Seite nicht gefunden
        </h2>
        <p className="max-w-md mx-auto mb-8 text-base" style={{ color: "var(--text-secondary)" }}>
          Diese Rezension oder Seite existiert leider nicht (mehr). Eventuell wurde sie bei der Migration verschoben.
        </p>
        <Link 
          href="/"
          className="px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-default)",
          }}
        >
          ← Zurück zur Startseite
        </Link>
      </main>
      <Footer />
    </>
  );
}
