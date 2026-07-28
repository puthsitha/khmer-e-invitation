"use client";

import { useEffect, useState } from "react";
import { listPalettes } from "@/lib/firebase/firestore";
import type { Palette } from "@/types";

export function usePalettes() {
  const [palettes, setPalettes] = useState<Palette[] | null>(null);

  useEffect(() => {
    listPalettes().then(setPalettes);
  }, []);

  return palettes;
}
