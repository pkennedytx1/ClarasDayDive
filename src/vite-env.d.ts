/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ASK_CLARA_API_URL?: string;
  readonly VITE_EVENT_BOOKING_API_URL?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
