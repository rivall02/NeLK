import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ZoomPrevent } from "@/components/providers/zoom-prevent";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "NeLK — Learn. Plan. Grow.",
  description:
    "AI-powered personal learning & productivity platform untuk mahasiswa. Hubungkan pengetahuan, jadwal, tugas, dan tujuan dalam satu workspace.",
  keywords: ["NeLK", "NextLink", "learning", "productivity", "AI", "mahasiswa", "student"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NeLK",
  },
  icons: {
    apple: "/assets/images/secondry-logo.png",
    icon: "/assets/images/secondry-logo.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#7c5cfc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} font-sans antialiased touch-pan-x touch-pan-y`}>
        <ZoomPrevent />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
