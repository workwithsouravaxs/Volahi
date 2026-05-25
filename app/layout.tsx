import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import StoreSyncInitializer from "@/components/StoreSyncInitializer";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
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
    <html lang="en" className={`${poppins.variable}`}>
      <body className="min-h-screen">
        <StoreSyncInitializer />
        {children}
      </body>
    </html>
  );
}
