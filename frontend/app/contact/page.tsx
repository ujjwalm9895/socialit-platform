"use client";

import PublicLayout from "../../components/PublicLayout";

export default function ContactPage() {
  return (
    <PublicLayout>
      <main className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-zensar-dark mb-2">Contact us</h1>
        <p className="text-zensar-muted mb-8">
          Get in touch for projects, partnerships, or questions. We’ll respond as soon as we can.
        </p>
        <div className="hover-lift rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-4 text-gray-700">
            <p>
              <strong className="text-zensar-dark">Email:</strong>{" "}
              <a href="mailto:hello@socialit.com" className="link-underline text-primary font-medium">
                hello@socialit.com
              </a>
            </p>
            <p>
              <strong className="text-zensar-dark">Address:</strong> Your company address here
            </p>
          </div>
        </div>
        <p className="mt-6 text-sm text-zensar-muted">
          You can also create a CMS page with slug <code className="bg-zensar-surface px-1.5 py-0.5 rounded">contact</code> in the admin to replace this with custom content.
        </p>
      </main>
    </PublicLayout>
  );
}
