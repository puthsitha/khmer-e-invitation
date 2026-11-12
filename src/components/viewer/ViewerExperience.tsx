"use client";

import { useEffect, useState } from "react";
import { NextIntlClientProvider, useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, Hourglass, Loader2, MailQuestion } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getInvitationBySlug, getTemplate } from "@/lib/firebase/firestore";
import { decryptGuestToken } from "@/lib/guestToken";
import { buildEventMetadata } from "@/lib/eventMetadata";
import {
  createSampleInvitationForTemplate,
  MOCK_WEDDING_INVITATION,
} from "@/lib/mockInvitation";
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
import { Closing } from "@/components/sections/Closing";
import type { Invitation, Template } from "@/types";

type Stage = "closed" | "landing" | "opened";

export function ViewerExperience({
  slug,
  initialInvitation,
  templateOverride,
  initialStage = "closed",
  contained = false,
  disableAutoScroll = false,
}: {
  slug: string;
  initialInvitation?: Invitation | null;
  templateOverride?: Template | null;
  initialStage?: Stage;
  contained?: boolean;
  disableAutoScroll?: boolean;
}) {
  const t = useTranslations("viewer");
  const { user, appUser, loading: authLoading } = useAuth();
  const [isAccessDenied, setIsAccessDenied] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("g");
  const initialTo = searchParams.get("to")?.trim();
  const [guestInfo, setGuestInfo] = useState<{
    guestId?: string;
    name?: string;
  } | null>(initialTo ? { name: initialTo } : null);

  const urlLocale = useLocale();
  const [fetchedInvitation, setFetchedInvitation] = useState<
    Invitation | null | undefined
  >(undefined);
  const invitation =
    initialInvitation !== undefined ? initialInvitation : fetchedInvitation;

  const [fetchedTemplate, setFetchedTemplate] = useState<Template | null>(null);
  const [stageState, setStage] = useState<Stage>(initialStage);
  const [prevInitialStage, setPrevInitialStage] = useState<Stage>(initialStage);
  if (initialStage !== prevInitialStage) {
    setPrevInitialStage(initialStage);
    setStage(initialStage);
  }
  const stage = stageState;

  const [displayLocale, setDisplayLocale] = useState<"km" | "en">(
    urlLocale === "en" ? "en" : "km",
  );

  useEffect(() => {
    if (templateOverride !== undefined) {
      return;
    }
    if (!invitation?.templateId) return;
    let cancelled = false;
    getTemplate(invitation.templateId)
      .then((tpl) => {
        if (!cancelled) setFetchedTemplate(tpl);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [invitation?.templateId, templateOverride]);

  const activeTemplate = templateOverride ?? fetchedTemplate;
  const musicEnabled = activeTemplate ? activeTemplate.hasMusic : true;
  const effectiveMusicUrl =
    musicEnabled && invitation
      ? invitation.mediaUrls.bgMusic || activeTemplate?.defaultMusicUrl
      : undefined;

  const {
    start: startMusic,
    muted,
    toggleMute,
  } = useBackgroundMusic(effectiveMusicUrl);

  useEffect(() => {
    if (initialInvitation !== undefined && initialInvitation !== null) return;
    if (authLoading) return;

    let cancelled = false;
    getInvitationBySlug(slug)
      .then(async (data) => {
        if (cancelled) return;
        if (!data && slug === MOCK_WEDDING_INVITATION.slug) {
          setFetchedInvitation(MOCK_WEDDING_INVITATION);
        } else if (!data && slug.startsWith("sample-")) {
          const tplId = slug.slice("sample-".length);
          const tpl = await getTemplate(tplId);
          if (!cancelled) {
            setFetchedInvitation(
              tpl ? createSampleInvitationForTemplate(tpl) : null
            );
          }
        } else {
          setFetchedInvitation(data);
        }
      })
      .catch((err) => {
        console.warn("Client fetch for invitation failed:", err);
        if (!cancelled) {
          setIsAccessDenied(true);
          setFetchedInvitation(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug, initialInvitation, authLoading, user]);

  useEffect(() => {
    if (invitation && !contained) {
      const { title, description } = buildEventMetadata(invitation);
      document.title = title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", description);
      }
    }
  }, [invitation, contained]);

  useEffect(() => {
    if (token) {
      decryptGuestToken(token, invitation?.invitationId).then((res) => {
        if (res) {
          setGuestInfo({ guestId: res.guestId, name: res.name });
        }
      });
    }
  }, [token, invitation?.invitationId]);

  useAutoScroll(!disableAutoScroll && !contained && stage === "opened");

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

  if (isAccessDenied) {
    return (
      <ViewerStatusScreen
        icon={<Hourglass className="h-8 w-8" />}
        message={t("notPublished")}
      />
    );
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

  const isOwnerOrAdmin = Boolean(
    user && (user.uid === invitation.ownerUid || appUser?.role === "admin")
  );

  if (invitation.status !== "published" && !isOwnerOrAdmin) {
    return (
      <ViewerStatusScreen
        icon={<Hourglass className="h-8 w-8" />}
        message={t("notPublished")}
      />
    );
  }

  const effectiveMediaType =
    activeTemplate?.backgroundType && activeTemplate.backgroundType !== "none"
      ? activeTemplate.backgroundType
      : activeTemplate?.backgroundType === "none"
        ? "none"
        : invitation.coverMediaType;

  const rawVideoUrl =
    activeTemplate?.backgroundType === "video"
      ? activeTemplate.backgroundVideoUrl
      : activeTemplate
        ? undefined
        : invitation.coverVideoEmbedUrl;

  const embedUrl =
    effectiveMediaType === "video" && rawVideoUrl
      ? toBackgroundEmbedUrl(rawVideoUrl)
      : null;

  const backdropImage =
    effectiveMediaType === "photo"
      ? activeTemplate?.backgroundImageUrl ||
        invitation.coverImageUrl ||
        invitation.mediaUrls.gallery[0]
      : undefined;

  return (
    <NextIntlClientProvider
      locale={displayLocale}
      messages={viewerMessages[displayLocale]}
    >
      <PaletteProvider
        colors={activeTemplate?.colors}
        templateId={invitation.templateId}
        palette={invitation.colorPalette}
      >
        <div
          className={`@container relative ${
            contained
              ? "h-full w-full overflow-hidden"
              : "min-h-screen w-full max-w-full overflow-x-clip"
          }`}
        >
          {!contained && invitation.status !== "published" && (
            <aside
              aria-label="Draft preview notice"
              className="sticky top-0 z-50 flex items-center justify-center gap-2 border-b border-amber-600/40 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-4 py-2 text-center text-xs font-semibold text-amber-950 shadow-md backdrop-blur-md sm:text-sm"
            >
              <Eye size={16} className="shrink-0" />
              <span>{t("draftPreviewBadge")}</span>
            </aside>
          )}
          <BackgroundBackdrop
            embedUrl={embedUrl}
            imageUrl={backdropImage}
            contained={contained}
          />

          {stage !== "closed" && (
            <ViewerTopBar
              locale={displayLocale}
              onChangeLocale={setDisplayLocale}
              hasMusic={Boolean(effectiveMusicUrl)}
              muted={muted}
              onToggleMute={toggleMute}
              contained={contained}
            />
          )}

          <div
            className={`relative z-10 mx-auto w-full max-w-[768px] ${
              contained ? "h-full overflow-y-auto overflow-x-hidden" : ""
            }`}
          >
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
                    contained={contained}
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
                    frameImageUrl={activeTemplate?.frameImageUrl}
                    onOpen={handleOpenInvitation}
                    onStartMusic={startMusic}
                    contained={contained}
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
                  <div className={contained ? "h-8" : "h-20 sm:h-24"} aria-hidden />
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
                  <Closing
                    invitation={invitation}
                    frameImageUrl={activeTemplate?.frameImageUrl}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </PaletteProvider>
    </NextIntlClientProvider>
  );
}
