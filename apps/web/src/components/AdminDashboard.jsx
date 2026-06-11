import { useState, useEffect, useCallback, useRef, memo } from "react";
import {
  Activity,
  Radio,
  RefreshCw,
  Send,
  Battery,
  CheckCircle,
  Settings,
  Plus,
  Trash2,
  Save,
  Check,
  HelpCircle,
  Gavel,
  Gift,
  FileText,
  AlertCircle,
  Sparkles,
  Copy
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { motion } from "motion/react";

const SECTION_LABELS = {
  loader: "شاشة التحميل",
  terminal: "التيرمنال",
  smile: "كاشف الابتسامة",
  mood: "مؤشر المزاج",
  timeline: "خط الذكريات",
  trivia: "الاختبار",
  judge: "المحكمة",
  gifts: "كروت الهدايا",
  fingerprint: "البصمة",
  trap: "سؤال الموت",
  letter: "الجواب",
  "eternal-void": "اللانهاية",
};

function timeAgo(iso) {
  if (!iso) return "—";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `من ${diff} ثانية`;
  if (diff < 3600) return `من ${Math.floor(diff / 60)} دقيقة`;
  return `من ${Math.floor(diff / 3600)} ساعة`;
}

function SessionRow({ row, onBroadcast }) {
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const d = new Date(row.updated_at);
  const timeStr = d.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const send = useCallback(async () => {
    if (!msg.trim()) return;
    setSending(true);
    await onBroadcast(row.session_id, msg.trim());
    setMsg("");
    setSending(false);
  }, [msg, row.session_id, onBroadcast]);

  // Translator for sections and actions
  const actionMap = {
    "session_start": "بدأت التصفح",
    "plea-submitted": "قدمت الدفاع في المحكمة",
    "rated-1": "قيمت بـ 1 نجمة 😡",
    "rated-2": "قيمت بـ 2 نجمة 😟",
    "rated-3": "قيمت بـ 3 نجوم 😐",
    "rated-4": "قيمت بـ 4 نجوم 🙂",
    "rated-5": "قيمت بـ 5 نجوم 😍",
    "eternal-void": "وصلت للنهاية",
  };
  const sectionMap = {
    loader: "شاشة التحميل",
    landing: "البداية",
    terminal: "الهاكر",
    smile: "كاشف الابتسامة",
    mood: "مؤشر الزعل",
    timeline: "ذكرياتنا",
    trivia: "اختبار الذاكرة",
    court: "المحكمة",
    gifts: "الهدايا",
    fingerprint: "البصمة",
    trap: "سؤال الفخ",
    letter: "رسالة النهاية",
    void: "شاشة الفضاء",
  };

  const getActionStr = (action) => {
    if (!action) return "غير معروف";
    if (action.startsWith("wrong:")) return `ضغطت زر خطأ: ${action.replace("wrong:", "")}`;
    return actionMap[action] || action;
  };

  const getSectionStr = (section) => sectionMap[section] || section || "غير معروف";

  const battery = row.battery_level ?? 0;
  const batteryColor =
    battery < 20
      ? "#EF4444"
      : battery < 50
        ? "#F97316"
        : battery < 80
          ? "#EC4899"
          : "#22C55E";

  const isOnline = (Date.now() - new Date(row.updated_at).getTime()) < 15000;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 text-sm shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-50 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-gray-400">
            {row.session_id.slice(0, 8)}...
          </span>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
            {timeStr}
          </span>
          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            {isOnline ? "متصل الآن" : "غير متصل"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
          <Battery size={12} style={{ color: batteryColor }} />
          <span style={{ color: batteryColor }}>{battery}%</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center bg-gray-50 px-2 py-1.5 rounded-md">
          <span className="text-gray-500 text-xs font-medium">القسم الحالي:</span>
          <span className="font-bold text-gray-800 text-xs">{getSectionStr(row.current_section)}</span>
        </div>
        <div className="flex justify-between items-center bg-gray-50 px-2 py-1.5 rounded-md">
          <span className="text-gray-500 text-xs font-medium">آخر حركة:</span>
          <span className="font-bold text-blue-700 text-xs text-left" dir="ltr">{getActionStr(row.last_action)}</span>
        </div>

        {row.details && row.details.quizChoices && (
          <div className="mt-1 flex flex-col gap-1 rounded bg-amber-50 p-2 text-xs font-medium text-amber-900 border border-amber-100">
            <span className="font-bold">🎯 إجابات الاختبار:</span>
            {row.details.quizChoices.map((c, i) => (
              <span key={i}>- {c.q}: {c.answer}</span>
            ))}
          </div>
        )}

        {row.hesitation_detected && (
          <div className="mt-1 flex items-center gap-1.5 rounded bg-orange-50 p-2 text-xs font-medium text-orange-700 border border-orange-100">
            <AlertCircle size={14} className="animate-pulse" />
            ترددت لمدة {Math.round(row.hesitation_seconds)} ثانية!
          </div>
        )}
        
        {/* User Inputs Display */}
        {row.plea_text && (
          <div className="mt-2 rounded-lg bg-indigo-50 p-3 border border-indigo-100">
            <span className="text-indigo-800 text-xs font-bold flex items-center gap-1 mb-1.5">
              ⚖️ دفاعها في المحكمة:
            </span>
            <p className="text-indigo-900 text-sm font-medium leading-relaxed">"{row.plea_text}"</p>
          </div>
        )}
        {row.final_comment && (
          <div className="mt-2 rounded-lg bg-pink-50 p-3 border border-pink-100">
            <span className="text-pink-800 text-xs font-bold flex items-center gap-1 mb-1.5">
              💌 رسالتها النهائية (التقييم {row.star_rating} نجوم):
            </span>
            <p className="text-pink-900 text-sm font-medium leading-relaxed">"{row.final_comment}"</p>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2 border-t border-gray-50 pt-3">
        <input
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="ابعث رسالة تظهر على شاشتها فوراً..."
          className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
        />
        <button
          type="button"
          disabled={!msg.trim() || sending}
          onClick={send}
          className="rounded-lg bg-blue-600 px-3 py-2 text-white font-medium text-xs transition-all hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 shadow-sm disabled:shadow-none flex items-center gap-1.5"
        >
          {sending ? "جاري..." : "إرسال"} <Send size={14} />
        </button>
      </div>
    </div>
  );
}

const MagicAIGenerator = memo(({ siteSlug, setFormData }) => {
  const [incidentReason, setIncidentReason] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState("");
  const [coreIntent, setCoreIntent] = useState("apology");
  const [textVibe, setTextVibe] = useState("standard");
  const [vibeIntensity, setVibeIntensity] = useState("medium");

  const handleGenerateAI = async (e) => {
    e.preventDefault();
    if (!incidentReason.trim() || !siteSlug) return;
    setIsGeneratingAI(true);
    setAiSuccessMsg("");
    try {
      const res = await fetch(`/api/sites/${encodeURIComponent(siteSlug)}/generate-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incident_reason: incidentReason.trim(),
          coreIntent,
          textVibe,
          vibeIntensity
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({
          ...prev,
          landingText: data.landingText,
          triviaQuestions: data.triviaQuestions,
          finalLetter: {
            ...prev.finalLetter,
            ...data.finalLetter,
          },
        }));
        setAiSuccessMsg("تم توليد النصوص السحرية بنجاح! 🪄 اضغط على زر حفظ التغييرات 💾");
      } else {
        const errData = await res.json();
        alert(errData.error || "فشل توليد نصوص المصالحة");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الاتصال بالسيرفر");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="bg-amber-50/60 border border-amber-200/50 rounded-2xl p-5 sm:p-6 mb-2 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <h4 className="flex items-center gap-2 text-sm font-bold text-amber-900 mb-2">
        <Sparkles size={16} className="text-amber-800 animate-pulse" />
        الصياغة السحرية بالذكاء الاصطناعي ✨
      </h4>
      <p className="text-xs sm:text-sm text-amber-800/80 mb-4 font-medium leading-relaxed max-w-2xl">
        اكتب سبب الزعل باختصار، وسيقوم الذكاء الاصطناعي بصياغة اعتذار رومانسي متكامل، وتجهيز أسئلة فخ مضحكة، وجواب خاص يليق بالمشكلة!
      </p>

      {/* AI Configuration Chips */}
      <div className="flex flex-col gap-4 mb-5 border-b border-amber-200/40 pb-5">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-amber-900/70">الهدف الأساسي (Core Intent):</label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'apology', label: 'مصالحة واعتذار استراتيجي' },
              { id: 'love', label: 'اعتراف رومانسي مفتوح' },
              { id: 'joy', label: 'بهجة وسعادة بدون سبب' }
            ].map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setCoreIntent(opt.id)}
                className={`px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 ease-in-out cursor-pointer select-none outline-none ${coreIntent === opt.id ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/40 ring-1 ring-amber-400 transform scale-[1.02]" : "bg-white/40 text-amber-900 hover:bg-white/80 hover:shadow-md hover:scale-[1.02] active:scale-95 border border-amber-200/40"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-amber-900/70">الروح العامة (Text Vibe):</label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'standard', label: 'عادي' },
              { id: 'funny', label: 'ضحك' },
              { id: 'sarcastic_egyptian', label: 'ضحك وسخرية بالعامية المصرية' }
            ].map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTextVibe(opt.id)}
                className={`px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 ease-in-out cursor-pointer select-none outline-none ${textVibe === opt.id ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/40 ring-1 ring-amber-400 transform scale-[1.02]" : "bg-white/40 text-amber-900 hover:bg-white/80 hover:shadow-md hover:scale-[1.02] active:scale-95 border border-amber-200/40"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-amber-900/70">الجرعة وقوة المشاعر (Intensity):</label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'low', label: 'على الهادي' },
              { id: 'medium', label: 'دوز متوسط' },
              { id: 'high', label: 'إكستريم / عالي الجرعة' }
            ].map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setVibeIntensity(opt.id)}
                className={`px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 ease-in-out cursor-pointer select-none outline-none ${vibeIntensity === opt.id ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/40 ring-1 ring-amber-400 transform scale-[1.02]" : "bg-white/40 text-amber-900 hover:bg-white/80 hover:shadow-md hover:scale-[1.02] active:scale-95 border border-amber-200/40"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={incidentReason}
          onChange={(e) => setIncidentReason(e.target.value)}
          placeholder="مثال: نسيت عيد ميلادها / اتأخرت عليها..."
          className="flex-1 rounded-xl border border-amber-200/50 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-amber-500 shadow-inner placeholder:text-gray-400"
        />
        <button
          type="button"
          onClick={handleGenerateAI}
          disabled={isGeneratingAI || !incidentReason.trim()}
          className="rounded-xl bg-gradient-to-r from-amber-700 to-amber-900 px-6 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all duration-300 ease-in-out shadow-md shrink-0 flex items-center justify-center gap-2"
        >
          {isGeneratingAI ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {isGeneratingAI ? "جاري الإبداع..." : "توليد سحري"}
        </button>
      </div>
      {aiSuccessMsg && (
        <p className="mt-3 text-xs sm:text-sm font-bold text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-100 inline-block">{aiSuccessMsg}</p>
      )}
    </div>
  );
});

export default function AdminDashboard() {
  const { config, refetchConfig, siteSlug } = useApp();

  const [activeTab, setActiveTab] = useState("live");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  // Password gate states
  const [savedPassword, setSavedPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [typingPassword, setTypingPassword] = useState("");

  // Settings tab states
  const [formData, setFormData] = useState(null);
  const [activeSection, setActiveSection] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState("");

  const copyToClipboard = () => {
    const url = window.location.origin + "/" + siteSlug;
    navigator.clipboard.writeText(url);
    setCopyFeedback("تم النسخ بنجاح! 📋");
    setTimeout(() => setCopyFeedback(""), 2000);
  };

  // Verify cached password on mount once config is loaded
  useEffect(() => {
    if (siteSlug && config) {
      const cached = localStorage.getItem(`auth_pwd_${siteSlug}`);
      if (cached) {
        const verifyCached = async () => {
          try {
            const res = await fetch(`/api/sites/${encodeURIComponent(siteSlug)}/config`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ edit_password: cached, config }),
            });
            if (res.ok) {
              setSavedPassword(cached);
              setIsAuthenticated(true);
            } else {
              localStorage.removeItem(`auth_pwd_${siteSlug}`);
            }
          } catch (e) {
            console.error("Cached verification failed", e);
          }
        };
        verifyCached();
      }
    }
  }, [siteSlug, config]);

  // Sync formData from context configuration once loaded
  useEffect(() => {
    if (config && !formData) {
      const parsedConfig = JSON.parse(JSON.stringify(config));
      
      // Ensure all objects exist to prevent crashes
      if (!parsedConfig.boyName) parsedConfig.boyName = "";
      if (!parsedConfig.girlName) parsedConfig.girlName = "";
      if (!parsedConfig.girlNickname) parsedConfig.girlNickname = "";
      if (!parsedConfig.landingText) parsedConfig.landingText = "";
      if (!parsedConfig.voidText) parsedConfig.voidText = "";
      if (!parsedConfig.audioUrl) parsedConfig.audioUrl = "";
      if (typeof parsedConfig.enableFunnyText === "undefined") parsedConfig.enableFunnyText = true;
      if (!parsedConfig.funnyText) parsedConfig.funnyText = "احا انتي لسه هنا يلا انطري ابلكاش 😂";
      
      // Integrations
      if (!parsedConfig.telegramBotToken) parsedConfig.telegramBotToken = "";
      if (!parsedConfig.telegramChatId) parsedConfig.telegramChatId = "";
      if (!parsedConfig.geminiApiKey) parsedConfig.geminiApiKey = "";

      if (!parsedConfig.loaderTexts) parsedConfig.loaderTexts = ["جار التحميل..."];
      if (!parsedConfig.triviaQuestions) parsedConfig.triviaQuestions = [];
      if (!parsedConfig.giftCoupons) parsedConfig.giftCoupons = [];
      if (!parsedConfig.timeline || !Array.isArray(parsedConfig.timeline) || parsedConfig.timeline.length === 0) {
        parsedConfig.timeline = [
          { text: "أول يوم اتكلمنا فيه كان بداية أحلى حاجة في حياتي", image: "" },
          { text: "ضحكتك بتخليني أنسى أي حاجة وحشة في الدنيا", image: "" },
          { text: "مهما حصل بينا، بتفضلي أقرب حد لقلبي", image: "" },
          { text: "دعمك ليا في أصعب أوقاتي مش هنساه أبداً", image: "" },
          { text: "إنتي مش بس حبيبتي، إنتي صاحبتي وسندي", image: "" },
          { text: "كل تفصيلة فيكي بتخليني أحبك أكتر", image: "" },
          { text: "مفيش حاجة في الدنيا تعوضني عنك لحظة", image: "" },
        ];
      }
      
      if (!parsedConfig.finalLetter) {
        parsedConfig.finalLetter = { title: "رسالة", body: [""], loveSignature: "", boySignature: "" };
      }
      if (!parsedConfig.finalLetter.body) parsedConfig.finalLetter.body = [""];
      
      if (!parsedConfig.judgeText) {
        parsedConfig.judgeText = { title: "المحكمة تحكم لصالحك!", details: "كل كلامك صح" };
      }
      if (!parsedConfig.feedbackTexts) {
        parsedConfig.feedbackTexts = {
          oneStar: "تنبيه: نجمة واحدة!",
          twoStar: "نجمتين!",
          threeStar: "3 نجوم",
          fourStar: "4 نجوم",
          fiveStar: "5 نجوم شكرا"
        };
      }
      
      setFormData(parsedConfig);
    }
  }, [config, formData]);

  const load = useCallback(async () => {
    if (!siteSlug) return;
    try {
      const res = await fetch(`/api/tracking/${encodeURIComponent(siteSlug)}`);
      if (!res.ok) throw new Error(`[${res.status}] ${res.statusText}`);
      const data = await res.json();
      setRows(data.rows || []);
      setError(null);
    } catch (err) {
      console.error("dashboard load failed", err);
      setError("مش قادر أجيب البيانات دلوقتي");
    } finally {
      setLoading(false);
    }
  }, [siteSlug]);

  // Poll only when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    load();
    intervalRef.current = setInterval(load, 3000);
    return () => clearInterval(intervalRef.current);
  }, [load, isAuthenticated]);

  const broadcast = useCallback(async (sessionId, message) => {
    if (!siteSlug) return;
    try {
      const res = await fetch(`/api/broadcast/${encodeURIComponent(siteSlug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message }),
      });
      if (!res.ok) throw new Error(`[${res.status}] ${res.statusText}`);
    } catch (err) {
      console.error("broadcast failed", err);
    }
  }, [siteSlug]);

  // Password verification handler
  const handleVerifyPassword = async (pwd) => {
    setAuthError("");
    try {
      const res = await fetch(`/api/sites/${encodeURIComponent(siteSlug)}/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edit_password: pwd, config }),
      });
      if (res.ok) {
        setSavedPassword(pwd);
        localStorage.setItem(`auth_pwd_${siteSlug}`, pwd);
        setIsAuthenticated(true);
      } else {
        setAuthError("كلمة المرور غير صحيحة");
      }
    } catch (err) {
      console.error(err);
      setAuthError("حدث خطأ أثناء الاتصال بالخادم");
    }
  };

  // Settings Save Handler
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const res = await fetch(`/api/sites/${encodeURIComponent(siteSlug)}/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          edit_password: savedPassword,
          config: formData,
        }),
      });
      if (res.ok) {
        setSaveStatus({ success: true, msg: "تم حفظ التغييرات بنجاح!" });
        await refetchConfig();
      } else {
        const errData = await res.json();
        setSaveStatus({ success: false, msg: errData.error || "فشل حفظ الإعدادات" });
      }
    } catch (err) {
      console.error(err);
      setSaveStatus({ success: false, msg: "حدث خطأ أثناء الاتصال بالسيرفر" });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (saveStatus) {
      const timer = setTimeout(() => {
        setSaveStatus(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  // Form State Mutator Helpers
  const updateField = (path, value) => {
    setFormData((prev) => {
      const next = { ...prev };
      const parts = path.split(".");
      let current = next;
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const handleTimelineImageUpload = (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        const MAX_DIM = 600;
        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);

        setFormData((prev) => {
          const next = { ...prev };
          const nextTimeline = [...(next.timeline || [])];
          if (nextTimeline[index]) {
            nextTimeline[index] = { ...nextTimeline[index], image: dataUrl };
          }
          next.timeline = nextTimeline;
          return next;
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveTimelineImage = (index) => {
    setFormData((prev) => {
      const next = { ...prev };
      const nextTimeline = [...(next.timeline || [])];
      if (nextTimeline[index]) {
        nextTimeline[index] = { ...nextTimeline[index], image: "" };
      }
      next.timeline = nextTimeline;
      return next;
    });
  };

  const updateLoaderText = (idx, value) => {
    setFormData((prev) => {
      const next = { ...prev };
      next.loaderTexts[idx] = value;
      return next;
    });
  };

  // Questions Helpers
  const addQuestion = () => {
    setFormData((prev) => {
      const next = { ...prev };
      next.triviaQuestions = [
        ...next.triviaQuestions,
        {
          q: "سؤال جديد؟",
          options: ["اختيار 1", "اختيار 2"],
          correct: "اختيار 1",
          trap: null,
        },
      ];
      return next;
    });
  };

  const deleteQuestion = (idx) => {
    setFormData((prev) => {
      const next = { ...prev };
      next.triviaQuestions = next.triviaQuestions.filter((_, i) => i !== idx);
      return next;
    });
  };

  const updateQuestionTitle = (idx, value) => {
    setFormData((prev) => {
      const next = { ...prev };
      next.triviaQuestions[idx].q = value;
      return next;
    });
  };

  const addOption = (qIdx) => {
    setFormData((prev) => {
      const next = { ...prev };
      next.triviaQuestions[qIdx].options.push(
        `اختيار جديد ${next.triviaQuestions[qIdx].options.length + 1}`
      );
      return next;
    });
  };

  const deleteOption = (qIdx, oIdx) => {
    setFormData((prev) => {
      const next = { ...prev };
      const optVal = next.triviaQuestions[qIdx].options[oIdx];
      next.triviaQuestions[qIdx].options = next.triviaQuestions[qIdx].options.filter(
        (_, i) => i !== oIdx
      );

      // Sanitize correct answers
      let correct = next.triviaQuestions[qIdx].correct;
      if (Array.isArray(correct)) {
        next.triviaQuestions[qIdx].correct = correct.filter((c) => c !== optVal);
      } else if (correct === optVal) {
        next.triviaQuestions[qIdx].correct = next.triviaQuestions[qIdx].options[0] || "";
      }

      // Sanitize trap option
      if (next.triviaQuestions[qIdx].trap?.option === optVal) {
        next.triviaQuestions[qIdx].trap = null;
      }

      return next;
    });
  };

  const updateOption = (qIdx, oIdx, value) => {
    setFormData((prev) => {
      const next = { ...prev };
      const oldVal = next.triviaQuestions[qIdx].options[oIdx];
      next.triviaQuestions[qIdx].options[oIdx] = value;

      // Update correct answers references
      let correct = next.triviaQuestions[qIdx].correct;
      if (Array.isArray(correct)) {
        next.triviaQuestions[qIdx].correct = correct.map((c) =>
          c === oldVal ? value : c
        );
      } else if (correct === oldVal) {
        next.triviaQuestions[qIdx].correct = value;
      }

      // Update trap references
      if (next.triviaQuestions[qIdx].trap?.option === oldVal) {
        next.triviaQuestions[qIdx].trap.option = value;
      }

      return next;
    });
  };

  const setCorrectOption = (qIdx, opt, isChecked) => {
    setFormData((prev) => {
      const next = { ...prev };
      const question = next.triviaQuestions[qIdx];
      let correct = question.correct;
      let isArray = Array.isArray(correct);

      if (isChecked) {
        if (isArray) {
          if (!correct.includes(opt)) {
            question.correct = [...correct, opt];
          }
        } else {
          // Convert to array containing both
          question.correct = [correct, opt];
        }
      } else {
        if (isArray) {
          const remaining = correct.filter((c) => c !== opt);
          if (remaining.length === 1) {
            question.correct = remaining[0];
          } else {
            question.correct = remaining;
          }
        } else {
          // Cannot uncheck only option
        }
      }
      return next;
    });
  };

  // Coupons Helpers
  const addCoupon = () => {
    setFormData((prev) => {
      const next = { ...prev };
      next.giftCoupons = [...next.giftCoupons, "كوبون جديد 🎟️"];
      return next;
    });
  };

  const deleteCoupon = (idx) => {
    setFormData((prev) => {
      const next = { ...prev };
      next.giftCoupons = next.giftCoupons.filter((_, i) => i !== idx);
      return next;
    });
  };

  const updateCoupon = (idx, value) => {
    setFormData((prev) => {
      const next = { ...prev };
      next.giftCoupons[idx] = value;
      return next;
    });
  };

  // Letter Body Helpers
  const addParagraph = () => {
    setFormData((prev) => {
      const next = { ...prev };
      next.finalLetter.body = [...next.finalLetter.body, "فقرة جديدة"];
      return next;
    });
  };

  const deleteParagraph = (idx) => {
    setFormData((prev) => {
      const next = { ...prev };
      next.finalLetter.body = next.finalLetter.body.filter((_, i) => i !== idx);
      return next;
    });
  };

  const updateParagraph = (idx, value) => {
    setFormData((prev) => {
      const next = { ...prev };
      next.finalLetter.body[idx] = value;
      return next;
    });
  };

  const categories = [
    { id: "basic", name: "الأساسيات والنصوص", icon: Sparkles },
    { id: "quiz", name: "الأسئلة والاختبار", icon: HelpCircle },
    { id: "court", name: "المحكمة والتقييم", icon: Gavel },
    { id: "letter", name: "الجواب والهدايا", icon: FileText },
  ];

  // Passcode Lock Screen
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen bg-[#FCFBF7] flex items-center justify-center px-5 font-sans antialiased text-[#4A3E3D]"
        dir="rtl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[#F4F3EF]/70 backdrop-blur-3xl border border-[#1A1A1A]/10 shadow-[0_30px_70px_rgba(0,0,0,0.4)] rounded-[2.5rem] p-8 sm:p-10 text-center relative overflow-hidden"
        >
          <div className="mb-6 flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-amber-50 border border-amber-200/50">
            <Radio size={36} className="text-amber-800 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">لوحة التحكم 🔐</h2>
          <p className="text-xs text-[#8A7E72] mb-6 leading-relaxed">
            أدخل كلمة المرور الخاصة بهذا الرابط لتتمكن من متابعة رحلة شريكتك لايف وتعديل إعدادات الموقع.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyPassword(typingPassword);
            }}
            className="space-y-4"
          >
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}
            <input
              type="password"
              required
              value={typingPassword}
              onChange={(e) => setTypingPassword(e.target.value)}
              placeholder="أدخل كلمة المرور هنا..."
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-800 transition-all text-center"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-amber-800 py-3 text-sm font-semibold text-white transition-all hover:bg-amber-900 focus:outline-none"
            >
              فتح لوحة التحكم 🔓
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Dashboard Interface
  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12 space-y-8">

        {/* Top Section: Hero Welcome & Telegram Sync */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left/Center Column (Welcome) */}
          <div className="lg:col-span-2 flex flex-col justify-center rounded-3xl bg-white p-6 sm:p-10 shadow-sm border border-gray-100">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800 w-fit">
              <Sparkles size={16} /> لوحة تحكم الإدارة
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-2">
              أهلاً بك في منصة الصلح 👋
            </h1>
            <p className="text-sm sm:text-base text-gray-500 max-w-lg leading-relaxed">
              هنا يمكنك متابعة رحلة شريكتك لحظة بلحظة، وتعديل نصوص المحكمة، والأسئلة، والذكريات المصورة بسهولة لإنشاء تجربة اعتذار لا تُنسى.
            </p>
            
            <div className="mt-8 bg-green-50/50 border border-green-200/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <CheckCircle size={24} className="text-green-600 shrink-0" />
                <div>
                  <h4 className="text-green-800 font-bold text-sm">رابط الموقع جاهز</h4>
                  <p className="text-xs text-green-700/80">انسخ الرابط وشاركه معها بعد ضبط الإعدادات</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-[10px] sm:text-xs font-mono text-gray-500 bg-white px-2 py-1.5 rounded-lg border border-green-100 select-all truncate max-w-[150px] sm:max-w-xs">
                  {typeof window !== "undefined" ? window.location.origin : ""}/{siteSlug}
                </span>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 bg-green-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors shrink-0"
                >
                  <Copy size={14} />
                  {copyFeedback ? "تم!" : "نسخ"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (Telegram Notification Box) */}
          <div className="lg:col-span-1 rounded-3xl bg-blue-50/50 p-6 shadow-sm border border-blue-100/50 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-blue-100">
                <Send size={20} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-blue-900 text-base">رادار الإشعارات</h3>
            </div>
            
            <p className="text-xs text-blue-800/80 mb-4 font-medium leading-relaxed">
              اربط حسابك بتيليجرام لاستقبال تنبيهات لحظية عندما تفتح الموقع وتتصفح صفحاته.
            </p>

            <div className="bg-white rounded-2xl p-4 border border-blue-50/80 space-y-3 shadow-sm mb-4">
              <p className="text-[11px] font-semibold text-gray-700 flex items-start gap-1.5">
                <span className="text-blue-500">1️⃣</span>
                <span>
                  اضغط لتفعيل البوت الرسمي:{" "}
                  <a href="https://t.me/apology_saas_2026_bot" target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold">@apology_saas_2026_bot</a>
                </span>
              </p>
              <p className="text-[11px] font-semibold text-gray-700 flex items-start gap-1.5">
                <span className="text-blue-500">2️⃣</span>
                <span>
                  أرسل /start للبوت <a href="https://t.me/getmyid_bot" target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold">@getmyid_bot</a> لنسخ رقم الـ ID الخاص بك (مكون من أرقام فقط).
                </span>
              </p>
              <p className="text-[11px] font-semibold text-gray-700 flex items-start gap-1.5">
                <span className="text-blue-500">3️⃣</span>
                <span>الصق الرقم في الخانة أدناه واضغط حفظ.</span>
              </p>
            </div>

            <div className="mt-auto">
              <label className="mb-1 block text-xs font-bold text-gray-700">
                Telegram Chat ID
              </label>
              <input
                type="text"
                value={formData?.telegramChatId || ""}
                onChange={(e) => updateField("telegramChatId", e.target.value)}
                placeholder="مثال: 987654321"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Middle Section: Live Tracking & Broadcast Control Center */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <Activity size={22} className="text-red-500 animate-pulse" />
                المتابعة اللحظية
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
                شاهد تقدمها في الموقع وأرسل لها رسائل تنبيهية تظهر فوراً على شاشتها.
              </p>
            </div>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> تحديث
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {loading && rows.length === 0 && <div className="text-sm text-center py-8 text-gray-400">جاري التحميل...</div>}
            {error && <div className="text-sm text-center py-8 text-red-500">{error}</div>}

            {!loading && rows.length === 0 && !error && (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-10 text-center">
                <Activity size={32} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-bold text-gray-900">
                  لا توجد زيارات حتى الآن
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  بمجرد أن تفتح الفتاة الرابط ستظهر تحركاتها هنا بشكل مباشر.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rows.map((row) => (
                <SessionRow
                  key={row.session_id}
                  row={row}
                  onBroadcast={broadcast}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Tabbed Management Interface */}
        {formData && (
          <form onSubmit={handleSave} className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                  <Settings size={22} className="text-amber-800" />
                  إعدادات محتوى الموقع
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
                  عدّل على نصوص وأسئلة الموقع لحفظ تجربة مخصصة لها.
                </p>
              </div>
              <div className="shrink-0 w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-800 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-amber-900 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800 focus-visible:ring-offset-2 shadow-md hover:shadow-lg"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      حفظ التغييرات
                    </>
                  )}
                </button>
                {saveStatus && (
                  <p className={`mt-2 text-center text-xs font-bold ${saveStatus.success ? "text-green-600" : "text-red-600"}`}>
                    {saveStatus.msg}
                  </p>
                )}
              </div>
            </div>

            {/* Fluid Tab Navigation */}
            <div className="flex overflow-x-auto pb-4 mb-6 hide-scrollbar gap-2">
              {[
                { id: "basic", label: "الأساسيات والنصوص", icon: Sparkles },
                { id: "timeline", label: "ذكريات خط الزمن", icon: Activity },
                { id: "quiz", label: "أسئلة الاختبار", icon: HelpCircle },
                { id: "court", label: "المحكمة الذكية", icon: Gavel },
                { id: "letter", label: "الجواب والهدايا", icon: Gift }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 relative overflow-hidden shrink-0 ${
                    activeSection === tab.id
                      ? "text-amber-900 bg-amber-50 border border-amber-200/50 shadow-sm"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <tab.icon size={16} className={activeSection === tab.id ? "text-amber-800" : "text-gray-400"} />
                  {tab.label}
                  {activeSection === tab.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="min-h-[400px]">
              {/* Tab 1: Basic */}
              {activeSection === "basic" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-6"
                >
                  <MagicAIGenerator siteSlug={siteSlug} setFormData={setFormData} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                      <label className="block text-xs font-bold text-gray-700 mb-2">اسم الولد</label>
                      <input
                        type="text"
                        required
                        value={formData.boyName}
                        onChange={(e) => updateField("boyName", e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                      />
                    </div>
                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                      <label className="block text-xs font-bold text-gray-700 mb-2">اسم البنت</label>
                      <input
                        type="text"
                        required
                        value={formData.girlName}
                        onChange={(e) => updateField("girlName", e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                      <label className="block text-xs font-bold text-gray-700 mb-2">اسم الدلع للبنت (الحالي)</label>
                      <input
                        type="text"
                        required
                        value={formData.girlNickname}
                        onChange={(e) => updateField("girlNickname", e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                      />
                    </div>
                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                      <label className="block text-xs font-bold text-gray-700 mb-2">اسم دلع مخصص للذكاء الاصطناعي (اختياري)</label>
                      <input
                        type="text"
                        value={formData.petNameOverride || ""}
                        onChange={(e) => updateField("petNameOverride", e.target.value)}
                        placeholder="مثال: مريومتي (لو فاضي الـ AI هيألف من عنده)"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <label className="block text-xs font-bold text-gray-700 mb-2">نص الصفحة الرئيسية (Landing)</label>
                    <textarea
                      rows={3}
                      required
                      value={formData.landingText}
                      onChange={(e) => updateField("landingText", e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 resize-none shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                      <label className="block text-xs font-bold text-gray-700 mb-2">نص النهاية (الشاشة اللانهائية)</label>
                      <input
                        type="text"
                        required
                        value={formData.voidText}
                        onChange={(e) => updateField("voidText", e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                      />
                    </div>
                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                      <label className="block text-xs font-bold text-gray-700 mb-2">رابط ملف الموسيقى (MP3/M4A)</label>
                      <input
                        type="text"
                        value={formData.audioUrl || ""}
                        onChange={(e) => updateField("audioUrl", e.target.value)}
                        placeholder="مثال: https://link-to-song.mp3"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6 mt-2">
                    <span className="block text-sm font-bold text-gray-900 mb-4">رسائل شاشة الهاكر (Loader Terminal)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {formData.loaderTexts.map((txt, idx) => (
                        <div key={idx} className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-gray-400">السطر {idx + 1}</label>
                          <input
                            type="text"
                            required
                            value={txt}
                            onChange={(e) => updateLoaderText(idx, e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-amber-500 transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Timeline */}
              {activeSection === "timeline" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex flex-col gap-4">
                    {formData.timeline?.map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row gap-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-sm">
                        
                        {/* Image Preview & Upload */}
                        <div className="flex flex-col items-center gap-3 w-full sm:w-1/3 shrink-0">
                          <div className="w-full aspect-video sm:aspect-square rounded-xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center bg-white relative group">
                            {item.image ? (
                              <>
                                <img src={item.image} alt="preview" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTimelineImage(idx)}
                                    className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center text-gray-400 gap-1">
                                <Activity size={24} className="opacity-20" />
                                <span className="text-[10px] font-medium uppercase tracking-wider">بدون صورة</span>
                              </div>
                            )}
                          </div>
                          {!item.image && (
                            <label className="text-xs font-bold bg-white text-gray-700 px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors w-full text-center border border-gray-200 shadow-sm">
                              رفع صورة
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleTimelineImageUpload(e, idx)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>

                        {/* Text Input */}
                        <div className="flex flex-col w-full">
                          <label className="mb-2 block text-xs font-bold text-gray-500 uppercase tracking-wider">
                            ذكرى رقم {idx + 1}
                          </label>
                          <textarea
                            value={item.text}
                            onChange={(e) => {
                              const nextTimeline = [...formData.timeline];
                              nextTimeline[idx] = { ...nextTimeline[idx], text: e.target.value };
                              updateField("timeline", nextTimeline);
                            }}
                            rows={3}
                            placeholder="اكتب جملة توصف الذكرى..."
                            className="w-full h-full min-h-[100px] rounded-xl border border-gray-200 p-4 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none resize-none bg-white shadow-inner"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Quiz */}
              {activeSection === "quiz" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">أضف أسئلة للتأكد من ذاكرتها ومواقفكم المشتركة.</p>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 px-4 py-2 rounded-xl transition-colors shadow-sm"
                    >
                      <Plus size={14} /> إضافة سؤال
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {formData.triviaQuestions.map((qItem, qIdx) => (
                      <div
                        key={qIdx}
                        className="border border-gray-100 rounded-2xl bg-white p-5 sm:p-6 relative shadow-sm"
                      >
                        <button
                          type="button"
                          onClick={() => deleteQuestion(qIdx)}
                          className="absolute top-4 left-4 text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                          title="حذف السؤال"
                        >
                          <Trash2 size={18} />
                        </button>

                        <div className="flex flex-col gap-5 pr-8 sm:pr-0">
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">السؤال {qIdx + 1}</label>
                            <input
                              type="text"
                              required
                              value={qItem.q}
                              onChange={(e) => updateQuestionTitle(qIdx, e.target.value)}
                              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-amber-500 transition-colors"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-3 border-t border-gray-100 pt-4">
                              <span className="text-xs font-bold text-gray-700">الاختيارات (حدد الصحيح ✔️)</span>
                              <button
                                type="button"
                                onClick={() => addOption(qIdx)}
                                className="text-xs text-amber-800 hover:text-amber-950 flex items-center gap-1 font-bold bg-amber-50 px-2 py-1 rounded-lg"
                              >
                                <Plus size={12} /> إضافة خيار
                              </button>
                            </div>
                            <div className="flex flex-col gap-2">
                              {qItem.options.map((opt, oIdx) => {
                                const isCorrect = Array.isArray(qItem.correct)
                                  ? qItem.correct.includes(opt)
                                  : qItem.correct === opt;

                                return (
                                  <div
                                    key={oIdx}
                                    className={`flex items-center gap-3 p-2.5 rounded-xl border ${isCorrect ? "border-green-400 bg-green-50" : "border-gray-200 bg-white"} transition-colors`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isCorrect}
                                      onChange={(e) => setCorrectOption(qIdx, opt, e.target.checked)}
                                      className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-600 cursor-pointer"
                                      title="إجابة صحيحة"
                                    />
                                    <input
                                      type="text"
                                      required
                                      value={opt}
                                      onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                      className={`flex-1 border-0 bg-transparent py-1 px-2 text-sm outline-none ${isCorrect ? "font-bold text-green-900" : "font-medium text-gray-700"}`}
                                    />
                                    {qItem.options.length > 2 && (
                                      <button
                                        type="button"
                                        onClick={() => deleteOption(qIdx, oIdx)}
                                        className="text-gray-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-white"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Trap option checkbox */}
                          <div className="border-t border-gray-100 pt-4 mt-2">
                            <label className="flex items-center gap-3 cursor-pointer select-none w-fit group">
                              <input
                                type="checkbox"
                                checked={qItem.trap !== null}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData((prev) => {
                                      const next = { ...prev };
                                      next.triviaQuestions[qIdx].trap = {
                                        option: qItem.options[0] || "",
                                        msg: "بطلي عبط اختاري تاني 🤦‍♂️😂",
                                      };
                                      return next;
                                    });
                                  } else {
                                    setFormData((prev) => {
                                      const next = { ...prev };
                                      next.triviaQuestions[qIdx].trap = null;
                                      return next;
                                    });
                                  }
                                }}
                                className="h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-600 cursor-pointer"
                              />
                              <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                                تفعيل خيار الفخ (خدعة للمرح) 🪤
                              </span>
                            </label>

                            {qItem.trap && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-amber-50/50 p-4 rounded-xl border border-amber-100 mt-3"
                              >
                                <div className="md:col-span-1">
                                  <label className="block text-[11px] font-bold text-amber-900/60 uppercase tracking-wider mb-1.5">الخيار المفخخ</label>
                                  <select
                                    value={qItem.trap.option}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const next = { ...prev };
                                        next.triviaQuestions[qIdx].trap.option = val;
                                        return next;
                                      });
                                    }}
                                    className="w-full rounded-lg border border-amber-200/50 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 font-medium text-amber-900"
                                  >
                                    {qItem.options.map((opt, idx) => (
                                      <option key={idx} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="md:col-span-2">
                                  <label className="block text-[11px] font-bold text-amber-900/60 uppercase tracking-wider mb-1.5">رسالة الخداع 🤡</label>
                                  <input
                                    type="text"
                                    required
                                    value={qItem.trap.msg}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const next = { ...prev };
                                        next.triviaQuestions[qIdx].trap.msg = val;
                                        return next;
                                      });
                                    }}
                                    className="w-full rounded-lg border border-amber-200/50 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 font-medium text-amber-900"
                                  />
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Tab 4: Court */}
              {activeSection === "court" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-6"
                >
                  <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 sm:p-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Gavel size={18} className="text-amber-800" />
                      الحكم الافتراضي للمحكمة (إذا لم يتم استخدام الذكاء الاصطناعي)
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">عنوان الحكم</label>
                        <input
                          type="text"
                          required
                          value={formData.judgeText.title}
                          onChange={(e) => updateField("judgeText.title", e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">تفاصيل الحكم</label>
                        <textarea
                          rows={3}
                          required
                          value={formData.judgeText.details}
                          onChange={(e) => updateField("judgeText.details", e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
                    <span className="block text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Sparkles size={18} className="text-amber-500" />
                      ردود تقييم النجوم (بعد المحكمة)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: "oneStar", label: "نجمة واحدة 😡", color: "red" },
                        { key: "twoStar", label: "نجمتين 😟", color: "orange" },
                        { key: "threeStar", label: "3 نجوم 😐", color: "yellow" },
                        { key: "fourStar", label: "4 نجوم 🙂", color: "blue" },
                        { key: "fiveStar", label: "5 نجوم 😍 (الصلح)", color: "green", full: true }
                      ].map((star) => (
                        <div key={star.key} className={`bg-white p-4 rounded-xl border border-gray-200 ${star.full ? "sm:col-span-2" : ""}`}>
                          <label className="block text-xs font-bold text-gray-700 mb-2">{star.label}</label>
                          <textarea
                            rows={star.full ? 3 : 2}
                            required
                            value={formData.feedbackTexts[star.key]}
                            onChange={(e) => updateField(`feedbackTexts.${star.key}`, e.target.value)}
                            className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-amber-500 resize-none transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 sm:p-6">
                    <label className="mb-4 flex items-center cursor-pointer gap-3 w-fit group">
                      <input
                        type="checkbox"
                        checked={formData.enableFunnyText}
                        onChange={(e) => updateField("enableFunnyText", e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">تفعيل الرسالة الساخرة في النهاية 😈</span>
                    </label>

                    {formData.enableFunnyText && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4"
                      >
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                          النص الساخر (مثال: احا انتي لسه هنا؟)
                        </label>
                        <input
                          type="text"
                          value={formData.funnyText}
                          onChange={(e) => updateField("funnyText", e.target.value)}
                          className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-bold text-blue-900 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Tab 5: Letter */}
              {activeSection === "letter" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-6"
                >
                  <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 sm:p-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText size={18} className="text-amber-800" />
                      رسالة النهاية (الجواب)
                    </h3>
                    
                    <div className="mb-5">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">عنوان الجواب</label>
                      <input
                        type="text"
                        required
                        value={formData.finalLetter.title}
                        onChange={(e) => updateField("finalLetter.title", e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="flex flex-col gap-3 mb-6 border-y border-gray-100 py-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">محتوى الجواب (فقرات)</span>
                        <button
                          type="button"
                          onClick={addParagraph}
                          className="text-xs text-amber-800 hover:text-amber-950 flex items-center gap-1 font-bold bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm"
                        >
                          <Plus size={12} /> إضافة فقرة
                        </button>
                      </div>
                      <div className="space-y-3">
                        {formData.finalLetter.body.map((para, idx) => (
                          <div
                            key={idx}
                            className="flex gap-3 items-start bg-white p-3 rounded-xl border border-gray-200 shadow-sm"
                          >
                            <span className="text-xs font-bold text-gray-300 pt-2">{idx + 1}</span>
                            <textarea
                              value={para}
                              required
                              onChange={(e) => updateParagraph(idx, e.target.value)}
                              rows={3}
                              className="flex-1 border-0 bg-transparent py-1 text-sm font-medium outline-none focus:ring-0 resize-none leading-relaxed text-gray-800"
                            />
                            {formData.finalLetter.body.length > 1 && (
                              <button
                                type="button"
                                onClick={() => deleteParagraph(idx)}
                                className="text-gray-300 hover:text-red-500 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">جملة الختام (اليمين)</label>
                        <input
                          type="text"
                          required
                          value={formData.finalLetter.loveSignature}
                          onChange={(e) => updateField("finalLetter.loveSignature", e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">اسمك (اليسار)</label>
                        <input
                          type="text"
                          required
                          value={formData.finalLetter.boySignature}
                          onChange={(e) => updateField("finalLetter.boySignature", e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Coupons Section */}
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                      <div>
                        <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                          <Gift size={18} />
                          كروت الهدايا (Gift Coupons)
                        </h3>
                        <p className="text-xs text-indigo-700/70 mt-1 font-medium">كروت تظهر لها في النهاية تسحبها للصلح المادي والمعنوي.</p>
                      </div>
                      <button
                        type="button"
                        onClick={addCoupon}
                        className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-colors shadow-sm"
                      >
                        <Plus size={14} /> إضافة كارت
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {formData.giftCoupons.map((coupon, idx) => (
                        <div
                          key={idx}
                          className="flex gap-2 items-center bg-white p-2.5 rounded-xl border border-indigo-100 shadow-sm"
                        >
                          <Gift size={16} className="text-indigo-300 shrink-0 ml-1" />
                          <input
                            type="text"
                            required
                            value={coupon}
                            onChange={(e) => updateCoupon(idx, e.target.value)}
                            className="flex-1 border-0 bg-transparent py-1 text-sm font-bold text-indigo-900 outline-none focus:ring-0 placeholder-indigo-300"
                            placeholder="مثال: خروجة على حسابي"
                          />
                          <button
                            type="button"
                            onClick={() => deleteCoupon(idx)}
                            className="text-indigo-200 hover:text-red-500 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors shrink-0"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
