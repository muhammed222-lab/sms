import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import Footer from "./components/footer";
import { AuthProvider } from "./components/AuthProvider"; // Assuming this manages Firebase auth
import Chat from "./components/chat";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Smsglobe",
  description: "Secure an Instant SMS Verification",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <html lang="en">
        <head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no"
          />
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
          />
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Smsglobe",
              url: "https://www.smsglobe.net",
              potentialAction: [
                {
                  "@type": "SearchAction",
                  target:
                    "https://www.smsglobe.net/search?q={search_term_string}",
                  "query-input": "required name=search_term_string",
                },
                {
                  "@type": "RegisterAction",
                  target: "https://www.smsglobe.net/signup",
                },
                {
                  "@type": "LoginAction",
                  target: "https://www.smsglobe.net/signin",
                },
                {
                  "@type": "ContactAction",
                  target: "https://www.smsglobe.net/contact",
                },
                {
                  "@type": "FAQPage",
                  url: "https://www.smsglobe.net/faq",
                },
                {
                  "@type": "OfferCatalog",
                  name: "Pricing",
                  url: "https://www.smsglobe.net/pricing",
                },
              ],
            })}
          </script>
        </head>
        <body
          className={`container ${geistSans.variable} ${geistMono.variable}`}
        >
          {children}
          <Chat />
          <Footer />
        </body>
      </html>
    </AuthProvider>
  );
}
