"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"

export default function AppPreview() {
  return (
    <section className="relative w-full py-24 lg:py-40 overflow-hidden bg-[#000000] border-t border-[#ffffff]/5">
      
      <div className="relative z-10 container mx-auto px-6 lg:px-12 flex flex-col items-center text-center">
        {/* Badge - Static & Clean */}
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           viewport={{ once: true }}
           className="inline-flex items-center gap-2 px-3 py-1 bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-full mb-10"
        >
          <span className="text-[#a1a1aa] text-[10px] font-bold uppercase tracking-[0.2em] leading-none">
            Institutional Grade Infrastructure
          </span>
        </motion.div>

        {/* Main Heading - High Contrast */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter text-[#ffffff] uppercase leading-[0.9] max-w-5xl mb-8"
        >
          The New Standard <br/>
          <span className="text-[#b6f09c]">For Onchain Payments</span>
        </motion.h2>


        {/* Sub-heading */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-[#71717a] font-medium text-lg md:text-xl max-w-2xl mb-14 leading-relaxed"
        >
          A unified stack for USDC bridging, smart analytics, and automated membership lifecycles. 
          Built for scale, secured by MPC, and optimized for sub-second finality.
        </motion.p>

        {/* CTA Buttons - Clean & Professional */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center gap-5 mb-24"
        >
          <Link href="/login" className="h-14 px-12 flex items-center justify-center rounded-xl bg-[#b6f09c] text-[#000000] font-black text-xs uppercase tracking-widest transition-all hover:opacity-90">
            Get Started
          </Link>
          <Link href="/docs" className="h-14 px-12 flex items-center justify-center rounded-xl border border-[#ffffff]/10 bg-[#ffffff]/5 text-[#ffffff] font-extrabold text-xs uppercase tracking-widest transition-all hover:bg-[#ffffff]/10">
            Developer Docs <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </motion.div>

        {/* App Showcase Visual - Static High Fidelity */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }} // Smooth professional easing
          viewport={{ once: true }}
          className="relative w-full max-w-6xl"
        >
          
          {/* Main App Image Container */}
          <div className="relative rounded-[2.5rem] border border-[#ffffff]/10 bg-[#000000] p-3 shadow-2xl shadow-[#000000] overflow-hidden">
             <div className="relative rounded-[1.8rem] overflow-hidden">
               <Image 
                 src="/demo-app.png" 
                 alt="Mecha Pay Dashboard" 
                 width={2560} 
                 height={1440} 
                 className="w-full object-cover active:scale-100 grayscale hover:grayscale-0 transition-all duration-700"
                 priority
               />
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
