"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  getInvitation,
  listRsvpResponses,
  updateInvitation,
} from "@/lib/firebase/firestore";
import {
  deleteMediaByUrl,
  uploadBgMusic,
  uploadDigitalEnvelopeQr,
  uploadGalleryImage,
  uploadStoryImage,
  UploadValidationError,
} from "@/lib/firebase/storage";
import { QrCode } from "@/components/ui/QrCode";
import { BilingualField } from "@/components/dashboard/BilingualField";
import { TimeSelect12h } from "@/components/dashboard/TimeSelect12h";
import { VideoPreviewCard } from "@/components/dashboard/VideoPreviewCard";
import { PaletteSelector } from "@/components/dashboard/PaletteSelector";
import { ImageUploadManager } from "@/components/dashboard/ImageUploadManager";
import { RsvpManager } from "@/components/dashboard/RsvpManager";
import { DateTimePicker } from "@/components/dashboard/DateTimePicker";
import { AutoDismissToast } from "@/components/dashboard/AutoDismissToast";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import {
  InvitationSidebar,
  InvitationSectionKey,
} from "@/components/dashboard/InvitationSidebar";
import { InvitationTopNav } from "@/components/dashboard/InvitationTopNav";
import { usePalettes } from "@/hooks/usePalettes";
import { asBilingual, EMPTY_BILINGUAL } from "@/lib/bilingual";
import {
  MapPin,
  Video,
  Music,
  Trash2,
  UploadCloud,
  Plus,
  Share2,
} from "lucide-react";
import type {
  AgendaItem,
  FamilyMembers,
  Invitation,
  RsvpResponse,
  StoryItem,
} from "@/types";

const inputClassName =
  "w-full rounded-xl border border-gold/40 bg-white/90 px-4 py-2.5 text-sm text-maroon shadow-xs transition-all duration-200 placeholder:text-maroon/30 hover:border-gold/70 focus:border-maroon focus:bg-white focus:outline-none focus:ring-2 focus:ring-maroon/15";

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

function Section({
  id,
  title,
  children,
  delay = 0,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      animate="show"
      variants={sectionVariants}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      className="mb-8 scroll-mt-20 flex flex-col gap-5 rounded-3xl border border-gold/30 bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 className="font-[family-name:var(--font-heading-km)] text-xl text-maroon">
        {title}
      </h2>
      {children}
    </motion.section>
  );
}

