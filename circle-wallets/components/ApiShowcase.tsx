"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight, Code2, Globe2, ShieldCheck } from "lucide-react"

const apiFeatureDetails = [
  {
    icon: <Globe2 className="w-5 h-5 text-[#3b82f6]" />,
    title: "Global Availability",
    description: "High-performance edge nodes ensuring sub-100ms response times worldwide."
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-[#3b82f6]" />,
    title: "Secure Auth",
    description: "Standardized API key authentication with granular merchant-level permissions."
  },
  {
    icon: <Code2 className="w-5 h-5 text-[#3b82f6]" />,
    title: "Web Hooks",
    description: "Real-time event notifications for subscription renewals and expirations."
  }
]

export default function ApiShowcase() {
  return (
    <section className="relative w-full py-24 lg:py-32 bg-[#000000] overflow-hidden z-20">
      
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          
          {/* Left Side: Content */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-full w-fit mb-2">
              <span className="text-zinc-300 text-xs font-semibold tracking-wide">Developer Suite</span>
            </div>
            
            <h2 className="text-5xl lg:text-6xl font-bold tracking-tighter text-[#ffffff]">
              Seamless Data <br/><span className="text-[#3b82f6]">Via REST API</span>
            </h2>
            
            <p className="text-zinc-400 font-medium leading-relaxed text-lg md:text-xl mt-2 lg:mt-4 max-w-xl">
              Integrate real-time subscription status and plan metadata directly into your backend or proprietary dashboard using our standardized REST endpoints.
            </p>

            <div className="flex flex-col gap-6 mt-4">
              {apiFeatureDetails.map((feature, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="p-2.5 rounded-xl bg-[#ffffff]/5 border border-[#ffffff]/10 shrink-0">
                    {feature.icon}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[#ffffff] font-bold text-base">{feature.title}</span>
                    <span className="text-zinc-400 text-sm leading-relaxed">{feature.description}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link 
                href="/docs" 
                className="flex h-14 w-full sm:w-fit px-8 items-center justify-center gap-2 rounded-full bg-[#3b82f6] text-sm font-bold text-[#ffffff] hover:opacity-90 transition-opacity"
              >
                <span>API Reference</span>
                <ArrowUpRight className="h-4 w-4 stroke-[3px]" />
              </Link>
            </div>
          </div>

          {/* Right Side: API Preview */}
          <div className="relative group perspective-[2000px]">
            <div className="relative bg-[#050505] border border-[#ffffff]/10 rounded-2xl shadow-2xl overflow-hidden w-full max-w-xl mx-auto">
               {/* Terminal-like header */}
               <div className="w-full h-12 bg-[#ffffff]/5 border-b border-[#ffffff]/5 flex items-center justify-between px-4 z-20">
                 <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                 </div>
                 <div className="px-3 py-1 bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-md">
                    <span className="text-[10px] font-mono text-zinc-400">GET /api/v1/status</span>
                 </div>
               </div>

               {/* JSON Preview Content */}
               <div className="p-6 font-mono text-xs sm:text-sm leading-relaxed">
                  <div className="text-zinc-300">{"{"}</div>
                  <div className="pl-6 flex gap-2">
                    <span className="text-[#7ee787]">"status"</span><span className="text-zinc-500">:</span>
                    <span className="text-[#a5d6ff]">"active"</span><span className="text-zinc-500">,</span>
                  </div>
                  <div className="pl-6 flex gap-2">
                    <span className="text-[#7ee787]">"subscriber"</span><span className="text-zinc-500">:</span>
                    <span className="text-[#a5d6ff]">"0x71C...3921"</span><span className="text-zinc-500">,</span>
                  </div>
                  <div className="pl-6 flex gap-2">
                    <span className="text-[#7ee787]">"plan"</span><span className="text-zinc-500">:</span>
                    <span className="text-[#a5d6ff]">"Enterprise Tier"</span><span className="text-zinc-500">,</span>
                  </div>
                  <div className="pl-6 flex gap-2">
                    <span className="text-[#7ee787]">"expiresAt"</span><span className="text-zinc-500">:</span>
                    <span className="text-[#79c0ff]">1711649400</span><span className="text-zinc-500">,</span>
                  </div>
                  <div className="pl-6 flex gap-2">
                    <span className="text-[#7ee787]">"metadata"</span><span className="text-zinc-500">:</span>
                    <div className="flex flex-col">
                       <span className="text-zinc-300">{"{"}</span>
                       <div className="pl-6 flex gap-2">
                         <span className="text-[#7ee787]">"userId"</span><span className="text-zinc-500">:</span>
                         <span className="text-[#a5d6ff]">"dev_v1_001"</span>
                       </div>
                       <span className="text-zinc-300">{"}"}</span>
                    </div>
                  </div>
                  <div className="text-zinc-300">{"}"}</div>
               </div>
            </div>

            {/* Floating Tag */}
            <div className="absolute -bottom-5 -right-2 sm:-right-6 px-4 py-2 sm:px-6 sm:py-3 bg-[#050505] border border-[#ffffff]/10 rounded-full shadow-2xl flex items-center gap-3 z-30">
               <div className="h-2 w-2 rounded-full bg-[#27c93f]" />
               <span className="text-[10px] sm:text-xs font-semibold text-zinc-300">Real-time Hook Active</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
