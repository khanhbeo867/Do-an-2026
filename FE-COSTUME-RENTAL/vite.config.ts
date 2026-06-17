import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig, loadEnv } from 'vite'

const config = defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

  return {
    resolve: {
      // This enables built-in support for path aliases defined in tsconfig.json
      tsconfigPaths: true,
    },
    plugins: [
      devtools(),
      nitro(),
      tailwindcss(),
      tanstackStart({
        server: { entry: 'src/server.ts' },
        prerender: {
          // Switch to true to enable prerendering
          enabled: false,

          // Disable if you need pages to be at `/page.html` instead of `/page/index.html`
          autoSubfolderIndex: true,

          // If disabled, only the root path or the paths defined in the pages config will be prerendered
          autoStaticPathsDiscovery: true,

          // How many prerender jobs to run at once
          concurrency: 14,

          // Whether to extract links from the HTML and prerender them also
          crawlLinks: true,

          // Filter function takes the page object and returns whether it should prerender
          filter: ({ path }) => path.startsWith('/policies'),

          // Number of times to retry a failed prerender job
          retryCount: 2,

          // Delay between retries in milliseconds
          retryDelay: 1000,

          // Maximum number of redirects to follow during prerendering
          maxRedirects: 5,

          // Fail if an error occurs during prerendering
          failOnError: true,

          // Callback when page is successfully rendered
          onSuccess: ({ page }) => {
            console.log(`Rendered ${page.path}!`)
          },
        },
        // Optional configuration for specific pages
        // Note: When autoStaticPathsDiscovery is enabled (default), discovered static
        // routes will be merged with the pages specified below
        pages: [
          {
            path: '/policies',
            prerender: { enabled: true, outputPath: '/policies/index.html' },
          },
        ],
      }),
      viteReact(),
    ],
    server: {
      port: 5000,
      watch: {
        ignored: ['**/mock/**', '**/.output/**'],
      },
      proxy: {
        '/storage/images-gallery': {
          target: process.env.VITE_EXTERNAL_API_URL,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 5000,
      proxy: {
        '/storage/images-gallery': {
          target: process.env.VITE_EXTERNAL_API_URL,
          changeOrigin: true,
        },
      },
    },
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              { name: '@tanstack/react-query', test: /@tanstack\/react-query/ },
              { name: '@tanstack/react-router', test: /@tanstack\/react-router/ },
              { name: '@tanstack/react-table', test: /@tanstack\/react-table/ },
              { name: '@tanstack/react-virtual', test: /@tanstack\/react-virtual/ },
              { name: '@tanstack/react-form', test: /@tanstack\/react-form/ },
              { name: '@tiptap/core', test: /@tiptap\/core/ },
              { name: '@tiptap/extension-color', test: /@tiptap\/extension-color/ },
              { name: '@tiptap/extension-file-handler', test: /@tiptap\/extension-file-handler/ },
              { name: '@tiptap/extension-gapcursor', test: /@tiptap\/extension-gapcursor/ },
              { name: '@tiptap/extension-heading', test: /@tiptap\/extension-heading/ },
              { name: '@tiptap/extension-highlight', test: /@tiptap\/extension-highlight/ },
              { name: '@tiptap/extension-image', test: /@tiptap\/extension-image/ },
              { name: '@tiptap/extension-link', test: /@tiptap\/extension-link/ },
              { name: '@tiptap/extension-placeholder', test: /@tiptap\/extension-placeholder/ },
              { name: '@tiptap/extension-table', test: /@tiptap\/extension-table/ },
              { name: '@tiptap/extension-table-cell', test: /@tiptap\/extension-table-cell/ },
              { name: '@tiptap/extension-table-header', test: /@tiptap\/extension-table-header/ },
              { name: '@tiptap/extension-table-row', test: /@tiptap\/extension-table-row/ },
              { name: '@tiptap/extension-text-align', test: /@tiptap\/extension-text-align/ },
              { name: '@tiptap/extension-text-style', test: /@tiptap\/extension-text-style/ },
              { name: '@tiptap/extension-underline', test: /@tiptap\/extension-underline/ },
              { name: '@tiptap/pm', test: /@tiptap\/pm/ },
              { name: '@tiptap/react', test: /@tiptap\/react/ },
              { name: '@tiptap/starter-kit', test: /@tiptap\/starter-kit/ },
              { name: 'ahooks', test: /ahooks/ },
              { name: 'react-resizable-panels', test: /react-resizable-panels/ },
              { name: 'recharts', test: /recharts/ },
              { name: 'qs', test: /qs/ },
              { name: 'lz-string', test: /lz-string/ },
              { name: 'lodash-es', test: /lodash-es/ },
              { name: 'sonner', test: /sonner/ },
              { name: 'zod', test: /zod/ },
              { name: 'zustand', test: /zustand/ },
              { name: 'tailwind-merge', test: /tailwind-merge/ },
              { name: 'tailwind-styled-components', test: /tailwind-styled-components/ },
            ],
          },
        },
      },
    },
  }
})

export default config
