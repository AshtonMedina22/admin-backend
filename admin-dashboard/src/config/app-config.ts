import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Admin Dashboard",
  version: packageJson.version,
  copyright: `© ${currentYear}, Gold Star Power.`,
  meta: {
    title: "Executive Admin Dashboard",
    description:
      "Executive operations dashboard for Gold Star Power, Yellow Star Power, Solar 2SK, and Solar 3SK workflows.",
  },
};
