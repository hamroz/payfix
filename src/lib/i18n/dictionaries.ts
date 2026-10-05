// Every language's dictionary. Imported by server code only (the client receives its one
// dictionary through <I18nProvider>), so client bundles never carry all eight.
import type { Locale } from "./config";
import type { Messages } from "./messages";
import en from "./messages/en";
import ru from "./messages/ru";
import de from "./messages/de";
import pl from "./messages/pl";
import fi from "./messages/fi";
import es from "./messages/es";
import zh from "./messages/zh";
import hi from "./messages/hi";

export const dictionaries: Record<Locale, Messages> = {
  en,
  ru,
  de,
  pl,
  fi,
  es,
  zh,
  hi,
};

export { en };
