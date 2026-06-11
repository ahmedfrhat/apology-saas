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
  Copy,
  Zap,
  BarChart2,
  MapPin,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import Footer from "@/components/Footer";

// ─── Constants ────────────────────────────────────────────────────────────────

const JOURNEY_STAGES = [
  { key: "loader",      icon: "⚡", label: "التحميل" },
  { key: "landing",     icon: "🌸", label: "البداية" },
  { key: "terminal",    icon: "💻", label: "الهاكر" },
  { key: "smile",       icon: "😊", label: "الابتسامة" },
  { key: "mood",        icon: "💭", label: "المزاج" },
  { key: "timeline",    icon: "📸", label: "الذكريات" },
  { key: "trivia",      icon: "🎯", label: "الاختبار" },
  { key: "court",       icon: "⚖️", label: "المحكمة" },
  { key: "gifts",       icon: "🎁", label: "الهدايا" },
  { key: "fingerprint", icon: "🔐", label: "البصمة" },
  { key: "trap",        icon: "🪤", label: "الفخ" },
  { key: "letter",      icon: "💌", label: "الجواب" },
];

const SECTION_MAP = {
  loader: "شاشة التحميل", landing: "البداية", terminal: "الهاكر",
  smile: "كاشف الابتسامة", mood: "مؤشر الزعل", timeline: "ذكرياتنا",
  trivia: "اختبار الذاكرة", court: "المحكمة", gifts: "الهدايا",
  fingerprint: "البصمة", trap: "سؤال الفخ", letter: "رسالة النهاية",
  void: "شاشة الفضاء", at_gate: "عند البوابة 🔒",
};

const ACTION_MAP = {
  "session_start": "بدأت التصفح",
  "plea-submitted": "قدمت الدفاع في المحكمة",
  "rated-1": "قيمت بـ 1 نجمة 😡",
  "rated-2": "قيمت بـ 2 نجمة 😟",
  "rated-3": "قيمت بـ 3 نجوم 😐",
  "rated-4": "قيمت بـ 4 نجوم 🙂",
  "rated-5": "قيمت بـ 5 نجوم 😍",
  "eternal-void": "وصلت للنهاية",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso) {
  if (!iso) return "—";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `منذ ${diff} ثانية`;
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  return `منذ ${Math.floor(diff / 3600)} ساعة`;
}

function getActionStr(action) {
  if (!action) return "غير معروف";
  if (action.startsWith("wrong:")) return `ضغطت زر خطأ: ${action.replace("wrong:", "")}`;
  return ACTION_MAP[action] || action;
}

function getSectionStr(section) {
  return SECTION_MAP[section] || section || "غير معروف";
}

// ─── Design Token Shortcuts ───────────────────────────────────────────────────

const T = {
  card: {
    background: "var(--bg-card)",
    border: "1px solid var(--border-base)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    boxShadow: "var(--shadow-card)",
  },
  surface: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border-base)",
  },
  base: {
    background: "var(--bg-base)",
    border: "1px solid var(--border-base)",
  },
  accentGradient: {
    background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)",
    color: "#1A1510",
    boxShadow: "0 4px 20px var(--accent-glow)",
  },
  input: {
    background: "var(--bg-base)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-base)",
  },
};

// ─── Reusable UI Atoms ────────────────────────────────────────────────────────

function FieldLabel({ children }) {
  return (
    <label style={{ color: "var(--text-muted)" }} className="block text-[10px] font-bold uppercase tracking-widest mb-1.5">
      {children}
    </label>
  );
}

