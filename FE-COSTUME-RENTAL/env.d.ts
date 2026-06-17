/// <reference types="vite/client" />

interface ImportMetaEnv extends InternalImportMetaEnv {}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export {}
