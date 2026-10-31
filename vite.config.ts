import { defineConfig, type Plugin } from 'vite';

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Inlines the JS and CSS bundle into index.html, so the production build is a
 * single self-contained file: it works offline, from any static host, and even
 * when opened directly from disk.
 */
function inlineBundle(): Plugin {
  return {
    name: 'inline-bundle',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const html = Object.values(bundle).find(
        (file) => file.type === 'asset' && file.fileName.endsWith('.html'),
      );
      if (!html || html.type !== 'asset') return;
      let source = String(html.source);

      for (const [name, file] of Object.entries(bundle)) {
        if (file.type === 'chunk' && file.isEntry) {
          const tag = new RegExp(`<script[^>]*src="[^"]*${escapeRe(file.fileName)}"[^>]*></script>`);
          const code = file.code.replace(/<\/script/gi, '<\\/script');
          source = source.replace(tag, () => `<script type="module">${code}</script>`);
          delete bundle[name];
        } else if (file.type === 'asset' && file.fileName.endsWith('.css')) {
          const tag = new RegExp(`<link[^>]*href="[^"]*${escapeRe(file.fileName)}"[^>]*>`);
          source = source.replace(tag, () => `<style>${String(file.source)}</style>`);
          delete bundle[name];
        }
      }
      html.source = source;
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [inlineBundle()],
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
  build: { assetsInlineLimit: 100_000_000, cssCodeSplit: false, modulePreload: false },
});
