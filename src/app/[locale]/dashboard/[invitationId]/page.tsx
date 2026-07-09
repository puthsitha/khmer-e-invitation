"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
import { PALETTE_IDS, PALETTE_LABELS } from "@/lib/palettes";
import { asBilingual, EMPTY_BILINGUAL } from "@/lib/bilingual";
import type {
  AgendaItem,
  FamilyMembers,
  Invitation,
  RsvpResponse,
  StoryItem,
} from "@/types";

export default function EditInvitationPage() {
  const { invitationId } = useParams<{ invitationId: string }>();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [rsvps, setRsvps] = useState<RsvpResponse[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getInvitation(invitationId).then(setInvitation);
    listRsvpResponses(invitationId).then(setRsvps);
  }, [invitationId]);

  if (!invitation) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-maroon/60">Loading…</p>
      </main>
    );
  }

  async function save(patch: Partial<Invitation>) {
    setSaving(true);
    setStatus(null);
    try {
      await updateInvitation(invitation!.invitationId, patch);
      setInvitation((prev) => (prev ? { ...prev, ...patch } : prev));
      setStatus("Saved.");
    } catch {
      setStatus("Could not save. Please try again.");
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
          err instanceof UploadValidationError
            ? err.message
            : "Upload failed.",
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
        err instanceof UploadValidationError ? err.message : "Upload failed.",
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
        err instanceof UploadValidationError ? err.message : "Upload failed.",
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
        err instanceof UploadValidationError ? err.message : "Upload failed.",
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
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/dashboard" className="text-sm text-maroon/70">
        ← Back to invitations
      </Link>
      <h1 className="mb-6 mt-2 font-[family-name:var(--font-heading-km)] text-2xl text-maroon">
        {invitation.slug}
      </h1>

      {status && <p className="mb-4 text-sm text-maroon">{status}</p>}

      <section className="mb-8 flex flex-col gap-4 rounded-xl border border-gold/30 bg-white p-6">
        <h2 className="text-lg font-medium text-maroon">Content</h2>

        <BilingualField
          label="Groom name"
          value={asBilingual(invitation.content.groomName)}
          onBlur={(v) => saveContent({ groomName: v })}
        />
        <BilingualField
          label="Bride name"
          value={asBilingual(invitation.content.brideName)}
          onBlur={(v) => saveContent({ brideName: v })}
        />

        <div>
          <p className="mb-2 text-sm text-maroon">Groom&rsquo;s family</p>
          <div className="flex flex-col gap-3 rounded-lg bg-cream/60 p-3">
            <BilingualField
              label="Father"
              value={asBilingual(invitation.content.groomFamily?.father)}
              onBlur={(v) => updateFamily("groomFamily", { father: v })}
            />
            <BilingualField
              label="Mother"
              value={asBilingual(invitation.content.groomFamily?.mother)}
              onBlur={(v) => updateFamily("groomFamily", { mother: v })}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-maroon">Bride&rsquo;s family</p>
          <div className="flex flex-col gap-3 rounded-lg bg-cream/60 p-3">
            <BilingualField
              label="Father"
              value={asBilingual(invitation.content.brideFamily?.father)}
              onBlur={(v) => updateFamily("brideFamily", { father: v })}
            />
            <BilingualField
              label="Mother"
              value={asBilingual(invitation.content.brideFamily?.mother)}
              onBlur={(v) => updateFamily("brideFamily", { mother: v })}
            />
          </div>
        </div>

        <BilingualField
          label="Invitation text"
          value={asBilingual(invitation.content.invitationText)}
          onBlur={(v) => saveContent({ invitationText: v })}
          textarea
        />
        <BilingualField
          label="Address"
          value={asBilingual(invitation.content.address)}
          onBlur={(v) => saveContent({ address: v })}
          textarea
        />

        <label className="flex flex-col gap-1 text-sm text-maroon">
          Map URL
          <input
            type="text"
            defaultValue={invitation.content.mapUrl ?? ""}
            onBlur={(e) => saveContent({ mapUrl: e.target.value })}
            className="rounded-lg border border-gold/40 px-4 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-maroon">
          Cover video (YouTube/Vimeo embed URL)
          <input
            type="text"
            defaultValue={invitation.coverVideoEmbedUrl ?? ""}
            onBlur={(e) => save({ coverVideoEmbedUrl: e.target.value })}
            className="rounded-lg border border-gold/40 px-4 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-maroon">
          Event date & time
          <input
            type="datetime-local"
            defaultValue={toLocalInputValue(invitation.eventDate)}
            onBlur={(e) =>
              save({ eventDate: new Date(e.target.value).getTime() })
            }
            className="rounded-lg border border-gold/40 px-4 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-maroon">
          Color palette
          <select
            defaultValue={invitation.colorPalette}
            onChange={(e) => save({ colorPalette: e.target.value })}
            className="rounded-lg border border-gold/40 px-4 py-2"
          >
            {PALETTE_IDS.map((p) => (
              <option key={p} value={p}>
                {PALETTE_LABELS[p]}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="mb-8 rounded-xl border border-gold/30 bg-white p-6">
        <h2 className="mb-4 text-lg font-medium text-maroon">Our Story</h2>
        <div className="flex flex-col gap-4">
          {story.map((item, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-lg border border-gold/20 bg-cream/60 p-4"
            >
              <BilingualField
                label="Title"
                value={item.title}
                onBlur={(v) => updateStory(index, { title: v })}
              />
              <BilingualField
                label="Description"
                value={item.description}
                onBlur={(v) => updateStory(index, { description: v })}
                textarea
              />
              <div>
                <p className="mb-1 text-xs text-maroon/60">Image</p>
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
                    className="mt-2 h-24 w-24 rounded object-cover"
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => removeStoryItem(index)}
                className="self-start text-sm text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addStoryItem}
          className="mt-4 rounded-full border border-gold/60 px-4 py-1.5 text-sm text-maroon"
        >
          + Add story item
        </button>
      </section>

      <section className="mb-8 rounded-xl border border-gold/30 bg-white p-6">
        <h2 className="mb-4 text-lg font-medium text-maroon">Agenda</h2>
        <div className="flex flex-col gap-4">
          {agenda.map((item, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-lg border border-gold/20 bg-cream/60 p-4"
            >
              <div>
                <p className="mb-1 text-xs text-maroon/60">Time</p>
                <TimeSelect12h
                  value={item.time}
                  onChange={(time) => updateAgendaItem(index, { time })}
                />
              </div>
              <BilingualField
                label="Title"
                value={item.title}
                onBlur={(v) => updateAgendaItem(index, { title: v })}
              />
              <button
                type="button"
                onClick={() => removeAgendaItem(index)}
                className="self-start text-sm text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addAgendaItem}
          className="mt-4 rounded-full border border-gold/60 px-4 py-1.5 text-sm text-maroon"
        >
          + Add agenda item
        </button>
      </section>

      <section className="mb-8 rounded-xl border border-gold/30 bg-white p-6">
        <h2 className="mb-4 text-lg font-medium text-maroon">Media</h2>
        <p className="mb-2 text-sm text-maroon/60">
          Gallery — up to 20 images, 500KB each (JPEG/PNG/WebP).
        </p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => handleGalleryUpload(e.target.files)}
        />
        <div className="mt-3 flex flex-wrap gap-3">
          {invitation.mediaUrls.gallery.map((url) => (
            <div key={url} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-20 w-20 rounded object-cover" />
              <button
                type="button"
                onClick={() => removeGalleryImage(url)}
                className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-maroon text-xs text-cream"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <p className="mb-2 mt-6 text-sm text-maroon/60">
          Background music — up to 3MB (MP3/M4A/WAV).
        </p>
        <input
          type="file"
          accept="audio/mpeg,audio/mp4,audio/wav"
          onChange={(e) => handleMusicUpload(e.target.files)}
        />
        {invitation.mediaUrls.bgMusic && (
          <audio className="mt-2 w-full" controls src={invitation.mediaUrls.bgMusic} />
        )}

        <p className="mb-2 mt-6 text-sm text-maroon/60">
          Digital envelope QR (gift/money) — up to 500KB (JPEG/PNG/WebP).
        </p>
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
            className="mt-2 h-32 w-32 rounded object-cover"
          />
        )}
      </section>

      <section className="mb-8 rounded-xl border border-gold/30 bg-white p-6">
        <h2 className="mb-4 text-lg font-medium text-maroon">Publish & share</h2>
        <p className="mb-3 text-sm text-maroon/60">
          Status: <strong>{invitation.status}</strong>
        </p>
        <button
          type="button"
          disabled={saving}
          onClick={() =>
            save({ status: invitation.status === "published" ? "draft" : "published" })
          }
          className="rounded-full bg-maroon px-6 py-2 text-cream disabled:opacity-60"
        >
          {invitation.status === "published" ? "Unpublish" : "Publish"}
        </button>

        {invitation.status === "published" && shareUrl && (
          <div className="mt-6 flex flex-col items-start gap-3">
            <a href={shareUrl} className="break-all text-maroon underline">
              {shareUrl}
            </a>
            <QrCode value={shareUrl} size={160} />
          </div>
        )}
      </section>

      <section className="rounded-xl border border-gold/30 bg-white p-6">
        <h2 className="mb-4 text-lg font-medium text-maroon">
          RSVPs ({rsvps.length})
        </h2>
        {rsvps.length === 0 && (
          <p className="text-sm text-maroon/60">No responses yet.</p>
        )}
        <ul className="flex flex-col gap-2">
          {rsvps.map((r) => (
            <li key={r.responseId} className="text-sm">
              <strong>{r.guestName}</strong> —{" "}
              {r.attending ? "Attending" : "Not attending"}
              {r.message ? ` — "${r.message}"` : ""}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function toLocalInputValue(timestamp: number) {
  const d = new Date(timestamp);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}
