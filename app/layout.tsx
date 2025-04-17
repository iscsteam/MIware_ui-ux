//layout.tsx
import type { Metadata } from 'next'

import { ThemeProvider } from '@/components/theme-provider' 
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Mi Ware',
  description: 'Created with v0',
  generator: 'v0.dev',
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
      </body>
    </html>
  )
}
              