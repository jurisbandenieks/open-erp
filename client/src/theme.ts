import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Custom color palette
const brandColor: MantineColorsTuple = [
  "#e7f5ff",
  "#d0ebff",
  "#a5d8ff",
  "#74c0fc",
  "#4dabf7",
  "#339af0",
  "#228be6",
  "#1c7ed6",
  "#1971c2",
  "#1864ab"
];

export const theme = createTheme({
  /** Primary color - used for buttons, links, etc. */
  primaryColor: "blue",

  /** Custom colors */
  colors: {
    brand: brandColor
  },

  /** Default radius for all components */
  defaultRadius: "md",

  /** Font settings */
  fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  fontFamilyMonospace: "Monaco, Courier, monospace",
  headings: {
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    fontWeight: "700",
    sizes: {
      h1: { fontSize: "2.25rem", lineHeight: "2.5rem" },
      h2: { fontSize: "1.875rem", lineHeight: "2.25rem" },
      h3: { fontSize: "1.5rem", lineHeight: "2rem" },
      h4: { fontSize: "1.25rem", lineHeight: "1.75rem" },
      h5: { fontSize: "1.125rem", lineHeight: "1.75rem" },
      h6: { fontSize: "1rem", lineHeight: "1.5rem" }
    }
  },

  /** Spacing scale */
  spacing: {
    xs: "0.625rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.25rem",
    xl: "1.5rem"
  },

  /** Shadow settings */
  shadows: {
    xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
  },

  /** Component-specific overrides */
  components: {
    Button: {
      defaultProps: {
        size: "md"
      }
    },
    TextInput: {
      defaultProps: {
        size: "md"
      }
    },
    Select: {
      defaultProps: {
        size: "md"
      }
    },
    Modal: {
      defaultProps: {
        centered: true
      }
    }
  }
});