function TokenInput({ value, onChange, placeholder, rows, type = "text", required }) {
  const baseClass = "w-full rounded-xl px-4 py-2.5 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-[var(--accent)]";
  return rows ? (
    <textarea
      value={value}
      onChange={onChange}
      rows={rows}
      required={required}
      placeholder={placeholder}
      style={T.input}
      className={`${baseClass} resize-none`}
    />
  ) : (
    <input
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      style={T.input}
      className={baseClass}
    />
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

function SectionCard({ children, className = "" }) {
  return (
    <div style={{ ...T.surface }} className={`rounded-2xl p-5 space-y-4 ${className}`}>
      {children}
    </div>
  );
}

function SectionHeading({ icon: Icon, children, accent = false }) {
  return (
    <h3
      style={{ color: "var(--text-primary)" }}
      className="text-sm font-bold flex items-center gap-2"
    >
      <Icon size={16} style={{ color: accent ? "var(--accent-2)" : "var(--accent)" }} />
      {children}
    </h3>
  );
}

// ─── Battery Bar ──────────────────────────────────────────────────────────────

function BatteryBar({ level }) {
  const color =
    level < 20 ? "#EF4444" :
    level < 50 ? "#F97316" :
    level < 80 ? "#EC4899" : "#22C55E";
  return (
    <div className="flex items-center gap-2">
      <Battery size={13} style={{ color }} />
      <div style={{ width: 40, height: 5, background: "var(--bg-base)", borderRadius: 999 }}>
        <div
          style={{
            width: `${level}%`, height: "100%",
            background: color, borderRadius: 999,
            transition: "width 800ms cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
      <span style={{ color, fontSize: "0.7rem" }} className="font-bold">{level}%</span>
    </div>
  );
}

// ─── Journey Progress Map ─────────────────────────────────────────────────────

function JourneyMap({ currentSection }) {
  const currentIdx = JOURNEY_STAGES.findIndex(s => s.key === currentSection);
  return (
    <div>
      <p style={{ color: "var(--text-muted)", fontSize: "0.6rem" }} className="font-bold uppercase tracking-widest mb-2">خريطة الرحلة</p>
      <div className="flex items-center gap-0.5 overflow-x-auto pb-1 scrollbar-hide">
        {JOURNEY_STAGES.map((stage, idx) => {
          const isPast = currentIdx >= 0 && idx < currentIdx;
          const isCurrent = stage.key === currentSection;
          return (
            <div key={stage.key} className="flex items-center gap-0.5 shrink-0">
              <div
                title={stage.label}
                style={{
                  width: 24, height: 24, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.6rem", fontWeight: 700,
                  background: isCurrent
                    ? "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)"
                    : isPast ? "rgba(34,197,94,0.18)" : "var(--bg-base)",
                  border: `1px solid ${isCurrent ? "var(--accent)" : isPast ? "rgba(34,197,94,0.35)" : "var(--border-base)"}`,
                  boxShadow: isCurrent ? "0 0 10px var(--accent-glow)" : "none",
                  color: isCurrent ? "#1A1510" : isPast ? "#4ADE80" : "var(--text-muted)",
                  transition: "all 500ms ease",
                }}
              >
                {isCurrent ? stage.icon : isPast ? "✓" : "·"}
              </div>
              {idx < JOURNEY_STAGES.length - 1 && (
                <div style={{
                  width: 8, height: 2, borderRadius: 999,
                  background: isPast ? "rgba(34,197,94,0.40)" : "var(--border-base)",
                  transition: "background 500ms ease",
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Premium Session Card ─────────────────────────────────────────────────────

function PremiumSessionCard({ row, onBroadcast }) {
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  const send = useCallback(async () => {
    if (!msg.trim()) return;
    setSending(true);
    await onBroadcast(row.session_id, msg.trim());
    setMsg("");
    setSending(false);
  }, [msg, row.session_id, onBroadcast]);

  const battery = row.battery_level ?? 0;
  const isOnline = (Date.now() - new Date(row.updated_at).getTime()) < 15000;
  const timeStr = new Date(row.updated_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  const isAtGate = row.current_section === "at_gate";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "var(--bg-card)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: isOnline
          ? "1px solid rgba(34,197,94,0.35)"
          : "1px solid var(--border-base)",
        boxShadow: isOnline
          ? "0 0 0 1px rgba(34,197,94,0.08), var(--shadow-card)"
          : "var(--shadow-card)",
        transition: "border-color 600ms ease",
      }}
      className="rounded-2xl p-4 space-y-3"
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${isOnline ? "bg-green-500 animate-pulse" : "bg-slate-400"}`}
          />
          <span style={{ color: "var(--text-muted)", fontFamily: "monospace", fontSize: "0.68rem" }}>
            {row.session_id.slice(0, 8)}…
          </span>
          <span
            style={{ background: "rgba(96,165,250,0.12)", color: "#60A5FA", border: "1px solid rgba(96,165,250,0.20)", fontSize: "0.65rem" }}
            className="px-2 py-0.5 rounded-full font-bold"
          >
            {timeStr}
          </span>
          <span
            style={{
              background: isOnline ? "rgba(34,197,94,0.10)" : "rgba(148,163,184,0.08)",
              border: `1px solid ${isOnline ? "rgba(34,197,94,0.25)" : "rgba(148,163,184,0.15)"}`,
              color: isOnline ? "#22C55E" : "var(--text-muted)",
              fontSize: "0.65rem",
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full font-bold"
          >
            {isOnline
              ? (isAtGate ? "عند البوابة 🔒" : "داخل المنصة ✅")
              : "غير متصلة"}
          </span>
        </div>
        <BatteryBar level={battery} />
      </div>

      {/* Journey Map */}
      <JourneyMap currentSection={row.current_section} />

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-2">
        <div style={T.base} className="rounded-xl px-3 py-2">
          <p style={{ color: "var(--text-muted)", fontSize: "0.58rem" }} className="font-bold uppercase tracking-wider mb-0.5">القسم الحالي</p>
          <p style={{ color: "var(--text-primary)", fontSize: "0.78rem" }} className="font-bold truncate">{getSectionStr(row.current_section)}</p>
        </div>
        <div style={T.base} className="rounded-xl px-3 py-2">
          <p style={{ color: "var(--text-muted)", fontSize: "0.58rem" }} className="font-bold uppercase tracking-wider mb-0.5">آخر حركة</p>
          <p style={{ color: "#60A5FA", fontSize: "0.78rem" }} className="font-bold truncate">{getActionStr(row.last_action)}</p>
        </div>
      </div>

      {/* Data panels */}
      {row.details?.quizChoices && (
        <div style={{ background: "rgba(201,149,108,0.08)", border: "1px solid rgba(201,149,108,0.25)" }} className="rounded-xl p-3 text-xs space-y-1">
          <span style={{ color: "var(--accent)" }} className="font-bold block">🎯 إجابات الاختبار:</span>
          {row.details.quizChoices.map((c, i) => (
            <span key={i} style={{ color: "var(--text-secondary)" }} className="block">· {c.q}: <strong>{c.answer}</strong></span>
          ))}
        </div>
      )}
      {row.hesitation_detected && (
        <div style={{ background: "rgba(251,146,60,0.10)", border: "1px solid rgba(251,146,60,0.25)" }} className="rounded-xl p-3 flex items-center gap-2 text-xs font-medium" style2={{ color: "#FB923C" }}>
          <AlertCircle size={14} className="text-orange-400 animate-pulse shrink-0" />
          <span style={{ color: "#FB923C" }}>ترددت لمدة {Math.round(row.hesitation_seconds)} ثانية!</span>
        </div>
      )}
      {row.plea_text && (
        <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.22)" }} className="rounded-xl p-3">
          <span className="text-indigo-400 text-xs font-bold flex items-center gap-1 mb-1.5">⚖️ دفاعها في المحكمة:</span>
          <p style={{ color: "var(--text-primary)" }} className="text-sm font-medium leading-relaxed">"{row.plea_text}"</p>
        </div>
      )}
      {row.final_comment && (
        <div style={{ background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.22)" }} className="rounded-xl p-3">
          <span className="text-pink-400 text-xs font-bold flex items-center gap-1 mb-1.5">
            💌 تقييمها النهائي ({row.star_rating} ⭐):
          </span>
          <p style={{ color: "var(--text-primary)" }} className="text-sm font-medium leading-relaxed">"{row.final_comment}"</p>
        </div>
      )}

      {/* Broadcast bar */}
      <div
        style={{ borderTop: "1px solid var(--border-base)", paddingTop: "0.75rem" }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="ابعث رسالة تظهر على شاشتها فوراً..."
          style={{ ...T.input, fontSize: "0.78rem" }}
          className="flex-1 rounded-xl px-3 py-2 font-medium outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
        />
        <button
          type="button"
          disabled={!msg.trim() || sending}
          onClick={send}
          style={
            msg.trim() && !sending
              ? T.accentGradient
              : { background: "var(--bg-base)", color: "var(--text-muted)", border: "1px solid var(--border-base)" }
          }
          className="rounded-xl px-3 py-2 font-bold text-xs transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
        >
          {sending ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
          {sending ? "..." : "إرسال"}
        </button>
      </div>
    </motion.div>
  );
}

// ─── AI Generator ─────────────────────────────────────────────────────────────

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
        body: JSON.stringify({ incident_reason: incidentReason.trim(), coreIntent, textVibe, vibeIntensity }),
      });
      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({
          ...prev,
          landingText: data.landingText,
          triviaQuestions: data.triviaQuestions,
          finalLetter: { ...prev.finalLetter, ...data.finalLetter },
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

  function ChipGroup({ label, options, value, onChange }) {
    return (
      <div className="space-y-2">
        <FieldLabel>{label}</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              style={
                value === opt.id
                  ? { ...T.accentGradient, border: "1px solid var(--accent)" }
                  : { background: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid var(--border-base)" }
              }
              className="px-4 py-2 text-xs font-bold rounded-full transition-all duration-200 hover:opacity-90 active:scale-95"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          style={{ background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)", boxShadow: "0 8px 24px var(--accent-glow)" }}
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0"
        >
          🤖
        </div>
        <div>
          <h3 style={{ color: "var(--text-primary)" }} className="text-lg font-bold">الصياغة السحرية بالذكاء الاصطناعي</h3>
          <p style={{ color: "var(--text-muted)" }} className="text-sm mt-0.5 font-medium leading-relaxed">
            اكتب سبب الزعل واضغط توليد — سيصيغ الـ AI اعتذاراً رومانسياً متكاملاً مع أسئلة وفخوخ مخصصة.
          </p>
        </div>
      </div>

      {/* Config chips */}
      <div style={T.surface} className="rounded-2xl p-5 space-y-5">
        <ChipGroup
          label="الهدف الأساسي (Core Intent)"
          options={[
            { id: "apology", label: "🤝 مصالحة واعتذار" },
            { id: "love",    label: "💕 اعتراف رومانسي" },
            { id: "joy",     label: "🎉 بهجة بدون سبب" },
          ]}
          value={coreIntent}
          onChange={setCoreIntent}
        />
        <ChipGroup
          label="روح النص (Vibe)"
          options={[
            { id: "standard",            label: "✨ عادي وراقي" },
            { id: "funny",               label: "😂 كوميدي" },
            { id: "sarcastic_egyptian",  label: "🧂 سخرية بالعامية المصرية" },
          ]}
          value={textVibe}
          onChange={setTextVibe}
        />
        <ChipGroup
          label="جرعة المشاعر (Intensity)"
          options={[
            { id: "low",    label: "🌤 على الهادي" },
            { id: "medium", label: "🔥 دوز متوسط" },
            { id: "high",   label: "💥 إكستريم" },
          ]}
          value={vibeIntensity}
          onChange={setVibeIntensity}
        />
      </div>

      {/* Input + Generate */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={incidentReason}
          onChange={(e) => setIncidentReason(e.target.value)}
          placeholder="مثال: نسيت عيد ميلادها / اتأخرت عليها..."
          style={T.input}
          className="flex-1 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
        />
        <button
          type="button"
          onClick={handleGenerateAI}
          disabled={isGeneratingAI || !incidentReason.trim()}
          style={T.accentGradient}
          className="rounded-xl px-6 py-3 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
        >
          {isGeneratingAI ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {isGeneratingAI ? "جاري الإبداع..." : "توليد سحري ✨"}
        </button>
      </div>

      {aiSuccessMsg && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs sm:text-sm font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-4 py-3 rounded-xl border border-green-200 dark:border-green-800"
        >
          {aiSuccessMsg}
        </motion.p>
      )}
    </div>
  );
});

// ─── Main Dashboard ───────────────────────────────────────────────────────────

import { useLanguage } from "../context/LanguageContext";

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { config, refetchConfig, siteSlug } = useApp();

  // ── State ──
  const [activeTab, setActiveTab] = useState("live");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const [formData, setFormData] = useState(null);
  const [activeSection, setActiveSection] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState("");

  // ── Copy Link ──
  const copyToClipboard = () => {
    const url = window.location.origin + "/" + siteSlug;
    navigator.clipboard.writeText(url);
    setCopyFeedback("تم النسخ! 📋");
    setTimeout(() => setCopyFeedback(""), 2000);
  };

  // ── Sync formData from config ──
  useEffect(() => {
    if (config && !formData) {
      const parsedConfig = JSON.parse(JSON.stringify(config));
      if (!parsedConfig.boyName) parsedConfig.boyName = "";
      if (!parsedConfig.girlName) parsedConfig.girlName = "";
      if (!parsedConfig.girlNickname) parsedConfig.girlNickname = "";
      const isEn = parsedConfig.locale === "en";
      if (!parsedConfig.landingText) parsedConfig.landingText = isEn ? "In the middle of any argument.. scroll down and see" : "في وسط أي زعل.. فيه حاجات تانية مستحيل تضيع.. انزلي شوفي";
      if (!parsedConfig.voidText) parsedConfig.voidText = isEn ? "{girlNickname} forever 💛" : "{girlNickname} للأبد 💛";
      if (!parsedConfig.audioUrl) parsedConfig.audioUrl = "";
      if (typeof parsedConfig.enableFunnyText === "undefined") parsedConfig.enableFunnyText = true;
      if (!parsedConfig.funnyText) parsedConfig.funnyText = isEn ? "Come on, stop playing around! 😂" : "احا انتي لسه هنا يلا انطري ابلكاش 😂";
      if (!parsedConfig.telegramBotToken) parsedConfig.telegramBotToken = "";
      if (!parsedConfig.telegramChatId) parsedConfig.telegramChatId = "";
      if (!parsedConfig.geminiApiKey) parsedConfig.geminiApiKey = "";
      if (!parsedConfig.loaderTexts) parsedConfig.loaderTexts = isEn ? ["Loading Memories...", "Fetching Love Signals..."] : ["جار التحميل..."];
      if (!parsedConfig.triviaQuestions) parsedConfig.triviaQuestions = [];
      if (!parsedConfig.giftCoupons) parsedConfig.giftCoupons = [];
      if (!parsedConfig.timeline || !Array.isArray(parsedConfig.timeline) || parsedConfig.timeline.length === 0) {
        parsedConfig.timeline = isEn ? [
          { text: "The first day we talked was the beginning of the best thing in my life", image: "" },
          { text: "Your smile makes me forget anything bad in the world", image: "" },
          { text: "No matter what happens, you are always the closest to my heart", image: "" },
          { text: "I'll never forget your support during my hardest times", image: "" },
          { text: "You are not just my girlfriend, you are my best friend and my rock", image: "" },
          { text: "Every detail about you makes me love you even more", image: "" },
          { text: "Nothing in the world could ever replace you for a second", image: "" },
        ] : [
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
        parsedConfig.finalLetter = isEn
          ? { title: "A Letter for you", body: [""], loveSignature: "Love,", boySignature: "" }
          : { title: "رسالة", body: [""], loveSignature: "", boySignature: "" };
      }
      if (!parsedConfig.finalLetter.body) parsedConfig.finalLetter.body = [""];
      if (!parsedConfig.judgeText) {
        parsedConfig.judgeText = isEn
          ? { title: "The Court rules in your favor!", details: "Everything you said is right." }
          : { title: "المحكمة تحكم لصالحك!", details: "كل كلامك صح" };
      }
      if (!parsedConfig.feedbackTexts) {
        parsedConfig.feedbackTexts = isEn ? {
          oneStar: "1 star alert!", twoStar: "2 stars?", threeStar: "3 stars.",
          fourStar: "4 stars!", fiveStar: "5 stars! Perfect!"
        } : {
          oneStar: "تنبيه: نجمة واحدة!", twoStar: "نجمتين!", threeStar: "3 نجوم",
          fourStar: "4 نجوم", fiveStar: "5 نجوم شكرا"
        };
      }
      setFormData(parsedConfig);
    }
  }, [config, formData]);

  // ── Live Tracking ──
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

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, 3000);
    return () => clearInterval(intervalRef.current);
  }, [load]);

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

  // ── Settings Save ──
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const savedPwd = sessionStorage.getItem(`auth_pwd_${siteSlug}`) || "";
      const res = await fetch(`/api/sites/${encodeURIComponent(siteSlug)}/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edit_password: savedPwd, config: formData }),
      });
      if (res.ok) {
        setSaveStatus({ success: true, msg: "✓ تم حفظ التغييرات بنجاح!" });
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
      const timer = setTimeout(() => setSaveStatus(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  // ── Delete Site ──
  const handleDeleteSite = async () => {
    if (!window.confirm("تحذير: هذا سيؤدي إلى مسح الموقع بالكامل. هل أنت متأكد؟")) return;
    try {
      const savedPwd = sessionStorage.getItem(`auth_pwd_${siteSlug}`) || "";
      const res = await fetch(`/api/sites/${encodeURIComponent(siteSlug)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: savedPwd }),
      });
      if (res.ok) {
        alert("تم مسح الموقع نهائياً بنجاح.");
        window.location.href = "/";
      } else {
        const errData = await res.json();
        alert(errData.error || "فشل مسح الموقع");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الاتصال بالخادم");
    }
  };

  // ── Form Helpers ──
  const updateField = (path, value) => {
    setFormData((prev) => {
      const next = { ...prev };
      const parts = path.split(".");
      let current = next;
      for (let i = 0; i < parts.length - 1; i++) current = current[parts[i]];
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
        let width = img.width, height = img.height;
        const MAX_DIM = 600;
        if (width > height) { if (width > MAX_DIM) { height *= MAX_DIM / width; width = MAX_DIM; } }
        else { if (height > MAX_DIM) { width *= MAX_DIM / height; height = MAX_DIM; } }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setFormData((prev) => {
          const next = { ...prev };
          const nextTimeline = [...(next.timeline || [])];
          if (nextTimeline[index]) nextTimeline[index] = { ...nextTimeline[index], image: dataUrl };
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
      if (nextTimeline[index]) nextTimeline[index] = { ...nextTimeline[index], image: "" };
      next.timeline = nextTimeline;
      return next;
    });
  };

  const updateLoaderText = (idx, value) => setFormData((prev) => { const next = { ...prev }; next.loaderTexts[idx] = value; return next; });
  const addQuestion = () => setFormData((prev) => { const next = { ...prev }; next.triviaQuestions = [...next.triviaQuestions, { q: "سؤال جديد؟", options: ["اختيار 1", "اختيار 2"], correct: "اختيار 1", trap: null }]; return next; });
  const deleteQuestion = (idx) => setFormData((prev) => { const next = { ...prev }; next.triviaQuestions = next.triviaQuestions.filter((_, i) => i !== idx); return next; });
  const updateQuestionTitle = (idx, value) => setFormData((prev) => { const next = { ...prev }; next.triviaQuestions[idx].q = value; return next; });
  const addOption = (qIdx) => setFormData((prev) => { const next = { ...prev }; next.triviaQuestions[qIdx].options.push(`اختيار ${next.triviaQuestions[qIdx].options.length + 1}`); return next; });
  const deleteOption = (qIdx, oIdx) => setFormData((prev) => {
    const next = { ...prev };
    const optVal = next.triviaQuestions[qIdx].options[oIdx];
    next.triviaQuestions[qIdx].options = next.triviaQuestions[qIdx].options.filter((_, i) => i !== oIdx);
    let correct = next.triviaQuestions[qIdx].correct;
    if (Array.isArray(correct)) next.triviaQuestions[qIdx].correct = correct.filter((c) => c !== optVal);
    else if (correct === optVal) next.triviaQuestions[qIdx].correct = next.triviaQuestions[qIdx].options[0] || "";
    if (next.triviaQuestions[qIdx].trap?.option === optVal) next.triviaQuestions[qIdx].trap = null;
    return next;
  });
  const updateOption = (qIdx, oIdx, value) => setFormData((prev) => {
    const next = { ...prev };
    const oldVal = next.triviaQuestions[qIdx].options[oIdx];
    next.triviaQuestions[qIdx].options[oIdx] = value;
    let correct = next.triviaQuestions[qIdx].correct;
    if (Array.isArray(correct)) next.triviaQuestions[qIdx].correct = correct.map((c) => c === oldVal ? value : c);
    else if (correct === oldVal) next.triviaQuestions[qIdx].correct = value;
    if (next.triviaQuestions[qIdx].trap?.option === oldVal) next.triviaQuestions[qIdx].trap.option = value;
    return next;
  });
  const setCorrectOption = (qIdx, opt, isChecked) => setFormData((prev) => {
    const next = { ...prev };
    const question = next.triviaQuestions[qIdx];
    let correct = question.correct;
    let isArray = Array.isArray(correct);
    if (isChecked) { question.correct = isArray ? (correct.includes(opt) ? correct : [...correct, opt]) : [correct, opt]; }
    else { if (isArray) { const remaining = correct.filter((c) => c !== opt); question.correct = remaining.length === 1 ? remaining[0] : remaining; } }
    return next;
  });
  const addCoupon = () => setFormData((prev) => { const next = { ...prev }; next.giftCoupons = [...next.giftCoupons, "كوبون جديد 🎟️"]; return next; });
  const deleteCoupon = (idx) => setFormData((prev) => { const next = { ...prev }; next.giftCoupons = next.giftCoupons.filter((_, i) => i !== idx); return next; });
  const updateCoupon = (idx, value) => setFormData((prev) => { const next = { ...prev }; next.giftCoupons[idx] = value; return next; });
  const addParagraph = () => setFormData((prev) => { const next = { ...prev }; next.finalLetter.body = [...next.finalLetter.body, "فقرة جديدة"]; return next; });
  const deleteParagraph = (idx) => setFormData((prev) => { const next = { ...prev }; next.finalLetter.body = next.finalLetter.body.filter((_, i) => i !== idx); return next; });
  const updateParagraph = (idx, value) => setFormData((prev) => { const next = { ...prev }; next.finalLetter.body[idx] = value; return next; });

  // ── Derived ──
  const onlineCount = rows.filter((r) => (Date.now() - new Date(r.updated_at).getTime()) < 15000).length;
  const lastSeen = rows.length > 0 ? timeAgo(rows.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0]?.updated_at) : null;

  const MAIN_TABS = [
    { id: "live",     label: "مباشر",     icon: Activity },
    { id: "settings", label: "الإعدادات", icon: Settings },
    { id: "ai",       label: "الذكاء",    icon: Sparkles },
  ];

  const SETTINGS_TABS = [
    { id: "basic",    label: "الأساسيات",       icon: Sparkles },
    { id: "timeline", label: "الذكريات",         icon: Activity },
    { id: "quiz",     label: "الاختبار",          icon: HelpCircle },
    { id: "court",    label: "المحكمة",           icon: Gavel },
    { id: "letter",   label: "الجواب والهدايا",   icon: Gift },
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: "var(--bg-base)", color: "var(--text-primary)", minHeight: "100vh" }} className="font-sans antialiased">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-16 space-y-5">

        {/* ══════════════════════════════════════════════
            BLOCK 1 — HERO HEADER
        ══════════════════════════════════════════════ */}
        <div style={T.card} className="rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

            {/* Identity */}
            <div className="flex items-center gap-4">
              <div
                style={{ background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)", boxShadow: "0 8px 28px var(--accent-glow)" }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 select-none"
              >
                🔒
              </div>
              <div>
                <h1
                  style={{ color: "var(--text-primary)", fontFamily: "'Playfair Display', 'Cairo', serif" }}
                  className="text-2xl sm:text-3xl font-bold tracking-tight"
                >
                  {t("dashboardTitle")}
                </h1>
                <p style={{ color: "var(--text-muted)" }} className="mt-0.5 text-sm font-medium">
                  إدارة رحلة{" "}
                  <span style={{ color: "var(--accent)" }} className="font-bold">
                    {formData?.girlNickname || "—"}
                  </span>
                </p>
              </div>
            </div>

            {/* Metrics + Actions */}
            <div className="flex flex-wrap items-center gap-3">

              {/* Online count badge */}
              <div
                style={{
                  background: onlineCount > 0 ? "rgba(34,197,94,0.10)" : "rgba(148,163,184,0.08)",
                  border: `1px solid ${onlineCount > 0 ? "rgba(34,197,94,0.30)" : "rgba(148,163,184,0.18)"}`,
                  color: onlineCount > 0 ? "#22C55E" : "var(--text-muted)",
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
              >
                <span className={`w-2 h-2 rounded-full ${onlineCount > 0 ? "bg-green-500 animate-pulse" : "bg-slate-400"}`} />
                {onlineCount > 0 ? `${onlineCount} متصلة الآن` : "لا يوجد زوار"}
              </div>

              {/* Last seen */}
              {lastSeen && (
                <div
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border-base)", color: "var(--text-muted)" }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold"
                >
                  <MapPin size={11} />
                  {lastSeen}
                </div>
              )}

              {/* Copy link */}
              <button
                onClick={copyToClipboard}
                style={T.accentGradient}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95"
              >
                <Copy size={15} />
                {copyFeedback || t("copyLink")}
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            BLOCK 2 — PREMIUM TAB BAR
        ══════════════════════════════════════════════ */}
        <div
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-base)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
          className="rounded-2xl p-1.5 flex gap-1"
        >
          {MAIN_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={
                  isActive
                    ? { background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)", color: "#1A1510", boxShadow: "0 4px 16px var(--accent-glow)" }
                    : { color: "var(--text-muted)" }
                }
                className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${!isActive ? "hover:bg-gray-50" : ""}`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════════
            BLOCK 3 — CONTENT AREA (animated)
        ══════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">

          {/* ─── TAB: LIVE ─── */}
          {activeTab === "live" && (
            <motion.div key="live" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="space-y-4">

              {/* Live header */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 style={{ color: "var(--text-primary)" }} className="flex items-center gap-2 text-base font-bold">
                    <Activity size={18} className="text-red-500 animate-pulse" />
                    {t("liveTracking")}
                  </h2>
                  <p style={{ color: "var(--text-muted)" }} className="text-xs mt-0.5 font-medium">{t("liveTrackingDesc")}</p>
                </div>
                <button
                  onClick={load}
                  disabled={loading}
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border-base)", color: "var(--text-secondary)" }}
                  className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all hover:opacity-80 disabled:opacity-40"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                  {t("refresh")}
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-center text-sm text-red-600 font-medium">{error}</div>
              )}

              {/* Empty state */}
              {!loading && rows.length === 0 && !error && (
                <div style={T.card} className="rounded-3xl p-14 text-center">
                  <div className="text-5xl mb-4 select-none">📡</div>
                  <p style={{ color: "var(--text-primary)" }} className="text-base font-bold">{t("noVisits")}</p>
                  <p style={{ color: "var(--text-muted)" }} className="text-sm mt-1 font-medium">{t("noVisitsDesc")}</p>
                </div>
              )}

              {/* Cards grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {rows.map((row) => (
                  <PremiumSessionCard key={row.session_id} row={row} onBroadcast={broadcast} />
                ))}
              </div>
            </motion.div>
          )}

          {/* ─── TAB: AI ─── */}
          {activeTab === "ai" && (
            <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
              <div style={T.card} className="rounded-3xl p-6 sm:p-8">
                <MagicAIGenerator siteSlug={siteSlug} setFormData={setFormData} />
              </div>
            </motion.div>
          )}

          {/* ─── TAB: SETTINGS ─── */}
          {activeTab === "settings" && formData && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
              <form onSubmit={handleSave} className="space-y-4">

                {/* Settings top bar */}
                <div style={T.card} className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 style={{ color: "var(--text-primary)" }} className="text-base font-bold flex items-center gap-2">
                      <Settings size={18} style={{ color: "var(--accent)" }} />
                      إعدادات محتوى الموقع
                    </h2>
                    <p style={{ color: "var(--text-muted)" }} className="text-xs mt-0.5 font-medium">
                      عدّل النصوص والأسئلة ثم اضغط حفظ.
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      type="submit"
                      disabled={isSaving}
                      style={T.accentGradient}
                      className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
                    >
                      {isSaving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                      {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
                    </button>
                    <AnimatePresence>
                      {saveStatus && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg ${saveStatus.success ? "text-green-700 bg-green-50 border border-green-200" : "text-red-600 bg-red-50 border border-red-200"}`}
                        >
                          {saveStatus.msg}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Settings sub-tab navigation */}
                <div
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border-base)" }}
                  className="rounded-2xl p-1 flex overflow-x-auto gap-1"
                  style2={{ scrollbarWidth: "none" }}
                >
                  {SETTINGS_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeSection === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveSection(tab.id)}
                        style={
                          isActive
                            ? { background: "var(--bg-card)", color: "var(--accent)", border: "1px solid var(--border-base)", boxShadow: "var(--shadow-card)" }
                            : { color: "var(--text-muted)", border: "1px solid transparent" }
                        }
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 hover:opacity-80"
                      >
                        <Icon size={13} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Settings Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    style={T.card}
                    className="rounded-3xl p-6 sm:p-8"
                  >

                    {/* ─ Basics ─ */}
                    {activeSection === "basic" && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { label: "اسم الولد",                   field: "boyName" },
                            { label: "اسم البنت",                   field: "girlName" },
                            { label: "اسم الدلع للبنت",             field: "girlNickname" },
                            { label: "اسم دلع للذكاء الاصطناعي (اختياري)", field: "petNameOverride" },
                          ].map(({ label, field }) => (
                            <FormField key={field} label={label}>
                              <TokenInput value={formData[field] || ""} onChange={(e) => updateField(field, e.target.value)} />
                            </FormField>
                          ))}
                        </div>

                        <FormField label="نص الصفحة الرئيسية (Landing)">
                          <TokenInput rows={3} value={formData.landingText} onChange={(e) => updateField("landingText", e.target.value)} />
                        </FormField>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField label="نص شاشة النهاية (اللانهائية)">
                            <TokenInput value={formData.voidText} onChange={(e) => updateField("voidText", e.target.value)} />
                          </FormField>
                          <FormField label="رابط ملف الموسيقى (MP3)">
                            <TokenInput value={formData.audioUrl || ""} onChange={(e) => updateField("audioUrl", e.target.value)} placeholder="https://..." />
                          </FormField>
                        </div>

                        <div style={{ borderTop: "1px solid var(--border-base)", paddingTop: "1.25rem" }}>
                          <FieldLabel>رسائل شاشة الهاكر (Loader Terminal)</FieldLabel>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                            {formData.loaderTexts.map((txt, idx) => (
                              <div key={idx}>
                                <label style={{ color: "var(--text-muted)", fontSize: "0.6rem" }} className="font-bold block mb-1">السطر {idx + 1}</label>
                                <TokenInput value={txt} onChange={(e) => updateLoaderText(idx, e.target.value)} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ─ Timeline ─ */}
                    {activeSection === "timeline" && (
                      <div className="space-y-4">
                        {formData.timeline?.map((item, idx) => (
                          <div key={idx} style={{ border: "1px solid var(--border-base)", background: "var(--bg-surface)" }} className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl">
                            <div className="flex flex-col items-center gap-3 w-full sm:w-1/3 shrink-0">
                              <div style={{ border: "2px dashed var(--border-base)", background: "var(--bg-base)" }} className="w-full aspect-video sm:aspect-square rounded-xl overflow-hidden flex items-center justify-center relative group">
                                {item.image ? (
                                  <>
                                    <img src={item.image} alt="preview" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <button type="button" onClick={() => handleRemoveTimelineImage(idx)} className="bg-red-500 text-white rounded-full p-2">
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <div style={{ color: "var(--text-muted)" }} className="flex flex-col items-center gap-1">
                                    <Activity size={22} className="opacity-20" />
                                    <span className="text-[10px] font-medium">بدون صورة</span>
                                  </div>
                                )}
                              </div>
                              {!item.image && (
                                <label style={{ background: "var(--bg-card)", border: "1px solid var(--border-base)", color: "var(--text-secondary)" }} className="text-xs font-bold px-4 py-2 rounded-xl cursor-pointer hover:opacity-80 w-full text-center transition-all">
                                  رفع صورة
                                  <input type="file" accept="image/*" onChange={(e) => handleTimelineImageUpload(e, idx)} className="hidden" />
                                </label>
                              )}
                            </div>
                            <div className="flex flex-col w-full gap-2">
                              <FieldLabel>ذكرى رقم {idx + 1}</FieldLabel>
                              <TokenInput rows={4} value={item.text} onChange={(e) => { const next = [...formData.timeline]; next[idx] = { ...next[idx], text: e.target.value }; updateField("timeline", next); }} placeholder="اكتب جملة توصف الذكرى..." />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ─ Quiz ─ */}
                    {activeSection === "quiz" && (
                      <div className="space-y-5">
                        <div className="flex items-center justify-between">
                          <p style={{ color: "var(--text-muted)" }} className="text-sm font-medium">أضف أسئلة للتأكد من ذاكرتها.</p>
                          <button type="button" onClick={addQuestion} style={T.accentGradient} className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90">
                            <Plus size={13} /> إضافة سؤال
                          </button>
                        </div>
                        <div className="space-y-5">
                          {formData.triviaQuestions.map((qItem, qIdx) => (
                            <div key={qIdx} style={{ border: "1px solid var(--border-base)", background: "var(--bg-surface)" }} className="rounded-2xl p-5 relative">
                              <button type="button" onClick={() => deleteQuestion(qIdx)} style={{ color: "var(--text-muted)" }} className="absolute top-4 left-4 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all">
                                <Trash2 size={16} />
                              </button>
                              <div className="flex flex-col gap-4 pr-8 sm:pr-0">
                                <FormField label={`السؤال ${qIdx + 1}`}>
                                  <TokenInput value={qItem.q} onChange={(e) => updateQuestionTitle(qIdx, e.target.value)} />
                                </FormField>
                                <div>
                                  <div className="flex items-center justify-between mb-3" style={{ borderTop: "1px solid var(--border-base)", paddingTop: "1rem" }}>
                                    <FieldLabel>الاختيارات (حدد الصحيح ✔️)</FieldLabel>
                                    <button type="button" onClick={() => addOption(qIdx)} style={{ color: "var(--accent)" }} className="text-xs flex items-center gap-1 font-bold hover:opacity-80">
                                      <Plus size={11} /> خيار
                                    </button>
                                  </div>
                                  <div className="space-y-2">
                                    {qItem.options.map((opt, oIdx) => {
                                      const isCorrect = Array.isArray(qItem.correct) ? qItem.correct.includes(opt) : qItem.correct === opt;
                                      return (
                                        <div key={oIdx} style={{ border: `1px solid ${isCorrect ? "rgba(34,197,94,0.35)" : "var(--border-base)"}`, background: isCorrect ? "rgba(34,197,94,0.07)" : "var(--bg-base)" }} className="flex items-center gap-3 p-2.5 rounded-xl">
                                          <input type="checkbox" checked={isCorrect} onChange={(e) => setCorrectOption(qIdx, opt, e.target.checked)} className="h-4 w-4 rounded shrink-0" />
                                          <input type="text" value={opt} onChange={(e) => updateOption(qIdx, oIdx, e.target.value)} style={{ color: isCorrect ? "#4ADE80" : "var(--text-primary)", background: "transparent" }} className={`flex-1 border-0 py-1 px-1 text-sm outline-none ${isCorrect ? "font-bold" : "font-medium"}`} />
                                          {qItem.options.length > 2 && (
                                            <button type="button" onClick={() => deleteOption(qIdx, oIdx)} style={{ color: "var(--text-muted)" }} className="hover:text-red-500 p-1 rounded-lg transition-colors shrink-0"><Trash2 size={14} /></button>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                                <div style={{ borderTop: "1px solid var(--border-base)", paddingTop: "0.75rem" }}>
                                  <label className="flex items-center gap-3 cursor-pointer w-fit group">
                                    <input type="checkbox" checked={qItem.trap !== null} onChange={(e) => {
                                      if (e.target.checked) setFormData((prev) => { const next = { ...prev }; next.triviaQuestions[qIdx].trap = { option: qItem.options[0] || "", msg: "بطلي عبط اختاري تاني 🤦‍♂️😂" }; return next; });
                                      else setFormData((prev) => { const next = { ...prev }; next.triviaQuestions[qIdx].trap = null; return next; });
                                    }} className="h-4 w-4 rounded shrink-0" />
                                    <span style={{ color: "var(--text-secondary)" }} className="text-sm font-bold">تفعيل خيار الفخ 🪤</span>
                                  </label>
                                  {qItem.trap && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ background: "rgba(201,149,108,0.08)", border: "1px solid rgba(201,149,108,0.22)" }} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl mt-3">
                                      <FormField label="الخيار المفخخ">
                                        <select value={qItem.trap.option} onChange={(e) => { const val = e.target.value; setFormData((prev) => { const next = { ...prev }; next.triviaQuestions[qIdx].trap.option = val; return next; }); }} style={T.input} className="w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] font-medium">
                                          {qItem.options.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
                                        </select>
                                      </FormField>
                                      <div className="md:col-span-2">
                                        <FormField label="رسالة الخداع 🤡">
                                          <TokenInput value={qItem.trap.msg} onChange={(e) => { const val = e.target.value; setFormData((prev) => { const next = { ...prev }; next.triviaQuestions[qIdx].trap.msg = val; return next; }); }} />
                                        </FormField>
                                      </div>
                                    </motion.div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ─ Court ─ */}
                    {activeSection === "court" && (
                      <div className="space-y-5">
                        <div style={{ border: "1px solid var(--border-base)", background: "var(--bg-surface)" }} className="rounded-2xl p-5 space-y-4">
                          <SectionHeading icon={Gavel}>الحكم الافتراضي للمحكمة</SectionHeading>
                          <FormField label="عنوان الحكم"><TokenInput value={formData.judgeText.title} onChange={(e) => updateField("judgeText.title", e.target.value)} /></FormField>
                          <FormField label="تفاصيل الحكم"><TokenInput rows={3} value={formData.judgeText.details} onChange={(e) => updateField("judgeText.details", e.target.value)} /></FormField>
                        </div>
                        <div style={{ border: "1px solid var(--border-base)", background: "var(--bg-surface)" }} className="rounded-2xl p-5 space-y-4">
                          <SectionHeading icon={Sparkles} accent>ردود تقييم النجوم</SectionHeading>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                              { key: "oneStar", label: "نجمة واحدة 😡" },
                              { key: "twoStar", label: "نجمتين 😟" },
                              { key: "threeStar", label: "3 نجوم 😐" },
                              { key: "fourStar", label: "4 نجوم 🙂" },
                              { key: "fiveStar", label: "5 نجوم 😍 (الصلح)", full: true },
                            ].map((star) => (
                              <div key={star.key} className={star.full ? "sm:col-span-2" : ""}>
                                <FormField label={star.label}>
                                  <TokenInput rows={star.full ? 3 : 2} value={formData.feedbackTexts[star.key]} onChange={(e) => updateField(`feedbackTexts.${star.key}`, e.target.value)} />
                                </FormField>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div style={{ border: "1px solid var(--border-base)", background: "var(--bg-surface)" }} className="rounded-2xl p-5 space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer w-fit">
                            <input type="checkbox" checked={formData.enableFunnyText} onChange={(e) => updateField("enableFunnyText", e.target.checked)} className="h-4 w-4 rounded shrink-0" />
                            <span style={{ color: "var(--text-primary)" }} className="text-sm font-bold">تفعيل الرسالة الساخرة في النهاية 😈</span>
                          </label>
                          {formData.enableFunnyText && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                              <FormField label="النص الساخر">
                                <TokenInput value={formData.funnyText} onChange={(e) => updateField("funnyText", e.target.value)} />
                              </FormField>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ─ Letter + Gifts ─ */}
                    {activeSection === "letter" && (
                      <div className="space-y-5">
                        <div style={{ border: "1px solid var(--border-base)", background: "var(--bg-surface)" }} className="rounded-2xl p-5 space-y-4">
                          <SectionHeading icon={FileText}>رسالة النهاية (الجواب)</SectionHeading>
                          <FormField label="عنوان الجواب"><TokenInput value={formData.finalLetter.title} onChange={(e) => updateField("finalLetter.title", e.target.value)} /></FormField>
                          <div style={{ borderTop: "1px solid var(--border-base)", paddingTop: "1rem" }}>
                            <div className="flex items-center justify-between mb-3">
                              <FieldLabel>محتوى الجواب (فقرات)</FieldLabel>
                              <button type="button" onClick={addParagraph} style={{ color: "var(--accent)", border: "1px solid var(--border-base)", background: "var(--bg-card)" }} className="text-xs flex items-center gap-1 font-bold px-3 py-1.5 rounded-lg hover:opacity-80">
                                <Plus size={11} /> فقرة
                              </button>
                            </div>
                            <div className="space-y-2">
                              {formData.finalLetter.body.map((para, idx) => (
                                <div key={idx} style={{ border: "1px solid var(--border-base)", background: "var(--bg-base)" }} className="flex gap-3 items-start p-3 rounded-xl">
                                  <span style={{ color: "var(--text-muted)" }} className="text-xs font-bold pt-2 shrink-0">{idx + 1}</span>
                                  <textarea value={para} onChange={(e) => updateParagraph(idx, e.target.value)} rows={3} style={{ color: "var(--text-primary)", background: "transparent" }} className="flex-1 border-0 py-1 text-sm font-medium outline-none resize-none leading-relaxed" />
                                  {formData.finalLetter.body.length > 1 && (
                                    <button type="button" onClick={() => deleteParagraph(idx)} style={{ color: "var(--text-muted)" }} className="hover:text-red-500 p-1.5 rounded-lg transition-colors shrink-0"><Trash2 size={14} /></button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField label="جملة الختام"><TokenInput value={formData.finalLetter.loveSignature} onChange={(e) => updateField("finalLetter.loveSignature", e.target.value)} /></FormField>
                            <FormField label="اسمك"><TokenInput value={formData.finalLetter.boySignature} onChange={(e) => updateField("finalLetter.boySignature", e.target.value)} /></FormField>
                          </div>
                        </div>

                        {/* Gift Coupons */}
                        <div style={{ border: "1px solid rgba(99,102,241,0.22)", background: "rgba(99,102,241,0.05)" }} className="rounded-2xl p-5 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 style={{ color: "var(--text-primary)" }} className="text-sm font-bold flex items-center gap-2">
                                <Gift size={15} className="text-indigo-400" />
                                كروت الهدايا (Gift Coupons)
                              </h3>
                              <p style={{ color: "var(--text-muted)" }} className="text-xs mt-0.5 font-medium">كروت تظهر لها في النهاية للصلح المادي والمعنوي.</p>
                            </div>
                            <button type="button" onClick={addCoupon} className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-colors">
                              <Plus size={13} /> إضافة
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {formData.giftCoupons.map((coupon, idx) => (
                              <div key={idx} style={{ border: "1px solid rgba(99,102,241,0.18)", background: "var(--bg-surface)" }} className="flex gap-2 items-center p-2.5 rounded-xl">
                                <Gift size={14} className="text-indigo-400 shrink-0 ml-1" />
                                <input type="text" value={coupon} onChange={(e) => updateCoupon(idx, e.target.value)} style={{ color: "var(--text-primary)", background: "transparent" }} className="flex-1 border-0 py-1 text-sm font-bold outline-none focus:ring-0" placeholder="مثال: خروجة على حسابي" />
                                <button type="button" onClick={() => deleteCoupon(idx)} style={{ color: "var(--text-muted)" }} className="hover:text-red-500 p-1 rounded-lg transition-colors shrink-0"><Trash2 size={14} /></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  </motion.div>
                </AnimatePresence>
              </form>
            </motion.div>
          )}

        </AnimatePresence>

        {/* ── Danger Zone ── */}
        <div style={{ border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.05)" }} className="rounded-3xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-red-600 flex items-center gap-2">
                <AlertCircle size={16} />
                {t("dangerZone")}
              </h2>
              <p style={{ color: "var(--text-muted)" }} className="text-xs mt-0.5 font-medium">{t("dangerZoneDesc")}</p>
            </div>
            <button onClick={handleDeleteSite} className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-sm font-bold text-white transition-all shrink-0 shadow-md">
              <Trash2 size={15} /> {t("deleteSiteBtn")}
            </button>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
