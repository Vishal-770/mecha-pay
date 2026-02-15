"use client"

import Link from "next/link";
import Image from "next/image";
import { Search, ArrowUpRight, LayoutGrid, Zap, Shield, Globe, Coins, Activity } from "lucide-react";
import { Mulish } from "next/font/google"; // Still need it for the className if variable fails or for safety
import BounceCards from "@/components/BounceCards";

const featureItems = [
  <div key="1" className="flex flex-col gap-3 pointer-events-auto">
    <div className="h-10 w-10 rounded-xl bg-[#b6f09c]/10 flex items-center justify-center border border-[#b6f09c]/20">
      <Zap className="h-5 w-5 text-[#b6f09c]" />
    </div>
    <h3 className="text-lg font-black uppercase italic tracking-tighter text-[#ffffff]">Gasless</h3>
    <p className="text-xs text-[#a1a1aa] leading-relaxed font-medium">Native USDC gas abstraction for zero-friction payments globally.</p>
  </div>,
  <div key="2" className="flex flex-col gap-3 pointer-events-auto">
    <div className="h-10 w-10 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center border border-[#3b82f6]/20">
      <Shield className="h-5 w-5 text-[#3b82f6]" />
    </div>
    <h3 className="text-lg font-black uppercase italic tracking-tighter text-[#ffffff]">Secure</h3>
    <p className="text-xs text-[#a1a1aa] leading-relaxed font-medium">Enterprise-grade MPC security with non-custodial control.</p>
  </div>,
  <div key="3" className="flex flex-col gap-3 pointer-events-auto">
    <div className="h-10 w-10 rounded-xl bg-[#b6f09c]/10 flex items-center justify-center border border-[#b6f09c]/20">
      <Globe className="h-5 w-5 text-[#b6f09c]" />
    </div>
    <h3 className="text-lg font-black uppercase italic tracking-tighter text-[#ffffff]">Unified</h3>
    <p className="text-xs text-[#a1a1aa] leading-relaxed font-medium">One balance across 15+ chains via Circle CCTP integration.</p>
  </div>,
  <div key="4" className="flex flex-col gap-3 pointer-events-auto">
    <div className="h-10 w-10 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center border border-[#f59e0b]/20">
      <Coins className="h-5 w-5 text-[#f59e0b]" />
    </div>
    <h3 className="text-lg font-black uppercase italic tracking-tighter text-[#ffffff]">Yield</h3>
    <p className="text-xs text-[#a1a1aa] leading-relaxed font-medium">Automated protocol yield generation for idle USDC balances.</p>
  </div>,
  <div key="5" className="flex flex-col gap-3 pointer-events-auto">
    <div className="h-10 w-10 rounded-xl bg-[#ef4444]/10 flex items-center justify-center border border-[#ef4444]/20">
      <Activity className="h-5 w-5 text-[#ef4444]" />
    </div>
    <h3 className="text-lg font-black uppercase italic tracking-tighter text-[#ffffff]">Realtime</h3>
    <p className="text-xs text-[#a1a1aa] leading-relaxed font-medium">Sub-second finality on ARC Testnet for instant operations.</p>
  </div>
];

const transformStyles = [
  "rotate(12deg) translate(-180px, -40px)",
  "rotate(-8deg) translate(-90px, 20px)",
  "rotate(0deg) translate(0px, -20px)",
  "rotate(8deg) translate(90px, 20px)",
  "rotate(-12deg) translate(180px, -40px)"
];

