import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'index.js',
      name: 'WebsiteHighlighter',
      fileName: 'website-highlighter',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      output: {
        exports: 'named'
      }
    }
  }
})
