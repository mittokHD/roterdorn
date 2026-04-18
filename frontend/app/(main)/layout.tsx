import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ReadingProgress from "@/components/ui/ReadingProgress";
import { AuthProvider } from "@/contexts/AuthContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ReadingProgress />
      <Header />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
    </AuthProvider>
  );
}
