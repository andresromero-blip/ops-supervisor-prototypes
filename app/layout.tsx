import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OPS.Supervisor · Prototipos UX",
  description: "Prototipos interactivos de UX para OPS.Supervisor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
