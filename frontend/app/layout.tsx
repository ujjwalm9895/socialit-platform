import "./globals.css";

export const metadata = {
  title: "Social IT – Digital Solutions",
  description: "We build amazing digital solutions for your business",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-zensar-surface text-zensar-dark antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
