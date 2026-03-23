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
        relative flex items-center gap-2 px-3 py-1.5 rounded-lg
        border border-orange-500/40 text-sm font-semibold
        bg-purple-800/60 text-orange-100
        hover:bg-orange-600/20 hover:border-orange-400/70
        shadow-[0_0_8px_rgba(234,88,12,0.15)]
        hover:shadow-[0_0_14px_rgba(234,88,12,0.35)]
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-wait
      `}
    >
      {isPending ? (
        <span className="animate-pulse">🕸️</span>
      ) : isEnglish ? (
        <>
          <span className="text-base leading-none">🇳🇱</span>
          <span className="text-orange-300 tracking-wide">NL</span>
        </>
      ) : (
        <>
          <span className="text-base leading-none">🇬🇧</span>
          <span className="text-orange-300 tracking-wide">EN</span>
        </>
      )}
    </button>
  );
}
