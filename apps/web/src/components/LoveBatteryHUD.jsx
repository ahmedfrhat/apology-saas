import { motion } from "motion/react";
import { useApp } from "@/context/AppContext";

function colorFor(level) {
  if (level < 20) return "#EF4444"; // red
  if (level < 50) return "#F97316"; // orange
  if (level < 80) return "#EC4899"; // pink
  return "#22C55E"; // green
}

// Fixed battery indicator (top-right) reflecting the growing love level.
export default function LoveBatteryHUD() {
  const { batteryLevel } = useApp();
  const level = Math.max(0, Math.min(100, batteryLevel));
  const color = colorFor(level);

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        insetInlineEnd: 16,
        zIndex: 80,
      }}
    >
      <div className="flex items-center gap-2 rounded-full border border-[#1A1A1A]/10 bg-[#F4F3EF]/70 px-3 py-1.5 backdrop-blur-xl">
        <span className="text-xs font-medium text-[#5A5955]">شحن الحب</span>
        <div className="flex items-center">
          <div
            className="relative h-4 w-9 rounded-[4px] border-2"
            style={{ borderColor: color }}
          >
            <motion.div
              className="absolute inset-y-[1px] start-[1px] rounded-[2px]"
              style={{ background: color }}
              animate={{ width: `${level}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
          </div>
          <div
            className="h-2 w-[3px] rounded-e-[2px]"
            style={{ background: color }}
          />
        </div>
        <span className="text-xs font-semibold" style={{ color }}>
          {level}%
        </span>
      </div>
    </div>
  );
}
