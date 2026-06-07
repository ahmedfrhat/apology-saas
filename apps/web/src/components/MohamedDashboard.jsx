import { useState, useEffect, useCallback, useRef } from "react";
import {
  Activity,
  Radio,
  RefreshCw,
  Send,
  BatteryCharging,
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
  Sparkles
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

  const send = useCallback(async () => {
    if (!msg.trim()) return;
    setSending(true);
    await onBroadcast(row.session_id, msg.trim());
    setMsg("");
    setSending(false);
  }, [msg, row.session_id, onBroadcast]);

  const battery = row.battery_level ?? 0;
  const batteryColor =
    battery < 20
      ? "#EF4444"
      : battery < 50
        ? "#F97316"
        : battery < 80
          ? "#EC4899"
          : "#22C55E";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
            <Activity size={12} className="text-amber-800" />
            {SECTION_LABELS[row.current_section] || row.current_section || "—"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700">
            <BatteryCharging size={12} style={{ color: batteryColor }} />
            <span style={{ color: batteryColor }} className="font-semibold">
              {battery}%
            </span>
          </span>
          {row.hesitation_detected && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 animate-pulse">
              ⚠️ مترددة! (فكرت في الرفض لمدة {Math.round(row.hesitation_seconds)} ثوانٍ قبل القبول)
            </span>
          )}
        </div>
        <span className="text-xs font-medium text-gray-500">
          {timeAgo(row.updated_at)}
        </span>
      </div>

      <div className="mt-3 font-mono text-xs text-gray-500" dir="ltr">
        {row.session_id}
      </div>
      <div className="mt-1 text-sm text-gray-600">
        <span className="text-gray-400 mr-2">-</span>
        آخر حركة: {row.last_action || "لا يوجد"}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="ابعت رسالة لشاشة الشريك..."
          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-amber-800"
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || !msg.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-900 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800 focus-visible:ring-offset-2"
        >
          <Send size={15} /> بث
        </button>
      </div>
    </div>
  );
}

