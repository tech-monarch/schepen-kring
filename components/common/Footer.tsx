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
import ANSWER24LOGO from "@/public/answerLogobgRemover-removebg-preview.png";

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

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 pt-24 pb-12 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-10">
            <Link
              href="/"
              className="inline-block transition-transform hover:scale-105"
            >
              {/* <Image 
                src={ANSWER24LOGO} 
                alt="Answer24 Logo" 
                width={160} 
                height={50}
                className="brightness-0 invert h-auto w-auto"
              /> */}
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm font-light tracking-wide italic">
              "{t("footer.tagline")}"
            </p>
            <div className="flex gap-5">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-10 h-10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-[#c5a572] hover:border-[#c5a572] transition-all"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav Links - Using a CSS Grid for better alignment */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12 border-l border-white/5 pl-0 lg:pl-16">
            {/* Quick Links */}
            <div>
              <h3 className="text-[#c5a572] text-[10px] font-bold tracking-[0.4em] uppercase mb-8">
                {t("footer.quick_links")}
              </h3>
              <ul className="space-y-4">
                {["about", "pricing", "faq", "contact"].map((item) => (
                  <li key={item}>
                    <Link
                      href={`/${item}`}
                      className="text-slate-400 hover:text-white transition-colors text-xs font-medium tracking-widest flex items-center group"
                    >
                      {t(`footer.${item}`)}
                      <ArrowUpRight className="ml-2 w-3 h-3 opacity-0 -translate-y-1 transition-all group-hover:opacity-100 group-hover:translate-y-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-[#c5a572] text-[10px] font-bold tracking-[0.4em] uppercase mb-8">
                {t("footer.legal")}
              </h3>
              <ul className="space-y-4">
                {legalPages.length > 0 ? (
                  legalPages.map((page) => (
                    <li key={page.id}>
                      <Link
                        href={`/legal/${page.slug}`}
                        className="text-slate-400 hover:text-white transition-colors text-xs font-medium tracking-widest"
                      >
                        {page.title}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-600 text-[10px] uppercase tracking-tighter">
                    {t("footer.no_pages")}
                  </li>
                )}
              </ul>
            </div>

            {/* Location */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-[#c5a572] text-[10px] font-bold tracking-[0.4em] uppercase mb-8">
                {t("footer.contact")}
              </h3>
              <address className="not-italic space-y-6">
                <p className="text-slate-400 text-xs font-light leading-relaxed tracking-wider">
                  Valkenierstraat 133, <br />
                  <span className="text-white">5553CP Valkenswaard</span>
                </p>
                <div className="space-y-2">
                  <a
                    href="mailto:info@answer24.com"
                    className="block text-slate-400 hover:text-[#c5a572] transition-colors text-xs tracking-widest"
                  >
                    info@Schepen-kring.nl
                  </a>
                  <a
                    href="tel:+3140-2100325"
                    className="block text-white font-serif italic text-lg hover:text-[#c5a572] transition-colors"
                  >
                    +31 40 2100 325
                  </a>
                </div>
              </address>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
            &copy; {currentYear} Schepen-kring.nl.{" "}
            <span className="text-slate-800 ml-2">
              Built for the Maritime Elite
            </span>
          </p>

          <div className="flex gap-8">
            <span className="text-slate-700 text-[10px] uppercase tracking-widest font-bold">
              Secure Infrastructure
            </span>
            <span className="text-slate-700 text-[10px] uppercase tracking-widest font-bold">
              Global 24/7
            </span>
          </div>
        </div>
      </div>

      {/* Background Large Text Decoration */}
      <div className="absolute bottom-0 right-0 translate-y-1/3 translate-x-1/4 pointer-events-none select-none">
        <span className="text-[250px] font-serif font-black text-white/[0.01] leading-none">
          A24
        </span>
      </div>
    </footer>
  );
};

export default Footer;
