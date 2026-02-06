// Dynamic segment: render on request, not at build time.
export const dynamic = "force-dynamic";

export default function BlogSlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
