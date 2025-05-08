//layout.tsx
import type { Metadata } from 'next'

import { ThemeProvider } from '@/components/theme-provider' 
import '@/styles/globals.css'
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'Mi Ware',
  description: 'Created with ISCS',
  generator: 'ISCS.dev',
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
              