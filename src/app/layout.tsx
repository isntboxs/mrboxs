import type { Metadata } from "next";

import "@/styles/globals.css";

import { geistMono, geistSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { WrapperQueryProvider } from "@/components/providers/wrapper-query-provider";

export const metadata: Metadata = {
  title: "mrboxs",
  description: "a personal website",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: dark)",
        href: "https://j85ducwzne.ufs.sh/f/3tEolv156eYjnjPhoMt3agoYM2VHKlrbieBQPO3F6XWLGRzu",
        url: "https://j85ducwzne.ufs.sh/f/3tEolv156eYjnjPhoMt3agoYM2VHKlrbieBQPO3F6XWLGRzu",
      },
      {
        media: "(prefers-color-scheme: light)",
        href: "https://j85ducwzne.ufs.sh/f/3tEolv156eYjnjPhoMt3agoYM2VHKlrbieBQPO3F6XWLGRzu",
        url: "https://j85ducwzne.ufs.sh/f/3tEolv156eYjnjPhoMt3agoYM2VHKlrbieBQPO3F6XWLGRzu",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={cn(
          "font-geist-sans antialiased",
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <WrapperQueryProvider>{children}</WrapperQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
