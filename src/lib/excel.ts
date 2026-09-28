import * as XLSX from "xlsx";
import type { WeddingGuest } from "@/types";

export interface ParsedGuestRow {
  no?: number;
  name: string;
  from?: string;
  by?: string;
  note?: string;
}

/**
 * Downloads a pre-formatted Excel (.xlsx) template for wedding guests.
 * The column structure matches the user's reference:
 * No. | Name | From | By | Note
 */
export function downloadGuestExcelTemplate() {
  const templateData = [
    {
      "No.": 1,
      Name: "J Tey",
      From: "Phnom Penh",
      By: "Sitha",
      Note: "sister cousin",
    },
    {
      "No.": 2,
      Name: "Dara",
      From: "Phnom Penh",
      By: "Sitha",
      Note: "Friend",
    },
    {
      "No.": 3,
      Name: "Reaksa",
      From: "Phnom Penh",
      By: "Sitha",
      Note: "Friend",
    },
    {
      "No.": 4,
      Name: "Chhay",
      From: "Phnom Penh",
      By: "Dalin",
      Note: "Team Work",
    },
    {
      "No.": 5,
      Name: "មុន្នី រតន៍",
      From: "Phnom Penh",
      By: "Sitha",
      Note: "Old Team Work",
    },
    {
      "No.": 6,
      Name: "S.Rith",
      From: "Phnom Penh",
      By: "Dalin",
      Note: "Boss",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);

  // Set nice column widths
  worksheet["!cols"] = [
    { wch: 8 }, // No.
    { wch: 26 }, // Name
    { wch: 20 }, // From
    { wch: 16 }, // By
    { wch: 22 }, // Note
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Wedding Guests");

  XLSX.writeFile(workbook, "wedding-guests-template.xlsx");
}

/**
 * Exports the current list of wedding guests to Excel (.xlsx),
 * including invitation dispatch and RSVP status.
 */
export function exportGuestsToExcel(
  guests: WeddingGuest[],
  filename = "wedding-guests-list.xlsx",
) {
  const rows = guests.map((g, idx) => ({
    "No.": g.no ?? idx + 1,
    Name: g.name,
    From: g.from || "",
    By: g.by || "",
    Note: g.note || "",
    "Invited Status": g.isInvited ? "Invited (បានអញ្ជើញ)" : "Not Invited (មិនទាន់)",
    "RSVP Status":
      g.rsvpStatus === "attending"
        ? "Attending (ចូលរួម)"
        : g.rsvpStatus === "declined"
          ? "Declined (មិនចូលរួម)"
          : g.rsvpStatus === "not_sure"
            ? "Not Sure (មិនប្រាកដ)"
            : "Pending (រង់ចាំ)",
    Wishes: g.rsvpMessage || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 8 },
    { wch: 26 },
    { wch: 18 },
    { wch: 14 },
    { wch: 20 },
    { wch: 22 },
    { wch: 22 },
    { wch: 35 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Guests");
  XLSX.writeFile(workbook, filename);
}

/**
 * Parses an uploaded Excel (.xlsx, .xls) or .csv file and extracts guest rows.
 * Headers are normalized (case-insensitive, trims whitespace, recognizes Khmer/English aliases).
 */
export async function parseGuestsFromExcel(
  file: File,
): Promise<ParsedGuestRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error("No worksheets found in uploaded file.");
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
  });

  const parsed: ParsedGuestRow[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    let no: number | undefined = undefined;
    let name = "";
    let from = "";
    let by = "";
    let note = "";

    for (const [rawKey, rawVal] of Object.entries(row)) {
      const key = rawKey.trim().toLowerCase();
      const val = String(rawVal ?? "").trim();

      if (
        key === "no" ||
        key === "no." ||
        key === "#" ||
        key === "index" ||
        key === "ល.រ" ||
        key === "លេខរៀង"
      ) {
        const parsedNum = Number.parseInt(val, 10);
        if (!Number.isNaN(parsedNum)) no = parsedNum;
      } else if (
        key === "name" ||
        key === "guest name" ||
        key === "guestname" ||
        key === "full name" ||
        key === "ឈ្មោះ" ||
        key === "ឈ្មោះភ្ញៀវ"
      ) {
        name = val;
      } else if (
        key === "from" ||
        key === "location" ||
        key === "city" ||
        key === "address" ||
        key === "មកពី" ||
        key === "ទីលំនៅ" ||
        key === "ទីកន្លែង"
      ) {
        from = val;
      } else if (
        key === "by" ||
        key === "inviter" ||
        key === "side" ||
        key === "host" ||
        key === "អញ្ជើញដោយ" ||
        key === "ខាង"
      ) {
        by = val;
      } else if (
        key === "note" ||
        key === "notes" ||
        key === "relationship" ||
        key === "remark" ||
        key === "remarks" ||
        key === "ចំណាំ" ||
        key === "ទំនាក់ទំនង"
      ) {
        note = val;
      }
    }

    // Fallback: If standard name key wasn't matched, check if any column value looks like a name
    if (!name) {
      for (const [k, v] of Object.entries(row)) {
        const val = String(v ?? "").trim();
        const key = k.toLowerCase();
        if (
          val &&
          !key.includes("no") &&
          !key.includes("#") &&
          !key.includes("from") &&
          !key.includes("by") &&
          !key.includes("note") &&
          !name
        ) {
          name = val;
        }
      }
    }

    if (name) {
      parsed.push({
        no: no ?? parsed.length + 1,
        name,
        from: from || undefined,
        by: by || undefined,
        note: note || undefined,
      });
    }
  }

  return parsed;
}
