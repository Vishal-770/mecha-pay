"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight, BarChart3, Database, Layers, Search } from "lucide-react"

const graphFeatureDetails = [
  {
    icon: <Search className="w-5 h-5 text-[#3b82f6]" />,
    title: "Real-time Indexing",
    description: "On-chain subscription events are indexed instantly for near-zero latency queries."
  },
  {
    icon: <BarChart3 className="w-5 h-5 text-[#3b82f6]" />,
    title: "Aggregated Stats",
    description: "Access instant revenue, subscriber growth, and plan performance metrics via GraphQL."
  },
  {
    icon: <Layers className="w-5 h-5 text-[#3b82f6]" />,
    title: "Decentralized Layer",
    description: "Reliable, open-source infrastructure powered by The Graph protocol nodes."
  }
]

export default function GraphShowcase() {
  return (
    <section className="relative w-full py-24 lg:py-40 bg-[#060608] overflow-hidden border-t border-[#ffffff]/5">
      
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          {/* Left Side: GraphQL Query Preview */}
          <div className="order-2 lg:order-1 relative group">
            
            <div className="relative bg-[#0b0b0f] border border-[#ffffff]/5 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden min-h-[480px]">
               {/* IDE-like header */}
               <div className="flex items-center justify-between mb-8 border-b border-[#ffffff]/5 pb-6">
                 <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#ffffff]/10 border border-[#ffffff]/20" />
                    <div className="h-3 w-3 rounded-full bg-[#ffffff]/10 border border-[#ffffff]/20" />
                    <div className="h-3 w-3 rounded-full bg-[#ffffff]/10 border border-[#ffffff]/20" />
                 </div>
                 <div className="px-3 py-1 bg-[#3b82f6]/10 rounded-md border border-[#3b82f6]/20">
                    <span className="text-[10px] font-mono text-[#3b82f6] font-bold">query SellerStats</span>
                 </div>
               </div>

               {/* GraphQL Query Content */}
               <div className="font-mono text-sm leading-relaxed">
                  <div className="text-[#a1a1aa] mb-2"># Fetching global merchant performance</div>
                  <div className="text-[#3b82f6]">query <span className="text-[#ffffff]">SellerStats</span>($seller: <span className="text-[#ffffff]">Bytes!</span>) {"{"}</div>
                  <div className="pl-6 flex gap-2">
                    <span className="text-[#ffffff]">seller</span>(id: $seller) {"{"}
                  </div>
                  <div className="pl-12 text-[#ffffff]">planCount</div>
                  <div className="pl-12 text-[#ffffff]">subscriptionCount</div>
                  <div className="pl-12 text-[#3b82f6]">totalGrossRevenue</div>
                  <div className="pl-12 text-[#3b82f6]">totalNetRevenue</div>
                  <div className="pl-12 text-[#ffffff]">updatedAt</div>
                  <div className="pl-6 text-[#ffffff]">{"}"}</div>
                  <div className="text-[#3b82f6]">{"}"}</div>
                  
                  <div className="mt-8 pt-6 border-t border-[#ffffff]/5">
                    <div className="text-[#a1a1aa] text-[10px] uppercase tracking-widest font-bold mb-4">Response Preview</div>
                    <div className="text-[#ffffff]">{"{"}</div>
                    <div className="pl-6 text-[#a1a1aa]">"seller": {"{"}</div>
                    <div className="pl-12 flex gap-2">
                        <span className="text-[#a1a1aa]">"totalNetRevenue":</span>
                        <span className="text-[#3b82f6]">"42,000 USDC"</span>
                    </div>
                    <div className="pl-6 text-[#a1a1aa]">{"}"}</div>
                    <div className="text-[#ffffff]">{"}"}</div>
                  </div>
               </div>
            </div>

            {/* Floating Indexer Badge */}
            <div className="absolute -top-6 -left-6 px-6 py-4 bg-[#000000] border border-[#ffffff]/10 rounded-2xl shadow-2xl flex items-center gap-3">
               <Database className="w-4 h-4 text-[#3b82f6]" />
               <span className="text-[10px] font-black uppercase tracking-widest text-[#ffffff] italic">Mecha Pay Subgraph</span>
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="order-1 lg:order-2 flex flex-col gap-8">
            <div className="px-3 py-1 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-full w-fit">
              <span className="text-[#3b82f6] text-[10px] font-bold uppercase tracking-[0.2em] leading-none">The Graph Protocol</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-[#ffffff] leading-[0.9]">
              Real-time Analytics <br/><span className="text-[#a1a1aa]">Via GraphQL</span>
            </h2>
            
            <p className="text-[#71717a] font-medium text-lg lg:text-xl leading-relaxed max-w-xl">
              Leverage the power of the world's leading indexing protocol to fetch, filter, and visualize your subscription data with sub-second finality.
            </p>

            <div className="flex flex-col gap-6 mt-4">
              {graphFeatureDetails.map((feature, i) => (
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
              <Link 
                href="https://thegraph.com/studio/subgraph/mecha-pay" 
                target="_blank"
                className="inline-flex h-14 px-10 items-center justify-center rounded-xl bg-[#3b82f6] text-[#ffffff] font-black text-xs uppercase tracking-widest transition-all hover:opacity-90 group/btn"
              >
                Explore Subgraph 
                <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
