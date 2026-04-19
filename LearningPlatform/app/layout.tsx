import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { NavigationMetrics } from '@/components/perf/navigation-metrics'
import { PrefetchRoutes } from '@/components/perf/prefetch-routes'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "BrainStack",
  description: "BrainStack: courses, lessons, and learning content management.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The nonce is generated per-request in middleware.ts and forwarded via the
  // x-nonce request header.  Applying it to the inline theme-init script allows
  // the Content-Security-Policy to block all OTHER inline scripts while still
  // permitting this one - eliminating the need for 'unsafe-inline' in script-src.
  // Use `undefined` when the header is absent so React omits the attribute
  // (rendering `nonce=""` causes hydration mismatches if the client
  // later applies a real nonce). `headers().get` may return null during
  // certain server-rendering scenarios, so prefer `undefined` over an
  // empty string to avoid emitting an empty attribute.
  const rawNonce = (await headers()).get('x-nonce')
  // Never pass '' — React/Next can serialize that as nonce="" and mismatch a later render that has a real nonce.
  const nonce = typeof rawNonce === 'string' && rawNonce.length > 0 ? rawNonce : undefined

  const themeInitScript = `(function(){try{var k='theme';var v=localStorage.getItem(k);var r=document.documentElement;if(v==='dark'){r.classList.add('dark');}else if(v==='light'){r.classList.remove('dark');}else{r.classList.add('dark');}}catch(e){try{document.documentElement.classList.add('dark');}catch(_){}} })()`
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Explicit favicon link to ensure the app/favicon.ico is used */}
        <link rel="icon" href="/favicon.ico" />
        <script
          suppressHydrationWarning
          {...(nonce ? { nonce } : {})}
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased`}
      >
        <NavigationMetrics />
        <PrefetchRoutes />
        {children}
      </body>
    </html>
  );
}
