import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { parseAudioUrl } from "@/utils/audioParser";

// Helper to load YouTube Player API
const loadYouTubeAPI = (callback) => {
  if (typeof window === "undefined") return;
  if (window.YT && window.YT.Player) {
    callback();
    return;
  }
  window._ytQueue = window._ytQueue || [];
  window._ytQueue.push(callback);

  if (!document.getElementById("yt-iframe-api")) {
    const tag = document.createElement("script");
    tag.id = "yt-iframe-api";
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      document.head.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => {
      window._ytQueue.forEach((cb) => cb());
      window._ytQueue = [];
    };
  }
};

// Helper to load SoundCloud Widget API
const loadSoundCloudAPI = (callback) => {
  if (typeof window === "undefined") return;
  if (window.SC && window.SC.Widget) {
    callback();
    return;
  }
  window._scQueue = window._scQueue || [];
  window._scQueue.push(callback);

  if (!document.getElementById("sc-widget-api")) {
    const tag = document.createElement("script");
    tag.id = "sc-widget-api";
    tag.src = "https://w.soundcloud.com/player/api.js";
    tag.onload = () => {
      window._scQueue.forEach((cb) => cb());
      window._scQueue = [];
    };
    const firstScriptTag = document.getElementsByTagName("script")[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      document.head.appendChild(tag);
    }
  }
};

