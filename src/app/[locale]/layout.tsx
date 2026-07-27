import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Great_Vibes,
  Inter,
  Kantumruy_Pro,
  Moul,
  Playfair_Display,
} from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { AuthProvider } from "@/contexts/AuthContext";
import { EnvTag } from "@/components/ui/EnvTag";
import "./globals.css";

const moul = Moul({
  variable: "--font-moul",
  subsets: ["khmer"],
  weight: "400",
});

const kantumruy = Kantumruy_Pro({
  variable: "--font-kantumruy",
  subsets: ["khmer", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Khmer E-Invitation",
  description:
    "Beautiful animated Khmer-style digital invitations for weddings, birthdays, and special events.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className={`${moul.variable} ${kantumruy.variable} ${playfair.variable} ${inter.variable} ${greatVibes.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <AuthProvider>{children}</AuthProvider>
        </NextIntlClientProvider>
        <EnvTag />
      </body>
    </html>
  );
}
