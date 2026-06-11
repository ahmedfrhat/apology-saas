import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useLanguage } from "./LanguageContext";
import Pusher from "pusher-js";

const AppContext = createContext(null);

// Persistent per-visit session id (kept in sessionStorage).
function getSessionId() {
  if (typeof window === "undefined") return "ssr";
  let id = window.sessionStorage.getItem("kvow_session_id");
  if (!id) {
    id = `kvow-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    window.sessionStorage.setItem("kvow_session_id", id);
  }
  return id;
}

function getSlugFromPath() {
  if (typeof window === "undefined") return "";
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0];
  if (first === "api" || first === "errors" || first === "__create") {
    return "";
  }
  return first;
}

const INITIAL_STATE = {
  batteryLevel: 0,
  currentSection: "loader",
  lastAction: null,
  hesitationDetected: false,
  hesitationSeconds: 0,
  broadcastMsg: null,
  pleaText: null,
  starRating: null,
  finalComment: null,
  details: {},
  sticky_notes: {},
  courtroom_followup: "",
  time_capsule: "",
  capsule_created_at: null,
};

export function AppProvider({ children }) {
  const { setLocale } = useLanguage();
  const [state, setState] = useState(INITIAL_STATE);
  const [config, setConfig] = useState(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const sessionIdRef = useRef(null);
  const wrongClicksRef = useRef([]);
  const syncTimerRef = useRef(null);
  const latestSyncRef = useRef({});
  const [currentTrackUrl, setCurrentTrackUrl] = useState("");
  const [isFrozen, setIsFrozen] = useState(false);
  const [whisperMessages, setWhisperMessages] = useState([]);
  
  const sectionStartTimeRef = useRef(Date.now());

  const [audioPlaying, setAudioPlaying] = useState(false);
  const playFnRef = useRef(null);
  const pauseFnRef = useRef(null);

  const registerPlayerCallbacks = useCallback((playFn, pauseFn) => {
    playFnRef.current = playFn;
    pauseFnRef.current = pauseFn;
  }, []);

  const playMusic = useCallback(() => {
    setAudioPlaying(true);
    if (playFnRef.current) {
      playFnRef.current();
    }
  }, []);

  const pauseMusic = useCallback(() => {
    setAudioPlaying(false);
    if (pauseFnRef.current) {
      pauseFnRef.current();
    }
  }, []);

  const toggleMusic = useCallback(() => {
    setAudioPlaying((prev) => {
      const next = !prev;
      if (next && playFnRef.current) {
        playFnRef.current();
      } else if (!next && pauseFnRef.current) {
        pauseFnRef.current();
      }
      return next;
    });
  }, []);

  if (sessionIdRef.current === null && typeof window !== "undefined") {
    sessionIdRef.current = getSessionId();
  }

  const fetchConfig = useCallback(async () => {
    const slug = getSlugFromPath();
    if (!slug) {
      setIsLoadingConfig(false);
      return;
    }
    try {
      setIsLoadingConfig(true);
      const res = await fetch(`/api/sites/${encodeURIComponent(slug)}`);
      if (res.ok) {
        const data = await res.json();
        let actualConfig = data.config || data;
        
        // UN-NEST if corrupted from previous saves
        while (actualConfig && actualConfig.config && typeof actualConfig.config === "object" && !Array.isArray(actualConfig.config)) {
          actualConfig = actualConfig.config;
        }
        
        setConfig(actualConfig);
        if (actualConfig.locale) {
          setLocale(actualConfig.locale);
        }
      } else {
        console.error("Failed to load config from server, status:", res.status);
      }
    } catch (err) {
      console.error("Failed to load config", err);
    } finally {
      setIsLoadingConfig(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const t = useCallback((str) => {
    if (typeof str !== "string") return str;
    if (!config) return str;
    return str
      .replace(/{boyName}/g, config.boyName || "حبيبك")
      .replace(/{girlName}/g, config.girlName || "حبيبتك")
      .replace(/{girlNickname}/g, config.girlNickname || "يا روحي");
  }, [config]);

  // Debounced sync of tracking-relevant fields to the backend.
  const scheduleSync = useCallback((next) => {
    latestSyncRef.current = {
      current_section: next.currentSection,
      battery_level: next.batteryLevel,
      last_action: next.lastAction,
      hesitation_detected: next.hesitationDetected,
      hesitation_seconds: next.hesitationSeconds,
      plea_text: next.pleaText,
      star_rating: next.starRating,
      final_comment: next.finalComment,
      details: next.details,
      sticky_notes: next.sticky_notes,
      courtroom_followup: next.courtroom_followup,
      time_capsule: next.time_capsule,
    };
    if (syncTimerRef.current) return;
    syncTimerRef.current = setTimeout(async () => {
      syncTimerRef.current = null;
      const sessionId = sessionIdRef.current;
      if (!sessionId) return;
      const slug = getSlugFromPath();
      if (!slug) return;
      try {
        await fetch(`/api/t-logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: slug,
            session_id: sessionId,
            ...latestSyncRef.current,
          }),
        });
      } catch (err) {
        // Tracking is best-effort; never break the experience.
        console.error("tracking sync failed", err);
      }
    }, 600);
  }, []);

  const updateState = useCallback(
    (partial) => {
      setState((prev) => {
        const next = { ...prev, ...partial };
        scheduleSync(next);
        return next;
      });
    },
    [scheduleSync],
  );

  const appendWrongClick = useCallback((text) => {
    wrongClicksRef.current = [...wrongClicksRef.current, text];
    setState((prev) => ({ ...prev, lastAction: `wrong:${text}` }));
  }, []);

  // Polling for broadcast message
  useEffect(() => {
    const isDashboard = typeof window !== "undefined" && window.location.pathname.includes("/dashboard");
    if (isDashboard) return;

    let active = true;
    let abortController = new AbortController();

    const poll = async () => {
      const sessionId = sessionIdRef.current;
      if (!sessionId) return;
      const slug = getSlugFromPath();
      if (!slug) return;

      try {
        const res = await fetch(
          `/api/broadcast/${encodeURIComponent(slug)}?session_id=${encodeURIComponent(sessionId)}`,
          { signal: abortController.signal }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (active && data.message) {
          setState((prev) => ({ ...prev, broadcastMsg: data.message }));
        }
      } catch (err) {
        // ignore polling errors
      }
    };

    const interval = setInterval(poll, 3000);
    return () => {
      active = false;
      clearInterval(interval);
      abortController.abort();
    };
  }, []);

  // Sync section transition durations dynamically
  useEffect(() => {
    const prevSection = state.currentSection;
    if (!prevSection) return;

    const elapsed = Math.round((Date.now() - sectionStartTimeRef.current) / 1000);
    sectionStartTimeRef.current = Date.now();

    if (elapsed <= 0) return;

    setState((prev) => {
      const currentDurations = prev.details?.stage_durations || {};
      const updatedDurations = {
        ...currentDurations,
        [prevSection]: (currentDurations[prevSection] || 0) + elapsed
      };
      const nextDetails = {
        ...prev.details,
        stage_durations: updatedDurations
      };
      const nextState = { ...prev, details: nextDetails };
      scheduleSync(nextState);
      return nextState;
    });
  }, [state.currentSection, scheduleSync]);

  // Real-time Event Logger Helper
  const logLedgerEvent = useCallback((description) => {
    const slug = getSlugFromPath();
    const sessionId = sessionIdRef.current;
    if (!slug || !sessionId) return;

    const newEvent = {
      timestamp: new Date().toISOString(),
      event: description
    };

    // Broadcast to Pusher Serverless trigger
    fetch(`/api/realtime/${encodeURIComponent(slug)}/trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        event: "ledger-event",
        data: { event: newEvent }
      })
    }).catch(() => {});

    // Save to State and trigger DB Sync
    setState((prev) => {
      const currentLedger = prev.details?.ledger || [];
      const nextDetails = {
        ...prev.details,
        ledger: [...currentLedger, newEvent]
      };
      const nextState = { ...prev, details: nextDetails };
      scheduleSync(nextState);
      return nextState;
    });
  }, [scheduleSync]);

  // Connect client-side to Pusher Channel & handle subscriptions
  useEffect(() => {
    const slug = getSlugFromPath();
    if (!slug) return;
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1";

    let pusherClient = null;
    let channel = null;

    if (pusherKey && pusherKey !== "mock-key") {
      try {
        pusherClient = new Pusher(pusherKey, {
          cluster: pusherCluster,
          forceTLS: true
        });
        channel = pusherClient.subscribe(`apology-${slug}`);

        channel.bind("freeze", (data) => {
          if (data.session_id === sessionId) {
            setIsFrozen(true);
          }
        });

        channel.bind("unfreeze", (data) => {
          if (data.session_id === sessionId) {
            setIsFrozen(false);
          }
        });

        channel.bind("stealth-message", (data) => {
          if (data.session_id === sessionId) {
            setWhisperMessages((prev) => [...prev, data.message]);
            // Save whispers array in DB details
            setState((prev) => {
              const currentWhispers = prev.details?.whisperMessages || [];
              const nextDetails = {
                ...prev.details,
                whisperMessages: [...currentWhispers, data.message]
              };
              const nextState = { ...prev, details: nextDetails };
              scheduleSync(nextState);
              return nextState;
            });
          }
        });
      } catch (err) {
        console.error("Pusher subscription failed client-side", err);
      }
    }

    return () => {
      if (channel && pusherClient) {
        channel.unbind_all();
        pusherClient.unsubscribe(`apology-${slug}`);
      }
    };
  }, [scheduleSync]);

  // Fallback Polling (Database Sync) for Freeze & Whispers if Pusher is absent
  useEffect(() => {
    const isDashboard = typeof window !== "undefined" && window.location.pathname.includes("/dashboard");
    if (isDashboard) return;

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    if (pusherKey && pusherKey !== "mock-key") return; // Pusher is active, skip polling

    let active = true;
    const pollDbFallback = async () => {
      const slug = getSlugFromPath();
      const sessionId = sessionIdRef.current;
      if (!slug || !sessionId || !active) return;

      try {
        const res = await fetch(`/api/tracking/${encodeURIComponent(slug)}/${encodeURIComponent(sessionId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.row && active) {
            setIsFrozen(!!data.row.is_frozen);
            if (data.row.details && data.row.details.whisperMessages) {
              setWhisperMessages(data.row.details.whisperMessages);
            }
          }
        }
      } catch (err) {
        // ignore fallback errors
      }
    };

    const interval = setInterval(pollDbFallback, 2000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Track cursor movements, throttle to 150ms, and broadcast
  useEffect(() => {
    const isDashboard = typeof window !== "undefined" && window.location.pathname.includes("/dashboard");
    if (isDashboard) return;

    const slug = getSlugFromPath();
    const sessionId = sessionIdRef.current;
    if (!slug || !sessionId) return;

    const lastSentRef = { current: 0 };

    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastSentRef.current < 150) return;
      lastSentRef.current = now;

      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      fetch(`/api/realtime/${encodeURIComponent(slug)}/trigger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          event: "cursor-move",
          data: { x, y }
        })
      }).catch(() => {});
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Fire initial session tracking registration on mount
  useEffect(() => {
    const isDashboard = typeof window !== "undefined" && window.location.pathname.includes("/dashboard");
    if (isDashboard) return;

    const slug = getSlugFromPath();
    if (!slug) return;
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;

    const fireInitialTracking = async () => {
      try {
        await fetch(`/api/t-logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: slug,
            session_id: sessionId,
            current_section: state.currentSection || "loader",
            battery_level: state.batteryLevel || 0,
            last_action: "session_start",
            hesitation_detected: state.hesitationDetected || false,
            hesitation_seconds: state.hesitationSeconds || 0,
            plea_text: state.pleaText || null,
            star_rating: state.starRating || null,
            final_comment: state.finalComment || null,
          }),
        });
      } catch (err) {
        console.error("Initial session tracking failed", err);
      }
    };
    fireInitialTracking();
  }, []);

  // Fetch existing session data if available
  useEffect(() => {
    const isDashboard = typeof window !== "undefined" && window.location.pathname.includes("/dashboard");
    if (isDashboard) return;

    const slug = getSlugFromPath();
    if (!slug) return;
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;

    const fetchSessionData = async () => {
      try {
        const res = await fetch(`/api/tracking/${encodeURIComponent(slug)}/${encodeURIComponent(sessionId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.row) {
            setIsFrozen(!!data.row.is_frozen);
            setState((prev) => ({
              ...prev,
              sticky_notes: data.row.sticky_notes || {},
              courtroom_followup: data.row.courtroom_followup || "",
              time_capsule: data.row.time_capsule || "",
              capsule_created_at: data.row.created_at || null,
              pleaText: data.row.plea_text || prev.pleaText,
              starRating: data.row.star_rating || prev.starRating,
              finalComment: data.row.final_comment || prev.finalComment,
              details: data.row.details || prev.details,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch session data", err);
      }
    };
    fetchSessionData();
  }, []);

  const clearBroadcast = useCallback(() => {
    setState((prev) => ({ ...prev, broadcastMsg: null }));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      sessionId: sessionIdRef.current,
      updateState,
      appendWrongClick,
      clearBroadcast,
      wrongClicks: wrongClicksRef.current,
      config,
      isLoadingConfig,
      t,
      refetchConfig: fetchConfig,
      siteSlug: getSlugFromPath(),
      audioPlaying,
      playMusic,
      pauseMusic,
      toggleMusic,
      registerPlayerCallbacks,
      currentTrackUrl,
      setCurrentTrackUrl,
      isFrozen,
      setIsFrozen,
      whisperMessages,
      logLedgerEvent,
    }),
    [
      state,
      updateState,
      appendWrongClick,
      clearBroadcast,
      config,
      isLoadingConfig,
      t,
      fetchConfig,
      audioPlaying,
      playMusic,
      pauseMusic,
      toggleMusic,
      registerPlayerCallbacks,
      currentTrackUrl,
      isFrozen,
      whisperMessages,
      logLedgerEvent,
    ],
  );

  if (isLoadingConfig) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-sans antialiased" style={{ background: "var(--gradient-bg, #FAF8F3)", color: "var(--text-primary, #4A3E3D)" }}>
        <div className="relative flex flex-col items-center">
          {/* Outer glow ring */}
          <div
            className="absolute w-32 h-32 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, transparent 0%, var(--mood-accent, #FF6B9D) 25%, transparent 50%, var(--mood-accent-alt, #E84393) 75%, transparent 100%)",
              animation: "holoRotate 3s linear infinite",
              opacity: 0.3,
              filter: "blur(8px)",
            }}
          />
          {/* Middle ring */}
          <div
            className="absolute w-24 h-24 rounded-full"
            style={{
              border: "2px solid transparent",
              backgroundImage: "conic-gradient(from 120deg, var(--mood-gradient-start, #FF6B9D), var(--mood-gradient-mid, #A855F7), var(--mood-gradient-end, #EC4899), var(--mood-gradient-start, #FF6B9D))",
              backgroundOrigin: "border-box",
              backgroundClip: "border-box",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
              padding: "2px",
              animation: "holoRotate 2s linear infinite reverse",
            }}
          />
          {/* Inner core */}
          <div
            className="relative w-16 h-16 rounded-full"
            style={{
              background: "conic-gradient(from 240deg, var(--mood-accent, #FF6B9D) 0%, transparent 30%, var(--mood-accent-alt, #E84393) 60%, transparent 100%)",
              animation: "holoRotate 1.5s linear infinite, glowBreath 2s ease-in-out infinite",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
              padding: "2px",
            }}
          />
          {/* Center dot */}
          <div
            className="absolute w-3 h-3 rounded-full"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "var(--mood-accent, #FF6B9D)",
              boxShadow: "0 0 20px var(--mood-glow-strong, rgba(255,107,157,0.5))",
              animation: "holoPulse 1.5s ease-in-out infinite",
            }}
          />
          <p className="mt-12 text-sm tracking-wider font-light animate-pulse" style={{ color: "var(--text-muted, #8A7E72)" }}>
            جاري تحضير التجربة...
          </p>
        </div>
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}

export default AppContext;
