import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const translations = {
  vi: {
    home: "Trang chủ",
    about: "Giới thiệu",
    services: "Dịch vụ",
    projects: "Dự án",
    cabinStudio: "Thiết kế Cabin",
    estimator: "Dự toán báo giá",
    news: "Tin tức",
    contact: "Liên hệ",
    quoteButton: "Yêu cầu báo giá",
    hotline: "Hotline 24/7",
    email: "Email liên hệ"
  },
  en: {
    home: "Home",
    about: "About Us",
    services: "Services",
    projects: "Projects",
    cabinStudio: "Cabin Studio 2.5D",
    estimator: "Cost Estimator",
    news: "News & Insights",
    contact: "Contact",
    quoteButton: "Request Quote",
    hotline: "24/7 Hotline",
    email: "Contact Email"
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("hahong_lang") || "vi";
  });

  const toggleLanguage = () => {
    setLang((prev) => {
      const next = prev === "vi" ? "en" : "vi";
      localStorage.setItem("hahong_lang", next);
      return next;
    });
  };

  const switchLanguage = (targetLang) => {
    setLang(targetLang);
    localStorage.setItem("hahong_lang", targetLang);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = translations[lang] || translations.vi;

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: "vi",
      toggleLanguage: () => {},
      switchLanguage: () => {},
      t: translations.vi
    };
  }
  return context;
}
