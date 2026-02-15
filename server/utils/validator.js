const PLATFORM_PATTERNS = [
  {
    name: "youtube",
    patterns: [
      /^(https?:\/\/)?(www\.)?youtube\.com\//i,
      /^(https?:\/\/)?(www\.)?youtu\.be\//i,
      /^(https?:\/\/)?(m\.)?youtube\.com\//i,
    ],
  },
  {
    name: "twitter",
    patterns: [
      /^(https?:\/\/)?(www\.)?twitter\.com\//i,
      /^(https?:\/\/)?(www\.)?x\.com\//i,
      /^(https?:\/\/)?(mobile\.)?twitter\.com\//i,
    ],
  },
  {
    name: "instagram",
    patterns: [/^(https?:\/\/)?(www\.)?instagram\.com\//i],
  },
  {
    name: "tiktok",
    patterns: [
      /^(https?:\/\/)?(www\.)?tiktok\.com\//i,
      /^(https?:\/\/)?(vm\.)?tiktok\.com\//i,
    ],
  },
  {
    name: "threads",
    patterns: [/^(https?:\/\/)?(www\.)?threads\.net\//i],
  },
];

function isValidUrl(url) {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    const trimmed = url.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return false;
    }
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
}

function getPlatform(url) {
  if (!url || typeof url !== "string") {
    return "unknown";
  }

  const trimmed = url.trim();

  for (const platform of PLATFORM_PATTERNS) {
    for (const pattern of platform.patterns) {
      if (pattern.test(trimmed)) {
        return platform.name;
      }
    }
  }

  return "unknown";
}

function isSupportedPlatform(url) {
  return getPlatform(url) !== "unknown";
}

module.exports = { isValidUrl, getPlatform, isSupportedPlatform };
