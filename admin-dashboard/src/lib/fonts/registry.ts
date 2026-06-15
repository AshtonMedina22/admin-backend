import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const fontRegistry = {
  poppins: {
    label: "Poppins",
    font: poppins,
  },
} as const;

export type FontKey = keyof typeof fontRegistry;

export const fontVars = poppins.variable;

export const fontOptions = [
  {
    key: "poppins" as FontKey,
    label: "Poppins",
    variable: poppins.variable,
  },
];
