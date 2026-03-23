import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const LOCALES = ['en', 'nl'] as const;
type Locale = (typeof LOCALES)[number];

function isValidLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get('locale')?.value ?? '';
  const locale: Locale = isValidLocale(raw) ? raw : 'en';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
