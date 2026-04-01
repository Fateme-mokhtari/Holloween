"use client";

import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import Link from "next/link";
import LanguageSwitcher from "../common/LanguageSwitcher";

export default function TopMenu() {
  const t = useTranslations("TopMenu");

  const handleEmailClick = () => {
    window.location.href =
      "mailto:halloweennesselandeapp@gmail.com?subject=Halloween%20Haunted%20Houses";
  };

  return (
    <header className="sticky top-0 w-full z-[5000] bg-purple-900 p-3 flex justify-between items-center text-white shadow-lg border-b border-orange-600/30">
      {/* Left actions: email & admin */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleEmailClick}
          title="Contact us"
          className="p-2 rounded-lg hover:bg-orange-600/30 transition-colors cursor-pointer"
        >
          <EnvelopeIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Center logo/text */}
      <Link
        href="/"
        className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
      >
        <span className="text-3xl">🎃</span>
        <h1 className="text-2xl font-creepster">{t("title")}</h1>
      </Link>

      {/* Right actions: refresh & language */}
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
      </div>
    </header>
  );
}
