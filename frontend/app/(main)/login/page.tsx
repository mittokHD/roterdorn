"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Anmeldung fehlgeschlagen.");
        return;
      }

      setUser(data.user);
      router.push("/");
      router.refresh();
    } catch {
      setError("Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl p-8 bg-surface-tertiary border border-border-subtle">
          <h1 className="text-2xl font-bold mb-2 text-text-primary">Anmelden</h1>
          <p className="text-sm text-text-muted mb-8">
            Noch kein Konto?{" "}
            <Link href="/registrieren" className="text-brand-500 hover:underline">
              Jetzt registrieren
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-text-secondary">
                E-Mail oder Benutzername
              </label>
              <input
                name="identifier"
                type="text"
                value={formData.identifier}
                onChange={handleChange}
                required
                autoComplete="username"
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-[color:var(--brand-500)] bg-[color:var(--bg-tertiary)] text-text-primary border border-border-default"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-text-secondary">
                Passwort
              </label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-[color:var(--brand-500)] bg-[color:var(--bg-tertiary)] text-text-primary border border-border-default"
              />
            </div>

            {error && (
              <div className="rounded-lg p-3 text-sm bg-red-500/10 border border-red-500/30 text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 bg-[color:var(--brand-500)] text-white shadow-[0_0_15px_var(--brand-500)]"
            >
              {isLoading ? "Wird angemeldet..." : "Anmelden"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
