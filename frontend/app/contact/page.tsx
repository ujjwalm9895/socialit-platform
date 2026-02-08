"use client";

import PublicLayout from "../../components/PublicLayout";

export default function ContactPage() {
  return (
    <PublicLayout>
      <main className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact us</h1>
        <p className="text-gray-600 mb-8">
          Get in touch for projects, partnerships, or questions. We’ll respond as soon as we can.
        </p>
        <div className="space-y-4 text-gray-700">
          <p>
            <strong>Email:</strong>{" "}
            <a href="mailto:hello@socialit.com" className="text-indigo-600 hover:underline">
              hello@socialit.com
            </a>
          </p>
          <p>
            <strong>Address:</strong> Your company address here
          </p>
        </div>
        <p className="mt-8 text-sm text-gray-500">
          You can also create a CMS page with slug <code className="bg-gray-100 px-1 rounded">contact</code> in the admin to replace this placeholder with custom content.
        </p>
      </main>
    </PublicLayout>
  );
}
