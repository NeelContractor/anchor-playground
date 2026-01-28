"use client";

import '@solana/wallet-adapter-react-ui/styles.css';
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ComponentProps, useEffect } from "react";

export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('anchorplayground-theme');
      if (!storedTheme) {
        document.documentElement.classList.add('solana');
        localStorage.setItem('anchorplayground-theme', 'solana');
      }
    }
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="solana"
      enableSystem={false}
      storageKey="anchorplayground-theme"
      disableTransitionOnChange
      themes={["light", "dark", "solana"]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}