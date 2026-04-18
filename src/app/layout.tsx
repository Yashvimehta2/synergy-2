import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClientProviders } from "./providers";

export const metadata: Metadata = {
  title: "GigID - Digital Identity for Gig Workers",
  description:
    "Secure, privacy-preserving digital identity platform for gig workers in India. Aggregate work history, build verifiable credentials, and access financial services.",
  keywords: [
    "gig workers",
    "digital identity",
    "verifiable credentials",
    "zero knowledge proof",
    "India",
    "fintech",
  ],
  authors: [{ name: "GigID" }],
  openGraph: {
    title: "GigID - Your Work, Your Identity",
    description: "Secure digital identity for gig workers in India",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
