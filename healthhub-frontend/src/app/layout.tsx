import type { Metadata } from "next";
import "./globals.css";
import React from "react";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
  createTheme,
} from "@mantine/core";

const theme = createTheme({
  colors: {
    primary: [
      "#f3fbe7",
      "#e8f3d8",
      "#d0e4b5",
      "#b7d48e",
      "#a2c76e",
      "#95bf58",
      "#8dbb4c",
      "#79a43d",
      "#6b9233",
      "#5a7e26",
    ],
    secondary: [
      "#083344",
      "#083344",
      "#083344",
      "#083344",
      "#083344",
      "#083344",
      "#083344",
      "#083344",
      "#083344",
      "#083344",
    ],
    accent: [
      "#e3faff",
      "#d6eef6",
      "#b3d9e6",
      "#8dc3d6",
      "#6db0c8",
      "#57a4c0",
      "#499fbd",
      "#378aa7",
      "#297b96",
      "#066b85",
    ],
  },
});

export const metadata: Metadata = {
  title: "HealthHub",
  description: "A health hub for all your health needs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}
