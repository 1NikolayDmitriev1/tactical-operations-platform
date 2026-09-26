import { en } from "./en";
import { ua } from "./ua";

export type Language = "en" | "ua";

export const translations = {
  en,
  ua,
} as const;

export type { TranslationSchema } from "./en";
