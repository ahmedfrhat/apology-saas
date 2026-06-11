import { useLoaderData } from "react-router";
import { useLanguage } from "@/context/LanguageContext";
import { BookOpen, Calendar, ArrowLeft, Heart } from "lucide-react";

// Mock blog post data loaded on the server
const BLOG_POSTS = [
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
  return { posts: BLOG_POSTS };
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

export default function BlogLandingPage() {
  const { posts } = useLoaderData();
  const { locale } = useLanguage();

  return (
    <div className="min-h-screen bg-[#FCFBF7] dark:bg-gray-950 font-sans text-[#4A3E3D] dark:text-gray-200 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Link */}
        <div className="mb-8">
          <a 
            href="/" 
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-400 hover:underline"
          >
            <ArrowLeft size={14} />
            <span>العودة للرئيسية</span>
          </a>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200/50 mb-3 text-amber-800 dark:text-amber-400">
            <BookOpen size={24} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-white mb-3 tracking-tight">
            مدونة التصالح والذكاء العاطفي 📚✍️
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
            نصائح ومقالات علمية ممتعة لمساعدتك على الحفاظ على شعلة الحب وتجاوز الخلافات اليومية بأسهل الطرق الممكنة.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="space-y-6">
          {posts.map((post) => (
            <article 
              key={post.slug}
              className="p-6 bg-white/70 dark:bg-gray-900/40 rounded-[2rem] border border-[#1A1A1A]/10 dark:border-gray-800/80 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-400 dark:text-gray-500 mb-2 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {post.date}
                </span>
                <span>•</span>
                <span>{post.readTime} قراءة</span>
                <span>•</span>
                <span>بواسطة {post.author}</span>
              </div>
              
              <h2 className="text-lg sm:text-xl font-bold text-[#1A1A1A] dark:text-white mb-2 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
                <a href={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </a>
              </h2>
              
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                {post.description}
              </p>
              
              <div className="flex items-center justify-between">
                <a 
                  href={`/blog/${post.slug}`}
                  className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1 hover:underline"
                >
                  <span>اقرأ المقال كاملاً</span>
                  <Heart size={12} className="text-rose-500 fill-rose-500" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
