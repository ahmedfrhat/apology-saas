import React, { Component } from "react";
import { useLoaderData } from "react-router";
import { useLanguage } from "@/context/LanguageContext";
import { Calendar, ArrowLeft, Heart, User, BookOpen, AlertCircle, Sparkles } from "lucide-react";
import Footer from "@/components/Footer";

const BLOG_POSTS = {
  "reconciliation-guide-5-steps": {
    titleKey: "دليل المصالحة الشامل: 5 خطوات لإصلاح الخلافات الرومانسية 💖",
    descriptionKey: "تعرف على القواعد الذهبية لتقديم اعتذار حقيقي وصادق يذيب الخلافات فوراً ويعيد الدفء للعلاقة.",
    date: "2026-06-10",
    readTime: "4 minutes",
    author: "Dr. Heart Planner",
    contentKeys: [
      "في العلاقات العاطفية، لا تخلو الحياة من المشاحنات أو الخلافات اليومية، ولكن سر العلاقات المستمرة والناجحة لا يكمن في خلوها من الزعل، بل في كيفية إنهاء هذا الزعل بسرعة وحكمة.",
      "1. الاعتراف بالخطأ بوضوح ودون مواربة: تجنب قول عبارات مثل 'أنا آسف لو كنت زعلتك' واستبدلها بـ 'أنا آسف لأني ارتكبت هذا الخطأ وتسببت في ضيقك'.",
      "2. إظهار التفهم والتعاطف الحقيقي: يجب أن تشعر شريكتك بأنك تفهم سبب حزنها تماماً ولا تستخف به.",
      "3. التراجع عن المكابرة (الكبرياء المؤذي): العلاقات ليست حرباً لمن ينتصر، بل هي سكن ومودة، والتنازل للشخص المفضل هو قمة الذكاء والقوة العاطفية.",
      "4. تقديم لفتة مصالحة مبتكرة: مثل إرسال رابط اعتذار تفاعلي ذكي كـ Safi.io لكسر جمود الصمت بابتسامة خفيفة ولطيفة.",
      "5. الاتفاق على خطة للمستقبل: صك الصلح ليس نهاية المطاف، بل هو بداية صفحة جديدة تُبنى على تلافي مسببات الزعل مستقبلاً."
    ]
  },
  "psychology-of-apologies": {
    titleKey: "سيكولوجية الاعتذار: لماذا يعتبر الاعتذار ذكاءً عاطفياً وليس ضعفاً؟ 🧠",
    descriptionKey: "الاعتذار الصادق يتطلب كبرياءً ووعياً كبيراً. في هذا المقال نوضح كيف يسهم الاعتذار في تعزيز الروابط.",
    date: "2026-06-08",
    readTime: "6 minutes",
    author: "Prof. Mona Widad",
    contentKeys: [
      "يتوهم البعض أن الاعتذار يقلل من القيمة الشخصية أو ينقص من الكرامة، بينما تثبت دراسات علم النفس العاطفي أن القدرة على الاعتذار هي مؤشر مباشر على نضج الذكاء الوجداني والشخصي.",
      "عندما تعتذر، فأنت ترسل رسالة واضحة لشريكتك مفادها: 'علاقتنا وصحتك النفسية أهم بكثير من رغبتي في أن أكون على صواب دائماً'. هذا يولد شعوراً بالأمان المطلق ويزيد من جاذبيتك وثقتها بك.",
      "علاوة على ذلك، فإن كبت الاعتذار يؤدي لتراكم الترسبات النفسية التي تنفجر عند أول خلاف قادم. اعتذر فوراً وصالح بذكاء لتجعل علاقتك صحية ومقاومة للزمن."
    ]
  },
  "how-safi-io-helps-couples": {
    titleKey: "كيف تساعد منصة Safi.io الكابلز في كسر الجليد بطريقة ممتعة ومرحة؟ 📱",
    descriptionKey: "أحياناً تكون الكلمات الجافة غير كافية. استكشف كيف تساعدك الألعاب والمحاكاة والرسائل الرقمية التفاعلية في الاعتذار بشكل مبهج.",
    date: "2026-06-05",
    readTime: "3 minutes",
    author: "Eng. Kareem Safi",
    contentKeys: [
      "الصمت العقابي هو أكبر عدو للعلاقات العاطفية. عندما يحدث خلاف كبير، يصعب أحياناً على الطرفين البدء بالحديث بشكل طبيعي بسبب الكبرياء أو التوتر المتراكم.",
      "هنا يأتي دور التكنولوجيا الترفيهية والمحاكاة الإبداعية. من خلال منصة Safi.io، يمكن للشباب تصميم صفحات اعتذار فريدة وبصمات سرية وأسئلة فكاهية مخصصة لشريكاتهم.",
      "عندما تدخل الفتاة وتجيب على الأسئلة الطريفة وتواجه 'الفخاخ' الفكاهية، فإن جمود الصمت ينكسر تلقائياً بابتسامة ناعمة، ممهداً الطريق لصلح حقيقي وتصفية للقلوب بنسبة 100%!"
    ]
  }
};

