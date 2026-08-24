import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { constructMetadata } from "@/lib/seo/metadata";
import { getLocalBusinessSchema } from "@/lib/seo/structured-data";
import PublicLayoutWrapper from "@/components/layout/PublicLayoutWrapper";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SettingsProvider } from "@/context/SettingsContext";

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
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Anti-flash inline script for dark theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('allwin_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-surface dark:bg-[#070e1b] text-text-primary dark:text-slate-100 selection:bg-purple-light/20 selection:text-navy transition-colors duration-300">
        <AuthProvider>
          <ThemeProvider>
            <SettingsProvider>
              <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
            </SettingsProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
