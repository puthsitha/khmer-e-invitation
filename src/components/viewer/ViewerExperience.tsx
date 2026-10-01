"use client";

import { useEffect, useState } from "react";
import { NextIntlClientProvider, useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Hourglass, Loader2, MailQuestion } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { getInvitationBySlug } from "@/lib/firebase/firestore";
import { decryptGuestToken } from "@/lib/guestToken";
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
import { FamilyInvitation } from "@/components/sections/FamilyInvitation";
import { Countdown } from "@/components/sections/Countdown";
import { CalendarSection } from "@/components/sections/CalendarSection";
import { Gallery } from "@/components/sections/Gallery";
import { Direction } from "@/components/sections/Direction";
import { OurStory } from "@/components/sections/OurStory";
import { Agenda } from "@/components/sections/Agenda";
import { DigitalEnvelope } from "@/components/sections/DigitalEnvelope";
import { GratitudeApology } from "@/components/sections/GratitudeApology";
import { RsvpSection } from "@/components/sections/RsvpSection";
import { ColorPaletteAccent } from "@/components/sections/ColorPaletteAccent";
import { Closing } from "@/components/sections/Closing";
import type { Invitation } from "@/types";

type Stage = "closed" | "landing" | "opened";

export function ViewerExperience({ slug }: { slug: string }) {
  const t = useTranslations("viewer");
  const searchParams = useSearchParams();
  const token = searchParams.get("g");
  const initialTo = searchParams.get("to")?.trim();
  const [guestInfo, setGuestInfo] = useState<{ guestId?: string; name?: string } | null>(
    initialTo ? { name: initialTo } : null,
  );

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

  useEffect(() => {
    if (token) {
      decryptGuestToken(token, invitation?.invitationId).then((res) => {
        if (res) {
          setGuestInfo({ guestId: res.guestId, name: res.name });
        }
      });
    }
  }, [token, invitation?.invitationId]);

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
        <div className="relative min-h-screen w-full max-w-full overflow-x-clip">
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

          <AnimatePresence mode="wait">
            {stage === "closed" && (
              <motion.div
                key="envelope"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <EnvelopeOpening
                  onOpen={handleOpenEnvelope}
                  guestName={guestInfo?.name}
                />
              </motion.div>
            )}

            {stage === "landing" && (
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Hero
                  invitation={invitation}
                  guestName={guestInfo?.name}
                  onOpen={handleOpenInvitation}
                  onStartMusic={startMusic}
                />
              </motion.div>
            )}

            {stage === "opened" && (
              <motion.div
                key="opened"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="w-full max-w-full"
              >
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
                <RsvpSection
                  invitation={invitation}
                  guestId={guestInfo?.guestId}
                  guestName={guestInfo?.name}
                />
                <ColorPaletteAccent invitation={invitation} />
                <Closing invitation={invitation} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PaletteProvider>
    </NextIntlClientProvider>
  );
}
