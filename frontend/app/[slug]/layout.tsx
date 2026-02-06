// Dynamic segment: render on request, not at build time (slug comes from URL).
export const dynamic = "force-dynamic";

export default function SlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
