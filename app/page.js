"use client";
import { ConnectKitButton } from "connectkit";
import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ABI } from './abi'; 

const CONTRACT_ADDRESS = "0x8D5eaB01907A30D2383762A5098EB6D6CD338Cc3";

export default function RWADashboard() {
  const [goldPrice, setGoldPrice] = useState(2350.45);
  const [mounted, setMounted] = useState(false);
  const [history, setHistory] = useState([]);
  const { isConnected, address } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: contractBalance, refetch: refreshBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address }
  });

  const { data: hash, writeContract, isPending: isMintingOnChain, error: mintError } = useWriteContract();
  const { isSuccess: isConfirmed, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed && hash) {
      refreshBalance();
      const newTx = {
        id: hash.slice(0, 10),
        type: "MINT",
        amount: "1.00",
        price: goldPrice,
        time: new Date().toLocaleTimeString(),
        txHash: hash
      };
      setHistory(prev => [newTx, ...prev]);
    }
  }, [isConfirmed, hash]);

  useEffect(() => {
    if (!mounted) return;
    const getPrice = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT');
        const data = await res.json();
        if(data.price) setGoldPrice(parseFloat(data.price).toFixed(2));
      } catch (e) { console.log("Price fetch error"); }
    };
    getPrice();
    const interval = setInterval(getPrice, 10000);
    return () => clearInterval(interval);
  }, [mounted]);

  // FIX: handleMint ko simplified arguments ke sath reset kiya
  const handleMint = async () => {
    if (!isConnected) return alert("Bhai wallet connect karo pehle!");
    
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'mintGold',
        // Agar 18 decimals hain toh ye value 1 Token hai
        // Agar fir bhi error aaye toh sirf BigInt(1) dalkar check karein
        args: [address, BigInt("1000000000000000000")], 
      });
    } catch (err) {
      console.error("Minting failed", err);
    }
  };

  if (!mounted) return null;

  const displayBalance = contractBalance ? (Number(contractBalance) / 1e18).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans selection:bg-yellow-500/30">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/10 blur-[120px] rounded-full"></div>
      </div>

      <nav className="flex justify-between items-center max-w-7xl mx-auto border-b border-white/5 pb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center font-black text-black">X</div>
          <h1 className="text-xl font-black tracking-tighter italic uppercase">XauCore <span className="text-yellow-500 text-sm not-italic font-medium">RWA Portal</span></h1>
        </div>
        <ConnectKitButton />
      </nav>

      <main className="max-w-7xl mx-auto mt-12 pb-20">
        {/* Error Handling UI */}
        {mintError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-mono">
            <span className="font-bold text-red-500 underline">Blockchain Error:</span> {mintError.shortMessage || "Insufficient funds for transfer inside contract logic."}
            <p className="mt-2 text-[10px] opacity-70">Tip: Check if your contract address has enough tokens to mint or if the owner logic is failing.</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <span className="bg-yellow-500/20 text-yellow-500 text-[10px] font-bold px-3 py-1 rounded-full tracking-[0.2em] border border-yellow-500/20 uppercase">LIVE XAU/USD</span>
                <span className="text-zinc-500 text-[10px] font-mono tracking-widest uppercase">Real-Time Oracle</span>
              </div>
              <div className="flex items-baseline gap-4">
                <h2 className="text-7xl font-black tracking-tighter">${goldPrice}</h2>
                <div className="flex flex-col">
                  <span className="text-green-400 font-mono text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span> NETWORK LIVE
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 p-8 rounded-[2.5rem] flex justify-between items-center group transition-all hover:bg-white/[0.04]">
              <div>
                <p className="text-zinc-500 text-xs font-bold tracking-widest uppercase">Verified Vault Balance</p>
                <h3 className="text-4xl font-black text-yellow-500 mt-2">
                    {displayBalance} <span className="text-white/50 text-xl font-light italic uppercase">XAU-T</span>
                </h3>
              </div>
              <div className="text-right">
                <p className="text-zinc-500 text-xs uppercase font-semibold">Net USD Value</p>
                <p className="text-2xl font-black text-zinc-200 mt-1">${(parseFloat(displayBalance) * goldPrice).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/20 to-transparent p-[1px] rounded-[2.5rem]">
            <div className="bg-[#0a0a0a] w-full h-full rounded-[2.45rem] p-8 flex flex-col justify-between min-h-[400px] border border-white/5">
              <div>
                <h3 className="text-2xl font-bold mb-4 italic text-yellow-500">Tokenize Asset</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-light">Mint institutional-grade gold tokens directly to your decentralized vault.</p>
              </div>
              
              <button 
                onClick={handleMint}
                disabled={!isConnected || isMintingOnChain || isConfirming}
                className={`w-full py-5 rounded-2xl font-black text-lg transition-all duration-500 shadow-2xl ${
                  isMintingOnChain || isConfirming ? 'bg-zinc-800 text-zinc-500' : 
                  isConnected ? 'bg-yellow-500 text-black hover:shadow-yellow-500/30 hover:scale-[1.02]' : 
                  'bg-white/5 text-zinc-600 border border-white/5'
                }`}
              >
                {isMintingOnChain ? "CHECK METAMASK..." : isConfirming ? "MINTING..." : isConnected ? "MINT 1.00 GOLD TOKEN" : "CONNECT WALLET"}
              </button>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="mt-12 bg-white/[0.01] border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
          <div className="p-6 border-b border-white/10 bg-white/5">
             <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400">Blockchain Ledger Activity</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-zinc-500 bg-black/40 uppercase text-[9px] tracking-[0.2em] font-black">
                <tr>
                  <th className="p-6">Type</th>
                  <th className="p-6 text-center">Qty</th>
                  <th className="p-6 text-center">Status</th>
                  <th className="p-6 text-right">Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.length > 0 ? (
                  history.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="p-6 font-black text-yellow-500 italic uppercase">{tx.type}</td>
                      <td className="p-6 text-zinc-200 font-bold text-center">{tx.amount} XAU-T</td>
                      <td className="p-6 text-center">
                        <span className="text-[10px] font-black text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">VERIFIED</span>
                      </td>
                      <td className="p-6 text-right font-mono text-[10px] text-zinc-500">
                        <a href={`https://sepolia.etherscan.io/tx/${tx.txHash}`} target="_blank" className="hover:text-yellow-500">
                          {tx.txHash.slice(0, 8)}...
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-16 text-center text-zinc-600 italic tracking-widest text-xs font-light">
                      Awaiting your first asset tokenization...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}