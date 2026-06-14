import packageJson from "../../package.json";
import { DEMO_ORG } from "./demo-identity";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "YS Ops Demo",
  version: packageJson.version,
  copyright: `© ${currentYear}, ${DEMO_ORG.parent}.`,
  meta: {
    title: "YS Ops Demo",
    description: `Workbook-backed operations demo for ${DEMO_ORG.parent}, ${DEMO_ORG.retail}, and ${DEMO_ORG.commercial} workflows.`,
  },
};
