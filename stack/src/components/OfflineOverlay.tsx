import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

// Full-screen, on-brand "no internet" state — replaces what used to be an
// endless spinner with no explanation whenever a request silently failed
// because the connection dropped.
//
// Two independent signals feed this, since neither alone is reliable:
//  1. The browser's own online/offline events — instant for the obvious
//     cases (wifi/airplane mode toggled off).
//  2. Custom "app:offline" / "app:online" events dispatched by
//     axiosinstance.js whenever a request fails with no response at all
//     (vs. a normal 4xx/5xx from the API) — catches the "connected to wifi
//     but the internet itself is down" case that navigator.onLine misses.
export default function OfflineOverlay() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(typeof navigator !== "undefined" && !navigator.onLine);

    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    window.addEventListener("app:online", goOnline);
    window.addEventListener("app:offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("app:online", goOnline);
      window.removeEventListener("app:offline", goOffline);
    };
  }, []);

  const handleRetry = () => {
    // A full reload is the most reliable way to re-trigger every page's
    // data fetching once connectivity is actually back, rather than trying
    // to individually re-run whatever fetch each page was in the middle of.
    window.location.reload();
  };

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-white/95 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
          <WifiOff className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1.5">No Internet Connection</h2>
        <p className="text-sm text-gray-500 mb-6">
          Please check your internet connection and try again.
        </p>
        <button
          onClick={handleRetry}
          className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition"
        >
          Retry
        </button>
      </div>
    </div>
  );
}