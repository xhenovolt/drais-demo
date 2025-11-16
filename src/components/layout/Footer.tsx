"use client";
import clsx from "clsx";
import { useI18n } from "@/components/i18n/I18nProvider";

export const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className={clsx("hidden md:flex mt-10 items-center justify-between text-xs text-gray-600 dark:text-gray-400 py-6")}>      <div>
        © {new Date().getFullYear()} DRAIS School Management. {t ? t('footer.rights') : 'All rights reserved.'}
      </div>
      <nav className="flex items-center gap-4">
        <a href="#" className="hover:text-[var(--color-primary)]">Docs</a>
        <a href="#" className="hover:text-[var(--color-primary)]">Privacy</a>
        <a href="#" className="hover:text-[var(--color-primary)]">Terms</a>
      </nav>
    </footer>
  );
};

export default Footer;
