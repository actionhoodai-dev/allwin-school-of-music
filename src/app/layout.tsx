import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { constructMetadata } from "@/lib/seo/metadata";
import { getLocalBusinessSchema } from "@/lib/seo/structured-data";
import PublicLayoutWrapper from "@/components/layout/PublicLayoutWrapper";
import { AuthProvider } from "@/context/AuthContext";
import { StudentAuthProvider } from "@/context/StudentAuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SettingsProvider } from "@/context/SettingsContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
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
    <html lang="en" suppressHydrationWarning className={`${poppins.variable} font-sans`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Enforce pure light theme across the application */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                localStorage.setItem('allwin_theme', 'light');
                document.documentElement.classList.remove('dark');
                document.documentElement.setAttribute('data-theme', 'light');
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-surface text-slate-900 selection:bg-blue-100 selection:text-blue-900 transition-colors duration-200">
        <AuthProvider>
          <StudentAuthProvider>
            <ThemeProvider>
              <SettingsProvider>
                <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
              </SettingsProvider>
            </ThemeProvider>
          </StudentAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

