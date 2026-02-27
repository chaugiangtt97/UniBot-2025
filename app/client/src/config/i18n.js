import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-xhr-backend";
import { initReactI18next } from "react-i18next";

const fallbackLng = ["fr"];

i18n
  .use(Backend) // used to load data from othe directory
  .use(LanguageDetector) // detects the current language
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    fallbackLng, // default language
    detection: {
        order: ["localStorage", "cookie", "navigator"],
        caches: ["localStorage"],
        checkWhitelist: true,
    },
    backend: {
      // Đổi tại đây:
      loadPath: '/unibot/locales/{{lng}}/{{ns}}.json',
    },
    debug: false,
    interpolation: {
      escapeValue: false, // no need for react. it escapes by default
    },
  });

export default i18n;