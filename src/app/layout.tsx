import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "NutriTrack UK | AI-Powered Calorie Counter",
  description: "The smartest, fastest calorie tracker for the UK market. Featuring a 500k+ UK food database, barcode scanning, and AI nutrition coaching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${inter.variable} ${outfit.variable} antialiased min-h-screen pb-20 md:pb-0`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
