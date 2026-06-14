import packageJson from "../../package.json";

import { DEMO_ORG } from "./demo-identity";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Admin Dashboard",
  version: packageJson.version,
  copyright: `© ${currentYear}, ${DEMO_ORG.parent}.`,
  meta: {
    title: "Executive Admin Dashboard",
    description: `Executive operations dashboard for ${DEMO_ORG.parent}, ${DEMO_ORG.portfolio}, ${DEMO_ORG.retail}, and ${DEMO_ORG.commercial} workflows.`,
  },
};
