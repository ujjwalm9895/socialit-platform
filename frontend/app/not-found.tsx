import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-zensar-surface">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="text-gray-600 mt-2">This page could not be found.</p>
      <Link href="/" className="btn-flashy mt-6 inline-block rounded-xl bg-primary px-5 py-2.5 text-white font-medium hover:bg-primary-dark">
        Back to home
      </Link>
      <p className="mt-4 text-sm text-zensar-muted">The page you’re looking for doesn’t exist or was moved.</p>
    </div>
  );
}
