"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { legalPagesService, LegalPage } from "@/lib/legalPages";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import ANSWER24LOGO from "@/public/schepenkring-logo.png";

const Footer = () => {
  const t = useTranslations("common");
  const locale = useLocale();
  const [legalPages, setLegalPages] = useState<LegalPage[]>([]);

  useEffect(() => {
    loadLegalPages();
  }, [locale]);

  const loadLegalPages = async () => {
    try {
      const pages = await legalPagesService.getAllPages(locale);
      setLegalPages(pages.filter((page) => page.is_active));
    } catch (error) {
      console.error("Error loading legal pages for footer:", error);
    }
  };
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

useEffect(() => {
  const handler = (e: any) => {
    e.preventDefault();
    setDeferredPrompt(e);
  };

  window.addEventListener("beforeinstallprompt", handler);

  return () => window.removeEventListener("beforeinstallprompt", handler);
}, []);

const handleInstallClick = async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  setDeferredPrompt(null);
};


  const currentYear = new Date().getFullYear();

  return (
    // Reduced padding from pt-32/pb-16 to pt-20/pb-10
    <footer className="bg-[#001e3c] pt-20 pb-10 overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Reduced margin-bottom from mb-28 to mb-16 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <Link
              href="/"
              className="inline-block transition-opacity hover:opacity-80"
            >
              <Image
                src={ANSWER24LOGO}
                alt="Logo"
                width={180}
                height={50}
                className="h-auto w-auto brightness-0 invert"
              />
            </Link>

            <p className="text-blue-100/60 text-lg leading-relaxed max-w-sm font-light italic border-l-4 border-blue-500/30 pl-6">
              "{t("footer.tagline")}"
            </p>

            <div className="flex gap-6">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="text-blue-200 hover:text-white transition-all transform hover:-translate-y-1"
                >
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12">
            {/* Quick Links */}
            <div>
              <h3 className="text-blue-400 text-[10px] font-black tracking-[0.4em] uppercase mb-6">
                {t("footer.quick_links")}
              </h3>
              <ul className="space-y-4">
                {["about", "pricing", "faq", "contact"].map((item) => (
                  <li key={item}>
                    <Link
                      href={`/${item}`}
                      className="text-white/80 hover:text-blue-400 transition-colors text-base font-medium flex items-center group"
                    >
                      {t(`footer.${item}`)}
                      <ArrowUpRight className="ml-1 w-4 h-4 opacity-0 transition-all group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-blue-400 text-[10px] font-black tracking-[0.4em] uppercase mb-6">
                {t("footer.legal")}
              </h3>
              <ul className="space-y-4">
                {legalPages.length > 0 ? (
                  legalPages.map((page) => (
                    <li key={page.id}>
                      <Link
                        href={`/legal/${page.slug}`}
                        className="text-white/80 hover:text-blue-400 transition-colors text-base font-medium"
                      >
                        {page.title}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-white/40 text-sm">
                    {t("footer.no_pages")}
                  </li>
                )}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-blue-400 text-[10px] font-black tracking-[0.4em] uppercase mb-6">
                {t("footer.contact")}
              </h3>
              <address className="not-italic space-y-6">
                <p className="text-blue-100/80 text-base font-light">
                  Parkhaven 3, <br />
                  <span className="text-white font-semibold">
                    
8242 PE Lelystad
                  </span>
                </p>
                <div className="space-y-2">
                  <a
                    href="mailto:info@Schepen-kring.nl"
                    className="block text-blue-400 hover:text-white transition-colors text-xs font-black tracking-widest uppercase"
                  >
                    lelystad@schepenkring.nl
                  </a>
                  <a
                    href="tel:+310320711340"
                    className="block text-white font-serif italic text-3xl hover:text-blue-400 transition-all"
                  >
                    +31 (0)320 711340
                  </a>
                </div>
              </address>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Reduced padding from pt-16 to pt-10 */}
        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em]">
            &copy; {currentYear} Schepen-kring.nl{" "}
            <span className="mx-4 text-white/5">|</span>{" "}
            <span className="text-blue-400/40 font-black">Elite Maritime</span>
          </div>

          <div className="flex gap-8 text-[10px] font-black tracking-widest text-white/20 uppercase">
            <span>Schepen Kring</span>
            <span>Ocean Sovereignty</span>


            
              <button
                onClick={handleInstallClick}
                className="hover:text-white transition-colors"
              >
                Install App
              </button>

            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="hover:text-white transition-colors"
              >
                Install App
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Decorative Large Background Mark - Adjusted for reduced height */}
      <div className="absolute bottom-[-20%] right-0 pointer-events-none select-none opacity-[0.02]">
        <span className="text-[350px] font-serif font-black text-white">
          SK
        </span>
      </div>
    </footer>
  );
};

export default Footer;