export default function EditInvitationPage() {
  const { invitationId } = useParams<{ invitationId: string }>();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [rsvps, setRsvps] = useState<RsvpResponse[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<InvitationSectionKey>("content");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const t = useTranslations("dashboard.editor");
  const tStatus = useTranslations("dashboard.list.status");
  const palettes = usePalettes();

  useEffect(() => {
    getInvitation(invitationId).then(setInvitation);
    listRsvpResponses(invitationId).then(setRsvps);
  }, [invitationId]);

  // Scroll-Spy to track and highlight active section on the Left Nav Bar
  useEffect(() => {
    const sectionKeys: InvitationSectionKey[] = [
      "content",
      "story",
      "agenda",
      "media",
      "publish",
      "rsvp",
    ];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (let i = sectionKeys.length - 1; i >= 0; i--) {
        const el = document.getElementById(`section-${sectionKeys[i]}`);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sectionKeys[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!invitation) {
    return <DashboardSkeleton type="editor" />;
  }

  async function save(patch: Partial<Invitation>) {
    setSaving(true);
    setStatus(null);
    try {
      await updateInvitation(invitation!.invitationId, patch);
      setInvitation((prev) => (prev ? { ...prev, ...patch } : prev));
      setStatus(t("saved"));
    } catch {
      setStatus(t("saveError"));
    } finally {
      setSaving(false);
    }
  }

  function saveContent(patch: Partial<Invitation["content"]>) {
    return save({ content: { ...invitation!.content, ...patch } });
  }

  function handleSelectSection(sectionKey: InvitationSectionKey) {
    setActiveSection(sectionKey);
    const element = document.getElementById(`section-${sectionKey}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // --- Media Handlers ------------------------------------------------
  async function handleGalleryUpload(files: FileList) {
    if (!files || !invitation) return;
    setStatus(null);
    const gallery = [...invitation.mediaUrls.gallery];
    for (const file of Array.from(files)) {
      try {
        const url = await uploadGalleryImage(
          invitation.invitationId,
          file,
          gallery.length,
        );
        gallery.push(url);
      } catch (err) {
        setStatus(
          err instanceof UploadValidationError ? err.message : t("saveError"),
        );
        break;
      }
    }
    await save({ mediaUrls: { ...invitation.mediaUrls, gallery } });
  }

  async function removeGalleryImage(url: string) {
    if (!invitation) return;
    await deleteMediaByUrl(url).catch(() => {});
    await save({
      mediaUrls: {
        ...invitation.mediaUrls,
        gallery: invitation.mediaUrls.gallery.filter((u) => u !== url),
      },
    });
  }

  async function handleMusicUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file || !invitation) return;
    setStatus(null);
    try {
      const url = await uploadBgMusic(invitation.invitationId, file);
      await save({ mediaUrls: { ...invitation.mediaUrls, bgMusic: url } });
    } catch (err) {
      setStatus(
        err instanceof UploadValidationError ? err.message : t("saveError"),
      );
    }
  }

  async function handleEnvelopeQrUpload(files: FileList) {
    const file = files?.[0];
    if (!file || !invitation) return;
    setStatus(null);
    try {
      const url = await uploadDigitalEnvelopeQr(invitation.invitationId, file);
      await save({ mediaUrls: { ...invitation.mediaUrls, digitalEnvelopeQr: url } });
    } catch (err) {
      setStatus(
        err instanceof UploadValidationError ? err.message : t("saveError"),
      );
    }
  }

  // --- Family fields -------------------------------------------------
  function updateFamily(
    key: "groomFamily" | "brideFamily",
    patch: Partial<FamilyMembers>,
  ) {
    const existing = invitation!.content[key];
    const base = existing && typeof existing === "object" ? existing : {};
    saveContent({ [key]: { ...base, ...patch } });
  }

  // --- Our Story -------------------------------------------------------
  const story = Array.isArray(invitation.content.story) ? invitation.content.story : [];

  function updateStory(index: number, patch: Partial<StoryItem>) {
    const next = story.map((item, i) => (i === index ? { ...item, ...patch } : item));
    saveContent({ story: next });
  }

  function addStoryItem() {
    const next: StoryItem[] = [
      ...story,
      { title: EMPTY_BILINGUAL, description: EMPTY_BILINGUAL },
    ];
    saveContent({ story: next });
  }

  async function removeStoryItem(index: number) {
    const item = story[index];
    if (item.image) await deleteMediaByUrl(item.image).catch(() => {});
    saveContent({ story: story.filter((_, i) => i !== index) });
  }

  async function handleStoryImageUpload(index: number, files: FileList) {
    const file = files?.[0];
    if (!file || !invitation) return;
    setStatus(null);
    try {
      const url = await uploadStoryImage(invitation.invitationId, file);
      updateStory(index, { image: url });
    } catch (err) {
      setStatus(
        err instanceof UploadValidationError ? err.message : t("saveError"),
      );
    }
  }

  // --- Agenda ------------------------------------------------------------
  const agenda = Array.isArray(invitation.content.agenda) ? invitation.content.agenda : [];

  function updateAgendaItem(index: number, patch: Partial<AgendaItem>) {
    const next = agenda.map((item, i) => (i === index ? { ...item, ...patch } : item));
    saveContent({ agenda: next });
  }

  function addAgendaItem() {
    const next: AgendaItem[] = [
      ...agenda,
      { time: "6:00 PM", title: EMPTY_BILINGUAL },
    ];
    saveContent({ agenda: next });
  }

  function removeAgendaItem(index: number) {
    saveContent({ agenda: agenda.filter((_, i) => i !== index) });
  }

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${invitation.defaultLocale}/i/${invitation.slug}`
      : "";

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {/* Sticky Top Navigation Bar */}
      <InvitationTopNav
        slug={invitation.slug}
        shareUrl={shareUrl}
        onOpenMobileMenu={() => setMobileSidebarOpen(true)}
      />

      {/* Main Page Layout: Left Nav Bar + Content Container */}
      <div className="flex flex-1">
        {/* Left Navigation Bar (Sections navigation + Back button) */}
        <InvitationSidebar
          slug={invitation.slug}
          status={invitation.status}
          activeSection={activeSection}
          onSelectSection={handleSelectSection}
          counts={{
            story: story.length,
            agenda: agenda.length,
            gallery: invitation.mediaUrls.gallery.length,
            rsvps: rsvps.length,
          }}
          shareUrl={shareUrl}
          isOpenMobile={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          tStatus={tStatus}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-10">
            {/* Header Title / Slug */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mb-8 flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <h1 className="font-[family-name:var(--font-heading-km)] text-2xl text-maroon sm:text-3xl">
                  {invitation.slug}
                </h1>
                <p className="mt-1 text-xs text-maroon/60">
                  Invitation ID: <span className="font-mono">{invitation.invitationId}</span>
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-xs ${
                  invitation.status === "published"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-gold/15 text-maroon"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    invitation.status === "published" ? "bg-emerald-600" : "bg-gold"
                  }`}
                />
                {tStatus(invitation.status)}
              </span>
            </motion.div>

            {/* Section 1: Content */}
            <Section id="section-content" title={t("content.title")} delay={0}>
              {/* Couple Names */}
              <BilingualField
                label={t("content.groomName")}
                value={asBilingual(invitation.content.groomName)}
                placeholderKm="ឈ្មោះកូនកម្លោះ"
                placeholderEn="Groom's full name"
                onBlur={(v) => saveContent({ groomName: v })}
              />
              <BilingualField
                label={t("content.brideName")}
                value={asBilingual(invitation.content.brideName)}
                placeholderKm="ឈ្មោះកូនក្រមុំ"
                placeholderEn="Bride's full name"
                onBlur={(v) => saveContent({ brideName: v })}
              />

              {/* Groom's Family */}
              <div className="rounded-2xl border border-gold/30 bg-cream/40 p-4 sm:p-5">
                <p className="mb-3 text-sm font-semibold text-maroon">
                  {t("content.groomFamily")}
                </p>
                <div className="flex flex-col gap-4">
                  <BilingualField
                    label={t("content.father")}
                    value={asBilingual(invitation.content.groomFamily?.father)}
                    onBlur={(v) => updateFamily("groomFamily", { father: v })}
                  />
                  <BilingualField
                    label={t("content.mother")}
                    value={asBilingual(invitation.content.groomFamily?.mother)}
                    onBlur={(v) => updateFamily("groomFamily", { mother: v })}
                  />
                </div>
              </div>

              {/* Bride's Family */}
              <div className="rounded-2xl border border-gold/30 bg-cream/40 p-4 sm:p-5">
                <p className="mb-3 text-sm font-semibold text-maroon">
                  {t("content.brideFamily")}
                </p>
                <div className="flex flex-col gap-4">
                  <BilingualField
                    label={t("content.father")}
                    value={asBilingual(invitation.content.brideFamily?.father)}
                    onBlur={(v) => updateFamily("brideFamily", { father: v })}
                  />
                  <BilingualField
                    label={t("content.mother")}
                    value={asBilingual(invitation.content.brideFamily?.mother)}
                    onBlur={(v) => updateFamily("brideFamily", { mother: v })}
                  />
                </div>
              </div>

              {/* Invitation Text */}
              <BilingualField
                label={t("content.invitationText")}
                value={asBilingual(invitation.content.invitationText)}
                onBlur={(v) => saveContent({ invitationText: v })}
                textarea
              />

              {/* Address */}
              <BilingualField
                label={t("content.address")}
                value={asBilingual(invitation.content.address)}
                onBlur={(v) => saveContent({ address: v })}
                textarea
              />

              {/* Map URL */}
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-maroon">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-gold" />
                  <span>{t("content.mapUrl")}</span>
                </div>
                <input
                  type="url"
                  defaultValue={invitation.content.mapUrl ?? ""}
                  placeholder="https://maps.google.com/?q=..."
                  onBlur={(e) => saveContent({ mapUrl: e.target.value })}
                  className={inputClassName}
                />
              </label>

              {/* Cover Video Input & Live Preview */}
              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-1.5 text-sm font-semibold text-maroon">
                  <div className="flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-gold" />
                    <span>{t("content.coverVideo")}</span>
                  </div>
                  <input
                    type="url"
                    defaultValue={invitation.coverVideoEmbedUrl ?? ""}
                    placeholder={t("content.coverVideoPlaceholder")}
                    onBlur={(e) => save({ coverVideoEmbedUrl: e.target.value })}
                    className={inputClassName}
                  />
                </label>

                <VideoPreviewCard
                  url={invitation.coverVideoEmbedUrl ?? ""}
                  onClear={() => save({ coverVideoEmbedUrl: "" })}
                  labels={{
                    previewTitle: t("content.videoPreviewTitle"),
                    previewEmpty: t("content.videoPreviewEmpty"),
                    previewHint: t("content.videoPreviewHint"),
                    validYoutube: t("content.videoValidYoutube"),
                    validVimeo: t("content.videoValidVimeo"),
                    openLink: t("content.openVideoLink"),
                    clear: t("content.clearVideo"),
                  }}
                />
              </div>

              {/* Event Date & Time */}
              <DateTimePicker
                value={invitation.eventDate}
                onChange={(newTimestamp) => save({ eventDate: newTimestamp })}
                label={t("content.eventDate")}
              />

              {/* Color Palette Selector */}
              <PaletteSelector
                palettes={palettes ?? []}
                selectedId={invitation.colorPalette}
                onSelect={(pId) => save({ colorPalette: pId })}
                title={t("content.colorPalette")}
                description={t("content.colorPaletteDescription")}
              />
            </Section>

            {/* Section 2: Our Story */}
            <Section id="section-story" title={t("story.title")} delay={0.05}>
              <div className="flex flex-col gap-4">
                <AnimatePresence initial={false}>
                  {story.map((item, index) => (
                    <motion.div
                      key={index}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-4 rounded-2xl border border-gold/30 bg-cream/30 p-5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-maroon">
                          Story Milestone #{index + 1}
                        </span>
                        <motion.button
                          type="button"
                          onClick={() => removeStoryItem(index)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 transition-colors hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>{t("story.remove")}</span>
                        </motion.button>
                      </div>

                      <BilingualField
                        label={t("story.itemTitle")}
                        value={item.title}
                        onBlur={(v) => updateStory(index, { title: v })}
                      />
                      <BilingualField
                        label={t("story.description")}
                        value={item.description}
                        onBlur={(v) => updateStory(index, { description: v })}
                        textarea
                      />

                      <div>
                        <ImageUploadManager
                          images={item.image ? [item.image] : []}
                          multiple={false}
                          onUpload={(files) => handleStoryImageUpload(index, files)}
                          onRemove={async () => {
                            if (item.image) await deleteMediaByUrl(item.image).catch(() => {});
                            updateStory(index, { image: undefined });
                          }}
                          labels={{
                            dropzoneTitle: t("story.image"),
                            browseFiles: t("media.browseFiles"),
                            uploading: t("media.uploading"),
                            removeImage: t("story.remove"),
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <motion.button
                type="button"
                onClick={addStoryItem}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-2 inline-flex items-center gap-1.5 self-start rounded-full border border-gold/60 bg-gold/10 px-4 py-2 text-xs font-semibold text-maroon transition-colors hover:bg-gold/20"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t("story.add")}</span>
              </motion.button>
            </Section>

            {/* Section 3: Agenda */}
            <Section id="section-agenda" title={t("agenda.title")} delay={0.1}>
              <div className="flex flex-col gap-4">
                <AnimatePresence initial={false}>
                  {agenda.map((item, index) => (
                    <motion.div
                      key={index}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-3 rounded-2xl border border-gold/30 bg-cream/30 p-4 sm:p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-maroon">
                          Agenda Event #{index + 1}
                        </span>
                        <motion.button
                          type="button"
                          onClick={() => removeAgendaItem(index)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 transition-colors hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>{t("agenda.remove")}</span>
                        </motion.button>
                      </div>

                      <div>
                        <p className="mb-1.5 text-xs font-semibold text-maroon/70">
                          {t("agenda.time")}
                        </p>
                        <TimeSelect12h
                          value={item.time}
                          onChange={(time) => updateAgendaItem(index, { time })}
                        />
                      </div>

                      <BilingualField
                        label={t("agenda.itemTitle")}
                        value={item.title}
                        onBlur={(v) => updateAgendaItem(index, { title: v })}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <motion.button
                type="button"
                onClick={addAgendaItem}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-2 inline-flex items-center gap-1.5 self-start rounded-full border border-gold/60 bg-gold/10 px-4 py-2 text-xs font-semibold text-maroon transition-colors hover:bg-gold/20"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t("agenda.add")}</span>
              </motion.button>
            </Section>

            {/* Section 4: Media */}
            <Section id="section-media" title={t("media.title")} delay={0.15}>
              {/* Gallery */}
              <div className="flex flex-col gap-2 rounded-2xl border border-gold/30 bg-cream/20 p-5">
                <h3 className="text-sm font-semibold text-maroon">Photo Gallery</h3>
                <ImageUploadManager
                  images={invitation.mediaUrls.gallery}
                  onUpload={handleGalleryUpload}
                  onRemove={removeGalleryImage}
                  multiple={true}
                  note={t("media.galleryNote")}
                  labels={{
                    dropzoneTitle: t("media.dropzoneTitle"),
                    browseFiles: t("media.browseFiles"),
                    uploading: t("media.uploading"),
                    removeImage: t("media.removeImage"),
                    coverPhotoBadge: t("media.coverPhotoBadge"),
                    addImage: t("media.addImage"),
                  }}
                />
              </div>

              {/* Background Music */}
              <div className="flex flex-col gap-3 rounded-2xl border border-gold/30 bg-cream/20 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/20 text-maroon">
                      <Music className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-maroon">Background Music</h4>
                      <p className="text-xs text-maroon/60">{t("media.musicNote")}</p>
                    </div>
                  </div>

                  {invitation.mediaUrls.bgMusic && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!invitation.mediaUrls.bgMusic) return;
                        await deleteMediaByUrl(invitation.mediaUrls.bgMusic).catch(() => {});
                        await save({ mediaUrls: { ...invitation.mediaUrls, bgMusic: undefined } });
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{t("media.removeImage")}</span>
                    </button>
                  )}
                </div>

                <div className="mt-1">
                  <input
                    type="file"
                    id="bg-music-input"
                    accept="audio/mpeg,audio/mp4,audio/wav"
                    onChange={(e) => handleMusicUpload(e.target.files)}
                    className="hidden"
                  />
                  <label
                    htmlFor="bg-music-input"
                    className="inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-white px-4 py-2.5 text-xs font-semibold text-maroon shadow-xs transition-colors hover:bg-gold/15 cursor-pointer"
                  >
                    <UploadCloud className="h-4 w-4 text-gold" />
                    <span>{invitation.mediaUrls.bgMusic ? "Change Audio Track" : "Upload Audio Track"}</span>
                  </label>
                </div>

                {invitation.mediaUrls.bgMusic && (
                  <div className="rounded-xl border border-gold/30 bg-white p-3 shadow-xs">
                    <audio className="w-full" controls src={invitation.mediaUrls.bgMusic} />
                  </div>
                )}
              </div>

              {/* Digital Envelope QR */}
              <div className="flex flex-col gap-2 rounded-2xl border border-gold/30 bg-cream/20 p-5">
                <h3 className="text-sm font-semibold text-maroon">Digital Envelope (Gift QR)</h3>
                <ImageUploadManager
                  images={invitation.mediaUrls.digitalEnvelopeQr ? [invitation.mediaUrls.digitalEnvelopeQr] : []}
                  multiple={false}
                  note={t("media.envelopeNote")}
                  onUpload={handleEnvelopeQrUpload}
                  onRemove={async () => {
                    if (invitation.mediaUrls.digitalEnvelopeQr) {
                      await deleteMediaByUrl(invitation.mediaUrls.digitalEnvelopeQr).catch(() => {});
                      await save({ mediaUrls: { ...invitation.mediaUrls, digitalEnvelopeQr: undefined } });
                    }
                  }}
                  labels={{
                    dropzoneTitle: t("media.dropzoneTitle"),
                    browseFiles: t("media.browseFiles"),
                    uploading: t("media.uploading"),
                    removeImage: t("media.removeImage"),
                  }}
                />
              </div>
            </Section>

            {/* Section 5: Publish & Share */}
            <Section id="section-publish" title={t("publish.title")} delay={0.2}>
              <div className="flex flex-col gap-4 rounded-2xl border border-gold/30 bg-cream/30 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-maroon/60">{t("publish.status")}</p>
                    <p className="font-semibold text-maroon capitalize">
                      {tStatus(invitation.status)}
                    </p>
                  </div>

                  <motion.button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      save({ status: invitation.status === "published" ? "draft" : "published" })
                    }
                    whileHover={{ scale: saving ? 1 : 1.03 }}
                    whileTap={{ scale: saving ? 1 : 0.97 }}
                    className={`rounded-full px-6 py-2 text-sm font-semibold shadow-md transition-all disabled:opacity-60 cursor-pointer ${
                      invitation.status === "published"
                        ? "border border-gold/60 bg-white text-maroon hover:bg-gold/10"
                        : "bg-maroon text-cream hover:bg-maroon/90 shadow-maroon/20"
                    }`}
                  >
                    {invitation.status === "published" ? t("publish.unpublish") : t("publish.publish")}
                  </motion.button>
                </div>

                <AnimatePresence>
                  {invitation.status === "published" && shareUrl && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-start gap-3 border-t border-gold/20 pt-4"
                    >
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-maroon">
                        <Share2 className="h-3.5 w-3.5 text-gold" />
                        <span>Shareable Link:</span>
                      </span>
                      <a
                        href={shareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-gold/30 bg-white px-3.5 py-2 text-xs font-medium text-maroon underline hover:text-gold transition-colors break-all"
                      >
                        {shareUrl}
                      </a>
                      <div className="mt-1 rounded-2xl border border-gold/30 bg-white p-4 shadow-xs">
                        <QrCode value={shareUrl} size={160} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Section>

            {/* Section 6: RSVPs */}
            <Section id="section-rsvp" title={t("rsvp.title", { count: rsvps.length })} delay={0.25}>
              <RsvpManager
                rsvps={rsvps}
                labels={{
                  title: t("rsvp.title", { count: rsvps.length }),
                  empty: t("rsvp.empty"),
                  attending: t("rsvp.attending"),
                  notAttending: t("rsvp.notAttending"),
                  total: t("rsvp.total"),
                  attendingCount: t("rsvp.attendingCount"),
                  declinedCount: t("rsvp.declinedCount"),
                  rate: t("rsvp.rate"),
                  searchPlaceholder: t("rsvp.searchPlaceholder"),
                  filterAll: t("rsvp.filterAll"),
                  filterAttending: t("rsvp.filterAttending"),
                  filterDeclined: t("rsvp.filterDeclined"),
                  noResults: t("rsvp.noResults"),
                }}
              />
            </Section>
          </div>
        </div>
      </div>

      {/* Auto-dismissing Floating Save Status Toast */}
      <AutoDismissToast
        message={status}
        onClose={() => setStatus(null)}
        duration={3000}
      />
    </div>
  );
}
