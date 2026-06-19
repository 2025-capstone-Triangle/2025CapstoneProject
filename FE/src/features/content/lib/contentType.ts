export type ContentRatio = "1:1" | "4:5" | "9:16";

const TYPE_TO_RATIO: Record<string, ContentRatio> = {
  SQUARE: "1:1",
  PROFILE: "1:1",
  AVATAR: "1:1",
  FEED: "4:5",
  POST: "4:5",
  PORTRAIT: "4:5",
  LANDSCAPE: "4:5",
  STORY: "9:16",
  REELS: "9:16",
  SHORTS: "9:16",
  VERTICAL: "9:16",
};

export function mapContentTypeToRatio(typeRaw: string): ContentRatio {
  const normalized = (typeRaw || "").trim().toUpperCase();

  if (TYPE_TO_RATIO[normalized]) {
    return TYPE_TO_RATIO[normalized];
  }

  if (normalized.includes("1:1") || normalized.includes("SQUARE") || normalized.includes("PROFILE")) {
    return "1:1";
  }

  if (normalized.includes("9:16") || normalized.includes("STORY") || normalized.includes("REEL")) {
    return "9:16";
  }

  return "4:5";
}

export function ratioToAspectClass(ratio: ContentRatio) {
  if (ratio === "1:1") return "aspect-square";
  if (ratio === "9:16") return "aspect-[9/16]";
  return "aspect-[4/5]";
}

