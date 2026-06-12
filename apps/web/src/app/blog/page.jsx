import React, { Component } from "react";
import { useLoaderData } from "react-router";
import { useLanguage } from "@/context/LanguageContext";
import { BookOpen, Calendar, ArrowLeft, Heart, Sparkles, AlertCircle } from "lucide-react";

// Robust fall-back blog data to ensure the page NEVER crashes or throws
const BLOG_POSTS_FALLBACK = [
  {
    slug: "reconciliation-guide-5-steps",
    title: "دليل المصالحة الشامل: 5 خطوات لإصلاح الخلافات الرومانسية 💖",
    description: "تعرف على القواعد الذهبية لتقديم اعتذار حقيقي وصادق يذيب الخلافات فوراً ويعيد الدفء للعلاقة.",
    date: "2026-06-10",
    readTime: "4 دقائق",
    author: "د. هادي القلوب"
  },
  {
    slug: "psychology-of-apologies",
    title: "سيكولوجية الاعتذار: لماذا يعتبر الاعتذار ذكاءً عاطفياً وليس ضعفاً؟ 🧠",
    description: "الاعتذار الصادق يتطلب كبرياءً ووعياً كبيراً. في هذا المقال نوضح كيف يسهم الاعتذار في تعزيز الروابط.",
    date: "2026-06-08",
    readTime: "6 دقائق",
    author: "أ. منى الوداد"
  },
  {
    slug: "how-safi-io-helps-couples",
    title: "كيف تساعد منصة Safi.io الكابلز في كسر الجليد بطريقة ممتعة ومرحة؟ 📱",
    description: "أحياناً تكون الكلمات الجافة غير كافية. استكشف كيف تساعدك الألعاب والمحاكاة والرسائل الرقمية التفاعلية في الاعتذار بشكل مبهج.",
    date: "2026-06-05",
    readTime: "3 دقائق",
    author: "م. كريم المصالحة"
  }
];

export async function loader() {
  return { posts: BLOG_POSTS_FALLBACK };
}

export const meta = () => {
  return [
    { title: "مدونة Safi.io - نصائح وحلول المصالحة والذكاء العاطفي 📚" },
    { name: "description", content: "استكشف مقالات علمية ونصائح مميزة لإصلاح العلاقات الزوجية والعاطفية وفن الاعتذار الذكي." },
    { property: "og:title", content: "مدونة Safi.io - نصائح وحلول المصالحة والذكاء العاطفي 📚" },
    { property: "og:description", content: "استكشف مقالات علمية ونصائح مميزة لإصلاح العلاقات الزوجية والعاطفية وفن الاعتذار الذكي." },
    { property: "og:type", content: "website" }
  ];
};

class LocalBlogErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FCFBF7] dark:bg-gray-950 flex items-center justify-center p-6 text-center">
          <div className="p-8 max-w-md bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-4">
            <AlertCircle size={48} className="text-amber-600 mx-auto animate-bounce" />
            <h2 className="text-xl font-black text-gray-900 dark:text-white">عذراً، جاري تحديث خوادم المدونة 🛠️</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              يمكنك قراءة جميع المقالات المميزة مباشرة من خلال تبويب "المدونة 📚" الموجود في الصفحة الرئيسية للموقع.
            </p>
            <a href="/" className="px-6 py-3 bg-amber-800 text-white rounded-full font-extrabold text-xs inline-block shadow-md hover:bg-amber-900">
              العودة للصفحة الرئيسية 🚀
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainBlogContent() {
  const loaderData = useLoaderData();
  const posts = loaderData?.posts || BLOG_POSTS_FALLBACK;
  const { locale } = useLanguage() || { locale: "ar" };

  return (
    <div className="min-h-screen bg-[#FCFBF7] dark:bg-gray-950 font-sans text-[#4A3E3D] dark:text-gray-200 py-12 px-4 sm:px-6 select-none">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Back Link */}
        <div>
          <a 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-amber-800 dark:text-amber-400 hover:underline hover:translate-x-1 transition-transform cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>العودة للواجهة الرئيسية (Safi.io)</span>
          </a>
        </div>

        {/* Header */}
        <div className="text-center p-8 bg-gradient-to-r from-amber-800/5 via-amber-700/10 to-amber-800/5 dark:from-amber-950/30 dark:via-gray-900 dark:to-amber-950/30 rounded-3xl border border-amber-800/15">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-800 to-amber-600 text-white shadow-lg shadow-amber-800/20 mb-4">
            <BookOpen size={30} />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
            مدونة التصالح والذكاء العاطفي 📚✍️
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-xl mx-auto leading-relaxed font-medium">
            مقالات ودراسات نفسية ممتعة لمساعدتك في تعزيز لغة الحوار وتجاوز أي خلاف رومانسية بذكاء وسلاسة تامة.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 gap-6">
          {posts.map((post) => (
            <article 
              key={post.slug}
              className="p-6 sm:p-8 bg-white dark:bg-gray-900/80 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-md hover:shadow-xl transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 mb-3 font-mono font-bold">
                  <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded-md">
                    <Calendar size={13} />
                    {post.date}
                  </span>
                  <span>•</span>
                  <span>{post.readTime} قراءة</span>
                  <span>•</span>
                  <span className="text-gray-600 dark:text-gray-300">بواسطة {post.author}</span>
                </div>
                
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
                  <a href={`/blog/${post.slug}`} className="hover:underline block">
                    {post.title}
                  </a>
                </h2>
                
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium mb-6">
                  {post.description}
                </p>
              </div>
              
              <div className="flex items-center justify-end pt-3 border-t border-gray-100 dark:border-gray-800">
                <a 
                  href={`/blog/${post.slug}`}
                  className="text-xs sm:text-sm font-black text-white bg-amber-800 hover:bg-amber-900 active:scale-95 px-6 py-2.5 rounded-full flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <span>اقرأ المقال كاملاً</span>
                  <ArrowLeft size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-tr from-[#1A1A1A] to-gray-800 text-white text-center space-y-4 shadow-xl">
          <Sparkles size={32} className="text-amber-400 mx-auto animate-spin" />
          <h3 className="text-xl sm:text-2xl font-black">عندك خناقة وعايز تصالحها بطريقة مبتكرة؟ 🪄</h3>
          <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto">
            ابني لها موقع مصالحة تفاعلي مخصص يحمل اسمها ورحلة حبكم في 10 ثوانٍ مجاناً!
          </p>
          <a href="/" className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-[#B45309] text-white rounded-full font-black text-xs sm:text-sm inline-block shadow-lg active:scale-95 transition-transform cursor-pointer">
            ابدأ الآن واصنع رابط المصالحة 🚀
          </a>
        </div>

      </div>
    </div>
  );
}

export default function BlogLandingPage() {
  return (
    <LocalBlogErrorBoundary>
      <MainBlogContent />
    </LocalBlogErrorBoundary>
  );
}
