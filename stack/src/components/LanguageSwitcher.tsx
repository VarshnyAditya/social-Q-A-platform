import { useLanguage } from "@/lib/LanguageContext";
import { Globe, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const LANGUAGE_ORDER = ["en", "es", "hi", "pt", "zh", "fr"];

const LanguageSwitcher = () => {
  const {
    language,
    t,
    pendingLanguage,
    otpChannel,
    maskedDestination,
    loading,
    requestLanguageChange,
    verifyLanguageChange,
    cancelLanguageChange,
  } = useLanguage();

  const [open, setOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (lang: string) => {
    setOpen(false);
    await requestLanguageChange(lang);
  };

  const handleVerify = async () => {
    if (!otp.trim()) return;
    const ok = await verifyLanguageChange(otp.trim());
    if (ok) setOtp("");
  };

  const handleCancel = () => {
    setOtp("");
    cancelLanguageChange();
  };

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((s) => !s)}
          aria-label={t("language.switchLanguage")}
          className="flex items-center gap-1.5 text-sm font-medium text-[#454545] px-3 py-1.5 rounded hover:bg-gray-200 transition"
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{t(`languageNames.${language}`)}</span>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            {LANGUAGE_ORDER.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleSelect(lang)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${
                  lang === language ? "font-semibold text-orange-600" : "text-gray-700"
                }`}
              >
                {t(`languageNames.${lang}`)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* OTP verification modal — shown once a language switch has been requested */}
      {pendingLanguage && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
            <button
              onClick={handleCancel}
              aria-label={t("common.close")}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {t("language.verificationRequired")}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {otpChannel === "email" ? t("language.otpSentEmail") : t("language.otpSentMobile")}
              {maskedDestination ? ` (${maskedDestination})` : ""}
            </p>

            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder={t("language.enterOtp")}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-300 mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={handleVerify}
                disabled={loading || !otp.trim()}
                className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded transition"
              >
                {t("language.verifyAndSwitch")}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 text-sm font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LanguageSwitcher;
