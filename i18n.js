import { createContext, createElement, useCallback, useContext, useMemo, useState } from 'react'

export const LANGS = ['de', 'en']

/** Keys every house UI gets for free; an app's dictionary may override them. */
const COMMON = {
  de: {
    'ago.now': 'gerade eben',
    'ago.min': 'vor {n} min',
    'ago.h': 'vor {n} h',
    'ago.d': 'vor {n} d',
    language: 'Sprache',
  },
  en: {
    'ago.now': 'just now',
    'ago.min': '{n} min ago',
    'ago.h': '{n} h ago',
    'ago.d': '{n} d ago',
    language: 'Language',
  },
}

/** A configured text in one language; "*" applies to every language. */
export function resolveText(text, lang) {
  if (!text) return ''
  return text[lang] ?? text['*'] ?? text.en ?? text.de ?? Object.values(text)[0] ?? ''
}

function initialLang(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    if (v === 'de' || v === 'en') return v
  } catch {
    // storage blocked
  }
  return fallback
}

/**
 * German is the house language, English one tap away; the choice is per
 * device and shared by all house UIs on one origin through "home.lang".
 *
 *   export const { I18nProvider, useI18n } = createI18n({ de: {...}, en: {...} })
 */
export function createI18n(dict, { storageKey = 'home.lang', defaultLang = 'de' } = {}) {
  const words = {
    de: { ...COMMON.de, ...dict.de },
    en: { ...COMMON.en, ...dict.en },
  }
  const Ctx = createContext(null)

  function I18nProvider({ children }) {
    const [lang, setLangState] = useState(() => initialLang(storageKey, defaultLang))

    const setLang = useCallback((l) => {
      setLangState(l)
      try {
        localStorage.setItem(storageKey, l)
      } catch {
        // convenience only
      }
    }, [])

    const value = useMemo(() => {
      const locale = lang === 'de' ? 'de-DE' : 'en-GB'
      document.documentElement.lang = lang
      const t = (key, vars) =>
        (words[lang][key] ?? words.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => String(vars?.[k] ?? ''))
      const fmt = new Map()
      const num = (n, decimals = 0) => {
        let f = fmt.get(decimals)
        if (!f) {
          f = new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
          fmt.set(decimals, f)
        }
        return f.format(n)
      }
      const ago = (iso, now = Date.now()) => {
        if (!iso) return ''
        const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000))
        if (s < 60) return t('ago.now')
        if (s < 3600) return t('ago.min', { n: Math.floor(s / 60) })
        if (s < 86400) return t('ago.h', { n: Math.floor(s / 3600) })
        return t('ago.d', { n: Math.floor(s / 86400) })
      }
      return { lang, locale, setLang, t, tx: (text) => resolveText(text, lang), num, ago }
    }, [lang, setLang])

    return createElement(Ctx.Provider, { value }, children)
  }

  function useI18n() {
    const v = useContext(Ctx)
    if (!v) throw new Error('useI18n outside I18nProvider')
    return v
  }

  return { I18nProvider, useI18n }
}

/** The DE/EN switch (a .seg control). */
export function LangSwitch({ i18n, className }) {
  return createElement(
    'div',
    { className: className ? `seg ${className}` : 'seg', role: 'group', 'aria-label': i18n.t('language') },
    LANGS.map((l) =>
      createElement(
        'button',
        { key: l, type: 'button', 'aria-pressed': i18n.lang === l, onClick: () => i18n.setLang(l), lang: l },
        l.toUpperCase(),
      ),
    ),
  )
}
