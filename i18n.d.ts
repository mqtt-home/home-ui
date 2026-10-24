import type { ReactNode, JSX } from 'react'

export type Lang = 'de' | 'en'
export declare const LANGS: Lang[]

/** A configured text per language; "*" applies to every language. */
export type Text = Record<string, string>

/** Keys every house UI gets from the package. */
export type CommonKey = 'ago.now' | 'ago.min' | 'ago.h' | 'ago.d' | 'language'

export interface I18n<K extends string = string> {
  lang: Lang
  locale: string
  setLang: (l: Lang) => void
  /** A UI string with {placeholders}. */
  t: (key: K | CommonKey, vars?: Record<string, string | number>) => string
  /** A configured text in the current language. */
  tx: (text: Text | null | undefined) => string
  /** A number in the current locale (8,5 in German); 0 decimals by default. */
  num: (n: number, decimals?: number) => string
  /** "vor 3 min" / "3 min ago". */
  ago: (iso: string | null | undefined, now?: number) => string
}

export declare function resolveText(text: Text | null | undefined, lang: Lang): string

/** German first; the English dictionary may lack keys (they fall back to the key). */
export declare function createI18n<D extends { de: Record<string, string>; en: Partial<Record<keyof D['de'], string>> }>(
  dict: D,
  options?: { storageKey?: string; defaultLang?: Lang },
): {
  I18nProvider: (props: { children?: ReactNode }) => JSX.Element
  useI18n: () => I18n<Extract<keyof D['de'], string>>
}

export declare function LangSwitch(props: { i18n: I18n<any>; className?: string }): JSX.Element
