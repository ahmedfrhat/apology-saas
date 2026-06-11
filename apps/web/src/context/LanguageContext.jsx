import React, { createContext, useContext, useState, useEffect } from "react";

const translations = {
  ar: {
    dashboardTitle: "لوحة التحكم 🔐",
    liveTracking: "المتابعة اللحظية",
    liveTrackingDesc: "شاهد تقدمها في الموقع وأرسل لها رسائل تنبيهية تظهر فوراً على شاشتها.",
    settingsTitle: "إعدادات محتوى الموقع",
    settingsDesc: "عدّل على نصوص وأسئلة الموقع لحفظ تجربة مخصصة لها.",
    saveChanges: "حفظ التغييرات",
    saving: "جاري الحفظ...",
    dangerZone: "منطقة الخطر (Danger Zone)",
    dangerZoneDesc: "مسح هذا الموقع سيؤدي إلى تدمير الرابط وحذف جميع بيانات المحكمة والمحتوى نهائياً.",
    deleteSiteBtn: "إنهاء ومسح الجلسة نهائياً 🗑️",
    sendBtn: "إرسال",
    sending: "جاري...",
    refresh: "تحديث",
    noVisits: "لا توجد زيارات حتى الآن",
    noVisitsDesc: "بمجرد أن تفتح الفتاة الرابط ستظهر تحركاتها هنا بشكل مباشر.",
    landingSubtitle: "إنشاء رابط سحري لمصالحة من تحب بأسلوب ذكي ومرح.",
    createMagicLink: "إنشاء المفاجأة الرومانسية 🪄",
    creating: "جاري التحضير...",
    magicLinkReady: "✨ الرابط السحري جاهز! شاركه معاها دلوقتي:",
    copyLink: "نسخ الرابط",
    copied: "تم النسخ بنجاح! 📋",
    createLinkError: "فشل إنشاء الرابط",
    boyName: "اسمك",
    girlName: "اسمها",
    petName: "اسم دلع البنت",
    pwdLabel: "كلمة المرور لإدارة هذا الرابط (مهم جداً)",
    pwdPlaceholder: "اكتب كلمة مرور قوية...",
    trustText: "مضمون 100% | آمن وسري تماماً | مجاني للتجربة",
    basicSettings: "الأساسيات والنصوص",
    quizSettings: "الأسئلة والاختبار",
    courtSettings: "المحكمة والتقييم",
    letterSettings: "الجواب والهدايا",
    timeline: "ذكرياتنا (Timeline)",
    addMemory: "إضافة ذكرى",
    trivia: "اختبار الذاكرة (Trivia)",
    addQuestion: "إضافة سؤال",
    coupons: "كروت الهدايا (Gift Coupons)",
    addCoupon: "إضافة كارت",
    letterBody: "نص الجواب فقرة بفقرة",
    addParagraph: "إضافة فقرة",
    pwdReminder: "⚠️ لا تنسَ إرسال كلمة المرور (Password) لها لتتمكن من الدخول!",
    telegramAlerts: "الإشعارات (Telegram)",
    notificationsSettings: "إعدادات الإشعارات والتليجرام",
    telegramSetup: "خطوات تفعيل التليجرام",
    telegramStep1: "1. ابحث عن البوت",
    telegramStep2: "2. أرسل له /start",
    telegramStep3: "3. انسخ الـ ID الخاص بك وضعه هنا",
    aiGenerator: "المولد الذكي",
    aiTitle: "الصياغة السحرية بالذكاء الاصطناعي",
    aiDesc: "اكتب سبب الزعل واضغط توليد — سيصيغ الـ AI اعتذاراً رومانسياً متكاملاً مع أسئلة وفخوخ مخصصة.",
    coreIntent: "الهدف الأساسي (Core Intent)",
    textVibe: "روح النص (Vibe)",
    vibeIntensity: "جرعة المشاعر (Intensity)",
    incidentReasonPlaceholder: "مثال: نسيت عيد ميلادها / اتأخرت عليها...",
    generateMagic: "توليد سحري ✨",
    generating: "جاري الإبداع...",
    journeyMap: "خريطة الرحلة",
    currentSectionLabel: "القسم الحالي",
    lastActionLabel: "آخر حركة",
    deleteSession: "حذف الجلسة",
    onlineNow: "متصلة الآن",
    offline: "لا يوجد زوار",
    atGate: "عند البوابة 🔒",
    insidePlatform: "داخل المنصة ✅",
    disconnected: "غير متصلة",
    broadcastPlaceholder: "ابعث رسالة تظهر على شاشتها فوراً...",
    contentSettingsTitle: "إعدادات محتوى الموقع",
    contentSettingsDesc: "عدّل النصوص والأسئلة ثم اضغط حفظ.",
    telegramOptional: "🔔 تفعيل إشعارات تليجرام (اختياري)",
    telegramChatIdPlaceholder: "Telegram Chat ID (e.g. 123456789)"
  },
  en: {
    dashboardTitle: "Admin Dashboard 🔐",
    liveTracking: "Live Tracking",
    liveTrackingDesc: "Watch her progress live and send instant push notifications to her screen.",
    settingsTitle: "Content Settings",
    settingsDesc: "Customize texts and questions for a personalized experience.",
    saveChanges: "Save Changes",
    saving: "Saving...",
    dangerZone: "Danger Zone",
    dangerZoneDesc: "Deleting this site will permanently destroy the link, court data, and all content.",
    deleteSiteBtn: "Terminate & Delete Session 🗑️",
    sendBtn: "Send",
    sending: "Sending...",
    refresh: "Refresh",
    noVisits: "No visits yet",
    noVisitsDesc: "Once she opens the link, her actions will appear here live.",
    landingSubtitle: "Create a magical link to playfully apologize and win her back.",
    createMagicLink: "Create Romantic Surprise 🪄",
    creating: "Preparing...",
    magicLinkReady: "✨ Magic Link Ready! Share it with her now:",
    copyLink: "Copy Link",
    copied: "Copied successfully! 📋",
    createLinkError: "Failed to create link",
    boyName: "Your Name",
    girlName: "Her Name",
    petName: "Her Pet Name",
    pwdLabel: "Admin Password for this link (Very Important)",
    pwdPlaceholder: "Enter a strong password...",
    trustText: "100% Guaranteed | Secure & Private | Free to try",
    basicSettings: "Basics & Texts",
    quizSettings: "Questions & Quiz",
    courtSettings: "Court & Rating",
    letterSettings: "Letter & Gifts",
    timeline: "Our Memories (Timeline)",
    addMemory: "Add Memory",
    trivia: "Memory Quiz (Trivia)",
    addQuestion: "Add Question",
    coupons: "Gift Coupons",
    addCoupon: "Add Coupon",
    letterBody: "Letter Body by Paragraph",
    addParagraph: "Add Paragraph",
    pwdReminder: "⚠️ Don't forget to send her the password!",
    telegramAlerts: "Notifications (Telegram)",
    notificationsSettings: "Notifications & Telegram Settings",
    telegramSetup: "Telegram Setup Steps",
    telegramStep1: "1. Search for the bot",
    telegramStep2: "2. Send /start",
    telegramStep3: "3. Copy your ID and paste it here",
    aiGenerator: "AI Generator",
    aiTitle: "Magic AI Generation",
    aiDesc: "Write the incident reason and click generate — AI will craft a full romantic apology with custom questions.",
    coreIntent: "Core Intent",
    textVibe: "Text Vibe",
    vibeIntensity: "Vibe Intensity",
    incidentReasonPlaceholder: "E.g. Forgot her birthday / Was late...",
    generateMagic: "Generate Magic ✨",
    generating: "Generating...",
    journeyMap: "Journey Map",
    currentSectionLabel: "Current Section",
    lastActionLabel: "Last Action",
    deleteSession: "Delete Session",
    onlineNow: "Online Now",
    offline: "No Visitors",
    atGate: "At the Gate 🔒",
    insidePlatform: "Inside Platform ✅",
    disconnected: "Disconnected",
    broadcastPlaceholder: "Send an instant message to her screen...",
    contentSettingsTitle: "Content Settings",
    contentSettingsDesc: "Edit texts and questions then click save.",
    telegramOptional: "🔔 Enable Telegram Alerts (Optional)",
    telegramChatIdPlaceholder: "Telegram Chat ID (e.g. 123456789)"
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children, initialLocale = "ar" }) {
  const [locale, setLocale] = useState(initialLocale);

  // We should only update the document dir when the locale changes or is set.
  useEffect(() => {
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }, [locale]);

  const t = (key) => {
    return translations[locale]?.[key] || translations["ar"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
