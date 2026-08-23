import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { constructMetadata } from "@/lib/seo/metadata";
import { getLocalBusinessSchema } from "@/lib/seo/structured-data";
import PublicLayoutWrapper from "@/components/layout/PublicLayoutWrapper";
import { AuthProvider } from "@/context/AuthContext";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = constructMetadata({
  title: "Allwin School of Music | Premium Music Education in Salem Since 2007",
  description:
    "Allwin School of Music & Musicals in Salem, TN. Structured Western & Classical music classes, Keyboard, Guitar, Violin, Vocal, Bharatham & Theory. Trinity College London & Annamalai University Affiliated.",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = getLocalBusinessSchema();

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-surface text-text-primary selection:bg-purple-light/20 selection:text-navy">
        <AuthProvider>
          <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
