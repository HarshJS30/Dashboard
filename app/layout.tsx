import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

// Load Outfit from Google Fonts via next/font
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Department Dashboard",
  description: "Dashboard with department and post details",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
