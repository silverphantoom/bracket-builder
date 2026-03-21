import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Bracket Builder — Make anything a tournament",
  description:
    "Create a bracket, share a link, watch the votes pour in. No login required.",
  openGraph: {
    title: "Bracket Builder — Make anything a tournament",
    description:
      "Create a bracket, share a link, watch the votes pour in. No login required.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${mono.variable} dark`}>
      <body className="min-h-screen bg-bg-primary text-text-primary font-jakarta antialiased">
        {children}
      </body>
    </html>
  );
}
