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
            Mecha Pay fundamentally redesigns the payment stack by uniting institutional-grade custody with sub-second finality. Enjoy zero-friction global operations with natively subsidized gas fees and built-in cross-chain swapping protocols.
          </p>
          <div className="grid grid-cols-2 gap-6 mt-8">
             <div className="flex flex-col gap-2">
                <span className="text-3xl font-black italic text-[#ffffff]">15+</span>
                <span className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest">Supported Chains</span>
             </div>
             <div className="flex flex-col gap-2">
                <span className="text-3xl font-black italic text-[#ffffff]">100%</span>
                <span className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest">MPC Covered</span>
             </div>
          </div>
        </div>

        <div className="flex-1 w-full flex items-center justify-center relative h-[600px] pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-[#b6f09c]/5 to-[#3b82f6]/5 rounded-full blur-3xl opacity-50 z-0" />
          
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
              <Card className="bg-[#000000]/80 border border-[#3b82f6]/30 backdrop-blur-xl shadow-2xl shadow-[#3b82f6]/10 rounded-2xl flex flex-col justify-between p-6">
                <div className="flex justify-between items-center text-[#ffffff]">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#3b82f6]"/> 
                    <span className="text-xs font-black uppercase tracking-widest italic">MPC Security</span>
                  </div>
                  <span className="text-xs font-bold text-[#3b82f6] bg-[#3b82f6]/10 px-2 py-1 rounded-md">Audited</span>
                </div>
                <div>
                  <div className="text-[#a1a1aa] text-[10px] font-bold uppercase tracking-widest mb-1">Protection</div>
                  <div className="text-4xl font-black italic tracking-tighter text-[#ffffff]">100<span className="text-xl text-[#3b82f6]">%</span></div>
                </div>
              </Card>
              <Card className="bg-[#000000]/80 border border-[#f59e0b]/30 backdrop-blur-xl shadow-2xl shadow-[#f59e0b]/10 rounded-2xl flex flex-col justify-between p-6">
                <div className="flex justify-between items-center text-[#ffffff]">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#f59e0b]"/> 
                    <span className="text-xs font-black uppercase tracking-widest italic">Gas Subsidized</span>
                  </div>
                  <span className="text-xs font-bold text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-1 rounded-md">Wrapped</span>
                </div>
                <div>
                  <div className="text-[#a1a1aa] text-[10px] font-bold uppercase tracking-widest mb-1">Transaction Fee</div>
                  <div className="text-4xl font-black italic tracking-tighter text-[#ffffff]">$0.<span className="text-xl text-[#f59e0b]">00</span></div>
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
              ✔ Installed mecha-pay@latest
            </AnimatedSpan>
            <AnimatedSpan delay={2000} className="text-[#3b82f6] font-mono block">
              ✔ Added peer dependencies: react, next
            </AnimatedSpan>
            
            <TypingAnimation delay={3000} duration={30} className="text-[#a1a1aa] font-mono mt-6 block">
              &gt; cat components/Billing.tsx
            </TypingAnimation>
            
            <AnimatedSpan delay={4000} className="text-[#ffffff] font-mono mt-2 block whitespace-pre-wrap leading-relaxed">
              <span className="text-[#f59e0b]">import</span> {'{'} PricingTable {'}'} <span className="text-[#f59e0b]">from</span> "mecha-pay";
              <br/><br/>
              <span className="text-[#f59e0b]">export default function</span> <span className="text-[#3b82f6]">Billing</span>() {'{'}
              <br/>
              {'  '}<span className="text-[#f59e0b]">return</span> (
              <br/>
              {'    '}&lt;<span className="text-[#b6f09c]">PricingTable</span> 
              <br/>
              {'      '}merchantId=<span className="text-[#b6f09c]">"your-id"</span> 
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
          <div className="px-4 py-2 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-full w-fit">
            <span className="text-[#3b82f6] text-[10px] font-bold uppercase tracking-widest">Developer SDK</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-[#ffffff]">
            Embed Your <br/><span className="text-[#3b82f6]">Checkout.</span>
          </h2>
          <p className="text-[#a1a1aa] font-medium leading-relaxed text-lg mt-4">
            Mecha Pay isn't just a dashboard. We provide a robust <span className="text-[#ffffff] font-bold">NPM package</span> that lets you drop beautifully designed crypto pricing tables directly into your own website with a few lines of code. 
          </p>
          <p className="text-[#a1a1aa] font-medium leading-relaxed text-lg mt-2">
            The <span className="font-mono text-[#b6f09c] text-sm bg-[#b6f09c]/10 px-2 py-1 rounded">PricingTable</span> component automatically syncs with the subscription plans you configure in your dashboard. Zero backend integration required.
          </p>
          <div className="flex gap-4 mt-6">
            <Link href="/docs" className="h-12 px-8 flex items-center justify-center rounded-xl bg-[#3b82f6] text-[#ffffff] font-black text-xs uppercase shadow-xl shadow-[#3b82f6]/20 transition-all hover:opacity-90">
              Read Documentation <ArrowUpRight className="ml-2 h-4 w-4 stroke-[3px]" />
            </Link>
          </div>
        </div>
      </section>

      <ApiShowcase />

      {/* Multi-Chain Bridge Showcase Section */}

      <section id="bridge" className="relative w-full bg-[#000000] py-32 px-12 lg:px-20 z-20 border-t border-[#ffffff]/5 overflow-hidden">
        {/* Subtle Institutional Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#3b82f6]/5 to-transparent pointer-events-none" />
        
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

      {/* Footer */}
      <footer className="relative w-full bg-[#000000] py-20 px-12 lg:px-20 border-t border-[#ffffff]/10 z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 group cursor-pointer transition-all">
              <Image src="/logo.png" alt="Mecha Pay Logo" width={28} height={28} className="rounded-lg shadow-lg" />
              <span className="text-2xl font-black tracking-tight text-[#ffffff] uppercase italic">Mecha Pay</span>
            </div>
            <p className="text-[#a1a1aa] font-medium leading-relaxed text-sm">
              The unified standard for modern on-chain payments. Zero gas friction, institutional security, and instant global finality on ARC.
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
              <Link href="#" className="text-[#a1a1aa] text-sm font-bold hover:text-[#ffffff] transition-all">Features</Link>
              <Link href="#" className="text-[#a1a1aa] text-sm font-bold hover:text-[#ffffff] transition-all">Pricing</Link>
              <Link href="#" className="text-[#a1a1aa] text-sm font-bold hover:text-[#ffffff] transition-all">Integration</Link>
              <Link href="#" className="text-[#a1a1aa] text-sm font-bold hover:text-[#ffffff] transition-all">API Reference</Link>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-[#ffffff] font-black uppercase text-xs tracking-widest italic">Protocol</h4>
            <div className="flex flex-col gap-3">
              <Link href="#" className="text-[#a1a1aa] text-sm font-bold hover:text-[#ffffff] transition-all">Whitepaper</Link>
              <Link href="#" className="text-[#a1a1aa] text-sm font-bold hover:text-[#ffffff] transition-all">Smart Contracts</Link>
              <Link href="#" className="text-[#a1a1aa] text-sm font-bold hover:text-[#ffffff] transition-all">Security Audit</Link>
              <Link href="#" className="text-[#a1a1aa] text-sm font-bold hover:text-[#ffffff] transition-all">Governance</Link>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-[#ffffff] font-black uppercase text-xs tracking-widest italic">Resources</h4>
            <div className="flex flex-col gap-3">
              <Link href="#" className="text-[#a1a1aa] text-sm font-bold hover:text-[#ffffff] transition-all">Documentation</Link>
              <Link href="#" className="text-[#a1a1aa] text-sm font-bold hover:text-[#ffffff] transition-all">Tutorials</Link>
              <Link href="#" className="text-[#a1a1aa] text-sm font-bold hover:text-[#ffffff] transition-all">Community</Link>
              <Link href="#" className="text-[#a1a1aa] text-sm font-bold hover:text-[#ffffff] transition-all">Support</Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-[#ffffff]/5 gap-6">
          <span className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest">
            © 2026 Mecha Pay Protocol. All rights reserved.
          </span>
          <div className="flex items-center gap-8">
            <Link href="#" className="text-[#a1a1aa] text-[10px] font-bold uppercase tracking-widest hover:text-[#ffffff] transition-all">Privacy Policy</Link>
            <Link href="#" className="text-[#a1a1aa] text-[10px] font-bold uppercase tracking-widest hover:text-[#ffffff] transition-all">Terms of Service</Link>
            <Link href="#" className="text-[#a1a1aa] text-[10px] font-bold uppercase tracking-widest hover:text-[#ffffff] transition-all">Cookie Settings</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}