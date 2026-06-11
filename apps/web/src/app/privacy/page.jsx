import Footer from "@/components/Footer";

export const meta = () => [
  { title: "سياسة الخصوصية | منصة المصالحة الذكية" }
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">سياسة الخصوصية</h1>
          
          <div className="space-y-6 text-gray-700 leading-relaxed text-sm sm:text-base">
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">1. جمع البيانات واستخدامها</h2>
              <p>
                نحن نجمع البيانات الأساسية التي تقدمها طواعية عند إنشاء مفاجأة أو رسالة اعتذار. هذه البيانات تُستخدم حصرياً لتخصيص التجربة بواسطة خوارزميات الذكاء الاصطناعي ولتقديم خدمة مميزة لك. لا نقوم بتخزين النصوص أو مشاركتها مع أطراف ثالثة لأغراض غير متعلقة بتشغيل الخدمة.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">2. معالجة النصوص عبر الذكاء الاصطناعي</h2>
              <p>
                تُعالج النصوص المُدخلة عبر نماذج ذكاء اصطناعي متقدمة. يرجى عدم إدخال معلومات حساسة أو سرية أو شخصية غير قابلة للنشر. المعالجة تتم بشكل فوري وآمن.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">3. ملفات تعريف الارتباط (Cookies) والطرف الثالث</h2>
              <p>
                يستخدم موقعنا ملفات تعريف الارتباط (Cookies) لتحسين تجربة المستخدم وتحليل الزيارات. كما قد نستخدم خدمات أطراف ثالثة مثل شبكات الإعلانات (مثل Google AdSense)، والتي قد تستخدم بدورها ملفات تعريف الارتباط لتخصيص الإعلانات المعروضة لك بناءً على اهتماماتك وتصفحك.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">4. التعديلات على سياسة الخصوصية</h2>
              <p>
                نحتفظ بالحق في تحديث سياسة الخصوصية هذه من وقت لآخر. سيتم نشر أي تغييرات في هذه الصفحة، ويعتبر استمرارك في استخدام المنصة بعد أي تعديلات بمثابة موافقة منك عليها.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
