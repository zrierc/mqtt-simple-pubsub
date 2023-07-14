/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MQ_USERNAME: string;
  readonly MQ_PASSWORD: string;
  readonly VITE_MQ_HOST: string;
  readonly VITE_MQ_TOPIC: string;
  readonly VITE_MQ_USERNAME: string;
  readonly VITE_MQ_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
