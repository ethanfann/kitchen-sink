import { readFileSync } from 'node:fs'
import path from 'node:path'
import { crx } from '@crxjs/vite-plugin'
import { defineConfig } from 'vite'
import zip from 'vite-plugin-zip-pack'
import manifest from './manifest.config.js'
import { name, version } from './package.json'

export default defineConfig({
  resolve: {
    alias: {
      '@': `${path.resolve(__dirname, 'src')}`,
    },
  },
  plugins: [
    crx({ manifest }),
    {
      name: 'license-notices',
      generateBundle() {
        for (const fileName of ['LICENSE', 'THIRD_PARTY_NOTICES.md']) {
          this.emitFile({
            type: 'asset',
            fileName,
            source: readFileSync(path.resolve(__dirname, fileName), 'utf8'),
          })
        }
      },
    },
    zip({ outDir: 'release', outFileName: `crx-${name}-${version}.zip` }),
  ],
  server: {
    cors: {
      origin: [
        /chrome-extension:\/\//,
      ],
    },
  },
})
