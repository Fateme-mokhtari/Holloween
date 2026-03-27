import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <Image
        src="/assets/images/splash-desktop.png"
        alt="Spooky background"
        fill
        className="object-cover"
        priority
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-6">
        <h1
          className="text-8xl font-extrabold text-orange-500 drop-shadow-[0_0_30px_rgba(234,88,12,0.8)] mb-2"
          style={{ fontFamily: "cursive" }}
        >
          404
        </h1>

        <h2
          className="text-4xl md:text-5xl font-bold text-orange-400 drop-shadow-[0_0_20px_rgba(234,88,12,0.6)] mb-4"
          style={{ fontFamily: "cursive" }}
        >
          {t("title")}
        </h2>

        <p className="text-lg md:text-xl text-gray-300 max-w-md mb-8">
          {t("description")}
        </p>

        <Link
          href="/"
          className="px-8 py-3 bg-purple-700 hover:bg-purple-800 text-white text-lg font-semibold rounded-full transition-colors duration-200 shadow-[0_0_20px_rgba(126,34,206,0.5)] hover:shadow-[0_0_30px_rgba(126,34,206,0.7)]"
        >
          {t("backHome")}
        </Link>
      </div>
    </div>
  );
}
