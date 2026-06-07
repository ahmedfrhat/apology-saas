import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Gift } from "lucide-react";
import { useApp } from "@/context/AppContext";

const GIFTS = [
  "عزومة شاورما فورا مفيهاش نقاش 🧀",
  "كارت مصالحة فوري ومفتوح في الخناقة الجاية بدون أي عتاب 🕊️",
  "خروجة وفسحة كاملة في المكان اللي تختاريه على حساب {boyName} 🎟️",
];

function FlipCard({ index, text, flipped, onFlip }) {
  return (
    <button
      type="button"
      onClick={onFlip}
      className="relative h-52 w-full focus-visible:outline-none"
      style={{ perspective: "1200px" }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* front */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[2rem] border border-[#1A1A1A]/10 bg-[#F4F3EF]/60 backdrop-blur-3xl"
          style={{ backfaceVisibility: "hidden" }}
        >
          <Gift size={40} className="text-[#DFBA73]" />
          <span className="text-sm font-semibold text-[#1A1A1A]">
            اكشفي الهدية رقم {index + 1}
          </span>
        </div>
        {/* back */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-[2rem] border border-[#DFBA73]/40 bg-[#DFBA73]/15 p-5 text-center"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <span className="text-base font-medium leading-relaxed text-[#1A1A1A]">
            {text}
          </span>
        </div>
      </motion.div>
    </button>
  );
}

export default function GiftCoupons({ onNext }) {
  const { updateState, config, t } = useApp();
  const rawGifts = config?.giftCoupons || GIFTS;
  const gifts = rawGifts.map((g) => t(g));
  const [flipped, setFlipped] = useState([]);

  useEffect(() => {
    setFlipped(Array(gifts.length).fill(false));
  }, [gifts.length]);

  useEffect(() => {
    updateState({ currentSection: "gifts", lastAction: "gift-coupons" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flip = useCallback((i) => {
    setFlipped((prev) => {
      if (prev[i]) return prev;
      const next = [...prev];
      next[i] = true;
      return next;
    });
  }, []);

  const allFlipped = flipped.length > 0 && flipped.every(Boolean);

  useEffect(() => {
    if (allFlipped) {
      updateState({ batteryLevel: 80, lastAction: "gifts-revealed" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allFlipped]);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-16 text-center">
      <h2 className="mb-2 text-3xl font-semibold tracking-tight text-[#1A1A1A]">
        {t("كروت الهدايا والمصالحة 🎁")}
      </h2>
      <p className="mb-10 text-sm font-medium text-[#5A5955]">
        {t("اضغطي على كل كارت عشان تشوفي الهدية بتاعتك وتقلبيها!")}
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {gifts.map((g, i) => (
          <FlipCard
            key={i}
            index={i}
            text={g}
            flipped={flipped[i] || false}
            onFlip={() => flip(i)}
          />
        ))}
      </div>

      {allFlipped && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 flex justify-center"
        >
          <button
            type="button"
            onClick={onNext}
            className="rounded-full bg-[#1A1A1A] px-8 py-3.5 text-sm font-medium text-[#F4F3EF] transition-colors hover:bg-[#DFBA73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBA73] focus-visible:ring-offset-2"
          >
            {t("استلام الهدايا وتفعيل الحماية 🔐")}
          </button>
        </motion.div>
      )}
    </div>
  );
}
