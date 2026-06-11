const fs = require('fs');

const path = 'D:/apology/apps/web/src/components/AdminDashboard.jsx';
const content = fs.readFileSync(path, 'utf8');

const targetIndex = content.indexOf('  // Dashboard Interface');
if (targetIndex === -1) {
  console.error("Could not find '// Dashboard Interface'");
  process.exit(1);
}

const prefix = content.substring(0, targetIndex);

const newJsx = `  // Dashboard Interface
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
                  أرسل رسالة للبوت <a href="https://t.me/apology_saas_2026_bot" target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold">@apology_saas_2026_bot</a> لنسخ رقم الـ ID الخاص بك.
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
                  <p className={\`mt-2 text-center text-xs font-bold \${saveStatus.success ? "text-green-600" : "text-red-600"}\`}>
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
                  className={\`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 relative overflow-hidden shrink-0 \${
                    activeSection === tab.id
                      ? "text-amber-900 bg-amber-50 border border-amber-200/50 shadow-sm"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent"
                  }\`}
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
                  <div className="bg-amber-50/60 border border-amber-200/50 rounded-2xl p-5 sm:p-6 mb-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl"></div>
                    <h4 className="flex items-center gap-2 text-sm font-bold text-amber-900 mb-2">
                      <Sparkles size={16} className="text-amber-800 animate-pulse" />
                      الصياغة السحرية بالذكاء الاصطناعي ✨
                    </h4>
                    <p className="text-xs sm:text-sm text-amber-800/80 mb-4 font-medium leading-relaxed max-w-2xl">
                      اكتب سبب الزعل باختصار، وسيقوم الذكاء الاصطناعي بصياغة اعتذار رومانسي متكامل، وتجهيز أسئلة فخ مضحكة، وجواب خاص يليق بالمشكلة!
                    </p>
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
                        className="rounded-xl bg-gradient-to-r from-amber-700 to-amber-900 px-6 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-md shrink-0 flex items-center justify-center gap-2"
                      >
                        {isGeneratingAI ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        {isGeneratingAI ? "جاري الإبداع..." : "توليد سحري"}
                      </button>
                    </div>
                    {aiSuccessMsg && (
                      <p className="mt-3 text-xs sm:text-sm font-bold text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-100 inline-block">{aiSuccessMsg}</p>
                    )}
                  </div>

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

                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <label className="block text-xs font-bold text-gray-700 mb-2">اسم الدلع للبنت</label>
                    <input
                      type="text"
                      required
                      value={formData.girlNickname}
                      onChange={(e) => updateField("girlNickname", e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                    />
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
                                    className={\`flex items-center gap-3 p-2.5 rounded-xl border \${isCorrect ? "border-green-400 bg-green-50" : "border-gray-200 bg-white"} transition-colors\`}
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
                                      className={\`flex-1 border-0 bg-transparent py-1 px-2 text-sm outline-none \${isCorrect ? "font-bold text-green-900" : "font-medium text-gray-700"}\`}
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
                        <div key={star.key} className={\`bg-white p-4 rounded-xl border border-gray-200 \${star.full ? "sm:col-span-2" : ""}\`}>
                          <label className="block text-xs font-bold text-gray-700 mb-2">{star.label}</label>
                          <textarea
                            rows={star.full ? 3 : 2}
                            required
                            value={formData.feedbackTexts[star.key]}
                            onChange={(e) => updateField(\`feedbackTexts.\${star.key}\`, e.target.value)}
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
`;

fs.writeFileSync('D:/apology/apps/web/src/components/AdminDashboard.new.jsx', prefix + newJsx);
console.log('Successfully wrote AdminDashboard.new.jsx');
