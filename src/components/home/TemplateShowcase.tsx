"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { ExternalLink, Eye, Music, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { DEFAULT_TEMPLATES, listTemplates } from "@/lib/firebase/firestore";
import { OrnamentDivider } from "@/components/ui/OrnamentDivider";
import type { Template } from "@/types";

export function TemplateShowcase() {
  const t = useTranslations("home");
  const tCat = useTranslations("dashboard.list.category");
  const locale = useLocale();

  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);

  useEffect(() => {
    let cancelled = false;
    listTemplates()
      .then((list) => {
        if (!cancelled && list.length > 0) {
          setTemplates(list);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="sample-templates"
      className="relative z-20 mx-auto w-full max-w-6xl px-4 py-12 sm:px-6"
    >
      {/* Section Header */}
      <div className="mb-10 flex flex-col items-center text-center">
        <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-gold uppercase">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{t("templatesBadge")}</span>
        </span>
        <h2 className="font-[family-name:var(--font-heading-km)] text-2xl leading-[1.6] text-maroon dark:text-[#f6eee8] sm:text-3xl md:text-4xl">
          {t("templatesTitle")}
        </h2>
        <div className="my-2">
          <OrnamentDivider variant={3} />
        </div>
        <p className="font-[family-name:var(--font-body-km)] mx-auto max-w-2xl text-sm leading-relaxed text-maroon/80 dark:text-[#f6eee8]/75 sm:text-base">
          {t("templatesSubtitle")}
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((tpl, index) => {
          const thumbSrc = tpl.previewImage || tpl.backgroundImageUrl;
          const bgOpacity = tpl.colors.backgroundOpacity ?? 85;
          const sampleHref = `/i/sample-${tpl.templateId}`;

          return (
            <motion.div
              key={tpl.templateId}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-gold/35 dark:border-gold/25 bg-white dark:bg-[#1c161b] shadow-lg transition-all duration-300 hover:border-gold hover:shadow-[0_20px_45px_rgba(201,162,75,0.22)]"
            >
              {/* Visual Preview Header */}
              <div>
                <Link
                  href={sampleHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block h-64 w-full overflow-hidden border-b border-gold/25"
                  style={{ backgroundColor: tpl.colors.background }}
                >
                  {thumbSrc && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={thumbSrc}
                      alt={tpl.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}

                  {/* Template Color Tint Overlay matching backgroundOpacity */}
                  <div
                    className="absolute inset-0 transition-opacity duration-300"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${tpl.colors.background} ${Math.min(82, Math.max(45, bgOpacity))}%, transparent)`,
                    }}
                  />

                  {/* Top Badges */}
                  <div className="absolute inset-x-3 top-3 z-10 flex items-center justify-between gap-2">
                    <span
                      className="rounded-full border px-2.5 py-0.5 text-[11px] font-semibold shadow-xs"
                      style={{
                        backgroundColor: tpl.colors.background,
                        borderColor: `${tpl.colors.primary}66`,
                        color: tpl.colors.primary,
                      }}
                    >
                      {tCat(tpl.category)}
                    </span>
                    {tpl.hasMusic && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium shadow-xs"
                        style={{
                          backgroundColor: tpl.colors.background,
                          borderColor: `${tpl.colors.primary}66`,
                          color: tpl.colors.text,
                        }}
                      >
                        <Music size={11} style={{ color: tpl.colors.primary }} />
                        <span>Music</span>
                      </span>
                    )}
                  </div>

                  {/* Mini Sample Invitation Card Preview inside Thumbnail */}
                  <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.25em]"
                      style={{ color: tpl.colors.primary }}
                    >
                      {locale === "km" ? "សិរីមង្គលអាពាហ៍ពិពាហ៍" : "Wedding Invitation"}
                    </span>
                    <p
                      className="mt-2 font-[family-name:var(--font-heading-km)] text-lg sm:text-xl leading-relaxed"
                      style={{ color: tpl.colors.text }}
                    >
                      {locale === "km" ? "ចិន្តា & មុនីរ័ត្ន" : "Chenda & Monyroth"}
                    </p>
                    <div
                      className="mt-2.5 h-px w-20"
                      style={{ backgroundColor: `${tpl.colors.primary}80` }}
                    />
                    <span
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold shadow-md transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: tpl.colors.primary,
                        color: "#140f13",
                      }}
                    >
                      <Eye size={13} />
                      <span>{t("openFullSample")}</span>
                    </span>
                  </div>
                </Link>

                {/* Card Body Details */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-[family-name:var(--font-heading-km)] text-base font-semibold text-maroon dark:text-[#f6eee8] sm:text-lg">
                      {tpl.name}
                    </h3>
                  </div>

                  {tpl.description && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-maroon/75 dark:text-[#f6eee8]/70 sm:text-sm">
                      {tpl.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center gap-2 border-t border-gold/20 bg-cream/40 dark:bg-white/5 px-5 py-3.5">
                <Link
                  href={sampleHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-maroon dark:bg-gold px-3.5 py-2 text-xs font-semibold text-cream dark:text-maroon shadow-xs transition-all hover:opacity-90"
                >
                  <span>{t("openFullSample")}</span>
                  <ExternalLink size={13} />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
