"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
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
import { usePalettes } from "@/hooks/usePalettes";
import { asBilingual, EMPTY_BILINGUAL } from "@/lib/bilingual";
import type {
  AgendaItem,
  FamilyMembers,
  Invitation,
  RsvpResponse,
  StoryItem,
} from "@/types";

const inputClassName =
  "rounded-lg border border-gold/40 px-4 py-2 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20";

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

function Section({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={sectionVariants}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className="mb-8 flex flex-col gap-4 rounded-2xl border border-gold/30 bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 className="font-[family-name:var(--font-heading-km)] text-lg text-maroon">
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
  const t = useTranslations("dashboard.editor");
  const tStatus = useTranslations("dashboard.list.status");
  const palettes = usePalettes();

  useEffect(() => {
    getInvitation(invitationId).then(setInvitation);
    listRsvpResponses(invitationId).then(setRsvps);
  }, [invitationId]);

  if (!invitation) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="text-maroon/60"
        >
          {t("loading")}
        </motion.p>
      </main>
    );
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

  async function handleGalleryUpload(files: FileList | null) {
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

  async function handleEnvelopeQrUpload(files: FileList | null) {
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

  async function handleStoryImageUpload(index: number, files: FileList | null) {
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
    <main className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
      <Link
        href="/dashboard"
        className="group inline-flex items-center gap-1.5 text-sm text-maroon/70 transition-colors hover:text-maroon"
      >
        <motion.span
          aria-hidden
          className="inline-block"
          animate={{ x: 0 }}
          whileHover={{ x: -2 }}
          transition={{ duration: 0.2 }}
        >
          ←
        </motion.span>
        {t("back")}
      </Link>

      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8 mt-2 font-[family-name:var(--font-heading-km)] text-2xl text-maroon sm:text-3xl"
      >
        {invitation.slug}
      </motion.h1>

      <Section title={t("content.title")} delay={0}>
        <BilingualField
          label={t("content.groomName")}
          value={asBilingual(invitation.content.groomName)}
          onBlur={(v) => saveContent({ groomName: v })}
        />
        <BilingualField
          label={t("content.brideName")}
          value={asBilingual(invitation.content.brideName)}
          onBlur={(v) => saveContent({ brideName: v })}
        />

        <div>
          <p className="mb-2 text-sm font-medium text-maroon">
            {t("content.groomFamily")}
          </p>
          <div className="flex flex-col gap-4 rounded-xl bg-cream/60 p-4">
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

        <div>
          <p className="mb-2 text-sm font-medium text-maroon">
            {t("content.brideFamily")}
          </p>
          <div className="flex flex-col gap-4 rounded-xl bg-cream/60 p-4">
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

        <BilingualField
          label={t("content.invitationText")}
          value={asBilingual(invitation.content.invitationText)}
          onBlur={(v) => saveContent({ invitationText: v })}
          textarea
        />
        <BilingualField
          label={t("content.address")}
          value={asBilingual(invitation.content.address)}
          onBlur={(v) => saveContent({ address: v })}
          textarea
        />

        <label className="flex flex-col gap-1 text-sm font-medium text-maroon">
          {t("content.mapUrl")}
          <input
            type="text"
            defaultValue={invitation.content.mapUrl ?? ""}
            onBlur={(e) => saveContent({ mapUrl: e.target.value })}
            className={inputClassName}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-maroon">
          {t("content.coverVideo")}
          <input
            type="text"
            defaultValue={invitation.coverVideoEmbedUrl ?? ""}
            onBlur={(e) => save({ coverVideoEmbedUrl: e.target.value })}
            className={inputClassName}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-maroon">
          {t("content.eventDate")}
          <input
            type="datetime-local"
            defaultValue={toLocalInputValue(invitation.eventDate)}
            onBlur={(e) =>
              save({ eventDate: new Date(e.target.value).getTime() })
            }
            className={inputClassName}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-maroon">
          {t("content.colorPalette")}
          <select
            defaultValue={invitation.colorPalette}
            onChange={(e) => save({ colorPalette: e.target.value })}
            className={inputClassName}
          >
            {palettes?.map((p) => (
              <option key={p.paletteId} value={p.paletteId}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </Section>

      <Section title={t("story.title")} delay={0.05}>
        <div className="flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {story.map((item, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col gap-3 rounded-xl border border-gold/20 bg-cream/60 p-4"
              >
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
                  <p className="mb-1 text-xs text-maroon/60">{t("story.image")}</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleStoryImageUpload(index, e.target.files)}
                  />
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt=""
                      className="mt-2 h-24 w-24 rounded-lg object-cover"
                    />
                  )}
                </div>
                <motion.button
                  type="button"
                  onClick={() => removeStoryItem(index)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="self-start text-sm text-red-700 transition-colors hover:text-red-800"
                >
                  {t("story.remove")}
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <motion.button
          type="button"
          onClick={addStoryItem}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="mt-4 self-start rounded-full border border-gold/60 px-4 py-1.5 text-sm text-maroon transition-colors hover:bg-gold/10"
        >
          + {t("story.add")}
        </motion.button>
      </Section>

      <Section title={t("agenda.title")} delay={0.1}>
        <div className="flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {agenda.map((item, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col gap-3 rounded-xl border border-gold/20 bg-cream/60 p-4"
              >
                <div>
                  <p className="mb-1 text-xs text-maroon/60">{t("agenda.time")}</p>
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
                <motion.button
                  type="button"
                  onClick={() => removeAgendaItem(index)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="self-start text-sm text-red-700 transition-colors hover:text-red-800"
                >
                  {t("agenda.remove")}
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <motion.button
          type="button"
          onClick={addAgendaItem}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="mt-4 self-start rounded-full border border-gold/60 px-4 py-1.5 text-sm text-maroon transition-colors hover:bg-gold/10"
        >
          + {t("agenda.add")}
        </motion.button>
      </Section>

      <Section title={t("media.title")} delay={0.15}>
        <div>
          <p className="mb-2 text-sm text-maroon/60">{t("media.galleryNote")}</p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => handleGalleryUpload(e.target.files)}
          />
          <div className="mt-3 flex flex-wrap gap-3">
            <AnimatePresence>
              {invitation.mediaUrls.gallery.map((url) => (
                <motion.div
                  key={url}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="relative"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="h-20 w-20 rounded-lg object-cover shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(url)}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-maroon text-xs text-cream shadow transition-transform hover:scale-110"
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div>
          <p className="mb-2 mt-2 text-sm text-maroon/60">{t("media.musicNote")}</p>
          <input
            type="file"
            accept="audio/mpeg,audio/mp4,audio/wav"
            onChange={(e) => handleMusicUpload(e.target.files)}
          />
          {invitation.mediaUrls.bgMusic && (
            <audio className="mt-2 w-full" controls src={invitation.mediaUrls.bgMusic} />
          )}
        </div>

        <div>
          <p className="mb-2 mt-2 text-sm text-maroon/60">{t("media.envelopeNote")}</p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleEnvelopeQrUpload(e.target.files)}
          />
          {invitation.mediaUrls.digitalEnvelopeQr && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={invitation.mediaUrls.digitalEnvelopeQr}
              alt=""
              className="mt-2 h-32 w-32 rounded-lg object-cover shadow-sm"
            />
          )}
        </div>
      </Section>

      <Section title={t("publish.title")} delay={0.2}>
        <p className="text-sm text-maroon/60">
          {t("publish.status")}:{" "}
          <strong className="text-maroon">{tStatus(invitation.status)}</strong>
        </p>
        <motion.button
          type="button"
          disabled={saving}
          onClick={() =>
            save({ status: invitation.status === "published" ? "draft" : "published" })
          }
          whileHover={{ scale: saving ? 1 : 1.03 }}
          whileTap={{ scale: saving ? 1 : 0.97 }}
          className="self-start rounded-full bg-maroon px-6 py-2.5 text-cream shadow-md shadow-maroon/20 transition-opacity disabled:opacity-60"
        >
          {invitation.status === "published" ? t("publish.unpublish") : t("publish.publish")}
        </motion.button>

        <AnimatePresence>
          {invitation.status === "published" && shareUrl && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mt-2 flex flex-col items-start gap-3"
            >
              <a href={shareUrl} className="break-all text-maroon underline">
                {shareUrl}
              </a>
              <QrCode value={shareUrl} size={160} />
            </motion.div>
          )}
        </AnimatePresence>
      </Section>

      <Section title={`${t("rsvp.title", { count: rsvps.length })}`} delay={0.25}>
        {rsvps.length === 0 && (
          <p className="text-sm text-maroon/60">{t("rsvp.empty")}</p>
        )}
        <ul className="flex flex-col gap-2">
          {rsvps.map((r) => (
            <li key={r.responseId} className="text-sm">
              <strong className="text-maroon">{r.guestName}</strong> —{" "}
              {r.attending ? t("rsvp.attending") : t("rsvp.notAttending")}
              {r.message ? ` — "${r.message}"` : ""}
            </li>
          ))}
        </ul>
      </Section>

      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-maroon px-5 py-2.5 text-sm text-cream shadow-lg"
          >
            {status}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function toLocalInputValue(timestamp: number) {
  const d = new Date(timestamp);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}
