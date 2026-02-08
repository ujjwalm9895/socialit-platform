import Link from "next/link";

export type AIMLSectionData = {
  enabled?: boolean;
  title?: string;
  overview?: string;
  services?: { title: string; description?: string }[];
  products?: { title: string; description?: string }[];
  benefits?: string[];
  cta_text?: string;
  cta_link?: string;
};

type Props = { data: AIMLSectionData | null };

export default function AIMLSolutionsSection({ data }: Props) {
  if (!data) return null;
  if (data.enabled === false) return null;

  const title = data.title || "Artificial Intelligence & Machine Learning Solutions";
  const overview = data.overview || "";
  const services = Array.isArray(data.services) ? data.services : [];
  const products = Array.isArray(data.products) ? data.products : [];
  const benefits = Array.isArray(data.benefits) ? data.benefits : [];
  const ctaText = data.cta_text || "Talk to Our AI Experts";
  const ctaLink = data.cta_link || "/contact";

  return (
    <section className="border border-gray-200 rounded-xl p-6 sm:p-8 mb-10 bg-white shadow-sm" aria-labelledby="ai-ml-section-heading">
      <h2 id="ai-ml-section-heading" className="text-2xl font-bold text-gray-900 mb-4">
        {title}
      </h2>

      {overview && (
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          {overview}
        </p>
      )}

      {services.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Services Offered</h3>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-1.5 mb-6">
            {services.map((s, i) => (
              <li key={i}>
                {s.title && <strong className="text-gray-800">{s.title}</strong>}
                {s.description && <> — {s.description}</>}
              </li>
            ))}
          </ul>
        </>
      )}

      {products.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">AI Products</h3>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-1.5 mb-6">
            {products.map((p, i) => (
              <li key={i}>
                {p.title && <strong className="text-gray-800">{p.title}</strong>}
                {p.description && <> — {p.description}</>}
              </li>
            ))}
          </ul>
        </>
      )}

      {benefits.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Business Benefits</h3>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-1.5 mb-6">
            {benefits.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <Link
          href={ctaLink}
          className="btn-flashy inline-block bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-dark shadow-glow"
        >
          {ctaText}
        </Link>
      </div>
    </section>
  );
}
