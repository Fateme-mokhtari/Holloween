// Type augmentation for next-intl — gives full autocomplete on all translation keys.
// Whenever you add a key to messages/en.json it becomes a compile-time error
// if it's missing in other locales or misspelled in useTranslations calls.

type Messages = typeof import('./messages/en.json');

declare interface IntlMessages extends Messages {}
