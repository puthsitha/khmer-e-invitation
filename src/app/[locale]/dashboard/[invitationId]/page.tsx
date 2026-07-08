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
  UploadValidationError,
} from "@/lib/firebase/storage";
import { QrCode } from "@/components/ui/QrCode";
import { PALETTE_IDS, PALETTE_LABELS } from "@/lib/palettes";
import type { Invitation, RsvpResponse } from "@/types";

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

      <section className="mb-8 rounded-xl border border-gold/30 bg-white p-6">
        <h2 className="mb-4 text-lg font-medium text-maroon">Content</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Groom name"
            value={invitation.content.groomName ?? ""}
            onBlur={(v) => save({ content: { ...invitation.content, groomName: v } })}
          />
          <Field
            label="Bride name"
            value={invitation.content.brideName ?? ""}
            onBlur={(v) => save({ content: { ...invitation.content, brideName: v } })}
          />
          <Field
            label="Groom's family"
            value={invitation.content.groomFamily ?? ""}
            onBlur={(v) => save({ content: { ...invitation.content, groomFamily: v } })}
          />
          <Field
            label="Bride's family"
            value={invitation.content.brideFamily ?? ""}
            onBlur={(v) => save({ content: { ...invitation.content, brideFamily: v } })}
          />
        </div>
        <TextField
          label="Invitation text"
          value={invitation.content.invitationText ?? ""}
          onBlur={(v) => save({ content: { ...invitation.content, invitationText: v } })}
        />
        <TextField
          label="Our story"
          value={invitation.content.story ?? ""}
          onBlur={(v) => save({ content: { ...invitation.content, story: v } })}
        />
        <Field
          label="Map URL"
          value={invitation.content.mapUrl ?? ""}
          onBlur={(v) => save({ content: { ...invitation.content, mapUrl: v } })}
        />
        <Field
          label="Cover video (YouTube/Vimeo embed URL)"
          value={invitation.coverVideoEmbedUrl ?? ""}
          onBlur={(v) => save({ coverVideoEmbedUrl: v })}
        />
        <label className="mt-4 flex flex-col gap-1 text-sm text-maroon">
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
        <label className="mt-4 flex flex-col gap-1 text-sm text-maroon">
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

function Field({
  label,
  value,
  onBlur,
}: {
  label: string;
  value: string;
  onBlur: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-maroon">
      {label}
      <input
        type="text"
        defaultValue={value}
        onBlur={(e) => onBlur(e.target.value)}
        className="rounded-lg border border-gold/40 px-4 py-2"
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onBlur,
}: {
  label: string;
  value: string;
  onBlur: (value: string) => void;
}) {
  return (
    <label className="mt-4 flex flex-col gap-1 text-sm text-maroon">
      {label}
      <textarea
        defaultValue={value}
        onBlur={(e) => onBlur(e.target.value)}
        rows={3}
        className="rounded-lg border border-gold/40 px-4 py-2"
      />
    </label>
  );
}
