"use client";

import {
  ArrowPathIcon,
  Cog6ToothIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

export default function TopMenu() {
  const t = useTranslations("TopMenu");

  const handleEmailClick = () => {
    window.location.href =
      "mailto:halloweennesselandeapp@gmail.com?subject=Halloween%20Haunted%20Houses";
  };

  return (
    <header className=" top-0 w-full z-[1000] bg-purple-900 p-3 flex justify-between items-center text-white shadow-lg border-b border-orange-600/30">
      {/* Left actions: email & admin */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleEmailClick}
          title="Contact us"
          className="p-2 rounded-lg hover:bg-orange-600/30 transition-colors cursor-pointer"
        >
          <EnvelopeIcon className="w-5 h-5" />
        </button>
        <button className="flex p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
          <Cog6ToothIcon className="w-5 h-5" />
          <span className="ml-1 text-sm">{t("admin")}</span>
        </button>
      </div>

      {/* Center logo/text */}
      <div className="flex items-center gap-2">
        <span className="text-3xl">🎃</span>
        <h1 className="text-2xl font-serif italic font-halloween">
          {t("title")}
        </h1>
      </div>

      {/* Right actions: refresh & language */}
      <div className="flex items-center gap-4">
        <button
          title={t("refresh")}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          <ArrowPathIcon className="w-5 h-5" />
        </button>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
