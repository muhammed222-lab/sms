import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Footer from "./components/footer";
import { AuthProvider } from "./components/AuthProvider";
import Chat from "./components/chat";
import Support from "./components/support/support";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Smsglobe - Secure Instant SMS Verification",
    template: "%s | Smsglobe",
  },
  description:
    "Get secure, instant SMS verification services with global coverage. Private, reliable phone numbers for verification needs.",
  keywords: [
    "SMS verification",
    "phone verification",
    "OTP service",
    "virtual numbers",
    "secure SMS",
    "temporary numbers",
  ],
  authors: [{ name: "Smsglobe Team", url: "https://smsglobe.net" }],
  creator: "Smsglobe",
  publisher: "Smsglobe",
  metadataBase: new URL("https://smsglobe.net"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Smsglobe - Secure Instant SMS Verification",
    description:
      "Get secure, instant SMS verification services with global coverage.",
    url: "https://smsglobe.net",
    siteName: "Smsglobe",
    images: [
      {
        url: "https://smsglobe.net/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Smsglobe - Secure SMS Verification",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smsglobe - Secure Instant SMS Verification",
    description:
      "Get secure, instant SMS verification services with global coverage.",
    images: ["https://smsglobe.net/twitter-image.jpg"],
    creator: "@smsglobe",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <html lang="en" className="scroll-smooth">
        <head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
          />
          <meta name="theme-color" content="#ffffff" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="black-translucent"
          />
          <meta name="format-detection" content="telephone=no" />

          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
            integrity="sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ=="
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />

          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Smsglobe",
              url: "https://www.smsglobe.net",
              logo: "https://www.smsglobe.net/logo.png",
              sameAs: [
                "https://twitter.com/smsglobe",
                "https://facebook.com/smsglobe",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+1-XXX-XXX-XXXX",
                contactType: "customer service",
                areaServed: "US,UK,CA,NG",
              },
            })}
          </script>
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
          suppressHydrationWarning={true}
        >
          {children}
          <Chat />
          <Support />
          <Footer />
        </body>
      </html>
    </AuthProvider>
  );
}