export async function loader({ params }) {
  const post = BLOG_POSTS[params.blogSlug];
  if (!post) {
    throw new Response("المقال غير موجود", { status: 404 });
  }
  return { post };
}

export function meta({ data }) {
  const post = data?.post;
  if (!post) {
    return [{ title: "مقال غير موجود - Safi.io" }];
  }
  return [
    { title: `${post.titleKey} - Safi.io Blog` },
    { name: "description", content: post.descriptionKey },
    { property: "og:title", content: post.titleKey },
    { property: "og:description", content: post.descriptionKey },
    { property: "og:type", content: "article" }
  ];
}

class LocalBlogDetailErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FCFBF7] dark:bg-gray-950 flex items-center justify-center p-6 text-center select-none font-sans">
          <div className="p-8 sm:p-12 max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-2xl space-y-5">
            <AlertCircle size={56} className="text-amber-600 mx-auto animate-bounce" />
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">Pardon Our Dust 📖</h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-medium">
              We are actively calibrating our standalone blog infrastructure. Please explore all articles flawlessly via the main directory.
            </p>
            <a href="/blog" className="px-8 py-4 bg-amber-800 text-white rounded-full font-black text-xs sm:text-sm inline-block shadow-lg hover:bg-amber-900">
              Return to Relationship Manuals 📚
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainBlogDetailContent() {
  const loaderData = useLoaderData();
  const post = loaderData?.post || BLOG_POSTS["reconciliation-guide-5-steps"];
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF7] dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 select-none transition-colors">
      
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8 relative z-10">
        
        {/* Back Link */}
        <div>
          <a 
            href="/blog" 
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-amber-800 dark:text-amber-400 hover:underline hover:translate-x-1 transition-transform cursor-pointer font-mono"
          >
            <ArrowLeft size={16} />
            <span>{t("blogBackList")}</span>
          </a>
        </div>

        {/* Cinematic Tri-Theme Article Header */}
        <div className="space-y-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl p-8 sm:p-12 rounded-[2.5rem] border border-gray-200/80 dark:border-gray-800 shadow-xl">
          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-mono font-black">
            <span className="flex items-center gap-1.5 bg-amber-50 dark:bg-gray-800 text-amber-800 dark:text-amber-400 px-3 py-1.5 rounded-lg">
              <Calendar size={14} />
              {post.date}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
              <User size={14} />
              {post.author}
            </span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
            {t(post.titleKey)}
          </h1>
        </div>

        {/* Content paragraphs */}
        <div className="p-8 sm:p-12 rounded-[2.5rem] bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-gray-200/80 dark:border-gray-800 shadow-xl space-y-6 text-sm sm:text-base leading-relaxed text-gray-800 dark:text-gray-200 font-medium font-sans">
          {post.contentKeys.map((p, idx) => (
            <p key={idx} className="whitespace-pre-line font-medium leading-relaxed">
              {t(p)}
            </p>
          ))}
        </div>

        {/* Enterprise Call to action footer */}
        <div className="mt-12 p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 text-white text-center space-y-5 shadow-2xl">
          <Sparkles size={32} className="text-amber-300 mx-auto animate-spin" />
          <h3 className="text-xl sm:text-3xl font-black text-white">{t("blogCtaTitle")}</h3>
          <p className="text-xs sm:text-sm text-amber-100 mb-4 max-w-lg mx-auto font-medium leading-relaxed">
            {t("blogCtaSubtitle")}
          </p>
          <a 
            href="/" 
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-amber-900 rounded-full text-xs sm:text-sm font-black transition-all hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
          >
            <span>{t("blogCtaBtn")}</span>
            <Heart size={16} className="fill-amber-900" />
          </a>
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function BlogPostPage() {
  return (
    <LocalBlogDetailErrorBoundary>
      <MainBlogDetailContent />
    </LocalBlogDetailErrorBoundary>
  );
}
