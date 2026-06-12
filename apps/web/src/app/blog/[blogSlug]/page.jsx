import React, { Component } from "react";
import { useLoaderData } from "react-router";
import { useLanguage } from "@/context/LanguageContext";
import { Calendar, ArrowLeft, Heart, User, BookOpen, AlertCircle, Sparkles } from "lucide-react";

const BLOG_POSTS = {
  "reconciliation-guide-5-steps": {
    title: "دليل المصالحة الشامل: 5 خطوات لإصلاح الخلافات الرومانسية 💖",
    description: "تعرف على القواعد الذهبية لتقديم اعتذار حقيقي وصادق يذيب الخلافات فوراً ويعيد الدفء للعلاقة.",
    date: "2026-06-10",
    readTime: "4 دقائق",
    author: "د. هادي القلوب",
    content: [
      "في العلاقات العاطفية، لا تخلو الحياة من المشاحنات أو الخلافات اليومية، ولكن سر العلاقات المستمرة والناجحة لا يكمن في خلوها من الزعل، بل في كيفية إنهاء هذا الزعل بسرعة وحكمة.",
      "1. الاعتراف بالخطأ بوضوح ودون مواربة: تجنب قول عبارات مثل 'أنا آسف لو كنت زعلتك' واستبدلها بـ 'أنا آسف لأني ارتكبت هذا الخطأ وتسببت في ضيقك'.",
      "2. إظهار التفهم والتعاطف الحقيقي: يجب أن تشعر شريكتك بأنك تفهم سبب حزنها تماماً ولا تستخف به.",
      "3. التراجع عن المكابرة (الكبرياء المؤذي): العلاقات ليست حرباً لمن ينتصر، بل هي سكن ومودة، والتنازل للشخص المفضل هو قمة الذكاء والقوة العاطفية.",
      "4. تقديم لفتة مصالحة مبتكرة: مثل إرسال رابط اعتذار تفاعلي ذكي كـ Safi.io لكسر جمود الصمت بابتسامة خفيفة ولطيفة.",
      "5. الاتفاق على خطة للمستقبل: صك الصلح ليس نهاية المطاف، بل هو بداية صفحة جديدة تُبنى على تلافي مسببات الزعل مستقبلاً."
    ]
  },
  "psychology-of-apologies": {
    title: "سيكولوجية الاعتذار: لماذا يعتبر الاعتذار ذكاءً عاطفياً وليس ضعفاً؟ 🧠",
    description: "الاعتذار الصادق يتطلب كبرياءً ووعياً كبيراً. في هذا المقال نوضح كيف يسهم الاعتذار في تعزيز الروابط.",
    date: "2026-06-08",
    readTime: "6 دقائق",
    author: "أ. منى الوداد",
    content: [
      "يتوهم البعض أن الاعتذار يقلل من القيمة الشخصية أو ينقص من الكرامة، بينما تثبت دراسات علم النفس العاطفي أن القدرة على الاعتذار هي مؤشر مباشر على نضج الذكاء الوجداني والشخصي.",
      "عندما تعتذر، فأنت ترسل رسالة واضحة لشريكتك مفادها: 'علاقتنا وصحتك النفسية أهم بكثير من رغبتي في أن أكون على صواب دائماً'. هذا يولد شعوراً بالأمان المطلق ويزيد من جاذبيتك وثقتها بك.",
      "علاوة على ذلك، فإن كبت الاعتذار يؤدي لتراكم الترسبات النفسية التي تنفجر عند أول خلاف قادم. اعتذر فوراً وصالح بذكاء لتجعل علاقتك صحية ومقاومة للزمن."
    ]
  },
  "how-safi-io-helps-couples": {
    title: "كيف تساعد منصة Safi.io الكابلز في كسر الجليد بطريقة ممتعة ومرحة؟ 📱",
    description: "أحياناً تكون الكلمات الجافة غير كافية. استكشف كيف تساعدك الألعاب والمحاكاة والرسائل الرقمية التفاعلية في الاعتذار بشكل مبهج.",
    date: "2026-06-05",
    readTime: "3 دقائق",
    author: "م. كريم المصالحة",
    content: [
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
    { title: `${post.title} - مدونة Safi.io` },
    { name: "description", content: post.description },
    { property: "og:title", content: post.title },
    { property: "og:description", content: post.description },
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
        <div className="min-h-screen bg-[#FCFBF7] dark:bg-gray-950 flex items-center justify-center p-6 text-center select-none">
          <div className="p-8 max-w-md bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-4">
            <AlertCircle size={48} className="text-amber-600 mx-auto animate-bounce" />
            <h2 className="text-xl font-black text-gray-900 dark:text-white">المقال المطلوب غير متاح حالياً 📖</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              يمكنك تصفح بقية المقالات والدراسات العاطفية الممتعة من خلال الصفحة الرئيسية للمدونة.
            </p>
            <a href="/blog" className="px-6 py-3 bg-amber-800 text-white rounded-full font-extrabold text-xs inline-block shadow-md hover:bg-amber-900">
              العودة لقائمة المقالات 📚
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
  const { locale } = useLanguage() || { locale: "ar" };

  return (
    <div className="min-h-screen bg-[#FCFBF7] dark:bg-gray-950 font-sans text-[#4A3E3D] dark:text-gray-200 py-12 px-4 sm:px-6 select-none">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Back Link */}
        <div>
          <a 
            href="/blog" 
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-amber-800 dark:text-amber-400 hover:underline hover:translate-x-1 transition-transform cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>العودة لقائمة المقالات</span>
          </a>
        </div>

        {/* Header */}
        <div className="space-y-4 bg-white dark:bg-gray-900/60 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-mono font-bold">
            <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 px-2.5 py-1 rounded-md">
              <Calendar size={14} />
              {post.date}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <User size={14} />
              {post.author}
            </span>
            <span>•</span>
            <span>{post.readTime} قراءة</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
            {post.title}
          </h1>
        </div>

        {/* Content paragraphs */}
        <div className="p-8 rounded-3xl bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 shadow-md space-y-6 text-sm sm:text-base leading-relaxed text-gray-850 dark:text-gray-200 font-medium">
          {post.content.map((p, idx) => (
            <p key={idx} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>

        {/* Call to action footer */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 text-white text-center space-y-4 shadow-xl">
          <Sparkles size={28} className="text-amber-300 mx-auto animate-spin" />
          <h3 className="text-lg sm:text-xl font-black text-white">هل تريد مصالحة شريكتك بذكاء ومرح؟ ❤️</h3>
          <p className="text-xs sm:text-sm text-amber-100 mb-4 max-w-md mx-auto leading-relaxed">
            اصنع الآن صفحة اعتذار تفاعلية مخصصة باسمها بالكامل مجاناً وشارك معها رابط المصالحة الذكي!
          </p>
          <a 
            href="/" 
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-amber-900 rounded-full text-xs sm:text-sm font-black transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
          >
            <span>ابدأ الآن واصنع رابط المصالحة ⚡</span>
            <Heart size={14} className="fill-amber-900" />
          </a>
        </div>

      </div>
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
