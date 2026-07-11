import { useState, useEffect, useCallback } from "react";
import { createContext, useContext } from "react";
import { toast } from "react-toastify";
import axiosInstance from "./axiosinstance";

import en from "@/locales/en.json";
import es from "@/locales/es.json";
import hi from "@/locales/hi.json";
import pt from "@/locales/pt.json";
import zh from "@/locales/zh.json";
import fr from "@/locales/fr.json";

const dictionaries = { en, es, hi, pt, zh, fr };

const LanguageContext = createContext();

// Looks up a dot-separated key ("nav.askQuestion") in a dictionary object.
// Falls back to English, then to the key itself, so a missing translation
// never breaks the UI — it just shows English or the raw key.
const lookup = (dict, key) => {
  const parts = key.split(".");
  let node = dict;
  for (const part of parts) {
    if (node == null) return undefined;
    node = node[part];
  }
  return node;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");
  const [pendingLanguage, setPendingLanguage] = useState(null);
  const [otpChannel, setOtpChannel] = useState(null); // "email" | "mobile"
  const [maskedDestination, setMaskedDestination] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("preferredLanguage");
    if (stored && dictionaries[stored]) setLanguage(stored);

    // If the user's already logged in, their saved preference on the
    // account takes priority over whatever's in localStorage.
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.preferredLanguage && dictionaries[parsed.preferredLanguage]) {
          setLanguage(parsed.preferredLanguage);
        }
      } catch {
        /* ignore malformed storage */
      }
    }
  }, []);

  const t = useCallback(
    (key) => {
      const dict = dictionaries[language] || dictionaries.en;
      const value = lookup(dict, key);
      if (value !== undefined) return value;
      const fallback = lookup(dictionaries.en, key);
      return fallback !== undefined ? fallback : key;
    },
    [language]
  );

  // STEP 1: user picks a target language -> ask backend to send OTP
  // (email for French, mobile for everything else)
  const requestLanguageChange = async (targetLanguage) => {
    if (targetLanguage === language) {
      toast.info(t("language.alreadyActive"));
      return { started: false };
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post("/language/request-otp", { targetLanguage });
      const { message, verificationChannel, maskedDestination: masked, devOtp } = res.data;

      setPendingLanguage(targetLanguage);
      setOtpChannel(verificationChannel);
      setMaskedDestination(masked);

      toast.info(`${message} (${masked})`);

      if (devOtp) {
        // Dev-mode-only reveal, stays on screen longer so there's time to copy it.
        toast.warn(`${t("language.devOtpNotice")} ${devOtp}`, { autoClose: 15000 });
      }

      return { started: true, verificationChannel, maskedDestination: masked };
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to send OTP";
      toast.error(msg);
      return { started: false };
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: verify the OTP -> actually apply the switch
  const verifyLanguageChange = async (otp) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/language/verify-otp", { otp });
      const { preferredLanguage } = res.data;

      setLanguage(preferredLanguage);
      localStorage.setItem("preferredLanguage", preferredLanguage);

      // keep the cached user object in sync too
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.preferredLanguage = preferredLanguage;
        localStorage.setItem("user", JSON.stringify(parsed));
      }

      toast.success(t("language.languageUpdated"));
      setPendingLanguage(null);
      setOtpChannel(null);
      setMaskedDestination("");
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || "OTP verification failed";
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelLanguageChange = () => {
    setPendingLanguage(null);
    setOtpChannel(null);
    setMaskedDestination("");
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        t,
        pendingLanguage,
        otpChannel,
        maskedDestination,
        loading,
        requestLanguageChange,
        verifyLanguageChange,
        cancelLanguageChange,
        supportedLanguages: Object.keys(dictionaries),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
