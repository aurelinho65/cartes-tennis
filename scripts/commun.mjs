// Outils partagés par l'export et la vérification (Node uniquement).
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

export const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');

// @font-face en base64 pour que les SVG exportés restent autonomes.
export function policesEmbarquees() {
  return [500, 600, 700].map((g) => {
    const b64 = readFileSync(join(RACINE, 'assets/fonts', `barlow-condensed-${g}.woff2`)).toString('base64');
    return `@font-face{font-family:'Barlow Condensed';font-weight:${g};src:url(data:font/woff2;base64,${b64}) format('woff2')}`;
  }).join('');
}

// Chromium sans interface : CHROME_PATH, puis Playwright, puis Edge / Chrome installés.
export function trouverChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const pw = join(homedir(), 'AppData/Local/ms-playwright');
  if (existsSync(pw)) {
    for (const d of readdirSync(pw).filter((n) => n.startsWith('chromium_headless_shell')).sort().reverse()) {
      const exe = join(pw, d, 'chrome-headless-shell-win64', 'chrome-headless-shell.exe');
      if (existsSync(exe)) return exe;
    }
  }
  return [
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].find(existsSync);
}
