"use client"

import { motion } from "framer-motion"
import { ArrowUpRight, Code2, Globe2, ShieldCheck } from "lucide-react"

const apiFeatureDetails = [
  {
    icon: <Globe2 className="w-5 h-5 text-[#3b82f6]" />,
    title: "Global Availability",
    description: "High-performance edge nodes ensuring sub-100ms response times worldwide."
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-[#b6f09c]" />,
    title: "Secure Auth",
    description: "Standardized API key authentication with granular merchant-level permissions."
  },
  {
    icon: <Code2 className="w-5 h-5 text-[#f59e0b]" />,
    title: "Web Hooks",
    description: "Real-time event notifications for subscription renewals and expirations."
  }
]

export default function ApiShowcase() {
  return (
    <section className="relative w-full py-24 lg:py-40 bg-[#000000] overflow-hidden border-t border-[#ffffff]/5">
      {/* Subtle background element */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-[#3b82f6]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          {/* Left Side: Content */}
          <div className="flex flex-col gap-8">
            <div className="px-3 py-1 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-full w-fit">
              <span className="text-[#3b82f6] text-[10px] font-bold uppercase tracking-[0.2em] leading-none">Developer Suite</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-[#ffffff] leading-[0.9]">
              Seamless Data <br/><span className="text-[#a1a1aa]">Via REST API</span>
            </h2>
            
            <p className="text-[#71717a] font-medium text-lg lg:text-xl leading-relaxed max-w-xl">
              Integrate real-time subscription status and plan metadata directly into your backend or proprietary dashboard using our standardized REST endpoints.
            </p>

            <div className="flex flex-col gap-6 mt-4">
              {apiFeatureDetails.map((feature, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="p-2 rounded-lg bg-[#ffffff]/5 border border-[#ffffff]/10 shrink-0">
                    {feature.icon}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[#ffffff] font-bold text-sm uppercase tracking-wider">{feature.title}</span>
                    <span className="text-[#71717a] text-sm leading-relaxed">{feature.description}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <button className="h-14 px-10 flex items-center justify-center rounded-xl bg-[#ffffff] text-[#000000] font-black text-xs uppercase tracking-widest transition-all hover:bg-[#ebf0f5]">
                API Reference <ArrowUpRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Side: API Preview */}
          <div className="relative group">
            {/* Glossy Border Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#3b82f6]/20 to-[#b6f09c]/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative bg-[#0b0b0f] border border-[#ffffff]/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
               {/* Terminal-like header */}
               <div className="flex items-center justify-between mb-8 border-b border-[#ffffff]/5 pb-6">
                 <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#ef4444]/20 border border-[#ef4444]/40" />
                    <div className="h-3 w-3 rounded-full bg-[#f59e0b]/20 border border-[#f59e0b]/40" />
                    <div className="h-3 w-3 rounded-full bg-[#b6f09c]/20 border border-[#b6f09c]/40" />
                 </div>
                 <div className="px-3 py-1 bg-[#ffffff]/5 rounded-md">
                    <span className="text-[10px] font-mono text-[#a1a1aa]">GET /api/v1/status</span>
                 </div>
               </div>

               {/* JSON Preview Content */}
               <div className="font-mono text-sm leading-relaxed">
                  <div className="text-[#ffffff]">{"{"}</div>
                  <div className="pl-6 flex gap-2">
                    <span className="text-[#a1a1aa]">"status":</span>
                    <span className="text-[#b6f09c]">"active"</span>,
                  </div>
                  <div className="pl-6 flex gap-2">
                    <span className="text-[#a1a1aa]">"subscriber":</span>
                    <span className="text-[#3b82f6]">"0x71C...3921"</span>,
                  </div>
                  <div className="pl-6 flex gap-2">
                    <span className="text-[#a1a1aa]">"plan":</span>
                    <span className="text-[#ffffff]">"Enterprise Tier"</span>,
                  </div>
                  <div className="pl-6 flex gap-2">
                    <span className="text-[#a1a1aa]">"expiresAt":</span>
                    <span className="text-[#f59e0b]">1711649400</span>,
                  </div>
                  <div className="pl-6 flex gap-2">
                    <span className="text-[#a1a1aa]">"metadata":</span>
                    <div className="flex flex-col">
                       <span className="text-[#ffffff]">{"{"}</span>
                       <div className="pl-6 flex gap-2">
                         <span className="text-[#a1a1aa]">"userId":</span>
                         <span className="text-[#b6f09c]">"dev_v1_001"</span>
                       </div>
                       <span className="text-[#ffffff]">{"}"}</span>
                    </div>
                  </div>
                  <div className="text-[#ffffff]">{"}"}</div>
               </div>
               
               {/* Decorative Gradient Overlay */}
               <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#3b82f6]/10 blur-[80px] rounded-full pointer-events-none" />
            </div>

            {/* Floating Tag */}
            <div className="absolute -bottom-6 -right-6 px-6 py-4 bg-[#000000] border border-[#ffffff]/10 rounded-2xl shadow-2xl flex items-center gap-3">
               <div className="h-2 w-2 rounded-full bg-[#b6f09c] animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest text-[#ffffff] italic">Real-time Hook Active</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
