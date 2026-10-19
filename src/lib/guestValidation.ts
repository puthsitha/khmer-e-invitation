import type { WeddingGuest } from "@/types";
import type { ParsedGuestRow } from "@/lib/excel";

export interface GuestInfoFields {
  name: string;
  from?: string;
  by?: string;
  note?: string;
}

export function normalizeGuestField(val?: string | null): string {
  return (val ?? "").trim().toLowerCase();
}

/**
 * Checks if two guests have completely identical info.
 * Per requirement: "not check only name, check all the info if have one field not the same add into list."
 * All 4 fields (name, from, by, note) must match for it to be a duplicate.
 * If even one field is not the same, returns false.
 */
export function isGuestDuplicate(
  guestA: GuestInfoFields,
  guestB: GuestInfoFields,
): boolean {
  return (
    normalizeGuestField(guestA.name) === normalizeGuestField(guestB.name) &&
    normalizeGuestField(guestA.from) === normalizeGuestField(guestB.from) &&
    normalizeGuestField(guestA.by) === normalizeGuestField(guestB.by) &&
    normalizeGuestField(guestA.note) === normalizeGuestField(guestB.note)
  );
}

/**
 * Finds an existing guest that duplicates the given candidate info.
 */
export function findDuplicateGuest<T extends GuestInfoFields & { guestId?: string }>(
  candidate: GuestInfoFields,
  existingList: T[],
  excludeGuestId?: string,
): T | undefined {
  return existingList.find((g) => {
    if (excludeGuestId && g.guestId === excludeGuestId) {
      return false;
    }
    return isGuestDuplicate(candidate, g);
  });
}

export interface ProcessedImportRow {
  row: ParsedGuestRow;
  index: number;
  isDuplicate: boolean;
  matchedExistingGuest?: WeddingGuest;
  duplicateOfRowIndex?: number;
}

/**
 * Analyzes parsed import rows against existing guests in the database
 * as well as against earlier rows in the same import file.
 */
export function analyzeImportRows(
  rows: ParsedGuestRow[],
  existingGuests: WeddingGuest[],
): {
  items: ProcessedImportRow[];
  duplicateCount: number;
  newCount: number;
} {
  const items: ProcessedImportRow[] = [];
  let duplicateCount = 0;
  let newCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    // Check against existing guests in the database
    const matchedExisting = findDuplicateGuest(row, existingGuests);

    // Check against earlier rows in this import batch
    const duplicateOfRowIndex = items.findIndex((item) =>
      isGuestDuplicate(row, item.row),
    );

    const isDuplicate = Boolean(matchedExisting) || duplicateOfRowIndex !== -1;
    if (isDuplicate) {
      duplicateCount++;
    } else {
      newCount++;
    }

    items.push({
      row,
      index: i,
      isDuplicate,
      matchedExistingGuest: matchedExisting,
      duplicateOfRowIndex: duplicateOfRowIndex !== -1 ? duplicateOfRowIndex : undefined,
    });
  }

  return { items, duplicateCount, newCount };
}
