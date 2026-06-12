import React, { Component } from "react";
import { useLoaderData } from "react-router";
import { useLanguage } from "@/context/LanguageContext";
import { BookOpen, Calendar, ArrowLeft, Heart, Sparkles, AlertCircle } from "lucide-react";
import Footer from "@/components/Footer";

// Robust bilingual fall-back blog data
const BLOG_POSTS_FALLBACK = [
  {
    slug: "reconciliation-guide-5-steps",
    titleKey: "دليل المصالحة الشامل: 5 خطوات لإصلاح الخلافات الرومانسية 💖",
    descriptionKey: "تعرف على القواعد الذهبية لتقديم اعتذار حقيقي وصادق يذيب الخلافات فوراً ويعيد الدفء للعلاقة.",
    date: "2026-06-10",
    readTime: "4 minutes",
    author: "Dr. Heart Planner"
  },
  {
    slug: "psychology-of-apologies",
    titleKey: "سيكولوجية الاعتذار: لماذا يعتبر الاعتذار ذكاءً عاطفياً وليس ضعفاً؟ 🧠",
    descriptionKey: "الاعتذار الصادق يتطلب كبرياءً ووعياً كبيراً. في هذا المقال نوضح كيف يسهم الاعتذار في تعزيز الروابط.",
    date: "2026-06-08",
    readTime: "6 minutes",
    author: "Prof. Mona Widad"
  },
  {
    slug: "how-safi-io-helps-couples",
    titleKey: "كيف تساعد منصة Safi.io الكابلز في كسر الجليد بطريقة ممتعة ومرحة؟ 📱",
    descriptionKey: "أحياناً تكون الكلمات الجافة غير كافية. استكشف كيف تساعدك الألعاب والمحاكاة والرسائل الرقمية التفاعلية في الاعتذار بشكل مبهج.",
    date: "2026-06-05",
    readTime: "3 minutes",
    author: "Eng. Kareem Safi"
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
        <div className="min-h-screen bg-[#FCFBF7] dark:bg-gray-950 flex items-center justify-center p-6 text-center font-sans">
          <div className="p-8 sm:p-12 max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-2xl space-y-5">
            <AlertCircle size={56} className="text-amber-600 mx-auto animate-bounce" />
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">Pardon Our Dust 🛠️</h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-medium">
              We are actively calibrating our standalone blog infrastructure. Please read all articles flawlessly via the main portal.
            </p>
            <a href="/" className="px-8 py-4 bg-gradient-to-r from-amber-800 to-[#B45309] text-white rounded-full font-black text-xs sm:text-sm inline-block shadow-lg active:scale-95 transition-transform">
              Return to Main Portal 🚀
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
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF7] dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 select-none transition-colors">
      
      {/* Blog Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10 relative z-10">
        
        {/* Back Link */}
        <div>
          <a 
            href="/" 
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-amber-800 dark:text-amber-400 hover:underline hover:translate-x-1 transition-transform cursor-pointer font-mono"
          >
            <ArrowLeft size={16} />
            <span>{t("blogBackMain")}</span>
          </a>
        </div>

        {/* Cinematic Premium Header Card */}
        <div className="text-center p-8 sm:p-12 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-gray-200/80 dark:border-gray-800 shadow-xl space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-800 to-amber-500 text-white shadow-lg shadow-amber-800/20 mx-auto">
            <BookOpen size={30} />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            {t("blogTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-xl mx-auto leading-relaxed font-medium">
            {t("blogSubtitle")}
          </p>
        </div>

        {/* Master Articles Tri-Theme List */}
        <div className="grid grid-cols-1 gap-8">
          {posts.map((post) => (
            <article 
              key={post.slug}
              className="p-8 sm:p-10 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-2xl transition-all group flex flex-col justify-between space-y-4 font-medium"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-gray-400 dark:text-gray-500 mb-3 font-mono font-black">
                  <span className="flex items-center gap-1.5 bg-amber-50 dark:bg-gray-800 text-amber-800 dark:text-amber-400 px-3 py-1 rounded-lg">
                    <Calendar size={14} />
                    {post.date}
                  </span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                  <span>•</span>
                  <span className="text-gray-600 dark:text-gray-300">{post.author}</span>
                </div>
                
                <h2 className="text-xl sm:text-3xl font-black mb-3 group-hover:text-[#B45309] dark:group-hover:text-amber-400 transition-colors">
                  <a href={`/blog/${post.slug}`} className="hover:underline block">
                    {t(post.titleKey)}
                  </a>
                </h2>
                
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium mb-6">
                  {t(post.descriptionKey)}
                </p>
              </div>
              
              <div className="flex items-center justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                <a 
                  href={`/blog/${post.slug}`}
                  className="text-xs sm:text-sm font-black text-white bg-amber-800 hover:bg-amber-900 dark:bg-amber-500 dark:text-gray-950 dark:hover:bg-amber-400 active:scale-95 px-8 py-3.5 rounded-full flex items-center gap-2 transition-all shadow-md cursor-pointer font-mono"
                >
                  <span>{t("blogReadMore")}</span>
                  <ArrowLeft size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Enterprise CTA Banner */}
        <div className="p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-tr from-gray-900 to-[#1A1A1A] text-white text-center space-y-5 shadow-2xl border border-gray-800">
          <Sparkles size={36} className="text-amber-400 mx-auto animate-spin" />
          <h3 className="text-xl sm:text-3xl font-black">{t("blogCtaTitle")}</h3>
          <p className="text-xs sm:text-sm text-gray-300 max-w-lg mx-auto font-medium leading-relaxed">
            {t("blogCtaSubtitle")}
          </p>
          <a href="/" className="px-10 py-4 bg-gradient-to-r from-amber-500 to-[#B45309] text-white rounded-full font-black text-xs sm:text-sm inline-block shadow-xl active:scale-95 transition-transform cursor-pointer">
            {t("blogCtaBtn")}
          </a>
        </div>

      </main>

      <Footer />
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
