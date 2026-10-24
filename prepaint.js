/**
 * Runs inline in <head> before the first paint, so a dark-mode phone never
 * flashes white and the Wall Display panel never sees an opaque page.
 *
 * The panel (wall-display2) sets html[data-embed="wall-display"] before any
 * script runs; older builds only identify through the user agent. Embedded,
 * the page is always dark: the panel draws a dark gradient behind it.
 * Otherwise it follows the system, live. It also sets html lang from the
 * stored language ("home.lang", German by default) for the first paint.
 *
 * Vite apps get it from the plugin in @mqtt-home/ui/vite; other builds paste
 * PREPAINT into an inline <script> in <head>.
 */
export const PREPAINT = `(function () {
  var root = document.documentElement
  try {
    var lang = localStorage.getItem('home.lang')
    root.lang = lang === 'en' ? 'en' : 'de'
  } catch (e) {}
  if (!root.dataset.embed && / WallDisplay\\//.test(navigator.userAgent)) root.dataset.embed = 'wall-display'
  var embedded = root.dataset.embed === 'wall-display'
  // Only the page the panel shows directly sits at the screen edge; an app
  // framed inside it (the start page's app view) is already below a header.
  var top = true
  try { top = window.self === window.top } catch (e) { top = false }
  if (embedded && top) root.dataset.embedTop = ''
  var mq = matchMedia('(prefers-color-scheme: dark)')
  function apply() {
    var dark = embedded || mq.matches
    root.classList.toggle('dark', dark)
    root.dataset.theme = dark ? 'dark' : 'light'
  }
  apply()
  if (mq.addEventListener) mq.addEventListener('change', apply)
})()`
