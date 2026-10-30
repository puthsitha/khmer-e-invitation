"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  getInvitation,
  getTemplate,
  listRsvpResponses,
  listWeddingGuests,
  createWeddingGuest,
  updateWeddingGuest,
  deleteWeddingGuest,
  toggleGuestInvitedStatus,
  batchImportWeddingGuests,
  updateInvitation,
} from "@/lib/firebase/firestore";
import type { WeddingGuest, RsvpDecision, Template } from "@/types";
import type { ParsedGuestRow } from "@/lib/excel";

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
import { ImageUploadManager } from "@/components/dashboard/ImageUploadManager";
import { AudioUploadManager } from "@/components/dashboard/AudioUploadManager";
import { RsvpManager } from "@/components/dashboard/RsvpManager";
import { DateTimePicker } from "@/components/dashboard/DateTimePicker";
import { AutoDismissToast } from "@/components/dashboard/AutoDismissToast";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import {
  InvitationSidebar,
  InvitationSectionKey,
} from "@/components/dashboard/InvitationSidebar";
import { InvitationTopNav } from "@/components/dashboard/InvitationTopNav";
import { VenueMapPreview } from "@/components/dashboard/VenueMapPreview";
import { asBilingual, EMPTY_BILINGUAL } from "@/lib/bilingual";
import {
  MapPin,
  Trash2,
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
  "w-full rounded-xl border border-gold/40 dark:border-gold/30 bg-white/90 dark:bg-[#20181e] px-4 py-2.5 text-base sm:text-sm text-maroon dark:text-[#f6eee8] shadow-xs transition-all duration-200 placeholder:text-maroon/30 dark:placeholder:text-[#f6eee8]/30 hover:border-gold/70 dark:hover:border-gold/50 focus:border-maroon dark:focus:border-gold focus:bg-white dark:focus:bg-[#20181e] focus:outline-none focus:ring-2 focus:ring-maroon/15 dark:focus:ring-gold/15";

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
      className="mb-8 scroll-mt-20 flex flex-col gap-5 rounded-2xl border border-gold/30 dark:border-gold/20 bg-white dark:bg-[#1c161b] p-4 shadow-sm sm:rounded-3xl sm:p-8"
    >
      <h2 className="font-[family-name:var(--font-heading-km)] text-xl text-maroon dark:text-[#f6eee8]">
        {title}
      </h2>
      {children}
    </motion.section>
  );
}

