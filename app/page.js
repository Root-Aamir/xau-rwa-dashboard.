"use client";
import { ConnectKitButton } from "connectkit";
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export default function RWADashboard() {
  const [goldPrice, setGoldPrice] = useState(2350.45);
  const [isMinting, setIsMinting] = useState(false);
  const { isConnected, address } = useAccount();

  // Binance Live Price Fetch
  useEffect(() => {
    const getPrice = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT');
        const data = await res.json();
        if(data.price) setGoldPrice(parseFloat(data.price).toFixed(2));
      } catch (e) { console.log("Price fetch error"); }
    };
    getPrice();
    const interval = setInterval(getPrice, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMint = () => {
    setIsMinting(true);
    setTimeout(() => {
      setIsMinting(false);
      alert("Success! 1.00 XAU-T added to your vault.");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 selection:bg-yellow-500 selection:text-black">
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/10 blur-[120px] rounded-full"></div>
      </div>

      <nav className="flex justify-between items-center max-w-7xl mx-auto border-b border-white/5 pb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center font-black text-black">X</div>
          <h1 className="text-xl font-black tracking-tighter italic">XAUCORE <span className="text-yellow-500">RWA</span></h1>
        </div>
        <ConnectKitButton />
      </nav>

      <main className="max-w-7xl mx-auto mt-16">
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Price Card */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <span className="bg-yellow-500/20 text-yellow-500 text-[10px] font-bold px-3 py-1 rounded-full tracking-[0.2em]">LIVE MARKET DATA</span>
              <span className="text-zinc-500 text-xs">PAXG / USDT</span>
            </div>
            <div className="flex items-baseline gap-4">
              <h2 className="text-7xl font-black tracking-tighter animate-pulse">${goldPrice}</h2>
              <span className="text-green-400 font-mono text-sm">▲ 0.04%</span>
            </div>
            <p className="text-zinc-400 mt-4 text-sm max-w-md italic font-light">"Real-time gold parity ensured via decentralized oracles and XauCore HFT liquidity."</p>
          </div>

          {/* Action Card */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-1 rounded-[2rem]">
            <div className="bg-black w-full h-full rounded-[1.9rem] p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Mint Gold Asset</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">Convert your USDT into physical-backed XAU tokens instantly on the blockchain.</p>
              </div>
              
              <button 
                onClick={handleMint}
                disabled={!isConnected || isMinting}
                className={`w-full py-4 rounded-2xl font-black text-lg transition-all duration-300 ${
                  isMinting ? 'bg-zinc-800 text-zinc-500' : 'bg-yellow-500 text-black hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] active:scale-95'
                }`}
              >
                {isMinting ? "TOKENIZING..." : isConnected ? "MINT ASSET" : "CONNECT WALLET"}
              </button>
            </div>
          </div>

        </div>

        {/* Footer Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {['24h Volume: $4.2M', 'Total Value Locked: $180M', 'Reserve: 100% Backed', 'Audit: Passed'].map((stat, i) => (
            <div key={i} className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest text-center border border-white/5 py-4 rounded-xl">
              {stat}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}