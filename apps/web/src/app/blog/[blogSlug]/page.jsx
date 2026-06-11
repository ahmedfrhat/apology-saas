import { useLoaderData } from "react-router";
import { useLanguage } from "@/context/LanguageContext";
import { Calendar, ArrowLeft, Heart, User, BookOpen } from "lucide-react";

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

export default function BlogPostPage() {
  const { post } = useLoaderData();
  const { locale } = useLanguage();

  return (
    <div className="min-h-screen bg-[#FCFBF7] dark:bg-gray-950 font-sans text-[#4A3E3D] dark:text-gray-200 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Back Link */}
        <div className="mb-8">
          <a 
            href="/blog" 
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-400 hover:underline"
          >
            <ArrowLeft size={14} />
            <span>العودة للمقالات</span>
          </a>
        </div>

        {/* Article Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mb-4 font-mono">
          <span className="flex items-center gap-1">
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
        <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] dark:text-white mb-6 leading-tight tracking-tight">
          {post.title}
        </h1>

        {/* Content paragraphs */}
        <div className="space-y-6 text-sm sm:text-base leading-relaxed text-gray-850 dark:text-gray-300 font-medium">
          {post.content.map((p, idx) => (
            <p key={idx} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>

        {/* Call to action footer */}
        <div className="mt-12 p-6 rounded-[2rem] bg-amber-800/5 dark:bg-amber-900/10 border border-amber-800/15 text-center">
          <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-2">هل تريد مصالحة شريكتك بذكاء؟ ❤️</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 max-w-sm mx-auto">
            اصنع الآن صفحة اعتذار تفاعلية مخصصة باسمها بالكامل مجاناً وشارك معها رابط المصالحة الذكي!
          </p>
          <a 
            href="/" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-800 text-white rounded-full text-xs font-bold transition-all hover:bg-amber-900 active:scale-95 shadow-sm"
          >
            <span>ابدأ الآن وصالحها ⚡</span>
            <Heart size={12} fill="currentColor" />
          </a>
        </div>
      </div>
    </div>
  );
}
