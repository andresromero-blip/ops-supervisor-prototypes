import type { Metadata } from "next";
import "./globals.css";
import { PeriodProvider } from "@/components/Header";

export const metadata: Metadata = {
  title: "OPS.Supervisor · UX prototypes",
  description: "Interactive UX prototypes for OPS.Supervisor",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PeriodProvider>{children}</PeriodProvider>
      </body>
    </html>
  );
}
