"use client"

import Link from "next/link";
import Image from "next/image";
import { Search, ArrowUpRight, LayoutGrid, Zap, Shield, Globe, Coins, Activity,Mail } from "lucide-react";
import { Mulish } from "next/font/google"; // Still need it for the className if variable fails or for safety
import BounceCards from "@/components/BounceCards";
import CardSwap, { Card } from "@/components/CardSwap";
import { Terminal, AnimatedSpan, TypingAnimation } from "@/components/ui/terminal";
import AppPreview from "@/components/AppPreview";
import ApiShowcase from "@/components/ApiShowcase";
import GraphShowcase from "@/components/GraphShowcase";



const featureItems = [
  <div key="1" className="flex flex-col gap-3 pointer-events-auto">
    <div className="h-10 w-10 rounded-xl bg-[#b6f09c]/10 flex items-center justify-center border border-[#b6f09c]/20">
      <Zap className="h-5 w-5 text-[#b6f09c]" />
    </div>
    <h3 className="text-lg font-black uppercase italic tracking-tighter text-[#ffffff]">Gas Subsidized</h3>
    <p className="text-xs text-[#a1a1aa] leading-relaxed font-medium">Enjoy seamless transactions with subsidized gas fee on Arc Testnet.</p>
  </div>,
  <div key="2" className="flex flex-col gap-3 pointer-events-auto">
    <div className="h-10 w-10 rounded-xl bg-[#b6f09c]/10 flex items-center justify-center border border-[#b6f09c]/20">
      <Shield className="h-5 w-5 text-[#b6f09c]" />
    </div>
    <h3 className="text-lg font-black uppercase italic tracking-tighter text-[#ffffff]">Secure MPC</h3>
    <p className="text-xs text-[#a1a1aa] leading-relaxed font-medium">Enterprise-grade MPC security with non-custodial Circle Wallets.</p>
  </div>,
  <div key="3" className="flex flex-col gap-3 pointer-events-auto">
    <div className="h-10 w-10 rounded-xl bg-[#b6f09c]/10 flex items-center justify-center border border-[#b6f09c]/20">
      <Globe className="h-5 w-5 text-[#b6f09c]" />
    </div>
    <h3 className="text-lg font-black uppercase italic tracking-tighter text-[#ffffff]">Native USDC</h3>
    <p className="text-xs text-[#a1a1aa] leading-relaxed font-medium">Bridge canonical USDC across 15+ chains via Circle CCTP protocol.</p>
  </div>,
  <div key="4" className="flex flex-col gap-3 pointer-events-auto">
    <div className="h-10 w-10 rounded-xl bg-[#b6f09c]/10 flex items-center justify-center border border-[#b6f09c]/20">
      <Coins className="h-5 w-5 text-[#b6f09c]" />
    </div>
    <h3 className="text-lg font-black uppercase italic tracking-tighter text-[#ffffff]">Zero Fees</h3>
    <p className="text-xs text-[#a1a1aa] leading-relaxed font-medium">Standard transaction fees are $0.00 for users paying via Arc.</p>
  </div>,
  <div key="5" className="flex flex-col gap-3 pointer-events-auto">
    <div className="h-10 w-10 rounded-xl bg-[#b6f09c]/10 flex items-center justify-center border border-[#b6f09c]/20">
      <Activity className="h-5 w-5 text-[#b6f09c]" />
    </div>
    <h3 className="text-lg font-black uppercase italic tracking-tighter text-[#ffffff]">Instant Finality</h3>
    <p className="text-xs text-[#a1a1aa] leading-relaxed font-medium">Sub-second transaction times on Arc Testnet for instant confirmation.</p>
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
    <div className="relative w-full bg-[#000000] font-mulish overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
      
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
          <Link href="#features" className="px-5 py-2 text-[10px] font-extrabold uppercase tracking-widest text-[#a1a1aa] hover:text-[#ffffff] hover:bg-[#ffffff]/5 rounded-xl transition-all">Features</Link>
          <Link href="#bridge" className="px-5 py-2 text-[10px] font-extrabold uppercase tracking-widest text-[#a1a1aa] hover:text-[#ffffff] hover:bg-[#ffffff]/5 rounded-xl transition-all">Bridge</Link>
          <Link href="https://mechapay.mintlify.app/" target="_blank" className="px-5 py-2 text-[10px] font-extrabold uppercase tracking-widest text-[#a1a1aa] hover:text-[#ffffff] hover:bg-[#ffffff]/5 rounded-xl transition-all">Docs</Link>

          <Link href="/dashboard/marketplace" className="px-5 py-2 text-[10px] font-extrabold uppercase tracking-widest text-[#a1a1aa] hover:text-[#ffffff] hover:bg-[#ffffff]/5 rounded-xl transition-all">Marketplace</Link>
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
              Subscriptions
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             <Link href="/login" className="h-12 px-10 flex items-center justify-center rounded-xl bg-[#b6f09c] text-[#000000] font-black text-xs uppercase shadow-xl shadow-[#b6f09c]/20 transition-all hover:opacity-90">
                Connect Wallet <ArrowUpRight className="ml-2 h-4 w-4 stroke-[3px]" />
             </Link>
             <Link href="/dashboard/marketplace" className="h-12 px-10 flex items-center justify-center rounded-xl border border-[#ffffff]/20 bg-[#ffffff]/5 backdrop-blur-md text-[#ffffff] font-extrabold text-xs uppercase transition-all hover:bg-[#ffffff]/10">
                Browse Marketplace
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
            enableHover={true}
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
      </section>

      <AppPreview />

      {/* Protocol Features Section */}

      <section id="features" className="relative min-h-screen w-full bg-[#060608] py-32 flex flex-col lg:flex-row items-center justify-center gap-20 px-12 lg:px-20 z-20 border-t border-[#ffffff]/10">
        <div className="flex-1 flex flex-col gap-6 max-w-2xl px-4">
          <div className="px-4 py-2 bg-[#b6f09c]/10 border border-[#b6f09c]/20 rounded-full w-fit">
            <span className="text-[#b6f09c] text-[10px] font-bold uppercase tracking-widest">Protocol Architecture</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-[#ffffff]">
            Trustless. <br/><span className="text-[#b6f09c]">Borderless.</span>
          </h2>
          <p className="text-[#a1a1aa] font-medium leading-relaxed text-lg mt-4">
            Mecha Pay is a Web3 subscription platform built on Arc Testnet with Circle CCTP integration. Create and manage recurring subscription plans with direct USDC payouts, MPC security, and cross-chain bridging across 15+ testnets.
          </p>
          <div className="grid grid-cols-2 gap-6 mt-8">
             <div className="flex flex-col gap-2">
                <span className="text-3xl font-black italic text-[#ffffff]">Arc</span>
                <span className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest">Testnet Live</span>
             </div>
             <div className="flex flex-col gap-2">
                <span className="text-3xl font-black italic text-[#ffffff]">Circle</span>
                <span className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest">MPC Wallets</span>
             </div>
          </div>
        </div>

        <div className="flex-1 w-full flex items-center justify-center relative h-[600px] pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-[#b6f09c]/5 to-[#b6f09c]/5 rounded-full blur-3xl opacity-50 z-0" />
          
          <div className="relative w-[320px] h-[200px] z-10 lg:right-10 pointer-events-auto">
            <CardSwap width={320} height={200} cardDistance={40} verticalDistance={50}>
              <Card className="bg-[#000000]/80 border border-[#b6f09c]/30 backdrop-blur-xl shadow-2xl shadow-[#b6f09c]/10 rounded-2xl flex flex-col justify-between p-6">
                <div className="flex justify-between items-center text-[#ffffff]">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#b6f09c]"/> 
                    <span className="text-xs font-black uppercase tracking-widest italic">Global Swap</span>
                  </div>
                  <span className="text-xs font-bold text-[#b6f09c] bg-[#b6f09c]/10 px-2 py-1 rounded-md">ETH/USDC</span>
                </div>
                <div>
                  <div className="text-[#a1a1aa] text-[10px] font-bold uppercase tracking-widest mb-1">Latency</div>
                  <div className="text-4xl font-black italic tracking-tighter text-[#ffffff]">150<span className="text-xl text-[#b6f09c]">ms</span></div>
                </div>
              </Card>
              <Card className="bg-[#000000]/80 border border-[#b6f09c]/30 backdrop-blur-xl shadow-2xl shadow-[#b6f09c]/10 rounded-2xl flex flex-col justify-between p-6">
                <div className="flex justify-between items-center text-[#ffffff]">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#b6f09c]"/> 
                    <span className="text-xs font-black uppercase tracking-widest italic">MPC Security</span>
                  </div>
                  <span className="text-xs font-bold text-[#b6f09c] bg-[#b6f09c]/10 px-2 py-1 rounded-md">Audited</span>
                </div>
                <div>
                  <div className="text-[#a1a1aa] text-[10px] font-bold uppercase tracking-widest mb-1">Protection</div>
                  <div className="text-4xl font-black italic tracking-tighter text-[#ffffff]">100<span className="text-xl text-[#b6f09c]">%</span></div>
                </div>
              </Card>
              <Card className="bg-[#000000]/80 border border-[#b6f09c]/30 backdrop-blur-xl shadow-2xl shadow-[#b6f09c]/10 rounded-2xl flex flex-col justify-between p-6">
                <div className="flex justify-between items-center text-[#ffffff]">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#b6f09c]"/> 
                    <span className="text-xs font-black uppercase tracking-widest italic tracking-tight">Gas Subsidized</span>
                  </div>
                  <span className="text-xs font-bold text-[#b6f09c] bg-[#b6f09c]/10 px-2 py-1 rounded-md">Native USDC</span>
                </div>
                <div>
                  <div className="text-[#a1a1aa] text-[10px] font-bold uppercase tracking-widest mb-1">Transaction Fee</div>
                  <div className="text-4xl font-black italic tracking-tighter text-[#ffffff] animate-pulse">$0.<span className="text-xl text-[#b6f09c]">00</span></div>
                </div>
              </Card>
            </CardSwap>
          </div>
        </div>
      </section>

      {/* Developer Integration Section */}
      <section id="developers" className="relative min-h-screen w-full bg-[#000000] py-32 flex flex-col lg:flex-row items-center justify-center gap-20 px-12 lg:px-20 z-20 border-t border-[#ffffff]/10">
        <div className="flex-1 w-full max-w-lg mx-auto flex items-center justify-center relative">
          <Terminal className="bg-[#0b0b0f] border-[#ffffff]/10 shadow-2xl h-[420px] w-full max-w-lg">
            <TypingAnimation delay={500} duration={30} className="text-[#a1a1aa] font-mono">
              &gt; npm install mecha-pay
            </TypingAnimation>
            <AnimatedSpan delay={1500} className="text-[#b6f09c] font-mono mt-2 block">
              ✔ Package installed successfully
            </AnimatedSpan>
            
            <TypingAnimation delay={2500} duration={30} className="text-[#a1a1aa] font-mono mt-6 block">
              &gt; cat components/Subscription.tsx
            </TypingAnimation>
            
            <AnimatedSpan delay={3500} className="text-[#ffffff] font-mono mt-2 block whitespace-pre-wrap leading-relaxed">
              <span className="text-[#b6f09c]">import</span> {'{'} PricingTable {'}'} <span className="text-[#b6f09c]">from</span> <span className="text-[#b6f09c]">'mecha-pay'</span>;
              <br/><br/>
              <span className="text-[#f59e0b]">export default function</span> <span className="text-[#b6f09c]">Page</span>() {'{'}
              <br/>
              {'  '}<span className="text-[#f59e0b]">return</span> (
              <br/>
              {'    '}&lt;<span className="text-[#b6f09c]">PricingTable</span> 
              <br/>
              {'      '}planId=<span className="text-[#b6f09c]">"0x123..."</span> 
              <br/>
              {'      '}theme=<span className="text-[#b6f09c]">"dark"</span> 
              <br/>
              {'    '}/&gt;
              <br/>
              {'  '});
              <br/>
              {'}'}
            </AnimatedSpan>
          </Terminal>
        </div>

        <div className="flex-1 flex flex-col gap-6 max-w-2xl px-4">
          <div className="px-4 py-2 bg-[#b6f09c]/10 border border-[#b6f09c]/20 rounded-full w-fit">
            <span className="text-[#b6f09c] text-[10px] font-bold uppercase tracking-widest">Developer API</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-[#ffffff]">
            Integrate with <br/><span className="text-[#b6f09c]">Mecha SDK.</span>
          </h2>
          <p className="text-[#a1a1aa] font-medium leading-relaxed text-lg mt-4">
            Mecha Pay provides a powerful <span className="text-[#ffffff] font-bold">React SDK</span> and npm package for seamless on-chain subscription management. Import pre-built UI components like <span className="text-[#ffffff] font-bold">PricingTable</span> or use our hooks to interact with the protocol.
          </p>
          <p className="text-[#a1a1aa] font-medium leading-relaxed text-lg mt-2">
            Get started by installing the <span className="font-mono text-[#b6f09c] text-sm bg-[#b6f09c]/10 px-2 py-1 rounded">mecha-pay</span> package and connecting your merchant account in minutes.
          </p>
          <div className="flex gap-4 mt-6">
            <Link href="https://mechapay.mintlify.app/" target="_blank" className="h-12 px-8 flex items-center justify-center rounded-xl bg-[#b6f09c] text-[#000000] font-black text-xs uppercase shadow-xl shadow-[#b6f09c]/20 transition-all hover:opacity-90">
              Explore SDK Docs <ArrowUpRight className="ml-2 h-4 w-4 stroke-[3px]" />
            </Link>
          </div>
        </div>
      </section>

      <ApiShowcase />

      <GraphShowcase />

      {/* Multi-Chain Bridge Showcase Section */}

      <section id="bridge" className="relative w-full bg-[#000000] py-32 px-12 lg:px-20 z-20 border-t border-[#ffffff]/5 overflow-hidden">
        {/* Subtle Institutional Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#b6f09c]/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center mb-24 gap-6">
          <div className="px-3 py-1 bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-full w-fit">
            <span className="text-[#a1a1aa] text-[10px] font-bold uppercase tracking-[0.2em] leading-none">Interoperability Layer</span>
          </div>
          <h2 className="text-4xl lg:text-8xl font-black uppercase tracking-tighter text-[#ffffff] leading-[0.85] max-w-4xl">
            Bridge USDC <br/><span className="text-[#a1a1aa]">Across Every Chain</span>
          </h2>
          <p className="text-[#71717a] font-medium leading-relaxed text-lg lg:text-xl max-w-3xl mt-4">
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
              className="relative flex flex-col items-center justify-center p-10 rounded-xl bg-[#0b0b0f] border border-[#ffffff]/5 transition-colors hover:border-[#ffffff]/10"
            >
              <div className="relative w-10 h-10 mb-6">
                 <Image src={chain.icon} alt={chain.name} fill className="object-contain" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#a1a1aa]">
                {chain.name}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-24 flex justify-center relative z-10">

           <Link href="/dashboard/bridge" className="h-14 px-12 flex items-center justify-center rounded-xl bg-[#ffffff] text-[#000000] font-black text-xs uppercase shadow-2xl shadow-[#ffffff]/10 transition-all hover:opacity-90">
              Open Bridge Console <ArrowUpRight className="ml-2 h-5 w-5 stroke-[3px]" />
           </Link>
        </div>
      </section>

      {/* Protocol Economics Section */}
      <section className="relative w-full bg-[#060608] py-32 px-12 lg:px-20 z-20 border-t border-[#ffffff]/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#b6f09c]/5 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 flex flex-col gap-6">
            <div className="px-4 py-2 bg-[#b6f09c]/10 border border-[#b6f09c]/20 rounded-full w-fit">
              <span className="text-[#b6f09c] text-[10px] font-bold uppercase tracking-widest">Fee Transparency</span>
            </div>
            <h2 className="text-4xl lg:text-7xl font-black uppercase italic tracking-tighter text-[#ffffff] leading-tight">
              Pure Efficiency. <br/>
              <span className="text-[#b6f09c]">Zero Waste.</span>
            </h2>
            <p className="text-[#a1a1aa] font-medium leading-relaxed text-lg mt-4 max-w-xl">
              Traditional payment rails eat into your margins with hidden fees and expensive gas costs. Mecha Pay redefines protocol economics.
            </p>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="p-8 rounded-3xl bg-[#ffffff]/5 border border-[#ffffff]/10 backdrop-blur-sm hover:border-[#b6f09c]/30 transition-all group">
              <div className="text-5xl font-black italic text-[#ffffff] mb-4 group-hover:text-[#b6f09c] transition-colors">$0.00</div>
              <h4 className="text-lg font-black uppercase italic text-[#ffffff] mb-2 tracking-tighter">Transaction fee</h4>
              <p className="text-sm text-[#71717a] font-medium leading-relaxed">Pay subscriptions without the heavy overhead. Zero hidden fees on Arc Testnet.</p>
            </div>
            
            <div className="p-8 rounded-3xl bg-[#ffffff]/5 border border-[#ffffff]/10 backdrop-blur-sm hover:border-[#b6f09c]/30 transition-all group">
              <div className="text-5xl font-black italic text-[#ffffff] mb-4 group-hover:text-[#b6f09c] transition-colors">Gasless</div>
              <h4 className="text-lg font-black uppercase italic text-[#ffffff] mb-2 tracking-tighter">Subsidized Fees</h4>
              <p className="text-sm text-[#71717a] font-medium leading-relaxed">Focus on your payments, not the platform costs. Subsidized gas infrastructure for all users.</p>
            </div>
            
            <div className="p-8 rounded-3xl bg-[#ffffff]/5 border border-[#ffffff]/10 backdrop-blur-sm hover:border-[#b6f09c]/30 transition-all group md:col-span-2">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-[#b6f09c]/10 flex items-center justify-center border border-[#b6f09c]/20">
                   <Globe className="h-6 w-6 text-[#b6f09c]" />
                </div>
                <div className="text-4xl font-black italic text-[#ffffff] group-hover:text-[#b6f09c] transition-colors">15+ Chains</div>
              </div>
              <h4 className="text-lg font-black uppercase italic text-[#ffffff] mb-2 tracking-tighter">Native CCTP Integration</h4>
              <p className="text-sm text-[#71717a] font-medium leading-relaxed">No wrapped assets. Move canonical USDC seamlessly between Ethereum, Base, Polygon, and more with 100% asset security.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative w-full bg-[#000000] py-20 px-12 lg:px-20 border-t border-[#ffffff]/10 z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 group cursor-pointer transition-all">
              <Image src="/logo.png" alt="Mecha Pay Logo" width={28} height={28} className="rounded-lg shadow-lg" />
              <span className="text-2xl font-black tracking-tight text-[#ffffff] uppercase italic">Mecha Pay</span>
            </div>
            <p className="text-[#a1a1aa] font-medium leading-relaxed text-sm">
              Web3 subscription platform on Arc Testnet with Circle CCTP bridging and MPC wallets. Currently in testnet phase.
            </p>
            <div className="flex items-center gap-4">
             
              <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-xl border border-[#ffffff]/10 bg-[#ffffff]/5 text-[#a1a1aa] hover:text-[#b6f09c] hover:border-[#b6f09c]/30 hover:bg-[#b6f09c]/5 transition-all">
                <Mail className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-[#ffffff] font-black uppercase text-xs tracking-widest italic">Product</h4>
            <div className="flex flex-col gap-3">
              <Link href="#features" className="text-[#a1a1aa] text-sm font-bold hover:text-[#ffffff] transition-all">Features</Link>
              <Link href="/dashboard/marketplace" className="text-[#a1a1aa] text-sm font-bold hover:text-[#ffffff] transition-all">Marketplace</Link>
              <Link href="/dashboard/plans/create" className="text-[#a1a1aa] text-sm font-bold hover:text-[#ffffff] transition-all">Create Plan</Link>
              <Link href="https://mechapay.mintlify.app/" target="_blank" className="text-[#a1a1aa] text-sm font-bold hover:text-[#ffffff] transition-all">API Reference</Link>

            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-[#ffffff] font-black uppercase text-xs tracking-widest italic">Platform</h4>
            <div className="flex flex-col gap-3">
              <Link href="/dashboard/bridge" className="text-[#a1a1aa] text-sm font-bold hover:text-[#ffffff] transition-all">Bridge</Link>
              <Link href="/dashboard/wallet" className="text-[#a1a1aa] text-sm font-bold hover:text-[#ffffff] transition-all">Wallet</Link>
              <Link href="/dashboard/developer" className="text-[#a1a1aa] text-sm font-bold hover:text-[#ffffff] transition-all">Developer</Link>
              <Link href="/dashboard/admin" className="text-[#a1a1aa] text-sm font-bold hover:text-[#ffffff] transition-all">Admin</Link>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-[#ffffff] font-black uppercase text-xs tracking-widest italic">Resources</h4>
            <div className="flex flex-col gap-3">
              <Link href="https://mechapay.mintlify.app/" target="_blank" className="text-[#a1a1aa] text-sm font-bold hover:text-[#ffffff] transition-all">Documentation</Link>

              <Link href="https://github.com/yourusername/mecha-pay" target="_blank" className="text-[#a1a1aa] text-sm font-bold hover:text-[#ffffff] transition-all">GitHub</Link>
              <Link href="https://api.studio.thegraph.com/query/1704298/mecha-pay/v0.0.8" target="_blank" className="text-[#a1a1aa] text-sm font-bold hover:text-[#ffffff] transition-all">GraphQL API</Link>
              <Link href="https://testnet.arcscan.net/address/0x2BC2f391fca4144f708eEa918d94348684Bdb544" target="_blank" className="text-[#a1a1aa] text-sm font-bold hover:text-[#ffffff] transition-all">Contract Explorer</Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-[#ffffff]/5 gap-6">
          <span className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest">
            © 2026 Mecha Pay Protocol. All rights reserved.
          </span>
          <div className="flex items-center gap-8">
            <span className="text-[#a1a1aa] text-[10px] font-bold uppercase tracking-widest hover:text-[#ffffff] transition-all cursor-not-allowed">Terms (Coming Soon)</span>
            <span className="text-[#a1a1aa] text-[10px] font-bold uppercase tracking-widest hover:text-[#ffffff] transition-all cursor-not-allowed">Privacy (Coming Soon)</span>
          </div>
        </div>
      </footer>

    </div>
  );
}