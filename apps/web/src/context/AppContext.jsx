import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";

const AppContext = createContext(null);

// Persistent per-visit session id (kept in sessionStorage).
function getSessionId() {
  if (typeof window === "undefined") return "ssr";
  let id = window.sessionStorage.getItem("manar_session_id");
  if (!id) {
    id = `manar-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    window.sessionStorage.setItem("manar_session_id", id);
  }
  return id;
}

function getSlugFromPath() {
  if (typeof window === "undefined") return "";
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0];
  if (first === "api" || first === "errors" || first === "mohamed-dashboard" || first === "__create") {
    return "";
  }
  return first;
}

const INITIAL_STATE = {
  batteryLevel: 0,
  currentSection: "loader",
  lastAction: "",
  starRating: 0,
  finalComment: "",
  judgeText: "",
  isEternalVoid: false,
  broadcastMsg: null,
  hesitationDetected: false,
  hesitationSeconds: 0,
};

export function AppProvider({ children }) {
  const [state, setState] = useState(INITIAL_STATE);
  const [config, setConfig] = useState(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const sessionIdRef = useRef(null);
  const wrongClicksRef = useRef([]);
  const syncTimerRef = useRef(null);
  const latestSyncRef = useRef({});

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
      .replace(/{boyName}/g, config.boyName || "محمد")
      .replace(/{girlName}/g, config.girlName || "منار")
      .replace(/{girlNickname}/g, config.girlNickname || "منورتي");
  }, [config]);

  // Debounced sync of tracking-relevant fields to the backend.
  const scheduleSync = useCallback((next) => {
    latestSyncRef.current = {
      current_section: next.currentSection,
      battery_level: next.batteryLevel,
      last_action: next.lastAction,
      hesitation_detected: next.hesitationDetected,
      hesitation_seconds: next.hesitationSeconds,
    };
    if (syncTimerRef.current) return;
    syncTimerRef.current = setTimeout(async () => {
      syncTimerRef.current = null;
      const sessionId = sessionIdRef.current;
      if (!sessionId) return;
      const slug = getSlugFromPath();
      if (!slug) return;
      try {
        await fetch(`/api/tracking/${encodeURIComponent(slug)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
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

  // Poll for broadcast messages addressed to this session.
  useEffect(() => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return undefined;
    const slug = getSlugFromPath();
    if (!slug) return undefined;
    let active = true;

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/broadcast/${encodeURIComponent(slug)}?session_id=${encodeURIComponent(sessionId)}`,
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
    };
  }, []);

  // Fire initial session tracking registration on mount
  useEffect(() => {
    const slug = getSlugFromPath();
    if (!slug) return;
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;

    const fireInitialTracking = async () => {
      try {
        await fetch(`/api/tracking/${encodeURIComponent(slug)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            current_section: state.currentSection || "loader",
            battery_level: state.batteryLevel || 0,
            last_action: "session_start",
            hesitation_detected: state.hesitationDetected || false,
            hesitation_seconds: state.hesitationSeconds || 0,
          }),
        });
      } catch (err) {
        console.error("Initial session tracking failed", err);
      }
    };
    fireInitialTracking();
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
    ],
  );

  if (isLoadingConfig) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex flex-col items-center justify-center font-sans antialiased text-[#4A3E3D]">
        <div className="relative flex flex-col items-center">
          <div className="absolute w-24 h-24 border border-amber-800/10 rounded-full animate-ping duration-1000 opacity-75"></div>
          <div className="relative w-16 h-16 border-2 border-t-amber-800 border-amber-800/10 rounded-full animate-spin"></div>
          <p className="mt-8 text-sm tracking-wider font-light text-[#8A7E72] animate-pulse">
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