export default function LandingPage() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#000000] font-mulish">
      
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-80"
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-[#000000]/30 z-10" />

      {/* Navbar Implementation */}
      <header className="absolute top-0 left-0 w-full z-50 p-8 flex items-center justify-between bg-transparent">
        <div className="flex items-center gap-2 group cursor-pointer transition-all">
          <Image src="/logo.png" alt="Mecha Pay Logo" width={28} height={28} className="rounded-lg shadow-lg" />
          <span className="text-2xl font-black tracking-tight text-[#ffffff] uppercase italic">Mecha Pay</span>
        </div>

        <nav className="hidden lg:flex items-center bg-[#ffffff]/5 backdrop-blur-2xl border border-[#ffffff]/10 rounded-2xl p-1 shadow-2xl">
          <Link href="/" className="flex items-center gap-2 px-5 py-2 text-[10px] font-extrabold uppercase tracking-widest text-[#ffffff] bg-[#ffffff]/10 backdrop-blur-md rounded-xl border border-[#ffffff]/10 shadow-sm transition-all hover:bg-[#ffffff]/15">
            <LayoutGrid className="h-4 w-4 text-[#b6f09c]" />
            Home
          </Link>
          <Link href="#features" className="px-5 py-2 text-[10px] font-extrabold uppercase tracking-widest text-[#a1a1aa] hover:text-[#ffffff] hover:bg-[#ffffff]/5 rounded-xl transition-all">Exchange</Link>
          <Link href="#protocol" className="px-5 py-2 text-[10px] font-extrabold uppercase tracking-widest text-[#a1a1aa] hover:text-[#ffffff] hover:bg-[#ffffff]/5 rounded-xl transition-all">Protocol</Link>
          <Link href="#community" className="px-5 py-2 text-[10px] font-extrabold uppercase tracking-widest text-[#a1a1aa] hover:text-[#ffffff] hover:bg-[#ffffff]/5 rounded-xl transition-all">Community</Link>
          <Link href="#community" className="px-5 py-2 text-[10px] font-extrabold uppercase tracking-widest text-[#a1a1aa] hover:text-[#ffffff] hover:bg-[#ffffff]/5 rounded-xl transition-all">Support</Link>
        </nav>

        <div className="flex items-center gap-4">
          <button className="h-10 w-10 flex items-center justify-center rounded-xl border border-[#ffffff]/10 bg-[#ffffff]/5 text-[#a1a1aa] hover:text-[#ffffff] transition-all cursor-pointer">
            <Search className="h-4 w-4" />
          </button>
          <Link href="/login" className="h-10 px-6 flex items-center justify-center rounded-xl bg-[#b6f09c] text-[#000000] font-black text-[11px] uppercase shadow-lg shadow-[#b6f09c]/20 transition-all hover:opacity-90">
            Connect Wallet <ArrowUpRight className="ml-2 h-4 w-4 stroke-[3px]" />
          </Link>
        </div>
      </header>

      {/* Hero Content */}
      <div className="absolute bottom-0 left-0 w-full z-20 p-12 lg:p-20 grid lg:grid-cols-[1fr_600px] items-end gap-12 pointer-events-none">
        
        {/* Left Side: Title and Buttons */}
        <div className="flex flex-col items-start text-left pointer-events-auto max-w-3xl">
          <div className="flex flex-col mb-10">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] uppercase italic text-[#ffffff]">
              Revolutionizing <br/>
              <span className="flex items-center gap-6">
                Unified 
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa] not-italic max-w-[220px] leading-tight block normal-case">
                   A new standard of trust, built for payments who value speed, clarity, and control.
                </span>
              </span>
              Payments
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             <Link href="/login" className="h-12 px-10 flex items-center justify-center rounded-xl bg-[#b6f09c] text-[#000000] font-black text-xs uppercase shadow-xl shadow-[#b6f09c]/20 transition-all hover:opacity-90">
                Connect Wallet <ArrowUpRight className="ml-2 h-4 w-4 stroke-[3px]" />
             </Link>
             <Link href="#features" className="h-12 px-10 flex items-center justify-center rounded-xl border border-[#ffffff]/20 bg-[#ffffff]/5 backdrop-blur-md text-[#ffffff] font-extrabold text-xs uppercase transition-all hover:bg-[#ffffff]/10">
                Explore Protocol
             </Link>
          </div>
        </div>

        {/* Right Side: BounceCards for Features */}
        <div className="hidden lg:flex items-center justify-center pointer-events-auto h-[500px] w-full relative">
          <BounceCards
            className="custom-bounceCards"
            items={featureItems}
            containerWidth={600}
            containerHeight={500}
            animationDelay={0.8}
            animationStagger={0.1}
            easeType="elastic.out(1, 0.5)"
            transformStyles={transformStyles}
            enableHover={false}
          />
        </div>
      </div>

      {/* Background Decorative Grid */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{
             backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }} 
      />

    </div>
  );
}