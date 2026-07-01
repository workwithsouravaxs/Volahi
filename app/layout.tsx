import type { Metadata } from "next";
import { Instrument_Sans, Nunito } from "next/font/google";
import "./globals.css";
import StoreSyncInitializer from "@/components/StoreSyncInitializer";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Volahi | Premium Women's Fashion",
  description: "Experience the elegance of Volahi. Curated sarees, lehengas, and designer wear for the modern woman.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSans.variable} ${nunito.variable}`}>
      <body className="min-h-screen">
        <StoreSyncInitializer />
        {children}
      </body>
    </html>
  );
}

