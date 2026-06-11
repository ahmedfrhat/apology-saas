import Footer from "@/components/Footer";

export const meta = () => [
  { title: "اتصل بنا | منصة المصالحة الذكية" }
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12 w-full max-w-lg text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl">
              ✉️
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">اتصل بنا</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            نسعد دائماً بتواصلكم معنا. إذا كانت لديكم أي استفسارات، اقتراحات، أو واجهتم أي مشكلة تقنية، لا تترددوا في مراسلتنا.
          </p>
          
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 inline-block">
            <p className="text-sm text-gray-500 mb-2 font-medium">البريد الإلكتروني للدعم الفني:</p>
            <a href="mailto:support@apology-saas.com" className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors" dir="ltr">
              support@apology-saas.com
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
