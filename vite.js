import { PREPAINT } from './prepaint.js'

/**
 * Vite plugin: puts the prepaint script (dark mode + Wall Display detection)
 * first into <head> of every page, so index.html needs no copy of it.
 *
 *   import { homeUi } from '@mqtt-home/ui/vite'
 *   export default defineConfig({ plugins: [react(), tailwindcss(), homeUi()] })
 */
export function homeUi() {
  return {
    name: 'mqtt-home-ui',
    transformIndexHtml() {
      return [{ tag: 'script', children: PREPAINT, injectTo: 'head-prepend' }]
    },
  }
}
