"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowUpRight, ShieldCheck } from "lucide-react"
import { useRef } from "react"

export default function AppPreview() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Parallax effect for the image
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })
  
  const y = useTransform(scrollYProgress, [0, 1], [50, -50])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0.5, 1, 1])
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [10, 0])

  return (
    <section 
      ref={containerRef}
      className="relative w-full pt-32 pb-40 overflow-hidden bg-[#000000]"
    >
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50%] bg-[#3b82f6] rounded-full blur-[200px] opacity-[0.03] pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-6 lg:px-12 flex flex-col items-center text-center">
        
        {/* Premium Badge */}
        <motion.div
           initial={{ opacity: 0, y: 15 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
           viewport={{ once: true, margin: "-100px" }}
           className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-full mb-8 backdrop-blur-md"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-[#3b82f6]" />
          <span className="text-zinc-300 text-xs font-semibold tracking-wide">
            Institutional Grade Infrastructure
          </span>
        </motion.div>

        {/* Main Heading - Clean & Sophisticated */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-bold tracking-tighter text-[#ffffff] leading-[1.05] max-w-4xl mb-8"
        >
          The New Standard <br/>
          <span className="text-[#3b82f6]">
            For Onchain Payments
          </span>
        </motion.h2>

        {/* Sub-heading - Legible and balanced */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-zinc-400 font-medium text-lg md:text-xl max-w-2xl mb-12 leading-relaxed"
        >
          A unified stack for USDC bridging, smart analytics, and automated membership lifecycles. 
          Built for scale, secured by MPC, and optimized for sub-second finality.
        </motion.p>

        {/* CTA Buttons - Professional static styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-24 w-full sm:w-auto"
        >
          <Link href="/login" className="flex h-14 w-full sm:w-auto px-8 items-center justify-center gap-2 rounded-full bg-[#3b82f6] text-sm font-bold text-[#ffffff] hover:opacity-90 transition-opacity">
            <span>Get Started</span>
            <ArrowUpRight className="h-4 w-4 stroke-[3px]" />
          </Link>
          <Link href="/docs" className="flex h-14 w-full sm:w-auto px-8 items-center justify-center gap-2 rounded-full border border-[#ffffff]/10 bg-transparent text-sm font-semibold text-[#ffffff] hover:bg-[#ffffff]/5 transition-colors">
            <span>Developer Docs</span>
          </Link>
        </motion.div>

        {/* App Showcase Visual - Crisp and Professional */}
        <motion.div
          style={{ y, opacity, rotateX }}
          className="relative w-full max-w-6xl perspective-[2000px]"
        >
          {/* Subtle outer glow removed to keep it cleaner */}
          <div className="absolute inset-0 bg-[#ffffff]/5 blur-[100px] rounded-[3rem] -z-10" />
          
          {/* Premium Bezel Container */}
          <div className="relative rounded-[2.5rem] border border-[#ffffff]/10 bg-[#050505] p-2 md:p-3 shadow-2xl overflow-hidden">
             
             {/* Inner Screen */}
             <div className="relative rounded-[1.8rem] md:rounded-[2rem] overflow-hidden border border-[#ffffff]/5 bg-[#000000]">
               {/* Image */}
               <Image 
                 src="/blue-demo-app.png" 
                 alt="Mecha Pay Dashboard" 
                 width={2560} 
                 height={1440} 
                 className="w-full object-cover rounded-[1.8rem] md:rounded-[2rem]"
                 priority
               />
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
