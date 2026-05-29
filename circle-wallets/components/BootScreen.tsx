"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [exit, setExit] = useState(false);

  useEffect(() => {
    // Ring draws for ~1.6s, then hold 300ms, then exit
    const t = setTimeout(() => {
      setExit(true);
      setTimeout(onComplete, 800);
    }, 2000);
    return () => clearTimeout(t);
  }, [onComplete]);

  const r = 44;
  const circumference = 2 * Math.PI * r;

  return (
    <AnimatePresence>
      {!exit && (
        <motion.div
          key="boot"
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center gap-8"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Ring + Logo */}
          <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.06)" }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* SVG progress ring */}
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              className="absolute inset-0 -rotate-90"
            >
              {/* Track */}
              <circle
                cx="60"
                cy="60"
                r={r}
                fill="none"
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="1.5"
              />
              {/* Animated fill */}
              <motion.circle
                cx="60"
                cy="60"
                r={r}
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
              />
            </svg>

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="relative z-10 w-14 h-14 rounded-2xl overflow-hidden"
            >
              <Image
                src="/logo.png"
                alt="Mecha Pay"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </div>

          {/* Wordmark */}
          <motion.div
            className="flex flex-col items-center gap-1.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          >
            <span className="text-white text-lg font-semibold tracking-tight">
              Mecha Pay
            </span>
            <span className="text-white/30 text-xs tracking-widest uppercase font-medium">
              USDC Payment Protocol
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
