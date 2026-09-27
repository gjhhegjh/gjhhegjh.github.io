import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import compressor from 'astro-compressor';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';
import { VitePWA } from 'vite-plugin-pwa';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import { manifest } from './src/utils/manifest';

// https://astro.build/config
export default defineConfig({
  site: 'https://gjhhegjh.github.io',
  // 部署到 GitHub Pages：静态输出，不需要服务端 adapter
  image: {
    remotePatterns: [{ protocol: 'https' }],
  },
  markdown: {
    drafts: true,
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      theme: 'material-theme-palenight',
      wrap: true,
    },
  },
  integrations: [
    mdx({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
      syntaxHighlight: 'shiki',
      shikiConfig: {
        theme: 'material-theme-palenight',
        wrap: true,
      },
      drafts: true,
    }),
    compressor({ gzip: true, brotli: true }),
    sitemap(),
    tailwind(),
    robotsTxt(),
  ],
  vite: {
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        manifest,
        workbox: {
          globDirectory: 'dist',
          globPatterns: ['**/*.{js,css,svg,png,jpg,jpeg,gif,webp,woff,woff2,ttf,eot,ico}'],
          navigateFallback: null,
        },
      }),
    ],
  },
});