export default function MohamedDashboard() {
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

  const [incidentReason, setIncidentReason] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState("");

  const handleGenerateAI = async (e) => {
    e.preventDefault();
    if (!incidentReason.trim() || !siteSlug) return;
    setIsGeneratingAI(true);
    setAiSuccessMsg("");
    try {
      const res = await fetch(`/api/sites/${encodeURIComponent(siteSlug)}/generate-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incident_reason: incidentReason.trim() }),
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
      setFormData(JSON.parse(JSON.stringify(config)));
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
        setSaveStatus({ success: true, msg: "تم حفظ الإعدادات بنجاح!" });
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
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="mx-auto max-w-4xl px-5 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900">
              <Radio size={24} className="text-amber-800" />
              لوحة تحكم الموقع ({siteSlug})
            </h1>
            <p className="text-sm text-gray-500">
              إدارة إعدادات الموقع، وتعديل المحتوى، ومتابعة النشاط اللحظي
            </p>
          </div>
          {activeTab === "live" && (
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 focus-visible:outline-none"
            >
              <RefreshCw size={15} /> تحديث
            </button>
          )}
        </div>

        {/* Tab Sub-navigation */}
        <div className="flex border-b border-gray-200 mb-8 bg-white rounded-xl p-1 shadow-sm border">
          <button
            onClick={() => setActiveTab("live")}
            className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "live"
                ? "bg-amber-800 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Activity size={16} />
            المتابعة اللحظية
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "settings"
                ? "bg-amber-800 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Settings size={16} />
            إعدادات الموقع
          </button>
        </div>

        {/* Tab Content: Live Tracking */}
        {activeTab === "live" && (
          <div className="flex flex-col gap-4">
            {loading && <p className="text-sm text-gray-500">جاري التحميل...</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}

            {!loading && rows.length === 0 && !error && (
              <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
                <p className="text-base font-semibold text-gray-900">
                  لسه مفيش حد فتح الموقع
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  هتظهر هنا أول ما يتم فتح اللينك
                </p>
              </div>
            )}

            {rows.map((row) => (
              <SessionRow
                key={row.session_id}
                row={row}
                onBroadcast={broadcast}
              />
            ))}
          </div>
        )}

        {/* Tab Content: Settings */}
        {activeTab === "settings" && formData && (
          <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Category selector */}
              <div className="md:col-span-1 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 border-b md:border-b-0 md:border-l border-gray-100 md:pl-4">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveSection(cat.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-lg whitespace-nowrap transition-all duration-200 text-right ${
                        activeSection === cat.id
                          ? "bg-amber-50 text-amber-900 border border-amber-200/50"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <Icon
                        size={16}
                        className={activeSection === cat.id ? "text-amber-800" : "text-gray-400"}
                      />
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* Setting Panels */}
              <div className="md:col-span-3">
                {/* 1. Basic Settings panel */}
                {activeSection === "basic" && (
                  <div className="flex flex-col gap-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">الأساسيات والنصوص</h3>
                    
                    <div className="bg-amber-50/60 border border-amber-200/50 rounded-2xl p-5 mb-2">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-amber-900 mb-2">
                        <Sparkles size={16} className="text-amber-800 animate-pulse" />
                        الصياغة السحرية بالذكاء الاصطناعي ✨
                      </h4>
                      <p className="text-xs text-amber-800/80 mb-3 leading-relaxed">
                        اكتب سبب المشكلة وهيصاغ اعتذار رومانسي وأسئلة فخ مضحكة وجواب خاص بالكامل!
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={incidentReason}
                          onChange={(e) => setIncidentReason(e.target.value)}
                          placeholder="مثال: نسيت عيد ميلادها / اندمجت في ببجي ونمت..."
                          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:ring-1 focus:ring-amber-800"
                        />
                        <button
                          type="button"
                          onClick={handleGenerateAI}
                          disabled={isGeneratingAI || !incidentReason.trim()}
                          className="rounded-lg bg-amber-800 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-900 disabled:opacity-50 transition-colors"
                        >
                          {isGeneratingAI ? "جاري التوليد..." : "توليد سحري ✨"}
                        </button>
                      </div>
                      {aiSuccessMsg && (
                        <p className="mt-2 text-xs font-medium text-green-700">{aiSuccessMsg}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">اسم الولد</label>
                        <input
                          type="text"
                          required
                          value={formData.boyName}
                          onChange={(e) => updateField("boyName", e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-amber-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">اسم البنت</label>
                        <input
                          type="text"
                          required
                          value={formData.girlName}
                          onChange={(e) => updateField("girlName", e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-amber-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">اسم الدلع للبنت</label>
                      <input
                        type="text"
                        required
                        value={formData.girlNickname}
                        onChange={(e) => updateField("girlNickname", e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-amber-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">نص الصفحة الرئيسية</label>
                      <textarea
                        rows={3}
                        required
                        value={formData.landingText}
                        onChange={(e) => updateField("landingText", e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-amber-800 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">نص النهاية (الشاشة اللانهائية)</label>
                      <input
                        type="text"
                        required
                        value={formData.voidText}
                        onChange={(e) => updateField("voidText", e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-amber-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">رابط ملف الموسيقى الخلفية (MP3/M4A)</label>
                      <input
                        type="text"
                        value={formData.audioUrl || ""}
                        onChange={(e) => updateField("audioUrl", e.target.value)}
                        placeholder="مثال: https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-amber-800"
                      />
                    </div>

                    <div className="border-t border-gray-100 pt-5">
                      <span className="block text-xs font-bold text-gray-700 mb-3">رسائل شاشة التحميل (Loader Terminal)</span>
                      <div className="flex flex-col gap-3">
                        {formData.loaderTexts.map((txt, idx) => (
                          <div key={idx} className="flex flex-col gap-1">
                            <label className="text-[10px] text-gray-400">السطر {idx + 1}</label>
                            <input
                              type="text"
                              required
                              value={txt}
                              onChange={(e) => updateLoaderText(idx, e.target.value)}
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-amber-800"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Quiz Settings panel */}
                {activeSection === "quiz" && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">الأسئلة والاختبار</h3>
                      <button
                        type="button"
                        onClick={addQuestion}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-950 bg-amber-50 border border-amber-200/50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Plus size={14} /> إضافة سؤال جديد
                      </button>
                    </div>

                    {formData.triviaQuestions.map((qItem, qIdx) => (
                      <div
                        key={qIdx}
                        className="border border-gray-200 rounded-xl bg-gray-50/50 p-4 relative"
                      >
                        <button
                          type="button"
                          onClick={() => deleteQuestion(qIdx)}
                          className="absolute top-4 left-4 text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                          title="حذف السؤال"
                        >
                          <Trash2 size={16} />
                        </button>

                        <div className="flex flex-col gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">السؤال {qIdx + 1}</label>
                            <input
                              type="text"
                              required
                              value={qItem.q}
                              onChange={(e) => updateQuestionTitle(qIdx, e.target.value)}
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-amber-800"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-gray-600">الاختيارات والحل الصحيح</span>
                              <button
                                type="button"
                                onClick={() => addOption(qIdx)}
                                className="text-xs text-amber-800 hover:text-amber-950 flex items-center gap-1 font-semibold"
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
                                    className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isCorrect}
                                      onChange={(e) => setCorrectOption(qIdx, opt, e.target.checked)}
                                      className="h-4 w-4 rounded border-gray-300 text-amber-800 focus:ring-amber-800"
                                      title="تحديد كإجابة صحيحة"
                                    />
                                    <input
                                      type="text"
                                      required
                                      value={opt}
                                      onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                      className="flex-1 border-0 bg-transparent py-1 px-2 text-sm text-gray-900 outline-none focus:ring-1 focus:ring-amber-800 rounded"
                                    />
                                    {qItem.options.length > 2 && (
                                      <button
                                        type="button"
                                        onClick={() => deleteOption(qIdx, oIdx)}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                        title="حذف الاختيار"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Trap option checkbox & config */}
                          <div className="border-t border-gray-200 pt-3">
                            <div className="flex items-center gap-2 mb-2">
                              <input
                                type="checkbox"
                                id={`trap-toggle-${qIdx}`}
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
                                className="h-4 w-4 rounded border-gray-300 text-amber-800 focus:ring-amber-800"
                              />
                              <label
                                htmlFor={`trap-toggle-${qIdx}`}
                                className="text-xs font-semibold text-amber-900 cursor-pointer"
                              >
                                تفعيل خيار الفخ (Trap Option) للسؤال
                              </label>
                            </div>

                            {qItem.trap && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-gray-200 mt-2">
                                <div className="md:col-span-1">
                                  <label className="block text-[11px] font-medium text-gray-500 mb-1">خيار الفخ</label>
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
                                    className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-amber-800"
                                  >
                                    {qItem.options.map((opt, idx) => (
                                      <option key={idx} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="md:col-span-2">
                                  <label className="block text-[11px] font-medium text-gray-500 mb-1">الرسالة المعروضة للفخ</label>
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
                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-amber-800"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. Court Verdict panel */}
                {activeSection === "court" && (
                  <div className="flex flex-col gap-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">المحكمة والتقييم</h3>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">عنوان حكم القاضي</label>
                      <input
                        type="text"
                        required
                        value={formData.judgeText.title}
                        onChange={(e) => updateField("judgeText.title", e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-amber-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">تفاصيل الحكم</label>
                      <textarea
                        rows={3}
                        required
                        value={formData.judgeText.details}
                        onChange={(e) => updateField("judgeText.details", e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-amber-800 resize-none"
                      />
                    </div>

                    <div className="border-t border-gray-100 pt-5 flex flex-col gap-4">
                      <span className="block text-xs font-bold text-gray-700">نصوص تقييم النجوم (Feedback Stars)</span>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">تقييم 1 نجمة</label>
                        <textarea
                          rows={2}
                          required
                          value={formData.feedbackTexts.oneStar}
                          onChange={(e) => updateField("feedbackTexts.oneStar", e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-amber-800 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">تقييم نجمتين</label>
                        <textarea
                          rows={2}
                          required
                          value={formData.feedbackTexts.twoStar}
                          onChange={(e) => updateField("feedbackTexts.twoStar", e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-amber-800 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">تقييم 3 نجوم</label>
                        <textarea
                          rows={2}
                          required
                          value={formData.feedbackTexts.threeStar}
                          onChange={(e) => updateField("feedbackTexts.threeStar", e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-amber-800 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">تقييم 4 نجوم</label>
                        <textarea
                          rows={2}
                          required
                          value={formData.feedbackTexts.fourStar}
                          onChange={(e) => updateField("feedbackTexts.fourStar", e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-amber-800 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">تقييم 5 نجوم (الصلح)</label>
                        <textarea
                          rows={2}
                          required
                          value={formData.feedbackTexts.fiveStar}
                          onChange={(e) => updateField("feedbackTexts.fiveStar", e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-amber-800 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Letter Settings panel */}
                {activeSection === "letter" && (
                  <div className="flex flex-col gap-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">الجواب والهدايا</h3>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">عنوان الجواب الأخير</label>
                      <input
                        type="text"
                        required
                        value={formData.finalLetter.title}
                        onChange={(e) => updateField("finalLetter.title", e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-amber-800"
                      />
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600">فقرات الجواب (نص الرسالة)</span>
                        <button
                          type="button"
                          onClick={addParagraph}
                          className="text-xs text-amber-800 hover:text-amber-950 flex items-center gap-1 font-semibold"
                        >
                          <Plus size={12} /> إضافة فقرة
                        </button>
                      </div>
                      {formData.finalLetter.body.map((para, idx) => (
                        <div
                          key={idx}
                          className="flex gap-2 items-start bg-gray-50 p-2.5 rounded-lg border border-gray-200"
                        >
                          <span className="text-xs font-bold text-gray-400 pt-2">{idx + 1}</span>
                          <textarea
                            value={para}
                            required
                            onChange={(e) => updateParagraph(idx, e.target.value)}
                            rows={3}
                            className="flex-1 border-0 bg-transparent py-1 px-2 text-sm text-gray-900 outline-none focus:ring-1 focus:ring-amber-800 rounded resize-none"
                          />
                          {formData.finalLetter.body.length > 1 && (
                            <button
                              type="button"
                              onClick={() => deleteParagraph(idx)}
                              className="text-gray-400 hover:text-red-500 p-1"
                              title="حذف الفقرة"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">توقيع الحب</label>
                        <input
                          type="text"
                          required
                          value={formData.finalLetter.loveSignature}
                          onChange={(e) => updateField("finalLetter.loveSignature", e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-amber-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">توقيع الولد</label>
                        <input
                          type="text"
                          required
                          value={formData.finalLetter.boySignature}
                          onChange={(e) => updateField("finalLetter.boySignature", e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-amber-800"
                        />
                      </div>
                    </div>

                    {/* Coupons Section */}
                    <div className="flex flex-col gap-3 border-t border-gray-100 pt-5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600">كروت الهدايا (Gift Coupons)</span>
                        <button
                          type="button"
                          onClick={addCoupon}
                          className="text-xs text-amber-800 hover:text-amber-950 flex items-center gap-1 font-semibold"
                        >
                          <Plus size={12} /> إضافة كارت
                        </button>
                      </div>
                      {formData.giftCoupons.map((coupon, idx) => (
                        <div
                          key={idx}
                          className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-200"
                        >
                          <input
                            type="text"
                            required
                            value={coupon}
                            onChange={(e) => updateCoupon(idx, e.target.value)}
                            className="flex-1 border-0 bg-transparent py-1 px-2 text-sm text-gray-900 outline-none focus:ring-1 focus:ring-amber-800 rounded"
                          />
                          <button
                            type="button"
                            onClick={() => deleteCoupon(idx)}
                            className="text-gray-400 hover:text-red-500 p-1"
                            title="حذف كارت الهدية"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="mt-8 border-t border-gray-200 pt-5 flex items-center justify-between">
              <div>
                {saveStatus && (
                  <span
                    className={`text-sm font-semibold flex items-center gap-1.5 ${
                      saveStatus.success ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {saveStatus.success ? <Check size={16} /> : <AlertCircle size={16} />}
                    {saveStatus.msg}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-900 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800"
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
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
