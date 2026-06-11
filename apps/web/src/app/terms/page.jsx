import Footer from "@/components/Footer";

export const meta = () => [
  { title: "شروط الاستخدام | منصة المصالحة الذكية" }
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">شروط الاستخدام</h1>
          
          <div className="space-y-6 text-gray-700 leading-relaxed text-sm sm:text-base">
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">1. طبيعة الخدمة</h2>
              <p>
                تم تصميم "منصة المصالحة الذكية" لأغراض الترفيه وإرسال الرسائل والمفاجآت الودية والرومانسية. لا تُعد المنصة أداة للوساطة القانونية أو الرسمية، ولا تتحمل أي مسؤولية عن العواقب الناتجة عن سوء الاستخدام.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">2. مسؤولية المستخدم</h2>
              <p>
                يتحمل المستخدمون المسؤولية الكاملة عن أي نصوص يتم إدخالها أو روابط يتم توليدها ومشاركتها عبر المنصة. يُمنع منعاً باتاً استخدام المنصة لإرسال رسائل التهديد، التنمر، أو أي محتوى يخالف القوانين أو يمس بحريات الآخرين.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">3. توفر الخدمة</h2>
              <p>
                نسعى جاهدين لضمان استمرارية عمل المنصة بشكل سليم، ولكننا لا نضمن خلوها من الأخطاء التقنية أو التوقفات المؤقتة. يجوز لنا تعليق الخدمة أو تعديلها في أي وقت دون إشعار مسبق.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">4. حقوق الملكية</h2>
              <p>
                جميع حقوق الملكية الفكرية لتصميم الموقع وبرمجياته تعود لإدارة المنصة. يُمنع استنساخ أو استغلال المنصة لأغراض تجارية دون موافقة كتابية مسبقة.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
