"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("TopMenu");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const next = locale === "en" ? "nl" : "en";
    document.cookie = `locale=${next};path=/;max-age=31536000;SameSite=Lax`;
    startTransition(() => {
      router.refresh();
    });
  };

  const isEnglish = locale === "en";

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      title={isEnglish ? t("switchToNl") : t("switchToEn")}
      className={`
        relative inline-flex h-10 w-[104px] items-center rounded-full
        border border-orange-500/50 bg-purple-800/70 p-1
        shadow-[0_0_10px_rgba(234,88,12,0.2)]
        transition-all duration-200
        hover:border-orange-400/80 hover:shadow-[0_0_14px_rgba(234,88,12,0.35)]
        cursor-pointer
        disabled:opacity-50 disabled:cursor-wait
      `}
      aria-label={isEnglish ? t("switchToNl") : t("switchToEn")}
      aria-pressed={!isEnglish}
    >
      <span
        className={`
          absolute top-1 bottom-1 w-[46px] rounded-full
          bg-orange-500 shadow-[0_0_12px_rgba(234,88,12,0.45)]
          transition-transform duration-200
          ${isEnglish ? "translate-x-0" : "translate-x-[52px]"}
        `}
      />

      <span className="relative z-10 grid w-full grid-cols-2 text-sm font-semibold">
        <span
          className={`text-center transition-colors duration-200 ${
            isEnglish ? "text-white" : "text-orange-200/80"
          }`}
        >
          EN
        </span>
        <span
          className={`text-center transition-colors duration-200 ${
            isEnglish ? "text-orange-200/80" : "text-white"
          }`}
        >
          NL
        </span>
      </span>

      {isPending && (
        <span className="absolute -right-5 text-xs animate-pulse">🕸️</span>
      )}
    </button>
  );
}
