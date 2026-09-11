import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { getSiteSettings } from "@/actions/setting";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <>
      <Navbar settings={settings} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      {/* Film grain overlay — fixed, non-interaktif */}
      <div aria-hidden className="noise-layer" />
    </>
  );
}
