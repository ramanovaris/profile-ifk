import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* Film grain overlay — fixed, non-interaktif */}
      <div aria-hidden className="noise-layer" />
    </>
  );
}
