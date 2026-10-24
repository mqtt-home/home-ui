# @mqtt-home/ui

The shared look of the mqtt-home web UIs ("Home OS v2"): colour tokens for light,
dark and the Wall Display panel, the Geist fonts, the common components, the
prepaint script and the German/English helper. The start page
(`home-portal`) and every service UI build on it, so a theme change is a
version bump instead of a copy into twenty repositories.

No build step: the package is plain CSS and JavaScript with type definitions.

## Install

Installed from a Git tag, not from a registry:

```json
"dependencies": {
  "@mqtt-home/ui": "github:mqtt-home/home-ui#v0.1.0"
}
```

pnpm downloads the tagged tarball from GitHub (no `git` needed in CI) and
records its commit in the lockfile. The 7-day `minimumReleaseAge` rule applies to
registry packages only, so our own releases are usable at once while its two
dependencies (`@fontsource-variable/geist`, `-mono`) stay under the rule.
Renovate updates the tag like any other dependency.

## Use

### Styles

A Tailwind 4 app imports it right after Tailwind and keeps only its own styles:

```css
@import "tailwindcss";
@import "@mqtt-home/ui/tailwind.css";

@layer components {
  /* the app's own components, on the tokens */
}
```

Without Tailwind (ESP32 web UIs, other stacks): `@import "@mqtt-home/ui/css";`.
Single parts: `@mqtt-home/ui/tokens.css`, `/embed.css`, `/fonts.css`.

| File | What |
|---|---|
| `css/tokens.css` | `--canvas`, `--surface*`, `--line*`, `--ink*`, `--accent*`, status (`--ok`, `--warn`, `--alert`, `--info`, `--idle`), energy and group colours, elevation, radii, motion. Dark on `html.dark` / `[data-theme=dark]`. |
| `css/base.css` | page defaults (`@layer base`), `.touch-target` |
| `css/components.css` | `.num` `.mono` `.top-bar` `.greeting` `.when` `.kicker` `.pill` `.field` `.seg` `.btn` (`.primary`) `.icon-btn` `.sec-title` `.ico` (tinted by `--c`) `.dot` `.card` `.card-h` `.card-b` `.alert-banner` `.meter` (`@layer components`) |
| `css/embed.css` | Wall Display embed mode, see below |
| `css/tailwind.css` | all of the above plus the dark variant, the Tailwind colour names on the tokens and the `px-safe` utility |

An app overrides a component simply by defining it again in its own
`@layer components`; it comes later, so it wins.

### Prepaint (dark mode and Wall Display detection)

Vite apps add the plugin; it puts the script first into `<head>`, so
`index.html` carries no copy:

```ts
import { homeUi } from '@mqtt-home/ui/vite'
export default defineConfig({ plugins: [react(), tailwindcss(), homeUi()] })
```

Other builds paste `PREPAINT` from `@mqtt-home/ui/prepaint` into an inline
`<script>` in `<head>`. It follows the system appearance live and is always dark
inside the Wall Display panel.

### German / English

```ts
import { createI18n, type I18n as BaseI18n } from '@mqtt-home/ui/i18n'

const dict = {
  de: { title: 'Lüftung', 'state.on': 'An' },
  en: { title: 'Ventilation', 'state.on': 'On' },
}
export type I18n = BaseI18n<keyof (typeof dict)['de']>
export const { I18nProvider, useI18n } = createI18n(dict)
```

`useI18n()` gives `t(key, vars)` with `{placeholders}`, `tx(text)` for
configured `{de, en, "*"}` texts, `num(n, decimals = 0)` in the locale (8,5),
`ago(iso)` ("vor 3 min"), `lang`, `locale` and `setLang`. German is the default;
the choice is stored per device and origin under `home.lang`. The keys `ago.*`
and `language` come with the package. `<LangSwitch i18n={i} />` renders the DE/EN
switch.

## Wall Display embed mode

The iPad wall panel (wall-display2) shows the start page and the services in a
transparent web view over its own gradient. It sets
`html[data-embed="wall-display"]` and injects its tokens (`--wd-*`, in
`<style id="wall-display-tokens">`) into every frame; the prepaint script also
detects its user agent (` WallDisplay/`). `embed.css` then maps the Home OS
tokens onto the panel's: transparent page, frosted `--wd-surface` cards,
`--wd-surface-raised` controls, hairline strokes, no shadows, `color-scheme: dark`
(the panel sets it only in its main frame, so every UI must set it itself),
icons by colour without a filled chip, headers `--wd-edge-inset` (10px) off the
top edge, 44pt targets. Status, energy and group colours stay.

Everything is gated on the attribute; normal browsers are unaffected. An app
adds rules for its own components the same way:

```css
:root[data-embed="wall-display"] .my-tile { background: var(--wd-surface); border-color: var(--wd-stroke); box-shadow: none; }
```

Check it by rendering: set the attribute and paint the panel's gradient on
`html` (see the `new-mqtt-service` skill in homeserver-gitops,
`scripts/cdp-shot.mjs`).

## Release

Change, then tag:

```bash
git tag v0.2.0 && git push origin main v0.2.0
```

Patch for fixes, minor for new tokens or components, major when a class or token
is renamed or removed (apps break silently: a missing class just looks wrong).
