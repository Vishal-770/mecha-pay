"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, LayoutGrid, Zap, Shield, Globe, Coins, Activity, Mail } from "lucide-react";
import Lenis from 'lenis';
import { motion, AnimatePresence } from "framer-motion";
import BootScreen from "@/components/BootScreen";
import CardSwap, { Card } from "@/components/CardSwap";
import { Terminal, AnimatedSpan, TypingAnimation } from "@/components/ui/terminal";

import AppPreview from "@/components/AppPreview";
import ApiShowcase from "@/components/ApiShowcase";


export default function LandingPage() {
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <BootScreen onComplete={() => setBooted(true)} />

      <AnimatePresence>
        {booted && (
          <motion.div
            key="page"
            className="dark relative w-full bg-[#000000] font-space-grotesk overflow-x-hidden"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
      
      {/* Hero Section */}
      <section className="relative min-h-screen w-full flex flex-col overflow-hidden bg-[#000000]">
      
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover opacity-60"
          >
            <source src="/bg.mp4" type="video/mp4" />
          </video>
          
          {/* Simple dark overlay */}
          <div className="absolute inset-0 bg-[#000000]/60 z-10" />
          
          {/* Seamless bottom fade to match the next section's background */}
          <div className="absolute bottom-0 left-0 w-full h-48 bg-linear-to-t from-[#000000] via-[#000000]/80 to-transparent z-10 pointer-events-none" />
        </div>

        {/* Navbar Implementation - Clean */}
        <header 
          className={`fixed top-0 left-0 right-0 z-50 w-full px-6 py-4 lg:px-10 lg:py-6 flex items-center justify-between transition-all duration-300 ease-in-out bg-transparent ${
            isNavVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden">
              <Image src="/logo.png" alt="Mecha Pay Logo" fill className="object-cover" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#ffffff]">Mecha Pay</span>
          </div>

          <div className="flex items-center gap-3 lg:gap-5">
            <Link href="/login" className="flex h-10 items-center justify-center gap-2 rounded-full bg-[#ffffff]/10 px-6 text-sm font-semibold text-[#ffffff] hover:bg-[#ffffff] hover:text-[#000000] transition-colors">
              <span>Launch App</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-20 flex-1 flex flex-col justify-center w-full px-8 sm:px-16 lg:pl-36 lg:pr-12 xl:pl-64 xl:pr-16 pb-20 pt-32 lg:pt-40">
          <div className="flex flex-col items-start text-left max-w-4xl w-full">
            
            {/* Left Side: Typography & CTAs */}
            <div className="flex flex-col items-start text-left relative z-30 w-full">
              <div className="flex flex-col mb-10 relative">
                <motion.h1 
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-[4.5rem] xl:text-[5.5rem] font-extrabold tracking-tighter leading-[1.05] text-foreground"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="block">USDC-Native</span>
                  <span className="block text-primary">Membership</span>
                  <span className="block">Infrastructure.</span>
                </motion.h1>
                
                <motion.p 
                  className="mt-8 text-base sm:text-lg lg:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                >
                  Integrate beautiful, predictable subscription checkouts in seconds. Zero friction, drop-in React SDK widgets powered by Circle Programmable Wallets, CCTP, and the Arc blockchain.
                </motion.p>
              </div>
              
              <motion.div 
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              >
                <Link href="/login" className="flex h-12 px-6 items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-md">
                  <span>Open Console</span>
                  <ArrowUpRight className="h-4 w-4 stroke-[2.5px]" />
                </Link>
                <Link href="/docs" className="flex h-12 px-6 items-center justify-center gap-2 rounded-full border border-border bg-card/35 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                  <span>Explore Docs</span>
                </Link>
              </motion.div>
              
              {/* Trust Indicators */}
              <motion.div 
                className="mt-14 flex items-center gap-6 opacity-60"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              >
                <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Powered by</span>
                <div className="flex items-center gap-6">
                  <span className="text-sm font-bold text-foreground tracking-wide">Circle</span>
                  <span className="text-sm font-bold text-foreground tracking-wide">Arc</span>
                  <span className="text-sm font-bold text-foreground tracking-wide">CCTP</span>
                </div>
              </motion.div>
            </div>
            
          </div>
        </div>
      </section>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <AppPreview />
      </motion.div>

      {/* Trust & Compliance Section */}
      <section id="compliance" className="relative w-full bg-[#000000] py-24 lg:py-32 px-6 sm:px-12 lg:px-20 z-20 overflow-hidden border-t border-[#ffffff]/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,#3b82f608,transparent_70%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col gap-16 relative z-10">
          
          <motion.div
            className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-full w-fit mb-2">
              <span className="text-[#3b82f6] text-xs font-semibold tracking-wide">Enterprise Gated Security</span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold tracking-tighter text-[#ffffff] leading-tight">
              Regulatory Compliance <br/>& <span className="text-zinc-500">Institutional Trust</span>
            </h2>
            <p className="text-zinc-400 font-medium leading-relaxed text-base sm:text-lg mt-2">
              Mecha Pay is engineered to align with global regulatory frameworks, ensuring a fully compliant stablecoin payment stream.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full relative">
            
            {/* Custom CSS Animations for high-fidelity professional SVG elements */}
            <style jsx global>{`
              @keyframes scanline {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(115px); }
              }
              @keyframes flow {
                to { stroke-dashoffset: -24; }
              }
              @keyframes flow-reverse {
                to { stroke-dashoffset: 24; }
              }
              @keyframes clean-tx-flow {
                0% { transform: translate(40px, 90px); opacity: 0; }
                5% { opacity: 1; }
                20% { transform: translate(184px, 90px); opacity: 1; }
                35% { transform: translate(184px, 90px); opacity: 1; }
                55% { transform: translate(380px, 50px); opacity: 1; }
                60% { transform: translate(380px, 50px); opacity: 0; }
                100% { transform: translate(380px, 50px); opacity: 0; }
              }
              @keyframes flagged-tx-flow {
                0% { transform: translate(40px, 90px); opacity: 0; fill: #3b82f6; }
                50% { transform: translate(40px, 90px); opacity: 0; fill: #3b82f6; }
                55% { transform: translate(40px, 90px); opacity: 1; fill: #3b82f6; }
                70% { transform: translate(184px, 90px); opacity: 1; fill: #3b82f6; }
                78% { transform: translate(184px, 90px); opacity: 1; fill: #ef4444; }
                92% { transform: translate(380px, 130px); opacity: 1; fill: #ef4444; }
                98% { transform: translate(380px, 130px); opacity: 0; fill: #ef4444; }
                100% { transform: translate(380px, 130px); opacity: 0; fill: #ef4444; }
              }
              @keyframes ofac-db-glow {
                0%, 12% { stroke: #27272a; fill: #050508; }
                15%, 25% { stroke: #3b82f6; fill: #0c101c; }
                28%, 62% { stroke: #27272a; fill: #050508; }
                65%, 75% { stroke: #ef4444; fill: #1c0c0c; }
                78%, 100% { stroke: #27272a; fill: #050508; }
              }
              @keyframes uneu-db-glow {
                0%, 12% { stroke: #27272a; fill: #050508; }
                15%, 25% { stroke: #3b82f6; fill: #0c101c; }
                28%, 100% { stroke: #27272a; fill: #050508; }
              }
              @keyframes ofac-db-text {
                0%, 12% { fill: #71717a; }
                15%, 25% { fill: #3b82f6; }
                28%, 62% { fill: #71717a; }
                65%, 75% { fill: #ef4444; }
                78%, 100% { fill: #71717a; }
              }
              @keyframes uneu-db-text {
                0%, 12% { fill: #71717a; }
                15%, 25% { fill: #3b82f6; }
                28%, 100% { fill: #71717a; }
              }
              @keyframes ofac-link-glow {
                0%, 12% { stroke: #27272a; opacity: 0.3; }
                15%, 25% { stroke: #3b82f6; opacity: 1; }
                28%, 62% { stroke: #27272a; opacity: 0.3; }
                65%, 75% { stroke: #ef4444; opacity: 1; }
                78%, 100% { stroke: #27272a; opacity: 0.3; }
              }
              @keyframes uneu-link-glow {
                0%, 12% { stroke: #27272a; opacity: 0.3; }
                15%, 25% { stroke: #3b82f6; opacity: 1; }
                28%, 100% { stroke: #27272a; opacity: 0.3; }
              }
              @keyframes rpc-gateway-border {
                0%, 62% { stroke: #27272a; }
                65%, 75% { stroke: #ef4444; }
                78%, 100% { stroke: #27272a; }
              }
              @keyframes gate-scanner-sweep {
                0%, 15% { transform: translateY(0px); opacity: 0.2; }
                16%, 24% { opacity: 1; }
                25%, 65% { transform: translateY(30px); opacity: 0.2; }
                66%, 74% { opacity: 1; }
                75%, 100% { transform: translateY(0px); opacity: 0.2; }
              }
              @keyframes scan-circle-pulse {
                0%, 15% { r: 2px; stroke: #27272a; fill: #27272a; }
                18%, 22% { r: 4px; stroke: #3b82f6; fill: #3b82f6; }
                25%, 65% { r: 2px; stroke: #27272a; fill: #27272a; }
                68%, 72% { r: 4px; stroke: #ef4444; fill: #ef4444; }
                75%, 100% { r: 2px; stroke: #27272a; fill: #27272a; }
              }
              @keyframes merchant-pulse {
                0%, 34% { r: 5px; opacity: 0; stroke: #10b981; }
                38% { r: 12px; opacity: 0.8; stroke: #10b981; }
                44%, 100% { r: 20px; opacity: 0; stroke: #10b981; }
              }
              @keyframes sink-pulse {
                0%, 82% { stroke: #ef4444; opacity: 0.3; }
                85% { stroke: #ef4444; opacity: 1; }
                92%, 100% { stroke: #ef4444; opacity: 0.3; }
              }
              @keyframes hud-text-monitoring {
                0%, 12% { opacity: 1; }
                15%, 25% { opacity: 0; }
                28%, 62% { opacity: 1; }
                65%, 75% { opacity: 0; }
                78%, 92% { opacity: 0; }
                95%, 100% { opacity: 1; }
              }
              @keyframes hud-text-checking {
                0%, 12% { opacity: 0; }
                15%, 25% { opacity: 1; fill: #3b82f6; }
                28%, 62% { opacity: 0; }
                65%, 75% { opacity: 1; fill: #3b82f6; }
                78%, 100% { opacity: 0; }
              }
              @keyframes hud-text-approved {
                0%, 25% { opacity: 0; }
                28%, 62% { opacity: 1; fill: #10b981; }
                65%, 100% { opacity: 0; }
              }
              @keyframes hud-text-blocked {
                0%, 75% { opacity: 0; }
                78%, 92% { opacity: 1; fill: #ef4444; }
                95%, 100% { opacity: 0; }
              }
              @keyframes hud-text-blocked-label {
                0%, 75% { fill: #27272a; opacity: 0.4; }
                78%, 92% { fill: #ef4444; opacity: 1; }
                95%, 100% { fill: #27272a; opacity: 0.4; }
              }
              @keyframes rotate-gear {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes rotate-gear-reverse {
                from { transform: rotate(360deg); }
                to { transform: rotate(0deg); }
              }
              @keyframes matrix-fade {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 1; }
              }
            `}</style>

            {/* BSA & AML Gating */}
            <motion.div
              className="group relative p-8 rounded-3xl bg-[#050505] border border-[#ffffff]/10 hover:bg-[#0a0a0f] hover:border-primary/20 transition-all duration-500 flex flex-col justify-between min-h-[380px] md:col-span-2 lg:col-span-2 overflow-hidden"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex flex-col gap-6 w-full relative z-10">
                {/* Top Row: Info & Stats */}
                <div className="flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center pb-6 border-b border-[#ffffff]/5">
                  <div className="flex-1">
                    <div className="h-10 w-10 rounded-xl bg-[#ffffff]/5 border border-[#ffffff]/10 flex items-center justify-center mb-4 group-hover:border-primary/20 transition-colors">
                      <Coins className="h-5 w-5 text-zinc-400 group-hover:text-primary transition-colors" />
                    </div>
                    <h4 className="text-xl font-bold text-foreground mb-2 tracking-tight">BSA / AML Gating</h4>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-2xl">
                      Integrates seamlessly with RPC-level sanction filters and OFAC screening tools, protecting merchants from interacting with flagged wallets.
                    </p>
                  </div>
                  
                  <div className="flex gap-6 shrink-0 mt-2 lg:mt-0">
                    <div className="flex flex-col border-l border-zinc-850 pl-4">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Sanction DB</span>
                      <span className="text-sm font-semibold text-foreground mt-0.5">OFAC / EU / UN</span>
                    </div>
                    <div className="flex flex-col border-l border-zinc-850 pl-4">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Latency</span>
                      <span className="text-sm font-semibold text-primary mt-0.5">&lt; 12ms</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Full-width Cryptographic Gating Mesh */}
                <div className="w-full">
                  <svg className="w-full h-[210px] rounded-2xl bg-[#08080c] border border-[#ffffff]/5" viewBox="0 0 480 180">
                    {/* Technical grid background */}
                    <g stroke="rgba(255, 255, 255, 0.015)" strokeWidth="0.5">
                      <line x1="0" y1="45" x2="480" y2="45" />
                      <line x1="0" y1="90" x2="480" y2="90" />
                      <line x1="0" y1="135" x2="480" y2="135" />
                      <line x1="60" y1="0" x2="60" y2="180" />
                      <line x1="120" y1="0" x2="120" y2="180" />
                      <line x1="184" y1="0" x2="184" y2="180" />
                      <line x1="240" y1="0" x2="240" y2="180" />
                      <line x1="300" y1="0" x2="300" y2="180" />
                      <line x1="380" y1="0" x2="380" y2="180" />
                    </g>

                    {/* Connection paths */}
                    {/* Sender to RPC Gateway */}
                    <line x1="40" y1="90" x2="184" y2="90" fill="none" stroke="#27272a" strokeWidth="1" strokeDasharray="3,3" />
                    
                    {/* Clean route: RPC Gateway to Merchant */}
                    <path d="M 184 90 Q 282 50 380 50" fill="none" stroke="#27272a" strokeWidth="1" strokeDasharray="3,3" />

                    {/* Flagged/Blocked route: RPC Gateway to Isolation Sink */}
                    <path d="M 184 90 Q 282 130 380 130" fill="none" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="3,3" opacity="0.3" />

                    {/* Dynamic query lines from Gateway to databases */}
                    <line x1="184" y1="70" x2="184" y2="38" stroke="#27272a" strokeWidth="1" strokeDasharray="2,2" style={{ animation: 'ofac-link-glow 8s infinite' }} />
                    <line x1="184" y1="110" x2="184" y2="142" stroke="#27272a" strokeWidth="1" strokeDasharray="2,2" style={{ animation: 'uneu-link-glow 8s infinite' }} />

                    {/* Sender Wallet Node */}
                    <g>
                      <circle cx="40" cy="90" r="6" fill="#050508" stroke="#27272a" strokeWidth="1.5" />
                      <circle cx="40" cy="90" r="2.5" fill="#3b82f6" />
                      <text x="40" y="106" fill="#71717a" fontSize="6.5" textAnchor="middle" fontFamily="monospace" fontWeight="bold">SENDER</text>
                    </g>

                    {/* RPC Gateway Shield Router */}
                    <g>
                      <rect x="166" y="70" width="36" height="40" rx="3.5" fill="#050508" stroke="#27272a" strokeWidth="1.5" style={{ animation: 'rpc-gateway-border 8s infinite' }} />
                      
                      {/* Sweep scan bar */}
                      <line x1="168" y1="73" x2="200" y2="73" stroke="#3b82f6" strokeWidth="1" opacity="0.6" style={{ animation: 'gate-scanner-sweep 8s infinite' }} />
                      
                      {/* Active hub dot */}
                      <circle cx="184" cy="90" style={{ animation: 'scan-circle-pulse 8s infinite' }} />
                      
                      <text x="184" y="122" fill="#71717a" fontSize="6.5" textAnchor="middle" fontFamily="monospace" fontWeight="bold">RPC GATEWAY</text>
                    </g>

                    {/* Database 1: OFAC Sanctions List */}
                    <g>
                      <rect x="162" y="22" width="44" height="16" rx="2" stroke="#27272a" strokeWidth="1" fill="#050508" style={{ animation: 'ofac-db-glow 8s infinite' }} />
                      <text x="184" y="32" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="monospace" style={{ animation: 'ofac-db-text 8s infinite' }}>OFAC</text>
                    </g>

                    {/* Database 2: UN/EU Sanctions List */}
                    <g>
                      <rect x="162" y="142" width="44" height="16" rx="2" stroke="#27272a" strokeWidth="1" fill="#050508" style={{ animation: 'uneu-db-glow 8s infinite' }} />
                      <text x="184" y="152" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="monospace" style={{ animation: 'uneu-db-text 8s infinite' }}>UN/EU</text>
                    </g>

                    {/* Destination: Merchant Wallet */}
                    <g>
                      <circle cx="380" cy="50" style={{ animation: 'merchant-pulse 8s infinite' }} fill="none" strokeWidth="1" />
                      <circle cx="380" cy="50" r="5" fill="#050508" stroke="#10b981" strokeWidth="1.5" />
                      <circle cx="380" cy="50" r="2" fill="#10b981" />
                      <text x="380" y="36" fill="#10b981" fontSize="6.5" textAnchor="middle" fontFamily="monospace" fontWeight="bold">MERCHANT</text>
                    </g>

                    {/* Destination: Isolation Sink */}
                    <g>
                      <rect x="345" y="115" width="70" height="30" rx="4.5" fill="#050508" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,2" style={{ animation: 'sink-pulse 8s infinite' }} />
                      <text x="380" y="110" fill="#ef4444" fontSize="6.5" textAnchor="middle" fontFamily="monospace" fontWeight="bold">ISOLATION SINK</text>
                      <text x="380" y="133" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace" style={{ animation: 'hud-text-blocked-label 8s infinite' }}>BLOCKED</text>
                    </g>

                    {/* Animated flows (Clean + Flagged cycles) */}
                    {/* Clean flow circle */}
                    <circle cx="0" cy="0" r="2.2" fill="#3b82f6" style={{ animation: 'clean-tx-flow 8s infinite' }} />

                    {/* Flagged/Blocked flow circle */}
                    <circle cx="0" cy="0" r="2.2" style={{ animation: 'flagged-tx-flow 8s infinite' }} />

                    {/* Live Dynamic HUD Status Labels */}
                    <text x="10" y="20" fill="#71717a" fontSize="6.5" fontFamily="monospace">REALTIME RPC-LEVEL GATING...</text>

                    <text x="10" y="166" fontSize="6.5" fontFamily="monospace" style={{ animation: 'hud-text-monitoring 8s infinite' }}>
                      REALTIME RPC: SYSTEM MONITORING
                    </text>
                    <text x="10" y="166" fontSize="6.5" fontFamily="monospace" style={{ animation: 'hud-text-checking 8s infinite' }}>
                      REALTIME RPC: QUERYING SANCTIONS LIST...
                    </text>
                    <text x="10" y="166" fontSize="6.5" fontFamily="monospace" style={{ animation: 'hud-text-approved 8s infinite' }}>
                      REALTIME RPC: 0x71C.. COMPLIANT (&lt; 12ms)
                    </text>
                    <text x="10" y="166" fontSize="6.5" fontFamily="monospace" style={{ animation: 'hud-text-blocked 8s infinite' }}>
                      REALTIME RPC: WALLET BLOCKED (OFAC SDN HIT)
                    </text>
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* MiCA Ready */}
            <motion.div
              className="group relative p-8 rounded-3xl bg-[#050505] border border-[#ffffff]/10 hover:bg-[#0a0a0f] hover:border-primary/20 transition-all duration-500 flex flex-col justify-between min-h-[380px] md:col-span-1 lg:col-span-1 overflow-hidden"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            >
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-[#ffffff]/5 border border-[#ffffff]/10 flex items-center justify-center mb-6 group-hover:border-primary/20 transition-colors">
                    <Shield className="h-5 w-5 text-zinc-400 group-hover:text-primary transition-colors" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-3 tracking-tight">MiCA Compliant</h4>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    Leverages native Circle USDC, fully backed and regulated under the EU's Markets in Crypto-Assets regulation.
                  </p>
                </div>

                {/* Elegant Concentric Regulatory Star Ring SVG */}
                <div className="mt-8 flex flex-col items-center justify-center py-10 px-4 rounded-2xl bg-[#08080c] border border-[#ffffff]/5 relative overflow-hidden group-hover:border-primary/10 transition-all duration-500">
                  <svg className="w-40 h-40" viewBox="0 0 120 120">
                    {/* Orbit Rings / Ticks */}
                    <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
                    <circle cx="60" cy="60" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.75" strokeDasharray="1,3" />
                    <circle cx="60" cy="60" r="32" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.5" />

                    {/* Orbiting star group rotating smoothly */}
                    <g className="origin-center" style={{ transformOrigin: '60px 60px', animation: 'rotateStar 32s linear infinite' }}>
                      {[...Array(12)].map((_, i) => {
                        const angle = (i * 30 * Math.PI) / 180;
                        const x = 60 + 40 * Math.cos(angle);
                        const y = 60 + 40 * Math.sin(angle);
                        return (
                          <polygon 
                            key={i} 
                            points="60,58.5 60.5,59.5 61.5,59.5 60.7,60.2 61.1,61.3 60,60.7 58.9,61.3 59.3,60.2 58.5,59.5 59.5,59.5" 
                            fill="#a1a1aa" 
                            className="opacity-70"
                            transform={`translate(${x - 60}, ${y - 60}) scale(0.45)`} 
                          />
                        );
                      })}
                    </g>
                    
                    {/* Center shield emblem - minimal, sharp, flat */}
                    <g>
                      {/* Shield Background */}
                      <path d="M 60 44 L 74 44 L 74 60 Q 74 74 60 80 Q 46 74 46 60 L 46 44 Z" fill="#08080c" stroke="#27272a" strokeWidth="1.5" />
                      
                      {/* Stylized key inside shield */}
                      <circle cx="60" cy="53" r="2.5" fill="none" stroke="#3b82f6" strokeWidth="1" />
                      <rect x="59.5" y="55.5" width="1" height="9" fill="#3b82f6" />
                      <rect x="60.5" y="59" width="2" height="1" fill="#3b82f6" />
                      <rect x="60.5" y="62" width="2" height="1" fill="#3b82f6" />
                    </g>
                    
                    {/* Technical text ring */}
                    <path id="textPath" d="M 60 92 A 32 32 0 0 1 60 28 A 32 32 0 0 1 60 92" fill="none" />
                    <text fontSize="4.2" fontFamily="monospace" fill="#71717a" letterSpacing="0.8">
                      <textPath href="#textPath" startOffset="0%">REGULATED // EU MICA COMPLIANT // USDC NATIVE //</textPath>
                    </text>
                  </svg>
                  <span className="text-[10px] font-bold text-zinc-400 tracking-widest mt-2 uppercase">MiCA Gated Stream</span>
                  <span className="text-[9px] text-zinc-500 font-semibold mt-1">100% Cash-Backed Stablecoins</span>
                </div>
              </div>
            </motion.div>

            {/* GDPR & Privacy First */}
            <motion.div
              className="group relative p-8 rounded-3xl bg-[#050505] border border-[#ffffff]/10 hover:bg-[#0a0a0f] hover:border-primary/20 transition-all duration-500 flex flex-col justify-between min-h-[380px] md:col-span-1 lg:col-span-1 overflow-hidden"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-[#ffffff]/5 border border-[#ffffff]/10 flex items-center justify-center mb-6 group-hover:border-primary/20 transition-colors">
                    <Globe className="h-5 w-5 text-zinc-400 group-hover:text-primary transition-colors" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-3 tracking-tight">GDPR & Data Privacy</h4>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    No personally identifiable information (PII) is stored on the ledger. Cryptographic session keys authorize payouts.
                  </p>
                </div>

                {/* ZK-Session / Data Privacy Pipeline SVG */}
                <div className="mt-8 py-8 px-4 rounded-2xl bg-[#08080c] border border-[#ffffff]/5 relative overflow-hidden group-hover:border-primary/10 transition-all duration-500">
                  <svg className="w-full h-36" viewBox="0 0 200 120">
                    {/* Inputs panel (Left) */}
                    <g transform="translate(10, 15)">
                      <rect x="0" y="0" width="50" height="12" rx="2" fill="#050508" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.5" />
                      <text x="25" y="8" fill="#71717a" fontSize="5.5" textAnchor="middle" fontFamily="monospace">email_raw</text>
                      
                      <rect x="0" y="24" width="50" height="12" rx="2" fill="#050508" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.5" />
                      <text x="25" y="32" fill="#71717a" fontSize="5.5" textAnchor="middle" fontFamily="monospace">ip_address</text>
                      
                      <rect x="0" y="48" width="50" height="12" rx="2" fill="#050508" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.5" />
                      <text x="25" y="56" fill="#71717a" fontSize="5.5" textAnchor="middle" fontFamily="monospace">cust_name</text>
                    </g>

                    {/* Convergence paths to ZK Gate */}
                    <path d="M 60 21 Q 82 21 100 52" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.75" strokeDasharray="2,2" />
                    <path d="M 60 45 Q 82 45 100 52" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.75" strokeDasharray="2,2" />
                    <path d="M 60 69 Q 82 69 100 52" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.75" strokeDasharray="2,2" />

                    {/* Minimal flow dots on left paths */}
                    <path d="M 60 21 Q 82 21 100 52" fill="none" stroke="#a1a1aa" strokeWidth="1" strokeDasharray="3,12" style={{ animation: 'flow 4s linear infinite' }} />
                    <path d="M 60 45 Q 82 45 100 52" fill="none" stroke="#a1a1aa" strokeWidth="1" strokeDasharray="3,12" style={{ animation: 'flow 3s linear infinite', animationDelay: '1s' }} />
                    <path d="M 60 69 Q 82 69 100 52" fill="none" stroke="#a1a1aa" strokeWidth="1" strokeDasharray="3,12" style={{ animation: 'flow 5s linear infinite', animationDelay: '0.5s' }} />

                    {/* Massive ZK Cryptographic Shield Gate (Center) */}
                    <g transform="translate(100, 52)">
                      <g style={{ transformOrigin: '0px 0px', animation: 'rotate-gear 16s linear infinite' }}>
                        <circle cx="0" cy="0" r="14" fill="none" stroke="#27272a" strokeWidth="0.75" strokeDasharray="3,4" />
                      </g>
                      
                      <circle cx="0" cy="0" r="8" fill="#050508" stroke="#10b981" strokeWidth="1.2" />
                      <text x="0" y="2" fill="#10b981" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="monospace">ZK</text>
                    </g>

                    {/* Encrypted Anonymized output stream */}
                    <path d="M 112 52 L 140 52" fill="none" stroke="#27272a" strokeWidth="1" strokeDasharray="3,6" style={{ animation: 'flow 2s linear infinite' }} />

                    {/* Cryptographic Session Key Block (Right) */}
                    <g transform="translate(140, 22)">
                      <rect x="0" y="0" width="52" height="42" rx="3.5" fill="#050508" stroke="#27272a" strokeWidth="1" />
                      
                      {/* Static minimal texts */}
                      <rect x="4" y="5" width="44" height="8" rx="1.5" fill="#0a0a0f" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.5" />
                      <text x="26" y="10.5" fill="#10b981" fontSize="4.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">SESSION_KEY</text>
                      
                      {/* Live obfuscated hex hashes */}
                      <text x="6" y="23" fill="#71717a" fontSize="5" fontFamily="monospace" style={{ animation: 'matrix-fade 2s infinite' }}>0x9e8a...02cd</text>
                      <text x="6" y="30" fill="#71717a" fontSize="5" fontFamily="monospace" style={{ animation: 'matrix-fade 3s infinite', animationDelay: '0.5s' }}>AES_256_GCM</text>
                      <text x="6" y="37" fill="#10b981" fontSize="4.5" fontWeight="bold" fontFamily="monospace">ANONYMOUS</text>
                    </g>
                  </svg>
                  <div className="text-[9px] font-bold text-center text-zinc-500 uppercase tracking-widest mt-1">Zero PII Data Minimization Active</div>
                </div>
              </div>
            </motion.div>

            {/* SOC 2 Type II */}
            <motion.div
              className="group relative p-8 rounded-3xl bg-[#050505] border border-[#ffffff]/10 hover:bg-[#0a0a0f] hover:border-primary/20 transition-all duration-500 flex flex-col justify-between min-h-[380px] md:col-span-2 lg:col-span-2 overflow-hidden"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            >
              <div className="flex flex-col gap-6 w-full relative z-10">
                {/* Top Row: Info & Stats */}
                <div className="flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center pb-6 border-b border-[#ffffff]/5">
                  <div className="flex-1">
                    <div className="h-10 w-10 rounded-xl bg-[#ffffff]/5 border border-[#ffffff]/10 flex items-center justify-center mb-4 group-hover:border-primary/20 transition-colors">
                      <Zap className="h-5 w-5 text-zinc-400 group-hover:text-primary transition-colors" />
                    </div>
                    <h4 className="text-xl font-bold text-foreground mb-2 tracking-tight">SOC 2 Type II Insulated</h4>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-2xl">
                      Operates using Circle's non-custodial wallet infrastructure, audited to SOC 2 Type II security standards for safe private key segment storage.
                    </p>
                  </div>
                  
                  <div className="flex gap-6 shrink-0 mt-2 lg:mt-0">
                    <div className="flex flex-col border-l border-zinc-850 pl-4">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Key Custody</span>
                      <span className="text-sm font-semibold text-foreground mt-0.5">MPC Non-Custodial</span>
                    </div>
                    <div className="flex flex-col border-l border-zinc-850 pl-4">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Auditor Status</span>
                      <span className="text-sm font-semibold text-emerald-500 mt-0.5">SOC 2 Certified</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Balanced Dual-Panel UI */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 w-full">
                  {/* Left Panel: Verified Controls Checklist */}
                  <div className="md:col-span-2 p-4 rounded-2xl bg-[#08080c] border border-[#ffffff]/5 flex flex-col gap-2.5 h-[210px] justify-between">
                    <div className="flex items-center justify-between text-[9px] text-zinc-500 border-b border-[#ffffff]/5 pb-2">
                      <span>VERIFIED SECURITY CONTROLS</span>
                      <span className="text-emerald-500 font-bold uppercase">COMPLIANT</span>
                    </div>
                    <div className="flex flex-col gap-2 text-xs text-zinc-400 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 opacity-60"></span>
                        <span>FIPS 140-2 Level 3 Hardware</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 opacity-60"></span>
                        <span>MPC Threshold Cryptography</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 opacity-60"></span>
                        <span>Zero Knowledge Session Gating</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 opacity-60"></span>
                        <span>Continuous Security Audits</span>
                      </div>
                    </div>
                    <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold border-t border-[#ffffff]/5 pt-2">
                      Audit cycle: Continuous real-time gating
                    </div>
                  </div>

                  {/* Right Panel: Animated MPC HSM Key Distribution SVG */}
                  <div className="md:col-span-3">
                    <svg className="w-full h-[210px] rounded-2xl bg-[#08080c] border border-[#ffffff]/5" viewBox="0 0 320 180">
                      {/* Technical Grid background */}
                      <g stroke="rgba(255, 255, 255, 0.015)" strokeWidth="0.5">
                        <line x1="0" y1="45" x2="320" y2="45" />
                        <line x1="0" y1="90" x2="320" y2="90" />
                        <line x1="0" y1="135" x2="320" y2="135" />
                        <line x1="100" y1="0" x2="100" y2="180" />
                        <line x1="200" y1="0" x2="200" y2="180" />
                      </g>

                      {/* Cryptographic connection paths */}
                      <path d="M 95 40 C 160 40, 160 90, 230 90" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                      <path d="M 95 90 L 230 90" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                      <path d="M 95 140 C 160 140, 160 90, 230 90" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />

                      {/* Animated cryptographic key segment flows */}
                      <path d="M 95 40 C 160 40, 160 90, 230 90" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,12" style={{ animation: 'flow 2.5s linear infinite' }} opacity="0.6" />
                      <path d="M 95 90 L 230 90" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,12" style={{ animation: 'flow 3s linear infinite', animationDelay: '0.5s' }} opacity="0.6" />
                      <path d="M 95 140 C 160 140, 160 90, 230 90" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,12" style={{ animation: 'flow 3.5s linear infinite', animationDelay: '1s' }} opacity="0.6" />

                      {/* Enclave 1: Circle HSM */}
                      <g transform="translate(15, 20)">
                        <rect x="0" y="0" width="80" height="36" rx="4" fill="#050508" stroke="#27272a" strokeWidth="1" />
                        <text x="40" y="15" fill="#ffffff" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">CIRCLE HSM</text>
                        <text x="40" y="26" fill="#71717a" fontSize="6" textAnchor="middle" fontFamily="monospace">SHARD A // FIPS</text>
                        <circle cx="8" cy="8" r="1.5" fill="#3b82f6" opacity="0.8" />
                      </g>

                      {/* Enclave 2: User Device TEE */}
                      <g transform="translate(15, 72)">
                        <rect x="0" y="0" width="80" height="36" rx="4" fill="#050508" stroke="#27272a" strokeWidth="1" />
                        <text x="40" y="15" fill="#ffffff" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">USER DEVICE</text>
                        <text x="40" y="26" fill="#71717a" fontSize="6" textAnchor="middle" fontFamily="monospace">SHARD B // TEE</text>
                        <circle cx="8" cy="8" r="1.5" fill="#3b82f6" opacity="0.8" />
                      </g>

                      {/* Enclave 3: Co-Signer Node */}
                      <g transform="translate(15, 124)">
                        <rect x="0" y="0" width="80" height="36" rx="4" fill="#050508" stroke="#27272a" strokeWidth="1" />
                        <text x="40" y="15" fill="#ffffff" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">CO-SIGNER</text>
                        <text x="40" y="26" fill="#71717a" fontSize="6" textAnchor="middle" fontFamily="monospace">SHARD C // SECURE</text>
                        <circle cx="8" cy="8" r="1.5" fill="#3b82f6" opacity="0.8" />
                      </g>

                      {/* Central Vault combining MPC credentials */}
                      <g transform="translate(230, 55)">
                        <rect x="0" y="0" width="75" height="70" rx="6" fill="#050508" stroke="#10b981" strokeWidth="1.5" />
                        
                        {/* Combination dial locks outline */}
                        <g style={{ transformOrigin: '37.5px 35px', animation: 'rotate-gear 12s linear infinite' }}>
                          <circle cx="37.5" cy="35" r="16" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.75" strokeDasharray="2,3" />
                        </g>
                        <g style={{ transformOrigin: '37.5px 35px', animation: 'rotate-gear-reverse 8s linear infinite' }}>
                          <circle cx="37.5" cy="35" r="10" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.75" strokeDasharray="1,2" />
                        </g>

                        <circle cx="37.5" cy="35" r="5" fill="#08080c" stroke="#10b981" strokeWidth="1" />

                        <text x="37.5" y="12" fill="#10b981" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="monospace">AUTHORIZED</text>
                        <text x="37.5" y="58" fill="#a1a1aa" fontSize="6" textAnchor="middle" fontFamily="monospace">2/3 SIGNED</text>
                        <text x="37.5" y="65" fill="#71717a" fontSize="5" textAnchor="middle" fontFamily="monospace">MPC REBUILT</text>
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Protocol Economics Section */}
      {/* Protocol Economics Section */}
      <section className="relative w-full bg-[#000000] py-24 lg:py-40 px-6 sm:px-12 lg:px-20 z-20 overflow-hidden">
        {/* Subtle Architectural Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-20 relative z-10">
          <motion.div
            className="flex-1 flex flex-col gap-6 w-full"
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-full w-fit mb-2">
              <span className="text-zinc-300 text-xs font-semibold tracking-wide">Fee Transparency</span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-bold tracking-tighter text-[#ffffff] leading-[1.1]">
              Pure Efficiency. <br/>
              <span className="text-[#3b82f6]">Zero Waste.</span>
            </h2>
            <p className="text-zinc-400 font-medium leading-relaxed text-lg md:text-xl mt-2 lg:mt-4 max-w-xl">
              Traditional payment rails eat into your margins with hidden fees and expensive gas costs. Mecha Pay redefines protocol economics.
            </p>
          </motion.div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <motion.div
              className="group relative overflow-hidden p-8 rounded-3xl bg-[#050505] border border-[#ffffff]/10 hover:bg-[#0a0a0f] hover:border-[#3b82f6]/30 transition-all duration-500"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <Coins className="w-32 h-32 text-[#3b82f6] -mr-8 -mt-8" />
              </div>
              <div className="relative z-10">
                <div className="text-5xl font-bold tracking-tighter text-[#ffffff] mb-4 group-hover:text-[#3b82f6] transition-colors duration-500">$0.00</div>
                <h4 className="text-xl font-bold text-[#ffffff] mb-2 tracking-tight">Native Fee</h4>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-[90%]">Eliminate secondary gas tokens. Arc uses USDC as native gas for predictable, low-cost execution.</p>
              </div>
            </motion.div>
            
            <motion.div
              className="group relative overflow-hidden p-8 rounded-3xl bg-[#050505] border border-[#ffffff]/10 hover:bg-[#0a0a0f] hover:border-[#3b82f6]/30 transition-all duration-500"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <Zap className="w-32 h-32 text-[#3b82f6] -mr-8 -mt-8" />
              </div>
              <div className="relative z-10">
                <div className="text-5xl font-bold tracking-tighter text-[#ffffff] mb-4 group-hover:text-[#3b82f6] transition-colors duration-500">Instant</div>
                <h4 className="text-xl font-bold text-[#ffffff] mb-2 tracking-tight">Sub-Second Finality</h4>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-[90%]">Subscriptions and bridges confirm in under 1 second, providing a true Web2-like experience.</p>
              </div>
            </motion.div>
            
            <motion.div
              className="group relative overflow-hidden p-8 rounded-3xl bg-[#050505] border border-[#ffffff]/10 hover:bg-[#0a0a0f] hover:border-[#3b82f6]/30 transition-all duration-500 md:col-span-2"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            >
              <div className="absolute inset-0 bg-linear-to-r from-[#3b82f6]/0 via-[#3b82f6]/5 to-[#3b82f6]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <Globe className="w-48 h-48 text-[#3b82f6] -mr-16 -mt-16" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-[#ffffff]/5 flex items-center justify-center border border-[#ffffff]/10 group-hover:border-[#3b82f6]/30 transition-colors duration-500">
                     <Globe className="h-6 w-6 text-[#ffffff] group-hover:text-[#3b82f6] transition-colors duration-500" />
                  </div>
                  <div className="text-3xl font-bold tracking-tighter text-[#ffffff]">Unified Liquidity</div>
                </div>
                <h4 className="text-xl font-bold text-[#ffffff] mb-2 tracking-tight">Native Circle CCTP Integration</h4>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-lg">No wrapped assets. Move canonical USDC seamlessly between Ethereum, Base, Polygon, and 15+ others via official burn-and-mint logic.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Protocol Features Section */}

      <section id="features" className="relative w-full bg-[#000000] py-24 lg:py-32 z-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-6 sm:px-12 lg:px-20 w-full">
          <motion.div
            className="flex-1 flex flex-col gap-6 max-w-2xl w-full"
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-full w-fit mb-2">
            <span className="text-zinc-300 text-xs font-semibold tracking-wide">Protocol Architecture</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold tracking-tighter text-[#ffffff]">
            USDC-Native. <br/><span className="text-[#3b82f6]">Arc-Powered.</span>
          </h2>
          <p className="text-zinc-400 font-medium leading-relaxed text-lg md:text-xl mt-2 lg:mt-4">
            Mecha Pay is the membership infrastructure for the Arc network. By combining Circle&apos;s Programmable Wallets with CCTP bridging, we&apos;ve eliminated gas complexity, allowing users to pay entirely in USDC while developers enjoy sub-second finality.
          </p>
          <div className="grid grid-cols-2 gap-8 mt-4 lg:mt-8">
             <div className="flex flex-col gap-2 border-l border-[#ffffff]/10 pl-4 lg:pl-6">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#ffffff]">USDC Gas</span>
                <span className="text-zinc-500 text-xs sm:text-sm font-semibold">Native Execution</span>
             </div>
             <div className="flex flex-col gap-2 border-l border-[#ffffff]/10 pl-4 lg:pl-6">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#ffffff]">CCTP</span>
                <span className="text-zinc-500 text-xs sm:text-sm font-semibold">Unified Liquidity</span>
             </div>
          </div>
        </motion.div>

        <motion.div
          className="hidden lg:flex flex-1 w-full items-center justify-center relative mt-16 lg:mt-0 h-112.5 lg:h-150 pointer-events-none"
          initial={{ opacity: 0, x: 32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <div className="relative w-[320px] h-50 z-10 lg:right-10 pointer-events-auto perspective-[2000px]">
            <CardSwap width={320} height={200} cardDistance={40} verticalDistance={50}>
              <Card className="bg-[#050505] border border-[#ffffff]/10 shadow-2xl rounded-2xl flex flex-col justify-between p-6">
                <div className="flex justify-between items-center text-[#ffffff]">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-[#3b82f6]"/> 
                    <span className="text-sm font-semibold tracking-wide">CCTP Bridge</span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-400 bg-[#ffffff]/5 border border-[#ffffff]/10 px-2.5 py-1 rounded-full">15+ Chains</span>
                </div>
                <div>
                  <div className="text-zinc-500 text-xs font-semibold tracking-wide mb-1">Bridging Fee</div>
                  <div className="text-4xl font-bold tracking-tighter text-[#ffffff]">0.<span className="text-[#a1a1aa]">00</span> <span className="text-xl text-[#a1a1aa] font-medium tracking-normal">USDC</span></div>
                </div>
              </Card>
              <Card className="bg-[#050505] border border-[#ffffff]/10 shadow-2xl rounded-2xl flex flex-col justify-between p-6">
                <div className="flex justify-between items-center text-[#ffffff]">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-[#3b82f6]"/> 
                    <span className="text-sm font-semibold tracking-wide">MPC Wallets</span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-400 bg-[#ffffff]/5 border border-[#ffffff]/10 px-2.5 py-1 rounded-full">Non-Custodial</span>
                </div>
                <div>
                  <div className="text-zinc-500 text-xs font-semibold tracking-wide mb-1">Key Management</div>
                  <div className="text-4xl font-bold tracking-tighter text-[#ffffff]">Circle<span className="text-xl text-[#a1a1aa] font-medium tracking-normal ml-1">SDK</span></div>
                </div>
              </Card>
              <Card className="bg-[#050505] border border-[#ffffff]/10 shadow-2xl rounded-2xl flex flex-col justify-between p-6">
                <div className="flex justify-between items-center text-[#ffffff]">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-[#3b82f6]"/> 
                    <span className="text-sm font-semibold tracking-wide">Execution</span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-400 bg-[#ffffff]/5 border border-[#ffffff]/10 px-2.5 py-1 rounded-full">Arc Network</span>
                </div>
                <div>
                  <div className="text-zinc-500 text-xs font-semibold tracking-wide mb-1">Finality</div>
                  <div className="text-4xl font-bold tracking-tighter text-[#ffffff]">&lt; 1.<span className="text-[#a1a1aa]">0s</span></div>
                </div>
              </Card>
            </CardSwap>
          </div>
        </motion.div>
        </div>
      </section>

      {/* Developer Integration Section */}
      <section id="developers" className="relative w-full bg-[#000000] py-32 z-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 px-6 sm:px-12 lg:px-20 w-full">
          <motion.div
            className="flex-1 w-full max-w-3xl mx-auto flex items-center justify-center relative perspective-[2000px]"
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
          <Terminal className="bg-[#050505] border border-[#ffffff]/10 shadow-2xl h-[520px] w-full max-w-3xl">
            <TypingAnimation delay={500} duration={30} className="text-zinc-500 text-xs sm:text-sm font-mono">
              &gt; npm install mechapay-react
            </TypingAnimation>
            <AnimatedSpan delay={1500} className="text-[#3b82f6] text-xs sm:text-sm font-mono mt-2 block">
              ✔ Package installed successfully
            </AnimatedSpan>
            
            <TypingAnimation delay={2500} duration={30} className="text-zinc-500 text-xs sm:text-sm font-mono mt-6 block">
              &gt; cat components/Pricing.tsx
            </TypingAnimation>
            
            <AnimatedSpan delay={3500} className="text-zinc-300 text-xs sm:text-sm font-mono mt-2 block whitespace-pre-wrap leading-relaxed">
              <span className="text-[#ff7b72]">import</span> {'{'} <span className="text-[#d2a8ff]">MechaPricingTable</span> {'}'} <span className="text-[#ff7b72]">from</span> <span className="text-[#a5d6ff]">&apos;mechapay-react&apos;</span>;
              <br/><br/>
              <span className="text-[#ff7b72]">export default function</span> <span className="text-[#d2a8ff]">Page</span>() {'{'}
              <br/>
              {'  '}<span className="text-[#ff7b72]">return</span> (
              <br/>
              {'    '}&lt;<span className="text-[#7ee787]">MechaPricingTable</span> 
              <br/>
              {'      '}planId=<span className="text-[#a5d6ff]">&quot;0x123...&quot;</span> 
              <br/>
              {'      '}userId=<span className="text-[#a5d6ff]">&quot;user_1&quot;</span> 
              <br/>
              {'    '}/&gt;
              <br/>
              {'  '});
              <br/>
              {'}'}
            </AnimatedSpan>
          </Terminal>
        </motion.div>

        <motion.div
          className="flex-1 flex flex-col gap-6 max-w-2xl w-full mt-16 lg:mt-0"
          initial={{ opacity: 0, x: 32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-full w-fit mb-2">
            <span className="text-[#3b82f6] text-xs font-semibold tracking-wide">Drop-in Checkout SDK</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold tracking-tighter text-[#ffffff] leading-tight">
            One-Click Payments. <br/><span className="text-[#3b82f6]">Integrates in Seconds.</span>
          </h2>
          <p className="text-zinc-400 font-medium leading-relaxed text-lg md:text-xl mt-2 lg:mt-4">
            Mecha Pay offers a zero-friction, pre-built checkout widget for your client application. Drop in a single React component to accept USDC subscriptions instantly, with automatic wallet provisioning, passkey security, native bridging, and real-time access gating.
          </p>
          <div className="flex gap-4 mt-6">
            <Link href="/docs" className="flex h-14 w-full sm:w-auto px-8 items-center justify-center gap-2 rounded-full bg-[#3b82f6] text-sm font-bold text-[#ffffff] hover:opacity-90 transition-opacity">
              <span>Explore SDK Docs</span>
              <ArrowUpRight className="h-4 w-4 stroke-[3px]" />
            </Link>
          </div>
        </motion.div>
        </div>
      </section>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <ApiShowcase />
      </motion.div>

      {/* Multi-Chain Bridge Showcase Section */}

      <section id="bridge" className="relative w-full bg-[#000000] py-24 lg:py-32 px-6 sm:px-12 lg:px-20 z-20">
        
        <motion.div
          className="relative z-10 flex flex-col items-center text-center mb-16 gap-6"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-full w-fit mb-2">
            <span className="text-zinc-300 text-xs font-semibold tracking-wide">Interoperability Layer</span>
          </div>
          <h2 className="text-5xl lg:text-7xl font-bold tracking-tighter text-[#ffffff] max-w-4xl">
            Bridge USDC <br/><span className="text-zinc-500">Across Every Chain</span>
          </h2>
          <p className="text-zinc-400 font-medium leading-relaxed text-lg md:text-xl max-w-3xl mt-4">
            Mecha Pay integrates natively with Circle CCTP to provide seamless, secure, and instant USDC transfers across 15+ testnet ecosystems. No wrappers, no compromises.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-7xl mx-auto relative z-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          {[
            { name: "Arc Testnet", icon: "/arc-logo.png" },
            { name: "Base Sepolia", icon: "https://avatars.githubusercontent.com/u/108554348?s=200&v=4" },
            { name: "Arbitrum Sepolia", icon: "https://ethglobal.storage/static/faucet/arbitrum-sepolia.png" },
            { name: "Avalanche Fuji", icon: "/avalanche-logo.png" },
            { name: "ETH Sepolia", icon: "/seoplia-logo.png" },
            { name: "OP Sepolia", icon: "/op-logo.png" },
            { name: "Polygon Amoy", icon: "/polygon-logo.png" },
            { name: "Unichain", icon: "https://ethglobal.storage/static/faucet/unichain.png" },
            { name: "Linea Sepolia", icon: "https://ethglobal.storage/static/faucet/linea-sepolia.png" },
            { name: "Sei Testnet", icon: "/sei-logo.png" },
            { name: "World Chain", icon: "https://ethglobal.storage/static/faucet/world-chain-sepolia.png" },
            { name: "Ink Testnet", icon: "https://inkonchain.com/logo/ink-mark-light.webp" },
            { name: "XDC Apothem", icon: "/xdc-faucet-logo.png" },
            { name: "Monad Testnet", icon: "https://ethglobal.storage/static/faucet/monad-testnet.png" },
            { name: "Codex Testnet", icon: "/codex-logo.png" },
          ].map((chain, i) => (
            <div 
              key={i} 
              className="group relative flex flex-col items-center justify-center p-8 rounded-2xl bg-[#050505] border border-[#ffffff]/10 hover:bg-[#ffffff]/5 transition-colors"
            >
              <div className="relative w-10 h-10 mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                 <Image src={chain.icon} alt={chain.name} fill className="object-contain" />
              </div>
              <span className="text-xs font-semibold text-zinc-400 text-center">
                {chain.name}
              </span>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="mt-16 flex justify-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
           <Link href="/dashboard/bridge" className="flex h-14 px-8 items-center justify-center gap-2 rounded-full bg-[#ffffff] text-sm font-bold text-[#000000] hover:opacity-90 transition-opacity">
              <span>Open Bridge Console</span>
              <ArrowUpRight className="h-4 w-4 stroke-[3px]" />
           </Link>
        </motion.div>
      </section>



      {/* Footer */}
      <footer className="relative w-full bg-[#000000] pt-32 pb-12 px-6 sm:px-12 lg:px-20 z-20 overflow-hidden border-t border-[#ffffff]/10">
        {/* Massive Background Text Trend */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none z-0">
           <h1 className="text-[15vw] font-black tracking-tighter text-[#ffffff]/5 whitespace-nowrap">MECHA PAY</h1>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-20">
            
            <div className="flex flex-col gap-6 lg:col-span-5 pr-0 lg:pr-12">
              <div className="flex items-center gap-3">
                <Image src="/logo.png" alt="Mecha Pay Logo" width={32} height={32} className="rounded-lg shadow-lg" />
                <span className="text-2xl font-bold tracking-tight text-[#ffffff]">Mecha Pay</span>
              </div>
              <p className="text-zinc-400 font-medium leading-relaxed text-sm max-w-sm">
                The production-grade, USDC-native membership infrastructure for Web3. Built on Arc Testnet with Circle CCTP.
              </p>
              <div className="flex items-center gap-4 mt-2">
                <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full border border-[#ffffff]/10 bg-[#ffffff]/5 text-zinc-400 hover:text-[#ffffff] hover:bg-[#3b82f6] hover:border-[#3b82f6] transition-all duration-300">
                  <Mail className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-6 lg:col-span-2 lg:col-start-7">
              <h4 className="text-[#ffffff] font-semibold text-sm tracking-wide">Product</h4>
              <div className="flex flex-col gap-4">
                <Link href="#features" className="text-zinc-400 text-sm font-medium hover:text-[#ffffff] hover:translate-x-1 transition-all">Features</Link>
                <Link href="/dashboard/marketplace" className="text-zinc-400 text-sm font-medium hover:text-[#ffffff] hover:translate-x-1 transition-all">Marketplace</Link>
                <Link href="/dashboard/plans/create" className="text-zinc-400 text-sm font-medium hover:text-[#ffffff] hover:translate-x-1 transition-all">Create Plan</Link>
                <Link href="https://mecha-pay.vercel.app/docs" target="_blank" className="text-zinc-400 text-sm font-medium hover:text-[#ffffff] hover:translate-x-1 transition-all">API Reference</Link>
              </div>
            </div>

            <div className="flex flex-col gap-6 lg:col-span-2">
              <h4 className="text-[#ffffff] font-semibold text-sm tracking-wide">Platform</h4>
              <div className="flex flex-col gap-4">
                <Link href="/dashboard/bridge" className="text-zinc-400 text-sm font-medium hover:text-[#ffffff] hover:translate-x-1 transition-all">Bridge</Link>
                <Link href="/dashboard/wallet" className="text-zinc-400 text-sm font-medium hover:text-[#ffffff] hover:translate-x-1 transition-all">Wallet</Link>
                <Link href="/dashboard/developer" className="text-zinc-400 text-sm font-medium hover:text-[#ffffff] hover:translate-x-1 transition-all">Developer</Link>
              </div>
            </div>

            <div className="flex flex-col gap-6 lg:col-span-2">
              <h4 className="text-[#ffffff] font-semibold text-sm tracking-wide">Resources</h4>
              <div className="flex flex-col gap-4">
                <Link href="https://mecha-pay.vercel.app/docs" target="_blank" className="text-zinc-400 text-sm font-medium hover:text-[#ffffff] hover:translate-x-1 transition-all">Documentation</Link>
                <Link href="https://github.com/Vishal-770/mecha-pay" target="_blank" className="text-zinc-400 text-sm font-medium hover:text-[#ffffff] hover:translate-x-1 transition-all">GitHub</Link>
                <Link href="https://testnet.arcscan.net" target="_blank" className="text-zinc-400 text-sm font-medium hover:text-[#ffffff] hover:translate-x-1 transition-all">ArcScan</Link>
                <Link href="https://testnet.arcscan.app/address/0x094D8A6dEDF25ee8ccFe093ac48514B83b7e73D2" target="_blank" className="text-zinc-400 text-sm font-medium hover:text-[#ffffff] hover:translate-x-1 transition-all">Contract</Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-[#ffffff]/10 gap-6">
            <span className="text-zinc-500 text-sm font-medium">
              © 2026 Mecha Pay Protocol. All rights reserved.
            </span>
            <div className="flex items-center gap-8">
              <span className="text-zinc-500 text-sm font-medium hover:text-zinc-300 transition-colors cursor-not-allowed">Terms</span>
              <span className="text-zinc-500 text-sm font-medium hover:text-zinc-300 transition-colors cursor-not-allowed">Privacy</span>
            </div>
          </div>
        </div>
      </footer>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}