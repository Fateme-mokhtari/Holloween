import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import type { ReactNode } from "react";
import ToastProvider from "./components/common/Toast";
import { creepster } from "./fonts";

import "./globals.css";

export const metadata = {
  title: "Holloween",
  description: "Discover haunted houses and spooky zones in your area!",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${creepster.variable}`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <ToastProvider />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
