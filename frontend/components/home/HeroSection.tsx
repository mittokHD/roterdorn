import Link from "next/link";
import { SearchIcon } from "@/components/ui/Icons";

/**
 * HeroSection Component
 * 
 * Displays the main introduction, heading, and call to action on the home page.
 * It uses a subtle animated background glow for better visual hierarchy.
 */
export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background glow for depth and modern aesthetics */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl opacity-20 pointer-events-none bg-brand-500" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center relative z-10">
        <div className="animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6">
            <span className="text-text-primary">Entdecke, was </span>
            <span className="bg-gradient-to-br from-brand-400 to-brand-600 bg-clip-text text-transparent">
              wirklich
            </span>
            <span className="text-text-primary"> zählt.</span>
          </h1>

          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 text-text-secondary">
            Ehrliche Rezensionen zu Büchern, Filmen, Musik, Spielen und Events
            — geschrieben mit Leidenschaft und einem kritischen Auge.
          </p>

          <Link
            href="/suche"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 bg-brand-500 text-white shadow-brand"
            id="hero-cta"
          >
            <SearchIcon />
            Rezensionen durchsuchen
          </Link>
        </div>
      </div>
    </section>
  );
}
