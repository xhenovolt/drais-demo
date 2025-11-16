"use client";
import { useI18n } from "@/components/i18n/I18nProvider";
import { LandingHero } from "@/components/landing/LandingHero";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { TahfizSection } from "@/components/landing/TahfizSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  const { dir } = useI18n();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900" dir={dir}>
      <LandingHero />
      <FeaturesSection />
      <TahfizSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
}