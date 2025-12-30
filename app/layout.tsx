import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { WalletProvider } from "@/components/WalletProvider";
import { WalletGate } from "@/components/WalletGate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Subber - Connect with Your Communities",
  description: "A next-generation platform for connecting with communities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WalletProvider>
          <WalletGate>
            <div className="flex">
              <Sidebar />
              <main className="flex-1 min-h-screen bg-background">
                <div className="max-w-7xl mx-auto">
                  {children}
                </div>
              </main>
            </div>
          </WalletGate>
        </WalletProvider>
      </body>
    </html>
  );
}
