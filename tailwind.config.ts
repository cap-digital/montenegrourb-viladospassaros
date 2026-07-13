import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Montenegro (landing)
        mn: {
          deep: "var(--mn-deep)",
          base: "var(--mn-base)",
          mid: "var(--mn-mid)",
          light: "var(--mn-light)",
          cream: "var(--mn-cream)",
          gold: "var(--mn-gold)",
        },
        // Vila dos Pássaros (dashboard)
        vp: {
          plane: "var(--vp-plane)",
          header: "var(--vp-header)",
          surface: "var(--vp-surface)",
          surface2: "var(--vp-surface-2)",
          ink: "var(--vp-ink)",
          ink2: "var(--vp-ink-2)",
          muted: "var(--vp-muted)",
          gold: "var(--vp-gold)",
          goldBright: "var(--vp-gold-bright)",
          goldDeep: "var(--vp-gold-deep)",
        },
        // Sidebar (dark brown)
        sb: {
          bg: "var(--sb-bg)",
          surface: "var(--sb-surface)",
          ink: "var(--sb-ink)",
          ink2: "var(--sb-ink-2)",
          muted: "var(--sb-muted)",
          gold: "var(--sb-gold)",
        },
      },
      borderColor: {
        vpline: "var(--vp-line)",
        vplineStrong: "var(--vp-line-strong)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
