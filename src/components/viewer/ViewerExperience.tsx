"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence } from "framer-motion";
import { getInvitationBySlug } from "@/lib/firebase/firestore";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { PaletteProvider } from "@/contexts/PaletteContext";
import { toBackgroundEmbedUrl } from "@/lib/embed";
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
  const [invitation, setInvitation] = useState<Invitation | null | undefined>(
    undefined,
  );
  const [stage, setStage] = useState<Stage>("closed");
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    getInvitationBySlug(slug).then(setInvitation);
  }, [slug]);

  useAutoScroll(stage === "opened");

  function handleOpenEnvelope() {
    setStage("landing");
  }

  function handleOpenInvitation() {
    setStage("opened");
    audioRef.current?.play().catch(() => {});
  }

  function toggleMute() {
    setMuted((prev) => {
      const next = !prev;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
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
    <PaletteProvider palette={invitation.colorPalette}>
      <div className="relative min-h-screen">
        <BackgroundBackdrop embedUrl={embedUrl} imageUrl={backdropImage} />

        {invitation.mediaUrls.bgMusic && (
          <audio ref={audioRef} loop src={invitation.mediaUrls.bgMusic} />
        )}

        {stage !== "closed" && (
          <ViewerTopBar
            hasMusic={Boolean(invitation.mediaUrls.bgMusic)}
            muted={muted}
            onToggleMute={toggleMute}
          />
        )}

        <AnimatePresence>
          {stage === "closed" && <EnvelopeOpening onOpen={handleOpenEnvelope} />}
        </AnimatePresence>

        {stage === "landing" && (
          <Hero invitation={invitation} onOpen={handleOpenInvitation} />
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
  );
}