export default function HiddenMultiSourcePlayer() {
  const { config, registerPlayerCallbacks, audioPlaying, currentTrackUrl } = useApp();
  
  // Get and parse audio URL with strict fallback to default public asset
  const parsed = useMemo(() => {
    const rawAudioUrl = currentTrackUrl || config?.audioUrl || config?.audio_url;
    const hasCustomAudio = typeof rawAudioUrl === "string" && rawAudioUrl.trim() !== "";
    if (hasCustomAudio) {
      return parseAudioUrl(rawAudioUrl.trim());
    } else {
      return { type: "direct", url: "/bq-music.m4a" };
    }
  }, [currentTrackUrl, config?.audioUrl, config?.audio_url]);

  const [playerReady, setPlayerReady] = useState(false);
  const playerReadyRef = useRef(false);
  const pendingPlayRef = useRef(false);
  const fadeIntervalRef = useRef(null);

  // DOM element refs
  const ytContainerRef = useRef(null);
  const scIframeRef = useRef(null);
  const audioRef = useRef(null);

  // Player instances
  const ytPlayerRef = useRef(null);
  const scWidgetRef = useRef(null);

  const cleanup = useCallback(() => {
    // Clear fade interval
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    // Direct audio cleanup
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch (e) {}
    }

    // YouTube cleanup
    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.pauseVideo();
        ytPlayerRef.current.destroy();
      } catch (e) {}
      ytPlayerRef.current = null;
    }

    // SoundCloud cleanup
    if (scWidgetRef.current) {
      try {
        scWidgetRef.current.pause();
      } catch (e) {}
      scWidgetRef.current = null;
    }

    if (ytContainerRef.current) {
      ytContainerRef.current.innerHTML = "";
    }

    setPlayerReady(false);
    playerReadyRef.current = false;
    pendingPlayRef.current = false;
  }, []);

  const startFadeIn = useCallback((setVolumeFn, isScale100 = false) => {
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    let currentVol = 0;
    const targetVol = isScale100 ? 30 : 0.3;
    const step = targetVol / 40; // 40 steps over 4 seconds (100ms interval)

    setVolumeFn(0);

    fadeIntervalRef.current = setInterval(() => {
      currentVol = Math.min(currentVol + step, targetVol);
      setVolumeFn(currentVol);
      if (currentVol >= targetVol) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
    }, 100);
  }, []);

  const stopFade = useCallback(() => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    if (!playerReadyRef.current) {
      pendingPlayRef.current = true;
      return;
    }

    stopFade();

    if (parsed.type === "youtube" && ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === "function") {
      try {
        ytPlayerRef.current.playVideo();
        startFadeIn((v) => {
          if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === "function") {
            ytPlayerRef.current.setVolume(v);
          }
        }, true);
      } catch (err) {
        console.error("YouTube play failed", err);
      }
    } else if (parsed.type === "soundcloud" && scWidgetRef.current) {
      try {
        scWidgetRef.current.play();
        startFadeIn((v) => {
          if (scWidgetRef.current && typeof scWidgetRef.current.setVolume === "function") {
            scWidgetRef.current.setVolume(v);
          }
        }, true);
      } catch (err) {
        console.error("SoundCloud play failed", err);
      }
    } else if (parsed.type === "direct" && audioRef.current) {
      try {
        audioRef.current.play().then(() => {
          startFadeIn((v) => {
            if (audioRef.current) audioRef.current.volume = v;
          }, false);
        }).catch((err) => {
          console.error("Direct audio play failed", err);
        });
      } catch (err) {
        console.error("Direct play call failed", err);
      }
    }
  }, [parsed.type, startFadeIn, stopFade]);

  const pause = useCallback(() => {
    pendingPlayRef.current = false;
    stopFade();

    if (parsed.type === "youtube" && ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === "function") {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch (err) {
        console.error("YouTube pause failed", err);
      }
    } else if (parsed.type === "soundcloud" && scWidgetRef.current) {
      try {
        scWidgetRef.current.pause();
      } catch (err) {
        console.error("SoundCloud pause failed", err);
      }
    } else if (parsed.type === "direct" && audioRef.current) {
      try {
        audioRef.current.pause();
      } catch (err) {
        console.error("Direct pause failed", err);
      }
    }
  }, [parsed.type, stopFade]);

  // Handle initialization when parsing parameters or dependencies change
  useEffect(() => {
    cleanup();

    if (parsed.type === "youtube") {
      loadYouTubeAPI(() => {
        if (!ytContainerRef.current) return;

        const childDiv = document.createElement("div");
        ytContainerRef.current.appendChild(childDiv);

        ytPlayerRef.current = new window.YT.Player(childDiv, {
          height: "0",
          width: "0",
          videoId: parsed.id,
          playerVars: {
            autoplay: 0,
            loop: 1,
            playlist: parsed.id,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
          },
          events: {
            onReady: () => {
              setPlayerReady(true);
              playerReadyRef.current = true;
              if (pendingPlayRef.current) {
                pendingPlayRef.current = false;
                play();
              }
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                event.target.playVideo();
              }
            },
          },
        });
      });
    } else if (parsed.type === "soundcloud") {
      loadSoundCloudAPI(() => {
        if (!scIframeRef.current) return;

        const widget = window.SC.Widget(scIframeRef.current);
        scWidgetRef.current = widget;

        widget.bind(window.SC.Widget.Events.READY, () => {
          widget.setLoop(true);
          setPlayerReady(true);
          playerReadyRef.current = true;
          if (pendingPlayRef.current) {
            pendingPlayRef.current = false;
            play();
          }
        });

        widget.bind(window.SC.Widget.Events.FINISH, () => {
          widget.play();
        });
      });
    } else if (parsed.type === "direct") {
      if (audioRef.current) {
        audioRef.current.src = parsed.url;
        audioRef.current.load();
        setPlayerReady(true);
        playerReadyRef.current = true;
        if (pendingPlayRef.current) {
          pendingPlayRef.current = false;
          play();
        }
      }
    }

    return () => {
      cleanup();
    };
  }, [parsed.type, parsed.id, parsed.url, cleanup, play]);

  // Register player callbacks in AppContext
  useEffect(() => {
    registerPlayerCallbacks(play, pause);
    return () => {
      registerPlayerCallbacks(null, null);
    };
  }, [play, pause, registerPlayerCallbacks]);

  const handleAudioError = () => {
    if (audioRef.current && audioRef.current.src.includes("bq-music.m4a")) {
      console.warn("bq-music.m4a failed, trying bg-music.m4a");
      audioRef.current.src = "/bg-music.m4a";
      audioRef.current.load();
      if (audioPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        width: 0,
        height: 0,
        opacity: 0,
        pointerEvents: "none",
        zIndex: -9999,
        overflow: "hidden",
      }}
    >
      {/* YouTube Container */}
      <div ref={ytContainerRef} />

      {/* SoundCloud Iframe */}
      {parsed.type === "soundcloud" && (
        <iframe
          ref={scIframeRef}
          src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(parsed.url)}&auto_play=false&loop=true&show_comments=false&show_user=false&show_reposts=false&visual=false`}
          width="0"
          height="0"
          frameBorder="no"
          scrolling="no"
          allow="autoplay"
        />
      )}

      {/* Direct HTML5 Audio */}
      {parsed.type === "direct" && (
        <audio
          ref={audioRef}
          loop
          preload="auto"
          onError={handleAudioError}
        />
      )}
    </div>
  );
}
