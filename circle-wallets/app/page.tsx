"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, LayoutGrid, Zap, Shield, Globe, Coins, Activity, Mail } from "lucide-react";
import Lenis from 'lenis';
import BounceCards from "@/components/BounceCards";
import CardSwap, { Card } from "@/components/CardSwap";
import { Terminal, AnimatedSpan, TypingAnimation } from "@/components/ui/terminal";

import AppPreview from "@/components/AppPreview";
import ApiShowcase from "@/components/ApiShowcase";



const featureItems = [
  <div key="1" className="flex flex-col gap-4 pointer-events-auto h-full w-full group">
    <div className="h-10 flex items-center transition-transform duration-300">
      <Zap className="h-8 w-8 text-[#b6f09c]" />
    </div>
    <div className="mt-2">
      <h3 className="text-xl font-bold tracking-tight text-white mb-2">USDC-as-Gas</h3>
      <p className="text-sm text-zinc-400 leading-relaxed font-medium">Eliminate native gas tokens. Pay for memberships and network fees entirely in USDC on Arc.</p>
    </div>
  </div>,
  <div key="2" className="flex flex-col gap-4 pointer-events-auto h-full w-full group">
    <div className="h-10 flex items-center transition-transform duration-300">
      <Shield className="h-8 w-8 text-[#b6f09c]" />
    </div>
    <div className="mt-2">
      <h3 className="text-xl font-bold tracking-tight text-white mb-2">Secure MPC</h3>
      <p className="text-sm text-zinc-400 leading-relaxed font-medium">Non-custodial infrastructure powered by Circle&apos;s Programmable Wallets and MPC technology.</p>
    </div>
  </div>,
  <div key="3" className="flex flex-col gap-4 pointer-events-auto h-full w-full group">
    <div className="h-10 flex items-center transition-transform duration-300">
      <Globe className="h-8 w-8 text-[#b6f09c]" />
    </div>
    <div className="mt-2">
      <h3 className="text-xl font-bold tracking-tight text-white mb-2">CCTP Native</h3>
      <p className="text-sm text-zinc-400 leading-relaxed font-medium">Bridge canonical USDC directly from 15+ testnet chains via Circle&apos;s native CCTP protocol.</p>
    </div>
  </div>,
  <div key="4" className="flex flex-col gap-4 pointer-events-auto h-full w-full group">
    <div className="h-10 flex items-center transition-transform duration-300">
      <Activity className="h-8 w-8 text-[#b6f09c]" />
    </div>
    <div className="mt-2">
      <h3 className="text-xl font-bold tracking-tight text-white mb-2">Fast Indexing</h3>
      <p className="text-sm text-zinc-400 leading-relaxed font-medium">Millisecond-accurate membership status powered by our custom high-fidelity indexing engine.</p>
    </div>
  </div>,
  <div key="5" className="flex flex-col gap-4 pointer-events-auto h-full w-full group">
    <div className="h-10 flex items-center transition-transform duration-300">
      <LayoutGrid className="h-8 w-8 text-[#b6f09c]" />
    </div>
    <div className="mt-2">
      <h3 className="text-xl font-bold tracking-tight text-white mb-2">React SDK</h3>
      <p className="text-sm text-zinc-400 leading-relaxed font-medium">Ready-to-use pricing tables and membership hooks for instant protocol integration.</p>
    </div>
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
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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
    <div className="relative w-full bg-[#000000] font-mulish overflow-x-hidden">
      
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
            <source src="/background.mp4" type="video/mp4" />
          </video>
          
          {/* Simple dark overlay */}
          <div className="absolute inset-0 bg-[#000000]/60 z-10" />
          
          {/* Seamless bottom fade to match the next section's background */}
          <div className="absolute bottom-0 left-0 w-full h-48 bg-linear-to-t from-[#000000] via-[#000000]/80 to-transparent z-10 pointer-events-none" />
        </div>

        {/* Decorative Grid */}
        <div className="absolute inset-0 z-10 opacity-[0.03] pointer-events-none" 
             style={{
               backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
               backgroundSize: '4rem 4rem'
             }} 
        />

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
        <div className="relative z-20 flex-1 flex flex-col justify-center w-full px-6 lg:px-12 xl:px-20 pb-20 pt-32 lg:pt-40">
          <div className="grid lg:grid-cols-[1.2fr_600px] items-center gap-12 xl:gap-20 w-full max-w-400 mx-auto">
            
            {/* Left Side: Typography & CTAs */}
            <div className="flex flex-col items-start text-left pt-10 lg:pt-0 relative z-30">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-full w-fit mb-6">
                <span className="text-[#b6f09c] text-xs font-semibold tracking-wide flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#b6f09c] animate-pulse"></span>
                  One-Click Subscriptions in Seconds
                </span>
                <span className="text-zinc-500 text-xs">•</span>
                <span className="text-zinc-300 text-xs font-semibold tracking-wide">Enterprise Compliance Ready</span>
              </div>
              <div className="flex flex-col mb-10 relative">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[4.5rem] xl:text-[5.5rem] font-extrabold tracking-tighter leading-[1.05] text-[#ffffff]">
                  <span className="block">USDC-Native</span>
                  <span className="block text-[#b6f09c]">Membership</span>
                  <span className="block">Infrastructure.</span>
                </h1>
                
                <p className="mt-8 text-base sm:text-lg lg:text-xl text-[#a1a1aa] font-medium leading-relaxed max-w-2xl">
                  Integrate beautiful, predictable subscription checkouts in seconds. Zero friction, drop-in React SDK widgets powered by Circle Programmable Wallets, CCTP, and the Arc blockchain.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
                <Link href="/login" className="flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#b6f09c] px-8 text-sm font-bold text-[#000000] hover:opacity-90 transition-opacity">
                  <span>Open Console</span>
                  <ArrowUpRight className="h-4 w-4 stroke-[3px]" />
                </Link>
                <Link href="/docs" className="flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#ffffff]/5 px-8 text-sm font-semibold text-[#ffffff] border border-[#ffffff]/10 hover:bg-[#ffffff]/10 transition-colors">
                  <span>Explore Docs</span>
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-14 flex items-center gap-6 opacity-60">
                <span className="text-xs font-semibold tracking-widest uppercase text-[#71717a]">Powered by</span>
                <div className="flex items-center gap-6">
                  <span className="text-sm font-bold text-[#ffffff] tracking-wide">Circle</span>
                  <span className="text-sm font-bold text-[#ffffff] tracking-wide">Arc</span>
                  <span className="text-sm font-bold text-[#ffffff] tracking-wide">CCTP</span>
                </div>
              </div>
            </div>

            {/* Right Side: Visuals (BounceCards) */}
            <div className="hidden lg:flex items-center justify-center h-150 w-full relative z-20">
              <BounceCards
                className="custom-bounceCards scale-110 xl:scale-125"
                items={featureItems}
                containerWidth={600}
                containerHeight={500}
                animationDelay={0.4}
                animationStagger={0.08}
                easeType="elastic.out(1, 0.75)"
                transformStyles={transformStyles}
                enableHover={true}
              />
            </div>
          </div>
        </div>
      </section>

      <AppPreview />

      {/* Protocol Features Section */}

      <section id="features" className="relative w-full bg-[#000000] py-24 lg:py-32 z-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-6 sm:px-12 lg:px-20 w-full">
          <div className="flex-1 flex flex-col gap-6 max-w-2xl w-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-full w-fit mb-2">
            <span className="text-zinc-300 text-xs font-semibold tracking-wide">Protocol Architecture</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold tracking-tighter text-[#ffffff]">
            USDC-Native. <br/><span className="text-[#b6f09c]">Arc-Powered.</span>
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
        </div>

        <div className="hidden lg:flex flex-1 w-full items-center justify-center relative mt-16 lg:mt-0 h-112.5 lg:h-150 pointer-events-none">
          <div className="relative w-[320px] h-50 z-10 lg:right-10 pointer-events-auto perspective-[2000px]">
            <CardSwap width={320} height={200} cardDistance={40} verticalDistance={50}>
              <Card className="bg-[#050505] border border-[#ffffff]/10 shadow-2xl rounded-2xl flex flex-col justify-between p-6">
                <div className="flex justify-between items-center text-[#ffffff]">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-[#b6f09c]"/> 
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
                    <Shield className="w-5 h-5 text-[#b6f09c]"/> 
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
                    <Zap className="w-5 h-5 text-[#b6f09c]"/> 
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
        </div>
        </div>
      </section>

      {/* Developer Integration Section */}
      <section id="developers" className="relative w-full bg-[#000000] py-32 z-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 px-6 sm:px-12 lg:px-20 w-full">
          <div className="flex-1 w-full max-w-xl mx-auto flex items-center justify-center relative perspective-[2000px]">
          <Terminal className="bg-[#050505] border border-[#ffffff]/10 shadow-2xl h-100 w-full max-w-xl">
            <TypingAnimation delay={500} duration={30} className="text-zinc-500 text-xs sm:text-sm font-mono">
              &gt; npm install mechapay-react
            </TypingAnimation>
            <AnimatedSpan delay={1500} className="text-[#b6f09c] text-xs sm:text-sm font-mono mt-2 block">
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
        </div>

        <div className="flex-1 flex flex-col gap-6 max-w-2xl w-full mt-16 lg:mt-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-full w-fit mb-2">
            <span className="text-[#b6f09c] text-xs font-semibold tracking-wide">Drop-in Checkout SDK</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold tracking-tighter text-[#ffffff] leading-tight">
            One-Click Payments. <br/><span className="text-[#b6f09c]">Integrates in Seconds.</span>
          </h2>
          <p className="text-zinc-400 font-medium leading-relaxed text-lg md:text-xl mt-2 lg:mt-4">
            Mecha Pay offers a zero-friction, pre-built checkout widget that inserts directly into your client application. Similar to modern drop-in login interfaces, just paste a single React component to accept USDC subscriptions instantly. No smart contract deployments or complex backend sync required.
          </p>
          <p className="text-zinc-400 font-medium leading-relaxed text-lg md:text-xl mt-2">
            The SDK automatically provisions non-custodial wallets, secures transactions via device passkeys, handles multi-chain bridging, and validates customer access privileges instantly.
          </p>
          <div className="flex gap-4 mt-6">
            <Link href="/docs" className="flex h-14 w-full sm:w-auto px-8 items-center justify-center gap-2 rounded-full bg-[#b6f09c] text-sm font-bold text-[#000000] hover:opacity-90 transition-opacity">
              <span>Explore SDK Docs</span>
              <ArrowUpRight className="h-4 w-4 stroke-[3px]" />
            </Link>
          </div>
        </div>
        </div>
      </section>

      <ApiShowcase />

      {/* Multi-Chain Bridge Showcase Section */}

      <section id="bridge" className="relative w-full bg-[#000000] py-24 lg:py-32 px-6 sm:px-12 lg:px-20 z-20">
        
        <div className="relative z-10 flex flex-col items-center text-center mb-16 gap-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-full w-fit mb-2">
            <span className="text-zinc-300 text-xs font-semibold tracking-wide">Interoperability Layer</span>
          </div>
          <h2 className="text-5xl lg:text-7xl font-bold tracking-tighter text-[#ffffff] max-w-4xl">
            Bridge USDC <br/><span className="text-zinc-500">Across Every Chain</span>
          </h2>
          <p className="text-zinc-400 font-medium leading-relaxed text-lg md:text-xl max-w-3xl mt-4">
            Mecha Pay integrates natively with Circle CCTP to provide seamless, secure, and instant USDC transfers across 15+ testnet ecosystems. No wrappers, no compromises.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-7xl mx-auto relative z-10">
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
        </div>

        <div className="mt-16 flex justify-center relative z-10">
           <Link href="/dashboard/bridge" className="flex h-14 px-8 items-center justify-center gap-2 rounded-full bg-[#ffffff] text-sm font-bold text-[#000000] hover:opacity-90 transition-opacity">
              <span>Open Bridge Console</span>
              <ArrowUpRight className="h-4 w-4 stroke-[3px]" />
           </Link>
        </div>
      </section>

      {/* Protocol Economics Section */}
      {/* Protocol Economics Section */}
      <section className="relative w-full bg-[#000000] py-24 lg:py-40 px-6 sm:px-12 lg:px-20 z-20 overflow-hidden">
        {/* Subtle Architectural Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-20 relative z-10">
          <div className="flex-1 flex flex-col gap-6 w-full">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-full w-fit mb-2">
              <span className="text-zinc-300 text-xs font-semibold tracking-wide">Fee Transparency</span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-bold tracking-tighter text-[#ffffff] leading-[1.1]">
              Pure Efficiency. <br/>
              <span className="text-[#b6f09c]">Zero Waste.</span>
            </h2>
            <p className="text-zinc-400 font-medium leading-relaxed text-lg md:text-xl mt-2 lg:mt-4 max-w-xl">
              Traditional payment rails eat into your margins with hidden fees and expensive gas costs. Mecha Pay redefines protocol economics.
            </p>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="group relative overflow-hidden p-8 rounded-3xl bg-[#050505] border border-[#ffffff]/10 hover:bg-[#0a0a0f] hover:border-[#b6f09c]/30 transition-all duration-500">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <Coins className="w-32 h-32 text-[#b6f09c] -mr-8 -mt-8" />
              </div>
              <div className="relative z-10">
                <div className="text-5xl font-bold tracking-tighter text-[#ffffff] mb-4 group-hover:text-[#b6f09c] transition-colors duration-500">$0.00</div>
                <h4 className="text-xl font-bold text-[#ffffff] mb-2 tracking-tight">Native Fee</h4>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-[90%]">Eliminate secondary gas tokens. Arc uses USDC as native gas for predictable, low-cost execution.</p>
              </div>
            </div>
            
            <div className="group relative overflow-hidden p-8 rounded-3xl bg-[#050505] border border-[#ffffff]/10 hover:bg-[#0a0a0f] hover:border-[#b6f09c]/30 transition-all duration-500">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <Zap className="w-32 h-32 text-[#b6f09c] -mr-8 -mt-8" />
              </div>
              <div className="relative z-10">
                <div className="text-5xl font-bold tracking-tighter text-[#ffffff] mb-4 group-hover:text-[#b6f09c] transition-colors duration-500">Instant</div>
                <h4 className="text-xl font-bold text-[#ffffff] mb-2 tracking-tight">Sub-Second Finality</h4>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-[90%]">Subscriptions and bridges confirm in under 1 second, providing a true Web2-like experience.</p>
              </div>
            </div>
            
            <div className="group relative overflow-hidden p-8 rounded-3xl bg-[#050505] border border-[#ffffff]/10 hover:bg-[#0a0a0f] hover:border-[#b6f09c]/30 transition-all duration-500 md:col-span-2">
              <div className="absolute inset-0 bg-linear-to-r from-[#b6f09c]/0 via-[#b6f09c]/5 to-[#b6f09c]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <Globe className="w-48 h-48 text-[#b6f09c] -mr-16 -mt-16" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-[#ffffff]/5 flex items-center justify-center border border-[#ffffff]/10 group-hover:border-[#b6f09c]/30 transition-colors duration-500">
                     <Globe className="h-6 w-6 text-[#ffffff] group-hover:text-[#b6f09c] transition-colors duration-500" />
                  </div>
                  <div className="text-3xl font-bold tracking-tighter text-[#ffffff]">Unified Liquidity</div>
                </div>
                <h4 className="text-xl font-bold text-[#ffffff] mb-2 tracking-tight">Native Circle CCTP Integration</h4>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-lg">No wrapped assets. Move canonical USDC seamlessly between Ethereum, Base, Polygon, and 15+ others via official burn-and-mint logic.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Compliance Section */}
      <section id="compliance" className="relative w-full bg-[#000000] py-24 lg:py-32 px-6 sm:px-12 lg:px-20 z-20 overflow-hidden border-t border-[#ffffff]/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,#b6f09c08,transparent_70%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col gap-16 relative z-10">
          
          <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-full w-fit mb-2">
              <span className="text-[#b6f09c] text-xs font-semibold tracking-wide">Enterprise Gated Security</span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold tracking-tighter text-[#ffffff] leading-tight">
              Regulatory Compliance <br/>& <span className="text-zinc-500">Institutional Trust</span>
            </h2>
            <p className="text-zinc-400 font-medium leading-relaxed text-base sm:text-lg mt-2">
              Mecha Pay is engineered to align with global regulatory frameworks, ensuring a fully compliant stablecoin payment stream.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {/* MiCA Ready */}
            <div className="group relative p-8 rounded-3xl bg-[#050505] border border-[#ffffff]/10 hover:bg-[#0a0a0f] hover:border-[#b6f09c]/30 transition-all duration-500 flex flex-col justify-between min-h-[260px]">
              <div>
                <div className="h-10 w-10 rounded-xl bg-[#ffffff]/5 border border-[#ffffff]/10 flex items-center justify-center mb-6 group-hover:border-[#b6f09c]/30 transition-colors">
                  <Shield className="h-5 w-5 text-[#b6f09c]" />
                </div>
                <h4 className="text-lg font-bold text-[#ffffff] mb-2 tracking-tight">MiCA Compliant</h4>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                  Leverages native Circle USDC, fully backed and regulated under the EU's Markets in Crypto-Assets regulation, guaranteeing stable value redemption.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mt-6">Stablecoin Regs</span>
            </div>

            {/* GDPR & Privacy First */}
            <div className="group relative p-8 rounded-3xl bg-[#050505] border border-[#ffffff]/10 hover:bg-[#0a0a0f] hover:border-[#b6f09c]/30 transition-all duration-500 flex flex-col justify-between min-h-[260px]">
              <div>
                <div className="h-10 w-10 rounded-xl bg-[#ffffff]/5 border border-[#ffffff]/10 flex items-center justify-center mb-6 group-hover:border-[#b6f09c]/30 transition-colors">
                  <Globe className="h-5 w-5 text-[#b6f09c]" />
                </div>
                <h4 className="text-lg font-bold text-[#ffffff] mb-2 tracking-tight">GDPR & Data Privacy</h4>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                  No personally identifiable information (PII) is stored on the ledger. Cryptographic session keys authorize payouts without exposing customer identities.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mt-6">GDPR Compliant</span>
            </div>

            {/* SOC 2 Type II */}
            <div className="group relative p-8 rounded-3xl bg-[#050505] border border-[#ffffff]/10 hover:bg-[#0a0a0f] hover:border-[#b6f09c]/30 transition-all duration-500 flex flex-col justify-between min-h-[260px]">
              <div>
                <div className="h-10 w-10 rounded-xl bg-[#ffffff]/5 border border-[#ffffff]/10 flex items-center justify-center mb-6 group-hover:border-[#b6f09c]/30 transition-colors">
                  <Zap className="h-5 w-5 text-[#b6f09c]" />
                </div>
                <h4 className="text-lg font-bold text-[#ffffff] mb-2 tracking-tight">SOC 2 Type II Insulated</h4>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                  Operates using Circle's non-custodial wallet infrastructure, audited to SOC 2 Type II security standards for safe private key segment storage.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mt-6">Audit Certified</span>
            </div>

            {/* BSA & AML Gating */}
            <div className="group relative p-8 rounded-3xl bg-[#050505] border border-[#ffffff]/10 hover:bg-[#0a0a0f] hover:border-[#b6f09c]/30 transition-all duration-500 flex flex-col justify-between min-h-[260px]">
              <div>
                <div className="h-10 w-10 rounded-xl bg-[#ffffff]/5 border border-[#ffffff]/10 flex items-center justify-center mb-6 group-hover:border-[#b6f09c]/30 transition-colors">
                  <Coins className="h-5 w-5 text-[#b6f09c]" />
                </div>
                <h4 className="text-lg font-bold text-[#ffffff] mb-2 tracking-tight">BSA / AML Gating</h4>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                  Integrates seamlessly with RPC-level sanction filters and OFAC screening tools, protecting merchants from interacting with flagged wallets.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mt-6">AML Protection</span>
            </div>
          </div>
        </div>
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
                <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full border border-[#ffffff]/10 bg-[#ffffff]/5 text-zinc-400 hover:text-[#000000] hover:bg-[#b6f09c] hover:border-[#b6f09c] transition-all duration-300">
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

    </div>
  );
}