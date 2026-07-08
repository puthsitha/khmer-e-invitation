"use client";

import { useTranslations } from "next-intl";
import { SectionShell } from "@/components/viewer/SectionShell";
import { OrnamentDivider } from "@/components/ui/OrnamentDivider";
import type { Invitation } from "@/types";

export function FamilyInvitation({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const { groomFamily, brideFamily, invitationText } = invitation.content;

  return (
    <SectionShell className="bg-cream text-maroon">
      <div className="grid w-full max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2">
        {groomFamily && (
          <div>
            <p className="mb-2 text-sm uppercase tracking-widest text-gold">
              {t("groomFamily")}
            </p>
            <p className="font-[family-name:var(--font-body-km)]">{groomFamily}</p>
          </div>
        )}
        {brideFamily && (
          <div>
            <p className="mb-2 text-sm uppercase tracking-widest text-gold">
              {t("brideFamily")}
            </p>
            <p className="font-[family-name:var(--font-body-km)]">{brideFamily}</p>
          </div>
        )}
      </div>

      <OrnamentDivider />

      {invitationText && (
        <p className="max-w-xl font-[family-name:var(--font-body-km)] leading-relaxed">
          {invitationText}
        </p>
      )}
    </SectionShell>
  );
}
