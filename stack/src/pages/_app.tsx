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
        {/* Google Search Content. */}
        <meta name="google-site-verification" content="RpstMfEa6Qd_e_oHW3JVKU-et-AJcLRoYn5_fWxnKhs" />
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