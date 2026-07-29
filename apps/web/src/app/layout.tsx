import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { TRPCProvider } from "@/components/providers/TRPCProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const title = "SelfForge — Become the most confident version of yourself";
const description =
  "Your AI self-improvement mentor for fitness, nutrition, skincare, style, and discipline. One roadmap. Every day.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "SelfForge",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#0A0908",
          colorForeground: "#0A0908",
          colorMutedForeground: "#78746C",
          colorBackground: "#FFFFFF",
          borderRadius: "16px",
          fontFamily: "var(--font-inter)",
        },
      }}
    >
      <html
        lang="en"
        className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-white text-ink-950">
          <TRPCProvider>{children}</TRPCProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
