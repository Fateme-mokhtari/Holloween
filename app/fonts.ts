import { Creepster, Fredoka, Inter } from "next/font/google";

export const creepster = Creepster({
  variable: "--font-creepster",
  weight: "400",
  subsets: ["latin"],
});

export const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
