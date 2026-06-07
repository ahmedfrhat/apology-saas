// Singleton background-music controller.
let audio = null;
let currentSrc = "";

function getAudio(srcUrl) {
  if (typeof window === "undefined") return null;

  // Default fallback music
  const finalUrl = srcUrl || "/bq-music.m4a";

  if (!audio) {
    audio = new Audio(finalUrl);
    currentSrc = finalUrl;
    audio.loop = true;
    audio.volume = 0.3;

    // Fallback if main music fails
    audio.addEventListener("error", () => {
      if (audio.src.includes("bq-music.m4a")) {
        console.warn("bq-music.m4a failed, trying bg-music.m4a");
        audio.src = "/bg-music.m4a";
        audio.load();
        audio.play().catch(() => {});
      }
    });

    // Double insurance for looping
    audio.addEventListener("ended", () => {
      audio.currentTime = 0;
      audio.play().catch((err) => console.error("Loop replay failed", err));
    });
  } else if (srcUrl && currentSrc !== srcUrl) {
    const wasPlaying = !audio.paused;
    audio.src = srcUrl;
    currentSrc = srcUrl;
    audio.load();
    if (wasPlaying) {
      audio.play().catch(() => {});
    }
  }
  return audio;
}

export function initializeAudio(url) {
  getAudio(url);
}

export async function playMusic(url) {
  const a = getAudio(url);
  if (!a) return false;
  try {
    await a.play();
    return true;
  } catch (err) {
    console.error("bg-music play failed", err);
    return false;
  }
}

export function pauseMusic() {
  const a = getAudio();
  if (a) a.pause();
}

export function isPlaying() {
  const a = getAudio();
  return a ? !a.paused : false;
}

export function toggleMusic(url) {
  const a = getAudio(url);
  if (!a) return false;
  if (a.paused) {
    playMusic(url);
    return true;
  }
  a.pause();
  return false;
}
