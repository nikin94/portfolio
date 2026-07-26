import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    // Never inline SVGs as data URIs. Small ones would otherwise be inlined,
    // and a `mask-image` pointing at a data-URI SVG with no intrinsic size
    // silently fails to apply in Chromium/WebKit (the mask drops and the
    // element shows as a solid `bg-current` square). Serving every SVG as a
    // file URL keeps the masked, theme-adaptive icons working.
    assetsInlineLimit: (file) => (file.endsWith(".svg") ? false : undefined),
  },
  ssgOptions: {
    // /foo -> /foo/index.html, so static hosts serve clean URLs without rewrites.
    dirStyle: "nested",
    script: "async",
  },
});
