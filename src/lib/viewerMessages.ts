import km from "../../messages/km.json";
import en from "../../messages/en.json";

/**
 * Both locales' messages, statically bundled so the viewer can switch its
 * displayed language client-side (no route navigation, no remount) — the
 * envelope/scroll state must survive a language switch.
 */
export const viewerMessages = { km, en } as const;
