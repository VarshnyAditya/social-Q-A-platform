import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/lib/AuthContext";
import { LanguageProvider } from "@/lib/LanguageContext";
import OfflineOverlay from "@/components/OfflineOverlay";
import Head from "next/head";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Code-Quest</title>
      </Head>
      <LanguageProvider>
        <AuthProvider>
          <ToastContainer />
          <OfflineOverlay />
          <Component {...pageProps} />
        </AuthProvider>
      </LanguageProvider>
    </>
  );
}