export default function EditInvitationPage() {
  const { invitationId } = useParams<{ invitationId: string }>();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [guests, setGuests] = useState<WeddingGuest[]>([]);
  const [rsvps, setRsvps] = useState<RsvpResponse[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<InvitationSectionKey>("content");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const contentAreaRef = useRef<HTMLElement | null>(null);

  const t = useTranslations("dashboard.editor");
  const tStatus = useTranslations("dashboard.list.status");
  const [template, setTemplate] = useState<Template | null>(null);

  useEffect(() => {
    let cancelled = false;

    getInvitation(invitationId)
      .then((inv) => {
        if (!cancelled) {
          setInvitation(inv);
          if (inv?.templateId) {
            getTemplate(inv.templateId)
              .then((tpl) => {
                if (!cancelled) setTemplate(tpl);
              })
              .catch(() => {});
          }
        }
      })
      .catch((err) => {
        console.warn("Could not load invitation:", err);
      });

    listRsvpResponses(invitationId)
      .then((r) => {
        if (!cancelled) setRsvps(r);
      })
      .catch((err) => {
        console.warn("Could not load RSVP responses:", err);
      });

    listWeddingGuests(invitationId)
      .then((g) => {
        if (!cancelled) setGuests(g);
      })
      .catch((err) => {
        console.warn("Could not load wedding guests:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [invitationId]);

  async function handleAddGuest(guestData: {
    name: string;
    from?: string;
    by?: string;
    note?: string;
    isInvited: boolean;
    rsvpStatus?: RsvpDecision;
  }) {
    try {
      const created = await createWeddingGuest(invitationId, guestData);
      setGuests((prev) => [...prev, created]);
      setStatus(t("rsvp.addSuccess"));
    } catch (err) {
      setStatus(t("saveError"));
      throw err;
    }
  }

  async function handleUpdateGuest(guestId: string, patch: Partial<WeddingGuest>) {
    try {
      await updateWeddingGuest(invitationId, guestId, patch);
      setGuests((prev) =>
        prev.map((g) => (g.guestId === guestId ? { ...g, ...patch, updatedAt: Date.now() } : g)),
      );
      setStatus(t("rsvp.updateSuccess"));
    } catch (err) {
      setStatus(t("saveError"));
      throw err;
    }
  }

  async function handleDeleteGuest(guestId: string) {
    try {
      await deleteWeddingGuest(invitationId, guestId);
      setGuests((prev) => prev.filter((g) => g.guestId !== guestId));
      setStatus(t("rsvp.deleteSuccess"));
    } catch (err) {
      setStatus(t("saveError"));
      throw err;
    }
  }

  async function handleToggleInvited(guestId: string, currentStatus: boolean) {
    const newStatus = !currentStatus;
    setGuests((prev) =>
      prev.map((g) => (g.guestId === guestId ? { ...g, isInvited: newStatus } : g)),
    );
    try {
      await toggleGuestInvitedStatus(invitationId, guestId, newStatus);
    } catch (err) {
      setGuests((prev) =>
        prev.map((g) => (g.guestId === guestId ? { ...g, isInvited: currentStatus } : g)),
      );
      setStatus(t("saveError"));
      throw err;
    }
  }

  async function handleBatchImportGuests(
    importedRows: ParsedGuestRow[],
    replaces?: Array<{
      guestId: string;
      data: {
        name: string;
        from?: string;
        by?: string;
        note?: string;
      };
    }>,
  ) {
    try {
      const { created, updated } = await batchImportWeddingGuests(
        invitationId,
        importedRows,
        replaces,
      );
      setGuests((prev) => {
        let next = [...prev];
        if (updated && updated.length > 0) {
          const updatedMap = new Map(updated.map((u) => [u.guestId, u]));
          next = next.map((g) => {
            const up = updatedMap.get(g.guestId);
            return up ? { ...g, ...up } : g;
          });
        }
        if (created && created.length > 0) {
          next = [...next, ...created];
        }
        return next;
      });
      const totalCount = (created?.length || 0) + (updated?.length || 0);
      setStatus(t("rsvp.importSuccess", { count: totalCount }));
    } catch (err) {
      setStatus(t("saveError"));
      throw err;
    }
  }


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
    contentAreaRef.current?.scrollTo({ top: 0, behavior: "smooth" });
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

  async function handleMusicUpload(file: File) {
    if (!file || !invitation) return;
    setStatus(null);
    try {
      const url = await uploadBgMusic(invitation.invitationId, file);
      await save({ mediaUrls: { ...invitation.mediaUrls, bgMusic: url } });
    } catch (err) {
      const msg =
        err instanceof UploadValidationError ? err.message : t("saveError");
      setStatus(msg);
      throw err;
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
    <div className="flex h-full flex-col overflow-hidden bg-cream dark:bg-[#140f13]">
      {/* Sticky Top Navigation Bar */}
      <InvitationTopNav
        slug={invitation.slug}
        shareUrl={shareUrl}
        onOpenMobileMenu={() => setMobileSidebarOpen(true)}
      />

      {/* Main Page Layout: Left Nav Bar + Content Container */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Navigation Bar (Sections navigation + Back button) */}
        <InvitationSidebar
          activeSection={activeSection}
          onSelectSection={handleSelectSection}
          counts={{
            story: story.length,
            agenda: agenda.length,
            gallery: invitation.mediaUrls.gallery.length,
            rsvps: guests.length || rsvps.length,
          }}
          shareUrl={shareUrl}
          isOpenMobile={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Content Area - ONLY THIS SCROLLS */}
        <main
          ref={contentAreaRef}
          className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden"
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
            overscrollBehaviorY: "contain",
          }}
        >
          {/* Sticky Header: Slug, ID, Status */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="sticky top-0 z-20 border-b border-gold/25 dark:border-gold/20 bg-cream/95 dark:bg-[#140f13]/95 px-4 py-3 shadow-xs sm:px-8 sm:py-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
              <div className="flex flex-col justify-center min-w-0 max-w-full">
                <h1 className="font-[family-name:var(--font-heading-km)] text-lg sm:text-2xl text-maroon dark:text-[#f6eee8] break-words min-w-0">
                  {invitation.slug}
                </h1>
                <p className="mt-0.5 text-xs text-maroon/60 dark:text-[#f6eee8]/60 truncate">
                  {t("invitationId")}: <span className="font-mono">{invitation.invitationId}</span>
                </p>
              </div>

              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-xs ${
                  invitation.status === "published"
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                    : "bg-gold/15 dark:bg-gold/20 text-maroon dark:text-[#f6eee8]"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    invitation.status === "published" ? "bg-emerald-600 dark:bg-emerald-400" : "bg-gold"
                  }`}
                />
                {tStatus(invitation.status)}
              </span>
            </div>
          </motion.div>

          <div className="w-full px-4 py-5 sm:px-8 sm:py-8">

            {/* Section 1: Content */}
            {activeSection === "content" && (
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
              <div className="rounded-2xl border border-gold/30 dark:border-gold/20 bg-cream/40 dark:bg-white/5 p-4 sm:p-5">
                <p className="mb-3 text-sm font-semibold text-maroon dark:text-[#f6eee8]">
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
              <div className="rounded-2xl border border-gold/30 dark:border-gold/20 bg-cream/40 dark:bg-white/5 p-4 sm:p-5">
                <p className="mb-3 text-sm font-semibold text-maroon dark:text-[#f6eee8]">
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
              <div className="flex flex-col gap-2">
                <label className="flex flex-col gap-1.5 text-sm font-semibold text-maroon dark:text-[#f6eee8]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-gold" />
                    <span>{t("content.mapUrl")}</span>
                  </div>
                  <input
                    type="url"
                    defaultValue={invitation.content.mapUrl ?? ""}
                    placeholder="https://maps.google.com/?q=... or latitude, longitude"
                    onBlur={(e) => saveContent({ mapUrl: e.target.value })}
                    className={inputClassName}
                  />
                </label>

                {/* Map Preview (strictly derived from the Map URL) */}
                <VenueMapPreview mapUrl={invitation.content.mapUrl} />
              </div>

              {/* Event Date & Time */}
              <DateTimePicker
                value={invitation.eventDate}
                onChange={(newTimestamp) => save({ eventDate: newTimestamp })}
                label={t("content.eventDate")}
              />
              </Section>
            )}

            {/* Section 2: Our Story */}
            {activeSection === "story" && (
              <Section id="section-story" title={t("story.title")} delay={0}>
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
                      className="flex flex-col gap-4 rounded-2xl border border-gold/30 dark:border-gold/20 bg-cream/30 dark:bg-white/5 p-5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-maroon dark:text-[#f6eee8]">
                          {t("story.milestone", { number: index + 1 })}
                        </span>
                        <motion.button
                          type="button"
                          onClick={() => removeStoryItem(index)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 transition-colors hover:text-red-700 dark:hover:text-red-300"
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
                            supportsNote: t("media.supportsNote"),
                            imagesCount: t("media.imagesCount", { count: item.image ? 1 : 0 }),
                            addImage: t("media.addImage"),
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
                className="mt-2 inline-flex items-center gap-1.5 self-start rounded-full border border-gold/60 dark:border-gold/40 bg-gold/10 dark:bg-gold/15 px-4 py-2 text-xs font-semibold text-maroon dark:text-[#f6eee8] transition-colors hover:bg-gold/20 dark:hover:bg-gold/25 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t("story.add")}</span>
              </motion.button>
              </Section>
            )}

            {/* Section 3: Agenda */}
            {activeSection === "agenda" && (
              <Section id="section-agenda" title={t("agenda.title")} delay={0}>
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
                      className="flex flex-col gap-3 rounded-2xl border border-gold/30 dark:border-gold/20 bg-cream/30 dark:bg-white/5 p-4 sm:p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-maroon dark:text-[#f6eee8]">
                          {t("agenda.event", { number: index + 1 })}
                        </span>
                        <motion.button
                          type="button"
                          onClick={() => removeAgendaItem(index)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 transition-colors hover:text-red-700 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>{t("agenda.remove")}</span>
                        </motion.button>
                      </div>

                      <div>
                        <p className="mb-1.5 text-xs font-semibold text-maroon/70 dark:text-[#f6eee8]/70">
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
                className="mt-2 inline-flex items-center gap-1.5 self-start rounded-full border border-gold/60 dark:border-gold/40 bg-gold/10 dark:bg-gold/15 px-4 py-2 text-xs font-semibold text-maroon dark:text-[#f6eee8] transition-colors hover:bg-gold/20 dark:hover:bg-gold/25 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t("agenda.add")}</span>
              </motion.button>
              </Section>
            )}

            {/* Section 4: Media */}
            {activeSection === "media" && (
              <Section id="section-media" title={t("media.title")} delay={0}>
              {/* Gallery */}
              <div className="flex flex-col gap-2 rounded-2xl border border-gold/30 dark:border-gold/20 bg-cream/20 dark:bg-white/5 p-5">
                <h3 className="text-sm font-semibold text-maroon dark:text-[#f6eee8]">{t("media.galleryTitle")}</h3>
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
                    supportsNote: t("media.supportsNote"),
                    imagesCount: t("media.imagesCount", { count: invitation.mediaUrls.gallery.length }),
                  }}
                />
              </div>

              {/* Background Music (only if enabled on template by admin) */}
              {(!template || template.hasMusic) && (
                <AudioUploadManager
                  audioUrl={invitation.mediaUrls.bgMusic}
                  onUpload={handleMusicUpload}
                  onRemove={async () => {
                    if (!invitation.mediaUrls.bgMusic) return;
                    await deleteMediaByUrl(invitation.mediaUrls.bgMusic).catch(() => {});
                    await save({ mediaUrls: { ...invitation.mediaUrls, bgMusic: undefined } });
                  }}
                  labels={{
                    musicTitle: t("media.musicTitle"),
                    musicNote: t("media.musicNote"),
                    dropzoneTitle: t("media.musicDropzoneTitle"),
                    dropzoneReplaceTitle: t("media.musicDropzoneReplaceTitle"),
                    browseFiles: t("media.browseFiles"),
                    uploading: t("media.musicProcessing"),
                    supportsNote: t("media.musicSupportsNote"),
                    removeAudio: t("media.removeImage"),
                    currentAudio: t("media.musicCurrentTrack"),
                    removing: t("media.musicRemoving"),
                    invalidAudioType: t("media.invalidAudioType"),
                  }}
                />
              )}

              {/* Digital Envelope QR */}
              <div className="flex flex-col gap-2 rounded-2xl border border-gold/30 dark:border-gold/20 bg-cream/20 dark:bg-white/5 p-5">
                <h3 className="text-sm font-semibold text-maroon dark:text-[#f6eee8]">{t("media.envelopeTitle")}</h3>
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
                    supportsNote: t("media.supportsNote"),
                    imagesCount: t("media.imagesCount", { count: invitation.mediaUrls.digitalEnvelopeQr ? 1 : 0 }),
                  }}
                />
              </div>
              </Section>
            )}

            {/* Section 5: Publish & Share */}
            {activeSection === "publish" && (
              <Section id="section-publish" title={t("publish.title")} delay={0}>
              <div className="flex flex-col gap-4 rounded-2xl border border-gold/30 dark:border-gold/20 bg-cream/30 dark:bg-white/5 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-maroon/60 dark:text-[#f6eee8]/60">{t("publish.status")}</p>
                    <p className="font-semibold text-maroon dark:text-[#f6eee8] capitalize">
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
                        ? "border border-gold/60 dark:border-gold/40 bg-white dark:bg-[#20181e] text-maroon dark:text-[#f6eee8] hover:bg-gold/10 dark:hover:bg-gold/20"
                        : "bg-maroon dark:bg-gold text-cream dark:text-maroon hover:bg-maroon/90 dark:hover:bg-gold/90 shadow-maroon/20"
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
                      className="flex flex-col items-start gap-3 border-t border-gold/20 dark:border-gold/15 pt-4"
                    >
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-maroon dark:text-[#f6eee8]">
                        <Share2 className="h-3.5 w-3.5 text-gold" />
                        <span>{t("publish.shareableLink")}:</span>
                      </span>
                      <a
                        href={shareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-gold/30 dark:border-gold/20 bg-white dark:bg-[#20181e] px-3.5 py-2 text-xs font-medium text-maroon dark:text-[#f6eee8] underline hover:text-gold dark:hover:text-gold transition-colors break-all"
                      >
                        {shareUrl}
                      </a>
                      <div className="mt-1 rounded-2xl border border-gold/30 dark:border-gold/20 bg-white p-4 shadow-xs">
                        <QrCode value={shareUrl} size={160} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              </Section>
            )}

            {/* Section 6: Guests & RSVPs */}
            {activeSection === "rsvp" && (
              <Section id="section-rsvp" title={t("rsvp.title", { count: guests.length || rsvps.length })} delay={0}>
                <RsvpManager
                  guests={guests}
                  rsvps={rsvps}
                  slug={invitation.slug}
                  onAddGuest={handleAddGuest}
                  onUpdateGuest={handleUpdateGuest}
                  onDeleteGuest={handleDeleteGuest}
                  onToggleInvited={handleToggleInvited}
                  onBatchImportGuests={handleBatchImportGuests}
                />
              </Section>
            )}
          </div>
        </main>
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
