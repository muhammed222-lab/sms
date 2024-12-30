import { ClerkProvider } from "@clerk/nextjs";
import type { AppProps } from "next/app";
import "../styles/globals.css"; // Adjust the path to your global CSS file

function MyApp({ Component, pageProps }: AppProps) {
  const clerkFrontendApi = process.env.NEXT_PUBLIC_CLERK_FRONTEND_API;

  return (
    <ClerkProvider publishableKey={clerkFrontendApi}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

export default MyApp;
