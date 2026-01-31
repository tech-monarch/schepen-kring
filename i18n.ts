const i18n = {
  defaultLocale: "en",
  locales: ["en", "nl"],
};

export default i18n;

export type Locale = (typeof i18n)["locales"][number];
