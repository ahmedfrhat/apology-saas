import { useEffect } from "react";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { useApp } from "@/context/AppContext";

const CARD =
  "bg-[#F4F3EF]/60 backdrop-blur-3xl border border-[#1A1A1A]/10 shadow-[0_30px_70px_rgba(0,0,0,0.6)] rounded-[2.5rem] overflow-hidden flex flex-col";

const MOMENTS = [
  "أول يوم اتكلمنا فيه كان بداية أحلى حاجة في حياتي",
  "ضحكتك بتخليني أنسى أي حاجة وحشة في الدنيا",
  "مهما حصل بينا، بتفضلي أقرب حد لقلبي",
  "دعمك ليا في أصعب أوقاتي مش هنساه أبداً",
  "إنتي مش بس حبيبتي، إنتي صاحبتي وسندي",
  "كل تفصيلة فيكي بتخليني أحبك أكتر",
  "مفيش حاجة في الدنيا تعوضني عنك لحظة",
];

export default function LoveTimeline({ onNext }) {
  const { updateState, config, t } = useApp();

  // If config has timeline, use it. Otherwise, construct it from MOMENTS
  let timelineData = config?.timeline;
  if (!timelineData || !Array.isArray(timelineData) || timelineData.length === 0) {
    timelineData = MOMENTS.map((m) => ({ text: m, image: "" }));
  }

  useEffect(() => {
    updateState({
      batteryLevel: 45,
      currentSection: "timeline",
      lastAction: "love-timeline",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-16">
      <h2 className="mb-12 text-center text-3xl font-semibold tracking-tight text-[#1A1A1A]">
        {t("حاجات مستحيل تضيع 💛")}
      </h2>

      <div className="relative">
        {/* central gold line */}
        <div
          className="absolute bottom-0 top-0 start-1/2 w-[2px] -translate-x-1/2"
          style={{ background: "#DFBA73" }}
        />

        <div className="space-y-10">
          {timelineData.map((item, i) => {
            const isRight = i % 2 === 0;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className={`flex w-full ${isRight ? "justify-start" : "justify-end"}`}
              >
                <div className={`relative w-[calc(50%-1.5rem)] ${CARD}`}>
                  {/* Indicator Dot */}
                  <div
                    className="absolute flex h-10 w-10 items-center justify-center rounded-full bg-[#F4F3EF] ring-4 ring-[#F4F3EF] z-10"
                    style={{
                      top: "1.5rem",
                      [isRight ? "insetInlineEnd" : "insetInlineStart"]: "-3.25rem",
                      border: "1px solid rgba(26,26,26,0.1)",
                    }}
                  >
                    <Heart
                      size={18}
                      fill="#DFBA73"
                      className="text-[#DFBA73]"
                    />
                  </div>

                  {/* Optional Image */}
                  {item.image && (
                    <div className="w-full aspect-[4/3] relative overflow-hidden bg-[#EAE8E1]">
                      <img 
                        src={item.image} 
                        alt="Memory" 
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>
                  )}

                  {/* Text Content */}
                  <div className="p-6">
                    <p className="text-base font-medium leading-relaxed text-[#1A1A1A]">
                      {t(item.text)}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-14 flex justify-center"
      >
        <button
          type="button"
          onClick={onNext}
          className="rounded-full bg-[#1A1A1A] px-8 py-3.5 text-sm font-medium text-[#F4F3EF] transition-colors hover:bg-[#DFBA73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBA73] focus-visible:ring-offset-2"
        >
          {t("دخلنا على الجد؟ 🫣")}
        </button>
      </motion.div>
    </div>
  );
}
