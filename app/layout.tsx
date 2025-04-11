import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider' // adjust path if needed

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
