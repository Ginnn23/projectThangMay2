import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

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

function setGoogleTranslateCookie(targetLang) {
  const cookieVal = targetLang === "en" ? "/vi/en" : "/vi/vi";
  const hostname = window.location.hostname;

  document.cookie = `googtrans=${cookieVal}; path=/;`;

  if (hostname && hostname !== "localhost") {
    document.cookie = `googtrans=${cookieVal}; path=/; domain=.${hostname};`;
    document.cookie = `googtrans=${cookieVal}; path=/; domain=${hostname};`;
  }

  if (targetLang === "vi") {
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    if (hostname && hostname !== "localhost") {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname};`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`;
    }
  }
}

function applyGoogleTranslate(targetLang) {
  setGoogleTranslateCookie(targetLang);

  const select = document.querySelector(".goog-te-combo");
  if (select) {
    if (targetLang === "en") {
      select.value = "en";
      select.dispatchEvent(new Event("change"));
    } else {
      select.value = "vi";
      select.dispatchEvent(new Event("change"));
      setTimeout(() => {
        window.location.reload();
      }, 120);
    }
  } else {
    // Nếu widget chưa mount xong, reload lại trang để script khởi tạo tự đọc cookie
    window.location.reload();
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("hahong_lang") || "vi";
  });
  const location = useLocation();

  // Đảm bảo cookie đồng bộ với state hiện tại khi tải ứng dụng
  useEffect(() => {
    document.documentElement.lang = lang;
    if (lang === "en") {
      setGoogleTranslateCookie("en");
    }
  }, [lang]);

  // Khi chuyển route mà đang ở chế độ Tiếng Anh, đảm bảo trigger dịch nội dung trang mới
  useEffect(() => {
    if (lang === "en") {
      const timer = setTimeout(() => {
        const select = document.querySelector(".goog-te-combo");
        if (select && select.value !== "en") {
          select.value = "en";
          select.dispatchEvent(new Event("change"));
        }
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, lang]);

  const toggleLanguage = useCallback(() => {
    const nextLang = lang === "vi" ? "en" : "vi";
    setLang(nextLang);
    localStorage.setItem("hahong_lang", nextLang);
    applyGoogleTranslate(nextLang);
  }, [lang]);

  const switchLanguage = useCallback((targetLang) => {
    if (targetLang === lang) return;
    setLang(targetLang);
    localStorage.setItem("hahong_lang", targetLang);
    applyGoogleTranslate(targetLang);
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
