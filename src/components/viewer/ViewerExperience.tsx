"use client";

import { useEffect, useState } from "react";
import { NextIntlClientProvider, useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Hourglass, Loader2, MailQuestion } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { getInvitationBySlug } from "@/lib/firebase/firestore";
import { decryptGuestToken } from "@/lib/guestToken";
import { buildEventMetadata } from "@/lib/eventMetadata";
import { MOCK_WEDDING_INVITATION } from "@/lib/mockInvitation";
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
// import { ColorPaletteAccent } from "@/components/sections/ColorPaletteAccent";
import { Closing } from "@/components/sections/Closing";
import type { Invitation } from "@/types";

type Stage = "closed" | "landing" | "opened";

export function ViewerExperience({
  slug,
  initialInvitation,
}: {
  slug: string;
  initialInvitation?: Invitation | null;
}) {
  const t = useTranslations("viewer");
  const searchParams = useSearchParams();
  const token = searchParams.get("g");
  const initialTo = searchParams.get("to")?.trim();
  const [guestInfo, setGuestInfo] = useState<{
    guestId?: string;
    name?: string;
  } | null>(initialTo ? { name: initialTo } : null);

  const urlLocale = useLocale();
  const [invitation, setInvitation] = useState<Invitation | null | undefined>(
    initialInvitation !== undefined ? initialInvitation : undefined,
  );
  const [stage, setStage] = useState<Stage>("closed");
  const [displayLocale, setDisplayLocale] = useState<"km" | "en">(
    urlLocale === "en" ? "en" : "km",
  );
  const {
    start: startMusic,
    muted,
    toggleMute,
  } = useBackgroundMusic(invitation ? invitation.mediaUrls.bgMusic : undefined);

  useEffect(() => {
    if (initialInvitation !== undefined) return;
    getInvitationBySlug(slug).then((data) => {
      if (!data && slug === MOCK_WEDDING_INVITATION.slug) {
        setInvitation(MOCK_WEDDING_INVITATION);
      } else {
        setInvitation(data);
      }
    });
  }, [slug, initialInvitation]);

  useEffect(() => {
    if (invitation) {
      const { title, description } = buildEventMetadata(invitation);
      document.title = title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", description);
      }
    }
  }, [invitation]);

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

  function handleEnvelopeAnimationStart() {
    startMusic();
  }

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

  const isPhotoCover = invitation.coverMediaType === "photo";
  const embedUrl =
    !isPhotoCover && invitation.coverVideoEmbedUrl
      ? toBackgroundEmbedUrl(invitation.coverVideoEmbedUrl)
      : null;
  const backdropImage =
    invitation.coverImageUrl || invitation.mediaUrls.gallery[0];

  return (
    <NextIntlClientProvider
      locale={displayLocale}
      messages={viewerMessages[displayLocale]}
    >
      <PaletteProvider palette={invitation.colorPalette}>
        <div className="relative min-h-screen w-full max-w-full">
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

          <div className="relative z-10 w-full max-w-full">
            <AnimatePresence mode="wait">
              {stage === "closed" && (
                <motion.div
                  key="envelope"
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <EnvelopeOpening
                    onStartAnimation={handleEnvelopeAnimationStart}
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
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
                  {/* <ColorPaletteAccent invitation={invitation} /> */}
                  <Closing invitation={invitation} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </PaletteProvider>
    </NextIntlClientProvider>
  );
}
