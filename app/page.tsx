'use client';

import { useState } from 'react';
import { Shield, Fingerprint, Activity, Hexagon } from 'lucide-react';
import UploadZone from '@/components/UploadZone';
import ForensicCanvas from '@/components/ForensicCanvas';
import { hashImage } from '@/lib/utils';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';

const ABI = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_imageHash", "type": "bytes32" },
      { "internalType": "uint8", "name": "_trustScore", "type": "uint8" },
      { "internalType": "string", "name": "_metadataURI", "type": "string" }
    ],
    "name": "addRecord",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Target registry address

interface Anomaly {
  label: string;
  confidence: number;
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

interface AnalysisResult {
  trustScore: number;
  summary: string;
  anomalies: Anomaly[];
}

export default function Dashboard() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [imageHashStr, setImageHashStr] = useState<string>('');
  
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const handleImageSelected = async (dataUrl: string) => {
    setImageSrc(dataUrl);
    setResult(null);
    setIsScanning(true);
    
    try {
      const computedHash = await hashImage(dataUrl);
      setImageHashStr(computedHash);

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
      });

      if (!response.ok) {
        throw new Error('Analysis pipeline failure');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSolidify = () => {
    if (!result || !imageHashStr) return;
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'addRecord',
      args: [imageHashStr as `0x${string}`, result.trustScore, 'ipfs://aegis-report-uri'],
    });
  };

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto flex flex-col gap-8 z-10 relative">
      <header className="flex justify-between items-center border-b border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
          <h1 className="text-2xl font-mono font-bold tracking-widest text-cyan-50">
            AEGIS<span className="text-cyan-400">_PROTOCOL</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {!isConnected ? (
             <div className="px-4 py-2 border border-cyan-900 bg-cyan-950/30 text-cyan-400 font-mono text-sm rounded shadow-[0_0_10px_rgba(8,145,178,0.2)]">
               SYS.OFFLINE // CONNECT_WALLET
             </div>
          ) : (
             <div className="px-4 py-2 border border-green-900 bg-green-950/30 text-green-400 font-mono text-sm rounded shadow-[0_0_10px_rgba(22,163,74,0.2)]">
               ID: {address?.slice(0, 6)}...{address?.slice(-4)}
             </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-gray-950/60 backdrop-blur-md border border-gray-800 rounded-xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-900 via-cyan-400 to-cyan-900 opacity-50" />
            <h2 className="text-sm font-mono text-gray-400 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> VISUAL_FEED
            </h2>
            {!imageSrc ? (
              <UploadZone onImageSelected={handleImageSelected} />
            ) : (
              <ForensicCanvas 
                imageSrc={imageSrc} 
                anomalies={result?.anomalies || []} 
                isScanning={isScanning} 
              />
            )}
          </div>
        </section>

        <aside className="flex flex-col gap-6">
          <div className="bg-gray-950/60 backdrop-blur-md border border-gray-800 rounded-xl p-6 shadow-2xl min-h-[500px] flex flex-col relative overflow-hidden">
            <h2 className="text-sm font-mono text-gray-400 mb-4 flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-cyan-400" /> FORENSIC_REPORT
            </h2>
            
            <AnimatePresence mode="wait">
              {!imageSrc ? (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center justify-center text-gray-600 font-mono text-sm">
                  WAITING_FOR_UPLINK...
                </motion.div>
              ) : isScanning ? (
                <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-cyan-400 font-mono text-sm gap-4">
                  <Hexagon className="w-12 h-12 animate-[spin_3s_linear_infinite]" />
                  EXTRACTING_GEOMETRY...
                </motion.div>
              ) : result ? (
                <motion.div key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6 font-mono h-full">
                  <div className="flex justify-between items-end border-b border-gray-800 pb-4">
                    <span className="text-xs text-gray-500">TRUST_SCORE</span>
                    <span className={`text-5xl font-bold ${result.trustScore > 80 ? 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]' : result.trustScore > 40 ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}>
                      {result.trustScore}%
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-gray-500">EXECUTIVE_SUMMARY</span>
                    <p className="text-xs text-gray-300 leading-relaxed bg-gray-900/50 p-3 rounded border border-gray-800">
                      {result.summary}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 flex-1">
                    <span className="text-xs text-gray-500">VECTORS_DETECTED: {result.anomalies.length}</span>
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {result.anomalies.map((anom, idx) => (
                        <div key={idx} className="bg-red-950/20 border border-red-900/50 rounded p-3 text-xs flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="text-red-400 font-bold uppercase">{anom.label}</span>
                            <span className="text-red-500 bg-red-950/50 px-2 py-0.5 rounded">{anom.confidence}%</span>
                          </div>
                          <span className="text-gray-500 text-[10px]">
                            COORDS: [{anom.xMin.toFixed(2)}, {anom.yMin.toFixed(2)}] - [{anom.xMax.toFixed(2)}, {anom.yMax.toFixed(2)}]
                          </span>
                        </div>
                      ))}
                      {result.anomalies.length === 0 && (
                        <div className="text-green-400 text-xs border border-green-900/50 bg-green-950/20 p-3 rounded">
                          ALL_GEOMETRY_NOMINAL. NO_MANIPULATION_DETECTED.
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={handleSolidify}
                    disabled={isPending || isConfirming} // Disabled condition adjusted for demonstration
                    className="mt-auto w-full py-4 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 font-bold tracking-widest text-sm rounded transition-all hover:shadow-[0_0_20px_rgba(8,145,178,0.6)] disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <span className="group-hover:text-cyan-100 transition-colors">
                      {isPending ? 'BROADCASTING...' : isConfirming ? 'MINING_BLOCK...' : isConfirmed ? 'IMMUTABLE_RECORD_CREATED' : 'SOLIDIFY_ON_CHAIN'}
                    </span>
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </aside>
      </div>
    </main>
  );
}
