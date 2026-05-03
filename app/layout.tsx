import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/Web3Provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-space-mono" });

export const metadata: Metadata = {
  title: "Aegis Protocol | Visual Forensics",
  description: "Decentralized source of truth for digital imagery using AI and blockchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceMono.variable} antialiased bg-gray-950 text-white min-h-screen relative overflow-x-hidden`}>
        <div className="scanlines"></div>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
