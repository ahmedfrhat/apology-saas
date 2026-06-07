import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles, X } from "lucide-react";
import { useApp } from "@/context/AppContext";

// Floating golden glass toast that appears when Mohamed broadcasts a message.
export default function BroadcastToast() {
  const { broadcastMsg, clearBroadcast } = useApp();

  useEffect(() => {
    if (!broadcastMsg) return undefined;
    const t = setTimeout(clearBroadcast, 9000);
    return () => clearTimeout(t);
  }, [broadcastMsg, clearBroadcast]);

  return (
    <AnimatePresence>
      {broadcastMsg && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className="fixed inset-x-0 top-16 z-[9999] mx-auto flex w-fit max-w-[90vw] items-center gap-3 rounded-full border border-[#DFBA73]/50 bg-[#F4F3EF]/80 px-5 py-3 backdrop-blur-2xl"
          style={{ boxShadow: "0 20px 50px rgba(223,186,115,0.35)" }}
        >
          <Sparkles size={18} className="shrink-0 text-[#DFBA73]" />
          <span className="text-sm font-medium text-[#1A1A1A]">
            {broadcastMsg}
          </span>
          <button
            type="button"
            onClick={clearBroadcast}
            className="shrink-0 rounded-full p-0.5 text-[#5A5955] hover:text-[#1A1A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBA73]"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
