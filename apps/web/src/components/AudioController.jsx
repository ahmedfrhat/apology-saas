import { Volume2, VolumeX } from "lucide-react";
import { useApp } from "@/context/AppContext";

// Fixed play/pause music controller (bottom-right).
export default function AudioController() {
  const { audioPlaying, toggleMusic } = useApp();

  return (
    <button
      type="button"
      onClick={toggleMusic}
      aria-label={audioPlaying ? "إيقاف الموسيقى" : "تشغيل الموسيقى"}
      className="fixed bottom-4 end-4 z-[80] flex h-11 w-11 items-center justify-center rounded-full border border-[#1A1A1A]/10 bg-[#F4F3EF]/70 text-[#1A1A1A] backdrop-blur-xl transition-colors hover:bg-[#DFBA73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBA73] focus-visible:ring-offset-2"
    >
      {audioPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </button>
  );
}

