// app/providers.tsx
'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import { type ThemeProviderProps } from 'next-themes'
import { ThemeProvider as StaticProvider } from 'next-themes'
// import { SessionProvider as SessionProviderReact } from "next-auth/react";

interface Props {
  children: React.ReactNode;
}

const DynProvider = dynamic(
  () => import('next-themes').then((e) => e.ThemeProvider),
  {
    ssr: false,
  }
)

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const NextThemeProvider =
    process.env.NODE_ENV === 'production' ? StaticProvider : DynProvider
  return <NextThemeProvider {...props}>{children}</NextThemeProvider>
}

// export function SessionProvider({ children }: Props) {
//   return <SessionProviderReact>{children}</SessionProviderReact>;
// }