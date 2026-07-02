import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "tertiary-fixed": "#c6f34c",
        "on-tertiary-container": "#a6d12c",
        "surface": "#f8faf8",
        "on-surface": "#191c1b",
        "surface-dim": "#d8dad9",
        "on-primary-container": "#9dd090",
        "surface-container-lowest": "#ffffff",
        "primary-container": "#2d5a27",
        "surface-tint": "#3b6934",
        "tertiary-fixed-dim": "#aad630",
        "secondary": "#934b00",
        "on-secondary": "#ffffff",
        "secondary-fixed-dim": "#ffb781",
        "secondary-fixed": "#ffdcc4",
        "surface-bright": "#f8faf8",
        "inverse-surface": "#2e3130",
        "on-error-container": "#93000a",
        "on-tertiary-fixed-variant": "#3a4d00",
        "on-secondary-fixed": "#301400",
        "outline": "#72796e",
        "on-primary-fixed-variant": "#23501e",
        "on-primary-fixed": "#002201",
        "surface-container-high": "#e6e9e7",
        "surface-container-highest": "#e1e3e1",
        "background": "#f8faf8",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "surface-container": "#eceeec",
        "on-surface-variant": "#42493e",
        "on-secondary-fixed-variant": "#703800",
        "on-tertiary": "#ffffff",
        "error": "#ba1a1a",
        "primary-fixed-dim": "#a1d494",
        "on-tertiary-fixed": "#151f00",
        "inverse-on-surface": "#eff1ef",
        "inverse-primary": "#a1d494",
        "tertiary-container": "#425700",
        "primary-fixed": "#bcf0ae",
        "tertiary": "#2e3e00",
        "on-primary": "#ffffff",
        "primary": "#154212",
        "secondary-container": "#fc943b",
        "outline-variant": "#c2c9bb",
        "surface-variant": "#e1e3e1",
        "on-secondary-container": "#683300",
        "surface-container-low": "#f2f4f2",
        "on-background": "#191c1b"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "stack-md": "24px",
        "stack-lg": "40px",
        "stack-sm": "12px",
        "base": "8px",
        "container-margin": "20px",
        "gutter": "16px"
      },
      fontFamily: {
        "body-md": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "headline-lg": ["Montserrat", "sans-serif"],
        "headline-md": ["Montserrat", "sans-serif"],
        "headline-lg-mobile": ["Montserrat", "sans-serif"]
      },
      fontSize: {
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "headline-lg-mobile": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "700" }]
      }
    },
  },
  plugins: [],
};
export default config;
