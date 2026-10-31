# Die außerordentliche Geburtstagsprüfung

A small, mobile-first browser game for a birthday surprise. The player works through
four puzzles on an illustrated map of the *Akademie der höheren Wissenschaft*, opens a
PIN-locked vault and receives a (humorous, fictional) **Bierdiplom**.

Vanilla TypeScript + Vite. It has no backend, no external requests and no runtime
dependencies. All artwork is inline SVG and CSS.

## Customising

Everything you will want to change is in **`src/config.ts`**:

| What | Where |
| --- | --- |
| Recipient name (greeting + diploma) | `RECIPIENT_NAME` |
| Vault PIN (digits only, any length) | `VAULT_PIN` (this is the only place it's defined) |
| Vault hint text | `VAULT_HINT` |
| Puzzles, accepted answers, hints, story text | `LEVELS` |
| Wrong-answer quips | `WRONG_ANSWER_MESSAGES`, `WRONG_PIN_MESSAGES` |
| Diploma wording, issuing place | `DIPLOMA` |
| Grade on the diploma (by number of wrong answers) | `GRADES` |

**Change the placeholder PIN before you give it away**, e.g. to a number written on
the real gift or card.

Answer checking (`src/answers.ts`) ignores case, surrounding spaces, umlaut spelling
(ä/ae), a leading article and small typos (1 typo for words of 5–8 letters, 2 for longer
words). Numbers accept `4`, `4.0`, `4,0` and even `4 Liter`.

## Requirements

Node.js 18 or newer (tested with Node 20).

## Install and run

```bash
npm install
npm run dev
```

Vite prints two addresses, for example:

```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.178.23:5173/
```

Open the *Local* address on the laptop.

### Playing on a phone (same Wi-Fi)

1. Keep `npm run dev` running on the laptop.
2. Connect the phone to the **same Wi-Fi network** as the laptop.
3. On the phone, open the **Network** address that Vite printed (e.g. `http://192.168.178.23:5173/`).
4. If it does not load, check:
   * macOS may ask whether Node may accept incoming connections. Click **Allow**
     (System Settings → Network → Firewall → Options).
   * Guest Wi-Fi networks often block device-to-device traffic. Use the main network.
   * To find the laptop's IP manually on macOS: `ipconfig getifaddr en0`.

Tip: on the iPhone, *Share → Add to Home Screen* gives the game a full-screen app icon.

## Production build

```bash
npm run build
```

This type-checks the project and writes `dist/`, which contains:

* `dist/index.html`: the **entire game in one self-contained file** (JS and CSS inlined).
  You can double-click it to open it locally, email it, or put it on any static host.
* `dist/sw.js`: a small service worker that lets the game reload while offline when it
  is served over HTTPS or from `localhost`.

To serve the build on your network without the dev server:

```bash
npm run preview
```

It is then available at `http://<laptop-ip>:4173/`. You can also upload `dist/` to any
static host (Netlify Drop, GitHub Pages, Cloudflare Pages …). The game needs no server logic.

### Offline behaviour

Once the page has loaded, the game makes no further network requests, so it keeps
working if the connection drops. Reloading while offline works when the page is served
over HTTPS or from `localhost` (where the service worker can run), or when it is opened
from the single `index.html` file. Over a plain `http://192.168…` address, browsers don't
allow service workers, so a reload needs the laptop to still be reachable.

## Progress and reset

Progress is stored in the browser's `localStorage` (key `akademie-bierdiplom:v1`), so a
refresh keeps all solved puzzles. To start over, use **„Prüfung zurücksetzen“** at the
bottom of the map (asks for confirmation).

## Project structure

```
src/
  config.ts        all texts, puzzles, answers, PIN, name  ← edit this
  state.ts         progress + unlocking rules (localStorage)
  answers.ts       tolerant answer checking
  router.ts        hash routes (#/karte, #/pruefung/<id>, #/tor, #/urkunde …)
  art.ts           SVG illustrations (buildings, vault, seals, crest)
  confetti.ts      lightweight canvas confetti
  ui.ts            small helpers: toast, confirm dialog, top bar
  screens/         start, map, level, vault, diploma (+ print view)
  style.css        all styling, including print styles
public/sw.js       offline cache
vite.config.ts     dev server on the network + single-file build
```

## Notes

* The PIN is checked in the browser. That is fine for a gift, but it is not security:
  anyone who reads the page source can find it.
* No audio plays at any point. Animations are reduced when the device has
  *Reduce Motion* turned on.
