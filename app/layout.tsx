import type { Metadata } from "next";
import "./globals.css";
import { PeriodProvider } from "@/components/Header";
import { ThemeProvider, THEME_NO_FLASH_SCRIPT } from "@/components/Theme";

export const metadata: Metadata = {
  title: "OPS.Supervisor · UX prototypes",
  description: "Interactive UX prototypes for OPS.Supervisor",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Sets the `dark` class before hydration so there's no flash of the wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: THEME_NO_FLASH_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <PeriodProvider>{children}</PeriodProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
