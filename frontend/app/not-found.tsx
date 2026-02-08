import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="text-gray-600 mt-2">This page could not be found.</p>
      <Link href="/" className="mt-6 text-primary hover:underline font-medium">
        Back to home
      </Link>
    </div>
  );
}
