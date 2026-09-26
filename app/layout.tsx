import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASCENSION — Account",
  description: "Sign in to ASCENSION to track and manage your orders.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
