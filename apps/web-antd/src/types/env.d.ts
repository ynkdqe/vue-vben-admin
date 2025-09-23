// / <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_NAMESPACE: string;
  readonly VITE_CLIENT_ID: string;
  readonly VITE_CLIENT_SECRET: string;
  readonly VITE_SCOPE: string;
  readonly VITE_GRANT_TYPE: string;
  readonly VITE_APP_URL_API: string;
  readonly VITE_GLOB_API_URL: string;
  readonly VITE_DEV_PORT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
// https://vitejs.dev/guide/env-and-mode.html#env-files
