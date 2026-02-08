import "./globals.css";

export const metadata = {
  title: "Social IT – Digital Solutions",
  description: "We build amazing digital solutions for your business",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zensar-surface text-zensar-dark antialiased">
        {children}
      </body>
    </html>
  );
}
