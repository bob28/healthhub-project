import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import React from "react";

export const metadata: Metadata = {
  title: "HealthHub",
  description: "A health hub for all your health needs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className=" antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
