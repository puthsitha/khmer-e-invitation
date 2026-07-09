"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { NextIntlClientProvider, useLocale, useTranslations } from "next-intl";
import { AnimatePresence } from "framer-motion";
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
import type { Invitation } from "@/types";

const FamilyInvitation = dynamic(() =>
  import("@/components/sections/FamilyInvitation").then((m) => m.FamilyInvitation),
);
const Countdown = dynamic(() =>
  import("@/components/sections/Countdown").then((m) => m.Countdown),
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
  }

  function handleOpenInvitation() {
    setStage("opened");
    startMusic();
  }

  if (invitation === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream text-maroon">
        <p>{t("loading")}</p>
      </main>
    );
  }

  if (invitation === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream text-maroon">
        <p>{t("notFound")}</p>
      </main>
    );
  }

  if (invitation.status !== "published") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream text-maroon">
        <p>{t("notPublished")}</p>
      </main>
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
            {stage === "closed" && <EnvelopeOpening onOpen={handleOpenEnvelope} />}
          </AnimatePresence>

          {stage === "landing" && (
            <Hero
              invitation={invitation}
              onOpen={handleOpenInvitation}
              onStartMusic={startMusic}
            />
          )}

          {stage === "opened" && (
            <>
              <FamilyInvitation invitation={invitation} />
              <Countdown invitation={invitation} />
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
