import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "HarvestGuard AI - Freshness Scanner",
  description: "AI-powered agricultural post-harvest produce quality analysis and tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="light">
        <head>
          {/* Google Fonts */}
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
          {/* Material Symbols */}
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="bg-background text-on-surface font-body-md min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
