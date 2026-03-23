
import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "HeHo - AI-Powered Backend & Database Orchestrator",
  description: "Deploy intelligent backends, autonomous data agents, and custom APIs powered by OpenRouter and Supabase.",
  applicationName: "HeHo",
  authors: [{ name: "Sparrow" }],
  creator: "Sparrow",
  source: "https://github.com/trucount/HeHo",
  keywords: [
    "AI", 
    "HeHo",
    "AI chatbot builder",
    "Backend orchestrator", 
    "OpenRouter", 
    "Supabase", 
    "No-code", 
    "AI Backend", 
    "Backend Builder",
    "Advanced analytics", 
    "Real-time data", 
    "One-click deployment", 
    "Theme customization", 
    "AI-assisted setup", 
    "Responsive design", 
    "Secure chatbot", 
    "Usage tracking", 
    "Public sharing",
    "Vercel",
    "Next.js",
    "React",
    "Sparrow",
    "AI assistant",
    "Custom chatbot",
    "Vercel deployment",
    "Next.js chatbot",
    "React chatbot",
    "Supabase database",
    "OpenRouter API",
    "autonomous backend",
    "data-driven AI",
    "AI chatbot for startups",
    "database chatbot",
    "REST API",
    "chatbot management",
    "AI models",
    "no-code platform",
    "open-source chatbot",
    "AI-powered database",
    "chatbot deployment",
    "AI integration",
    "business automation"
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "QO1hxfpzSpt5kNRRdz3Ex_J_C9k6ThQiNPdC-HOxz8U",
  },
  openGraph: {
    title: "HeHo - AI-Powered Backend & Database Orchestrator",
    description: "Deploy intelligent backends, autonomous data agents, and custom APIs powered by OpenRouter and Supabase.",
    url: "https://heho.vercel.app",
    siteName: "HeHo",
    images: [
      {
        url: 'https://heho.vercel.app/og-image.png', 
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en-US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "HeHo - AI-Powered Backend & Database Orchestrator",
    description: "Deploy intelligent backends, autonomous data agents, and custom APIs powered by OpenRouter and Supabase.",
    creator: '@sparrow_ps',
    images: ['https://heho.vercel.app/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
      </head>
      <body className="bg-background text-foreground">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
