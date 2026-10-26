export interface ParsedMapDetails {
  lat?: number;
  lng?: number;
  query?: string;
  embedSrc: string;
}

/**
 * Checks if the given URL is a Google Maps short link (which requires HTTP redirect resolution).
 */
export function isShortGoogleMapsUrl(url?: string | null): boolean {
  if (!url) return false;
  return /maps\.app\.goo\.gl|goo\.gl\/maps/i.test(url);
}

/**
 * Extracts numeric latitude and longitude from various Google Maps URL formats or raw coordinate strings.
 */
export function extractCoordinates(
  urlOrText?: string | null,
): { lat: number; lng: number } | null {
  if (!urlOrText) return null;
  let trimmed = urlOrText.trim();
  try {
    trimmed = decodeURIComponent(trimmed);
  } catch {
    // ignore decode error
  }

  // 1. Raw coordinates "11.5564, 104.8872" or "11.5564,104.8872"
  const rawCoordsMatch = trimmed.match(
    /^(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)$/,
  );
  if (rawCoordsMatch) {
    const lat = parseFloat(rawCoordsMatch[1]);
    const lng = parseFloat(rawCoordsMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 2. DMS coordinates e.g. 13°17'01.5"N+103°05'17.0"E or 13°17'01.5"N, 103°05'17.0"E
  const dmsMatch = trimmed.match(
    /(\d{1,2})°(\d{1,2})[`'’]([\d.]+)[`'’"“”]*([NSEW])[\s+,]+(\d{1,3})°(\d{1,2})[`'’]([\d.]+)[`'’"“”]*([NSEW])/i,
  );
  if (dmsMatch) {
    let lat =
      parseFloat(dmsMatch[1]) +
      parseFloat(dmsMatch[2]) / 60 +
      parseFloat(dmsMatch[3]) / 3600;
    if (dmsMatch[4].toUpperCase() === "S") lat = -lat;
    let lng =
      parseFloat(dmsMatch[5]) +
      parseFloat(dmsMatch[6]) / 60 +
      parseFloat(dmsMatch[7]) / 3600;
    if (dmsMatch[8].toUpperCase() === "W") lng = -lng;
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 3. Google Maps Protobuf data parameters: !3d<lat>!4d<lng>
  const protoMatch = trimmed.match(
    /!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/,
  );
  if (protoMatch) {
    const lat = parseFloat(protoMatch[1]);
    const lng = parseFloat(protoMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 4. URL path @lat,lng (e.g. /maps/@11.5564,104.8872,17z or /place/.../@11.5564,104.8872)
  const atMatch = trimmed.match(
    /@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/,
  );
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 5. Query params containing coordinates: ?q=lat,lng or ?ll=lat,lng or ?loc:lat,lng or center=lat,lng or markers=lat,lng
  const qCoordMatch = trimmed.match(
    /[?&](?:q|query|ll|loc|center|sll|markers)=(?:loc:)?(-?\d{1,2}\.\d+)[,\s%2C]+(-?\d{1,3}\.\d+)/i,
  );
  if (qCoordMatch) {
    const lat = parseFloat(qCoordMatch[1]);
    const lng = parseFloat(qCoordMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  return null;
}

function isValidLatLng(lat: number, lng: number): boolean {
  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Parses any Google Maps URL, coordinate string, or place name into a reliable Google Maps Embed iframe URL.
 * When mapUrl is provided, it ONLY parses from mapUrl and never uses address text.
 * Falls back to the wedding venue address ONLY when mapUrl is missing.
 */
export function parseGoogleMapsDetails(
  mapUrl?: string | null,
  fallbackAddress?: string | null,
  locale: string = "km",
): ParsedMapDetails | null {
  const url = mapUrl?.trim();
  const address = fallbackAddress?.trim();

  // If a map URL is provided, ONLY parse and resolve from the map URL.
  // Never fall back to address text when a map URL is specified!
  if (url) {
    // 1. Try extracting exact coordinates first (highest accuracy)
    const coords = extractCoordinates(url);
    if (coords) {
      return {
        lat: coords.lat,
        lng: coords.lng,
        embedSrc: `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&hl=${locale}&z=16&output=embed`,
      };
    }

    // 2. Direct embed URLs already formatted for iframes
    if (
      url.includes("/maps/embed") ||
      (url.includes("output=embed") && !url.includes("q=http"))
    ) {
      return { embedSrc: url };
    }

    // 3. Extract place name or query from Google Maps URL (if not short link)
    if (!isShortGoogleMapsUrl(url)) {
      // Check for /maps/place/<placeName>
      const placeMatch = url.match(/\/maps\/place\/([^/@?]+)/i);
      if (placeMatch) {
        const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
        if (placeName && !placeName.startsWith("http")) {
          const coordsFromPlace = extractCoordinates(placeName);
          if (coordsFromPlace) {
            return {
              lat: coordsFromPlace.lat,
              lng: coordsFromPlace.lng,
              embedSrc: `https://maps.google.com/maps?q=${coordsFromPlace.lat},${coordsFromPlace.lng}&hl=${locale}&z=16&output=embed`,
            };
          }
          return {
            query: placeName,
            embedSrc: `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&hl=${locale}&z=16&output=embed`,
          };
        }
      }

      // Check for ?q=<placeName>
      const queryParamMatch = url.match(/[?&](?:q|query)=([^&]+)/i);
      if (queryParamMatch) {
        const queryVal = decodeURIComponent(queryParamMatch[1].replace(/\+/g, " "));
        if (queryVal && !queryVal.startsWith("http://") && !queryVal.startsWith("https://")) {
          const coordsFromQuery = extractCoordinates(queryVal);
          if (coordsFromQuery) {
            return {
              lat: coordsFromQuery.lat,
              lng: coordsFromQuery.lng,
              embedSrc: `https://maps.google.com/maps?q=${coordsFromQuery.lat},${coordsFromQuery.lng}&hl=${locale}&z=16&output=embed`,
            };
          }
          return {
            query: queryVal,
            embedSrc: `https://maps.google.com/maps?q=${encodeURIComponent(queryVal)}&hl=${locale}&z=16&output=embed`,
          };
        }
      }
    }

    // If map URL is present, DO NOT use address text for mapview!
    return null;
  }

  // 4. Fallback to the textual venue address ONLY when NO mapUrl was provided
  if (address) {
    return {
      query: address,
      embedSrc: `https://maps.google.com/maps?q=${encodeURIComponent(address)}&hl=${locale}&z=16&output=embed`,
    };
  }

  return null;
}

/**
 * Returns an external Google Maps link suitable for an <a> "Open in Maps" button.
 */
export function getDirectionsUrl(
  mapUrl?: string | null,
  fallbackAddress?: string | null,
): string | null {
  if (mapUrl?.trim()) return mapUrl.trim();
  if (fallbackAddress?.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      fallbackAddress.trim(),
    )}`;
  }
  return null;
}
