"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { NextIntlClientProvider, useLocale, useTranslations } from "next-intl";
import { AnimatePresence } from "framer-motion";
import { Hourglass, Loader2, MailQuestion } from "lucide-react";
import { getInvitationBySlug } from "@/lib/firebase/firestore";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { PaletteProvider } from "@/contexts/PaletteContext";
import { toBackgroundEmbedUrl } from "@/lib/embed";
import { viewerMessages } from "@/lib/viewerMessages";
import { EnvelopeOpening } from "@/components/sections/EnvelopeOpening";
import { Hero } from "@/components/sections/Hero";
import { BackgroundBackdrop } from "@/components/viewer/BackgroundBackdrop";
import { ViewerTopBar } from "@/components/viewer/ViewerTopBar";
import { ViewerStatusScreen } from "@/components/viewer/ViewerStatusScreen";
import type { Invitation } from "@/types";

const FamilyInvitation = dynamic(() =>
  import("@/components/sections/FamilyInvitation").then((m) => m.FamilyInvitation),
);
const Countdown = dynamic(() =>
  import("@/components/sections/Countdown").then((m) => m.Countdown),
);
const CalendarSection = dynamic(() =>
  import("@/components/sections/CalendarSection").then((m) => m.CalendarSection),
);
const Gallery = dynamic(() =>
  import("@/components/sections/Gallery").then((m) => m.Gallery),
);
const Direction = dynamic(() =>
  import("@/components/sections/Direction").then((m) => m.Direction),
);
const OurStory = dynamic(() =>
  import("@/components/sections/OurStory").then((m) => m.OurStory),
);
const Agenda = dynamic(() =>
  import("@/components/sections/Agenda").then((m) => m.Agenda),
);
const DigitalEnvelope = dynamic(() =>
  import("@/components/sections/DigitalEnvelope").then((m) => m.DigitalEnvelope),
);
const GratitudeApology = dynamic(() =>
  import("@/components/sections/GratitudeApology").then((m) => m.GratitudeApology),
);
const ColorPaletteAccent = dynamic(() =>
  import("@/components/sections/ColorPaletteAccent").then(
    (m) => m.ColorPaletteAccent,
  ),
);
const Closing = dynamic(() =>
  import("@/components/sections/Closing").then((m) => m.Closing),
);

type Stage = "closed" | "landing" | "opened";

export function ViewerExperience({ slug }: { slug: string }) {
  const t = useTranslations("viewer");
  const urlLocale = useLocale();
  const [invitation, setInvitation] = useState<Invitation | null | undefined>(
    undefined,
  );
  const [stage, setStage] = useState<Stage>("closed");
  const [displayLocale, setDisplayLocale] = useState<"km" | "en">(
    urlLocale === "en" ? "en" : "km",
  );
  const { start: startMusic, muted, toggleMute } = useBackgroundMusic(
    invitation ? invitation.mediaUrls.bgMusic : undefined,
  );

  useEffect(() => {
    getInvitationBySlug(slug).then(setInvitation);
  }, [slug]);

  useAutoScroll(stage === "opened");

  function handleOpenEnvelope() {
    setStage("landing");
    startMusic();
  }

  function handleOpenInvitation() {
    setStage("opened");
  }

  if (invitation === undefined) {
    return (
      <ViewerStatusScreen
        icon={<Loader2 className="h-8 w-8 animate-spin" />}
        message={t("loading")}
      />
    );
  }

  if (invitation === null) {
    return (
      <ViewerStatusScreen
        icon={<MailQuestion className="h-8 w-8" />}
        message={t("notFound")}
      />
    );
  }

  if (invitation.status !== "published") {
    return (
      <ViewerStatusScreen
        icon={<Hourglass className="h-8 w-8" />}
        message={t("notPublished")}
      />
    );
  }

  const embedUrl = invitation.coverVideoEmbedUrl
    ? toBackgroundEmbedUrl(invitation.coverVideoEmbedUrl)
    : null;
  const backdropImage = invitation.mediaUrls.gallery[0];

  return (
    <NextIntlClientProvider locale={displayLocale} messages={viewerMessages[displayLocale]}>
      <PaletteProvider palette={invitation.colorPalette}>
        <div className="relative min-h-screen">
          <BackgroundBackdrop embedUrl={embedUrl} imageUrl={backdropImage} />

          {stage !== "closed" && (
            <ViewerTopBar
              locale={displayLocale}
              onChangeLocale={setDisplayLocale}
              hasMusic={Boolean(invitation.mediaUrls.bgMusic)}
              muted={muted}
              onToggleMute={toggleMute}
            />
          )}

          <AnimatePresence>
            {stage === "closed" && (
              <Suspense fallback={null}>
                <EnvelopeOpening onOpen={handleOpenEnvelope} />
              </Suspense>
            )}
          </AnimatePresence>

          {stage === "landing" && (
            <Suspense fallback={null}>
              <Hero
                invitation={invitation}
                onOpen={handleOpenInvitation}
                onStartMusic={startMusic}
              />
            </Suspense>
          )}

          {stage === "opened" && (
            <>
              <div className="h-20 sm:h-24" aria-hidden />
              <FamilyInvitation invitation={invitation} />
              <Countdown invitation={invitation} />
              <CalendarSection invitation={invitation} />
              <Gallery invitation={invitation} />
              <Direction invitation={invitation} />
              <OurStory invitation={invitation} />
              <Agenda invitation={invitation} />
              <DigitalEnvelope invitation={invitation} />
              <GratitudeApology />
              <ColorPaletteAccent invitation={invitation} />
              <Closing invitation={invitation} />
            </>
          )}
        </div>
      </PaletteProvider>
    </NextIntlClientProvider>
  );
}
