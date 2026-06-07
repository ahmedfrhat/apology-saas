export function parseAudioUrl(url) {
  if (!url || typeof url !== "string") {
    return { type: "none", url: "" };
  }

  const trimmed = url.trim();

  // 1. YouTube Regex Matcher
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
  const ytMatch = trimmed.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    return { type: "youtube", id: ytMatch[1] };
  }

  // 2. SoundCloud Matcher
  if (trimmed.includes("soundcloud.com")) {
    return { type: "soundcloud", url: trimmed };
  }

  // 3. Fallback: Direct Audio URL (MP3/M4A/etc)
  return { type: "direct", url: trimmed };
}
