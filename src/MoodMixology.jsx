import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, RefreshCw, Download, X, Loader2, UtensilsCrossed, ChefHat, Flame, Sparkles, Smile, Wine, ArrowLeft, ChevronDown } from 'lucide-react';

// --- 全局配置 ---
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; // 在此处填入 API Key
const API_BASE_URL = "/api/proxy";

// ==========================================
// 🍷 模块一：Mood Mixology (微醺调酒)
// ==========================================

// 调酒数据
const FALLBACK_COCKTAILS = [
  {
    name: "Midnight Echo", cnName: "午夜回声",
    liquidColor: "linear-gradient(180deg, rgba(30, 41, 59, 0.9) 0%, rgba(71, 85, 105, 0.95) 100%)",
    desc: "沉入海底的那句叹息，化作舌尖的冷冽。",
    base: "金酒", mid: "白桃", top: "薄荷",
    analysis: { base: "金酒的冷冽，回应你内心的静默时刻。", mid: "白桃的清甜，是记忆中模糊的温柔。", top: "薄荷带来的清凉，试图冲破此刻的压抑。" }
  },
  {
    name: "Velvet Sunset", cnName: "天鹅绒日落",
    liquidColor: "linear-gradient(180deg, rgba(154, 52, 18, 0.9) 0%, rgba(255, 166, 158, 0.85) 100%)",
    desc: "将笑意酿成晚霞，余温尚存。",
    base: "朗姆", mid: "玫瑰", top: "西柚",
    analysis: { base: "温润的陈年朗姆，呼应你原本昂扬的情绪。", mid: "玫瑰的馥郁，是对美好瞬间的留恋。", top: "西柚的微苦，是成熟后的清醒与克制。" }
  },
  {
    name: "Emerald Dream", cnName: "翡翠梦境",
    liquidColor: "linear-gradient(180deg, rgba(6, 78, 59, 0.9) 0%, rgba(52, 211, 153, 0.8) 100%)",
    desc: "迷失在雨后的森林，呼吸着潮湿的苔藓。",
    base: "伏特加", mid: "青柠", top: "罗勒",
    analysis: { base: "纯净的伏特加，让一切归于原本的空白。", mid: "青柠的酸涩，刺激着麻木的感官。", top: "罗勒的草本香气，带你逃离城市的喧嚣。" }
  }
];

// 调酒 API 逻辑
const analyzeCocktailMood = async (text) => {
  if (!apiKey) {
    console.log("未检测到 API Key，使用离线模式。");
    await new Promise(r => setTimeout(r, 2000));
    return FALLBACK_COCKTAILS[Math.floor(Math.random() * FALLBACK_COCKTAILS.length)];
  }

  const prompt = `
    Role: Expert Mixologist.
    Task: Create a unique cocktail based on the user's mood.
    User Mood: "${text}"
    REQUIREMENTS:
    1. Output VALID JSON ONLY. No markdown.
    2. Language: Simplified Chinese for ALL fields.
    JSON SCHEMA:
    {
      "name": "String (English Name)",
      "cnName": "String (Creative Chinese Name)",
      "liquidColor": "String (CSS linear-gradient e.g. 'linear-gradient(180deg, red 0%, black 100%)')",
      "base": "String (Base Spirit)",
      "mid": "String (Middle Note)",
      "top": "String (Garnish/Top Note)",
      "desc": "String (Poetic description)",
      "analysis": { "base": "String", "mid": "String", "top": "String" }
    }
  `;
  
  const url = `${API_BASE_URL}?key=${apiKey}`;
  let delay = 1000;
  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch(url, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.8, maxOutputTokens: 1024 } }),
      });
      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
      }
    } catch (error) { console.error(error); }
    await new Promise(r => setTimeout(r, delay)); delay *= 2;
  }
  return FALLBACK_COCKTAILS[Math.floor(Math.random() * FALLBACK_COCKTAILS.length)];
};

// --- 调酒视觉组件 ---

const MixologyBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden bg-[#080808]">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, background: 'radial-gradient(circle at 50% 120%, #1e1b4b 0%, #000000 80%)' }} transition={{ duration: 2 }} className="absolute inset-0" />
    <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }} />
    <motion.div animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
  </div>
);

const Jigger = ({ isVisible }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div key="jigger-actor" initial={{ y: -400, opacity: 0, rotate: 0 }} animate={{ y: [-400, 75, 75, 75, -400], rotate: [0, 0, -115, -115, 0], opacity: [0, 1, 1, 1, 0] }} exit={{ y: -400, opacity: 0, rotate: 0, transition: { duration: 0.8, ease: "easeInOut" } }} transition={{ duration: 4.5, times: [0, 0.2, 0.3, 0.85, 1], ease: "easeInOut" }} className="absolute left-1/2 z-50 pointer-events-none" style={{ top: 0, marginLeft: '15px', transformOrigin: 'top left' }}>
        <div className="relative transform -rotate-12 scale-90">
           <div className="w-10 h-14" style={{ background: 'linear-gradient(90deg, #444, #eee, #666)', clipPath: 'polygon(0 0, 100% 0, 75% 100%, 25% 100%)', boxShadow: 'inset 0 0 8px rgba(0,0,0,0.8)' }} />
           <div className="w-5 h-2 bg-[#888] mx-auto -mt-[1px]" />
           <div className="w-8 h-10 mx-auto -mt-[1px]" style={{ background: 'linear-gradient(90deg, #333, #ccc, #444)', clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0 100%)' }} />
           <div className="absolute top-0 left-3 w-[1px] h-full bg-white/40 blur-[1px]" />
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const PremiumStream = ({ isVisible }) => (
    <AnimatePresence>
        {isVisible && (
            <div className="absolute left-1/2 -translate-x-1/2 origin-top" style={{ top: '-35px' }}>
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "280px", opacity: 0.4 }} exit={{ height: 0, opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }} transition={{ delay: 1.5, duration: 0.5 }} className="absolute left-1/2 -translate-x-1/2 w-[10px] blur-[4px] bg-white/40" />
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "280px", opacity: 0.95 }} exit={{ height: 0, opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }} transition={{ delay: 1.5, duration: 0.5, ease: "circIn" }} className="relative overflow-hidden w-[3.5px] rounded-[2px]" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.4), rgba(255,255,255,1) 50%, rgba(255,255,255,0.4))', boxShadow: '0 0 5px rgba(255,255,255,0.3)' }}>
                        <motion.div className="absolute inset-0 w-full h-[300%]" style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.7) 10%, transparent 20%)', backgroundSize: '100% 80px' }} animate={{ y: [0, 180] }} transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }} />
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

const MartiniGlass = ({ mixingPhase, inputLength, cocktailData }) => {
  const liquidHeight = cocktailData ? 82 : (mixingPhase === 'pouring' || mixingPhase === 'filled' ? 60 : (mixingPhase === 'shaking' ? 70 : (mixingPhase === 'settling' ? 75 : Math.min(30 + inputLength * 0.5, 90))));
  const currentLiquidColor = cocktailData?.liquidColor || (mixingPhase === 'idle' ? 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)' : 'linear-gradient(180deg, rgba(200,200,255,0.2) 0%, rgba(150,150,255,0.3) 100%)');

  return (
    <div className="relative w-full h-[380px] flex items-end justify-center perspective-[1000px] group">
      <div className="absolute bottom-0 w-24 h-4 bg-white/5 blur-xl opacity-30 rounded-full scale-x-150" />
      <div className="absolute top-0 left-0 w-full h-full z-40 pointer-events-none"><Jigger isVisible={mixingPhase === 'pouring'} /></div>
      <motion.div className="relative z-20 flex flex-col items-center origin-bottom" animate={mixingPhase === 'shaking' ? { rotate: [0, -6, 0, 6, 0], x: [0, -4, 0, 4, 0], y: [0, 2, 0, 2, 0] } : { rotate: 0, x: 0, y: 0 }} transition={mixingPhase === 'shaking' ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.8, ease: "easeOut" }}>
        <div className="relative w-64 h-32 z-30">
            <div className="absolute inset-0 z-40 pointer-events-none" style={{ clipPath: 'polygon(-100% -1000%, 200% -1000%, 100% 0%, 50% 100%, 0% 0%)' }}><PremiumStream isVisible={mixingPhase === 'pouring'} /></div>
            <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-[1px]" />
                <motion.div className="absolute bottom-0 left-0 w-full z-10 flex items-end justify-center" initial={{ height: "5%" }} animate={{ height: `${liquidHeight}%` }} transition={{ height: { type: "spring", stiffness: 20, damping: 20 } }}>
                    <motion.div className="w-full h-full relative" style={{ background: currentLiquidColor }}>
                        {(mixingPhase !== 'idle' || cocktailData) && Array.from({ length: 10 }).map((_, i) => (
                            <motion.div key={i} className="absolute bg-white/40 rounded-full" style={{ width: 1.2, height: 1.2, left: `${Math.random() * 100}%`, top: '100%' }} animate={{ y: [0, -200], opacity: [0, 0.6, 0] }} transition={{ duration: 3, repeat: Infinity, delay: Math.random() * 2, ease: "linear" }} />
                        ))}
                        {mixingPhase === 'pouring' && <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-3 bg-white/30 blur-md rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 0.6, repeat: Infinity }} />}
                        <motion.div className="absolute top-0 w-full h-[4px] bg-white/20" style={{ borderRadius: '100%' }} animate={mixingPhase === 'shaking' ? { rotate: [0, 6, 0, -6, 0], scaleX: [1, 1.1, 1] } : { rotate: 0, scaleX: 1 }} transition={mixingPhase === 'shaking' ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.5 }} />
                    </motion.div>
                </motion.div>
            </div>
            <div className="absolute inset-0 z-40 pointer-events-none" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }}>
                 <div className="absolute top-0 right-10 w-[2px] h-full bg-gradient-to-b from-white/30 to-transparent rotate-[26deg] blur-[1px] opacity-40" />
                 <div className="absolute top-0 w-full h-[1px] bg-white/40 opacity-50" />
            </div>
        </div>
        <div className="relative w-[1.5px] h-32 bg-gradient-to-r from-white/10 via-white/30 to-white/10 backdrop-blur-sm z-20" />
        <div className="relative w-20 h-2 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-sm rounded-[100%] border-t border-white/10 z-20 shadow-lg mt-[-1px]" />
      </motion.div>
    </div>
  );
};

const PoeticLoader = ({ step }) => (
    <div className="flex flex-col items-center gap-6 min-h-[60px]">
        <div className="flex gap-2">
            {[0, 1, 2].map(i => <motion.div key={i} className="w-1 h-1 bg-white/80 rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }} />)}
        </div>
        <AnimatePresence mode="wait">
            <motion.p key={step} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-sm font-premium text-white/70 tracking-[0.2em] font-light italic text-center">{step}</motion.p>
        </AnimatePresence>
    </div>
);

const ShareCocktailModal = ({ isOpen, onClose, cocktail, captureRef }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (!window.html2canvas) { const script = document.createElement('script'); script.src = 'https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js'; document.body.appendChild(script); }
        } else { document.body.style.overflow = ''; }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleGeneratePoster = async () => {
        if (!window.html2canvas || !captureRef.current) return;
        setIsGenerating(true);
        try {
            const canvas = await window.html2canvas(captureRef.current, { backgroundColor: '#050505', scale: 2, useCORS: true, logging: false, onclone: (clonedDoc) => { const buttons = clonedDoc.querySelectorAll('button'); buttons.forEach(b => b.style.display = 'none'); } });
            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a'); link.href = image; link.download = `MoodLab-${cocktail.name.replace(/\s+/g, '-')}.png`; document.body.appendChild(link); link.click(); document.body.removeChild(link);
            setTimeout(() => { setIsGenerating(false); onClose(); }, 500);
        } catch (error) { console.error(error); setIsGenerating(false); }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" />
                    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed bottom-0 left-0 w-full z-[70] bg-[#1a1a1a] rounded-t-3xl border-t border-white/10 p-8 pb-12">
                        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-8" />
                        <div className="flex justify-between items-center mb-8"><h3 className="text-xl font-title italic text-white tracking-widest">保存回忆</h3><button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><X size={16} className="text-white/60" /></button></div>
                        <button onClick={handleGeneratePoster} disabled={isGenerating} className="w-full flex items-center justify-center gap-3 bg-white text-black hover:bg-gray-200 py-4 rounded-full transition-all active:scale-95 group font-bold tracking-widest uppercase text-xs">
                            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                            {isGenerating ? "正在显影..." : "生成海报"}
                        </button>
                        <p className="text-center text-[10px] text-white/30 mt-6 tracking-[0.2em] font-premium">将这份情绪特调永久珍藏</p>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const ScrollIndicator = ({ visible }) => (
    <AnimatePresence>
        {visible && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, y: [0, 5, 0] }} exit={{ opacity: 0 }} transition={{ opacity: { duration: 0.5 }, y: { duration: 2, repeat: Infinity, ease: "easeInOut" } }} className="fixed bottom-8 left-0 w-full flex flex-col items-center justify-center z-50 pointer-events-none">
                <div className="flex flex-col items-center gap-2"><span className="text-[10px] tracking-[0.3em] uppercase font-premium" style={{ color: 'rgba(255, 255, 255, 0.95)', textShadow: '0 0 8px rgba(100, 200, 255, 0.8), 0 0 15px rgba(100, 200, 255, 0.5)' }}>下滑 · 阅览心绪特调</span><ChevronDown size={18} style={{ color: 'rgba(255, 255, 255, 0.9)', filter: 'drop-shadow(0 0 5px rgba(100, 200, 255, 0.8))' }} /></div>
            </motion.div>
        )}
    </AnimatePresence>
);

const MoodMixologyApp = ({ onBack }) => {
  const [appState, setAppState] = useState('input');
  const [inputText, setInputText] = useState('');
  const [cocktail, setCocktail] = useState(null);
  const [analysisStep, setAnalysisStep] = useState('');
  const [mixingPhase, setMixingPhase] = useState('idle');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const glassRef = useRef(null);
  const posterRef = useRef(null); 

  useEffect(() => {
      if (appState === 'result') {
          setShowScrollHint(true);
          const handleScroll = () => { if (window.scrollY > 50) setShowScrollHint(false); };
          window.addEventListener('scroll', handleScroll);
          return () => window.removeEventListener('scroll', handleScroll);
      } else { setShowScrollHint(false); }
  }, [appState]);

  const handleStartMixing = async () => {
    if (!inputText.trim()) return;
    if (glassRef.current) glassRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setAppState('analyzing');
    setMixingPhase('pouring');
    setAnalysisStep("萃取思绪杂质...");
    
    const apiCall = analyzeCocktailMood(inputText);
    await new Promise(r => setTimeout(r, 4250)); 
    setTimeout(() => setMixingPhase('idle'), 100); 
    await new Promise(r => setTimeout(r, 750)); 

    setMixingPhase('shaking');
    setAnalysisStep("感知情绪基调...");
    const minShaking = new Promise(r => setTimeout(r, 4000));
    const [result] = await Promise.all([apiCall, minShaking]);

    setMixingPhase('settling');
    setAnalysisStep("平衡风味层次...");
    await new Promise(r => setTimeout(r, 1500));

    setAnalysisStep("正在斟酒...");
    setCocktail(result);
    setAppState('result');
    setMixingPhase('idle');
  };

  const handleReset = () => {
    setAppState('input');
    setInputText('');
    setCocktail(null);
    setMixingPhase('idle');
    setShowShareModal(false);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#050505] text-white font-premium flex flex-col items-center">
      <MixologyBackground />
      <div className="absolute top-6 left-6 z-50">
        <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs tracking-widest uppercase"><ArrowLeft size={14}/> Back</button>
      </div>
      <div ref={posterRef} className="w-full flex flex-col items-center bg-[#050505]"> 
          <header className="w-full flex flex-col items-center pt-20 pb-2 shrink-0 z-40">
              <div className="flex flex-col gap-2 items-center">
                <span className="text-xl italic text-white/90 font-title tracking-[0.2em]">Mood Lab.</span>
                <div className="w-8 h-px bg-white/20" />
                <span className="text-[9px] tracking-[0.3em] text-white/30 uppercase font-premium" style={{ letterSpacing: '0.3em' }}>AI Mixology</span>
              </div>
          </header>

          <main className="w-full max-w-md px-6 pb-32 flex-1 flex flex-col items-center relative z-20">
            <div ref={glassRef} className="w-full flex items-center justify-center relative shrink-0 -mt-8">
                <MartiniGlass mixingPhase={mixingPhase} inputLength={inputText.length} cocktailData={cocktail} />
            </div>

            <div className="w-full flex flex-col items-center justify-start min-h-[240px] relative z-30">
                <AnimatePresence mode="wait">
                {appState === 'input' && (
                    <motion.div key="input" className="w-full flex flex-col items-center gap-8">
                        <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (inputText.trim()) handleStartMixing(); } }} placeholder="请以此刻心绪入酒..." className="w-full bg-transparent border-b border-white/20 py-4 text-center text-xl text-white/90 placeholder:text-white/20 placeholder:italic outline-none h-24 resize-none font-title italic transition-colors focus:border-white/50" />
                        <motion.button onClick={handleStartMixing} disabled={!inputText.trim()} className="px-12 py-4 rounded-sm font-title italic tracking-[0.2em] text-sm border border-white/30 uppercase bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.15)] disabled:bg-transparent disabled:text-white/50">
                            开启特调
                        </motion.button>
                    </motion.div>
                )}
                {appState === 'analyzing' && <motion.div key="loader" className="w-full"><PoeticLoader step={analysisStep} /></motion.div>}
                {appState === 'result' && cocktail && (
                    <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full flex flex-col items-center text-center">
                        <h2 className="text-3xl font-title italic text-white mb-2">{cocktail.cnName}</h2>
                        <p className="text-[10px] text-white/50 uppercase tracking-[0.4em] mb-8">{cocktail.name}</p>
                        <p className="text-base font-title italic text-white/80 leading-loose mb-12 italic px-4">“{cocktail.desc}”</p>
                        <div className="w-full flex flex-col gap-8 text-left px-4">
                            {[{ label: '基底', val: cocktail.base, desc: cocktail.analysis.base }, { label: '前韵', val: cocktail.top, desc: cocktail.analysis.top }, { label: '主调', val: cocktail.mid, desc: cocktail.analysis.mid }].map((item, i) => (
                                <div key={i} className="border-l border-white/10 pl-6 py-1">
                                    <span className="text-[10px] text-white/30 uppercase block mb-1">{item.label}</span>
                                    <span className="text-xl font-title italic text-white/90 block mb-1">{item.val}</span>
                                    <p className="text-sm text-white/60 font-light leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-10 mt-16 w-full justify-center pb-8">
                            <button onClick={() => setShowShareModal(true)} className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-white/50 hover:text-white transition-colors uppercase border-b border-transparent hover:border-white/40 pb-1 font-premium" style={{ letterSpacing: '0.2em' }}>
                                <Share2 size={14} /> 分享此刻
                            </button>
                            <button onClick={handleReset} className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-white/50 hover:text-white transition-colors uppercase border-b border-transparent hover:border-white/40 pb-1 font-premium" style={{ letterSpacing: '0.2em' }}>
                                <RefreshCw size={14} /> 再续一杯
                            </button>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
          </main>
      </div>
      <ScrollIndicator visible={showScrollHint} />
      <ShareCocktailModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} cocktail={cocktail} captureRef={posterRef} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,400;1,500&family=Noto+Serif+SC:wght@200;300;400&display=swap');
        .font-premium { font-family: 'Noto Serif SC', serif; }
        .font-title { font-family: 'Cormorant Garamond', serif; }
        textarea { caret-color: white; }
      `}</style>
    </div>
  );
}

// ==========================================
// 🍛 模块二：Mood Dining (暖心食堂)
// ==========================================

const FALLBACK_DISHES = [
  {
    name: "Midnight Ramen", cnName: "猫咪暖暖拉面", themeColor: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    desc: "像被一只毛茸茸的大猫抱住，呼噜呼噜地治愈你的疲惫。",
    main: "豚骨汤", side: "溏心蛋", garnish: "鸣门卷",
    imagePrompt: "cute ramen bowl with cat ears, soft boiled egg, naruto fish cake, steam, kawaii, chibi style, flat vector illustration, simple colors, white background, thick outlines, sticker style",
    analysis: { main: "浓郁的汤底，把心里的洞填得满满当当。", side: "流心的蛋黄，是生活里的小确幸。", garnish: "可爱的鱼板，提醒你保持童心。" }
  },
  {
    name: "Cloudy Congee", cnName: "云朵绵绵粥", themeColor: "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)",
    desc: "把烦恼都熬化了，只剩下软乎乎的温柔。",
    main: "香米", side: "干贝", garnish: "葱花",
    imagePrompt: "cute white rice porridge bowl, steam shaped like clouds, kawaii, chibi style, flat vector illustration, pastel colors, simple, white background, thick outlines, sticker style",
    analysis: { main: "米香扑鼻，带你回到小时候的午后。", side: "藏在粥里的鲜甜，是给你的惊喜。", garnish: "一点点翠绿，心情也跟着亮起来。" }
  },
  {
    name: "Happy Mapo Tofu", cnName: "元气麻婆豆腐", themeColor: "linear-gradient(135deg, #f87171 0%, #ef4444 100%)",
    desc: "热辣辣的一口下去，把所有的不开心都吓跑啦！",
    main: "嫩豆腐", side: "肉酱", garnish: "花椒",
    imagePrompt: "cute spicy tofu dish, red cubes, happy face, kawaii, chibi style, flat vector illustration, vibrant colors, simple, white background, thick outlines, sticker style",
    analysis: { main: "软嫩的豆腐，却有火热的内心。", side: "香喷喷的肉酱，让满足感爆棚。", garnish: "酥酥麻麻的感觉，唤醒你的能量。" }
  }
];

const preloadImage = (src, timeout = 30000) => {
    return new Promise((resolve) => {
        const img = new Image();
        let timer;
        const done = (success) => { clearTimeout(timer); resolve(success); };
        timer = setTimeout(() => { console.warn("图片加载超时"); done(false); }, timeout);
        img.src = src;
        img.onload = () => done(true);
        img.onerror = () => done(false);
    });
};

const analyzeFoodMood = async (text) => {
  if (!apiKey) {
    console.log("未检测到 API Key，使用离线模式。");
    await new Promise(r => setTimeout(r, 2000)); 
    return FALLBACK_DISHES[Math.floor(Math.random() * FALLBACK_DISHES.length)];
  }

  const prompt = `
    Role: A cute, heartwarming anime chef.
    Task: Recommend a comforting dish based on user's mood.
    User Mood: "${text}"
    REQUIREMENTS:
    1. Output VALID JSON ONLY.
    2. Language: Simplified Chinese for display fields. English for imagePrompt.
    3. Style: Cute, healing, heartwarming.
    JSON SCHEMA:
    {
      "name": "String (English Name)",
      "cnName": "String (Cute Chinese Name)",
      "themeColor": "String (CSS linear-gradient, bright and appetizing)",
      "main": "String", "side": "String", "garnish": "String",
      "desc": "String (Cute, healing description)",
      "imagePrompt": "String (English prompt for image gen. Keywords: 'cute chibi food', 'kawaii', 'flat vector', 'simple', 'white background', 'isolated')",
      "analysis": { "main": "String", "side": "String", "garnish": "String" }
    }
  `;
  
  const url = `${API_BASE_URL}?key=${apiKey}`;
  try {
      const response = await fetch(url, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const json = text.match(/\{[\s\S]*\}/)?.[0];
        return JSON.parse(json);
      }
  } catch (e) {}
  return FALLBACK_DISHES[Math.floor(Math.random() * FALLBACK_DISHES.length)];
};

const CartoonBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden bg-[#ffedd5]"> 
    <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#ffffff 20%, transparent 20%)', backgroundSize: '24px 24px' }} />
    {[...Array(6)].map((_, i) => (
        <motion.div 
            key={i} 
            animate={{ 
                y: [0, -30, 0], 
                rotate: [0, 5, -5, 0] 
            }} 
            transition={{ 
                duration: 15 + i * 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
            }} 
            className="absolute text-orange-300/40" 
            style={{ 
                top: `${10 + Math.random() * 80}%`, 
                left: `${10 + Math.random() * 80}%`, 
                transform: `scale(${0.5 + Math.random() * 0.5})` 
            }}
        >
            {i % 3 === 0 ? <ChefHat size={64} /> : i % 3 === 1 ? <UtensilsCrossed size={64} /> : <Smile size={64} />}
        </motion.div>
    ))}
  </div>
);

const CartoonCookingVisuals = ({ phase }) => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence>
            {phase === 'cooking' && (
                <>
                    {[...Array(3)].map((_, i) => (
                        <motion.div key={`steam-${i}`} initial={{ opacity: 0, y: 0, scale: 0.5 }} animate={{ opacity: [0, 0.8, 0], y: -120, scale: 1.5 }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }} className="absolute left-1/2 bottom-10 bg-white rounded-full border-2 border-slate-100" style={{ width: 40 + i * 10, height: 40 + i * 10, marginLeft: -20 + (i % 2 === 0 ? 20 : -20) }} />
                    ))}
                    {[...Array(8)].map((_, i) => (
                        <motion.div key={`star-${i}`} initial={{ scale: 0 }} animate={{ scale: [0, 1, 0], rotate: 180 }} transition={{ duration: 1, repeat: Infinity, delay: Math.random() }} className="absolute text-yellow-400" style={{ left: `calc(50% + ${(Math.random() - 0.5) * 200}px)`, bottom: `calc(20% + ${Math.random() * 100}px)` }}>
                            <Sparkles size={24} fill="currentColor" />
                        </motion.div>
                    ))}
                </>
            )}
        </AnimatePresence>
    </div>
);

const CartoonPlate = ({ phase, dishData }) => {
  const isCooking = phase === 'cooking';
  const isServed = phase === 'served' || dishData;
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
      if (dishData && dishData.imageUrl) {
          const img = new Image();
          img.src = dishData.imageUrl;
          img.onload = () => setImageLoaded(true);
          img.onerror = () => setImageLoaded(true); 
      } else { setImageLoaded(false); }
  }, [dishData]);

  return (
    <div className="relative w-full h-[300px] flex items-center justify-center">
      <CartoonCookingVisuals phase={phase} />
      <motion.div className="relative w-64 h-64 bg-white rounded-full flex items-center justify-center border-b-8 border-slate-100" animate={{ scale: isCooking ? [1, 1.05, 1] : 1, rotate: isCooking ? [0, 5, -5, 0] : 0 }} transition={isCooking ? { duration: 0.5, repeat: Infinity } : { duration: 0.5, type: "spring" }} style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', zIndex: 20 }}>
        <div className="absolute inset-3 border-2 border-dashed border-orange-100 rounded-full opacity-50 pointer-events-none z-10" />
        <div className="relative w-[82%] h-[82%] rounded-full overflow-hidden flex items-center justify-center bg-slate-50">
            <AnimatePresence mode="wait">
                {isServed && dishData ? (
                    <motion.div key="food" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.4 }} className="w-full h-full relative overflow-hidden">
                        <img 
                            src={dishData.imageUrl} 
                            alt={dishData.name} 
                            className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} 
                            onLoad={() => setImageLoaded(true)} 
                            onError={() => setImageLoaded(true)} 
                        />
                        {!imageLoaded && <div className="absolute inset-0 flex items-center justify-center bg-orange-50"><UtensilsCrossed className="text-orange-200 animate-spin" size={32} /></div>}
                        <div className="absolute inset-0 rounded-full ring-inset ring-4 ring-black/5 pointer-events-none" />
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                    </motion.div>
                ) : (
                    <motion.div className="text-slate-200"> {isCooking ? <UtensilsCrossed size={48} className="animate-spin" /> : <Smile size={48} />} </motion.div>
                )}
            </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

const CartoonLoader = ({ step }) => (
    <div className="flex flex-col items-center gap-4">
        <div className="flex gap-3">
            {[0, 1, 2].map(i => <motion.div key={i} className="w-3 h-3 bg-orange-400 rounded-full" animate={{ y: [-10, 0, -10] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }} />)}
        </div>
        <motion.p key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-slate-500 font-cartoon font-bold text-lg tracking-wider">{step}</motion.p>
    </div>
);

const ShareFoodCard = ({ isOpen, onClose, dish, captureRef }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    useEffect(() => {
        if (isOpen && !window.html2canvas) { const script = document.createElement('script'); script.src = 'https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js'; document.body.appendChild(script); }
    }, [isOpen]);

    const handleGeneratePoster = async () => {
        if (!window.html2canvas || !captureRef.current) return;
        setIsGenerating(true);
        try {
            const canvas = await window.html2canvas(captureRef.current, { backgroundColor: '#ffedd5', scale: 2, useCORS: true, allowTaint: true, onclone: (doc) => { doc.querySelectorAll('button').forEach(b => b.style.display = 'none'); } });
            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a'); link.href = image; link.download = `MoodYummy-${dish.name}.png`; document.body.appendChild(link); link.click(); document.body.removeChild(link); setTimeout(() => { setIsGenerating(false); onClose(); }, 500);
        } catch (e) { console.error(e); setIsGenerating(false); }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm z-50 bg-white rounded-3xl p-6 shadow-xl border-4 border-orange-100">
                        <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-cartoon font-bold text-orange-500">打包美好</h3><button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20} className="text-slate-500" /></button></div>
                        {/* 移除英文标题显示 */}
                        <div className="text-center mb-4">
                            <h2 className="text-3xl font-cartoon font-black text-slate-800 mb-2">{dish.cnName}</h2>
                            <p className="text-lg text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-2xl w-full">“{dish.desc}”</p>
                        </div>
                        <button onClick={handleGeneratePoster} disabled={isGenerating} className="w-full py-4 rounded-xl bg-orange-400 text-white font-bold text-lg shadow-lg shadow-orange-200 hover:bg-orange-500 hover:scale-105 transition-all flex items-center justify-center gap-2">
                            {isGenerating ? <Loader2 className="animate-spin" /> : <Download />} {isGenerating ? "制作中..." : "保存卡片"}
                        </button>
                        <p className="text-xs text-center text-slate-300 mt-4">图片可能会因为跨域问题无法保存，请截图留念哦~</p>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const MoodDiningApp = ({ onBack }) => {
  const [appState, setAppState] = useState('input');
  const [inputText, setInputText] = useState('');
  const [dish, setDish] = useState(null);
  const [loadingText, setLoadingText] = useState('');
  const [visualPhase, setVisualPhase] = useState('idle');
  const [showShareModal, setShowShareModal] = useState(false);
  const posterRef = useRef(null); 
  const containerRef = useRef(null);

  // 优化：放慢文案循环速度 (3秒一次)
  useEffect(() => {
    let interval;
    if (appState === 'cooking') {
        const messages = [
            "正在捕捉开心因子...", "咕嘟咕嘟熬煮中...", "加一点魔法佐料...", 
            "收集清晨的露水...", "尝试与食材沟通...", "正在施展美味魔法...", 
            "调整火候至完美...", "听见食物的呼吸..."
        ];
        let i = 0;
        setLoadingText(messages[0]);
        interval = setInterval(() => {
            i = (i + 1) % messages.length;
            setLoadingText(messages[i]);
        }, 3000); // 3000ms = 3秒
    }
    return () => clearInterval(interval);
  }, [appState]);

  const handleStartCooking = async () => {
    if (!inputText.trim()) return;
    if (containerRef.current) containerRef.current.scrollIntoView({ behavior: 'smooth' });

    setAppState('cooking');
    setVisualPhase('cooking');
    
    // 1. 获取文本数据 (JSON)
    const apiCall = analyzeFoodMood(inputText);
    // 保持一定的等待时间，让动画至少播放2.5秒
    await new Promise(r => setTimeout(r, 2500));
    
    const result = await apiCall;
    
    if (result) {
        // 2. 只有拿到结果后，才开始生成和加载图片
        // 此时 appState 依然是 'cooking'，用户看到的是正在烹饪的动画和循环文案
        
        const styleSuffix = " kawaii chibi food, adorable style, soft pastel colors, sticker art, thick rounded outlines, white background, simple vector, flat design, no photorealism, high quality 2d art, cute game asset";
        const finalPrompt = (result.imagePrompt || result.name + " cute food") + styleSuffix;
        const seed = Math.floor(Math.random() * 1000);
        // 加上时间戳防止缓存
        const generatedImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=512&height=512&nologo=true&seed=${seed}&t=${Date.now()}`;
        
        // 3. 关键：等待图片完全下载！超时时间设为30秒
        await preloadImage(generatedImageUrl, 30000);
        
        // 4. 图片加载完毕，才切换状态
        result.imageUrl = generatedImageUrl;
        setDish(result);
        setAppState('result');
        setVisualPhase('served');
    } else {
        setAppState('input');
        setVisualPhase('idle');
    }
  };

  const handleReset = () => {
    setAppState('input');
    setInputText('');
    setDish(null);
    setVisualPhase('idle');
    setShowShareModal(false);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#ffedd5] text-slate-700 font-cartoon flex flex-col items-center overflow-x-hidden selection:bg-orange-200">
      <CartoonBackground />
      <div className="absolute top-6 left-6 z-50">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-orange-500 transition-colors text-xs font-bold tracking-widest uppercase"><ArrowLeft size={14}/> 返回</button>
      </div>
      <div ref={posterRef} className="w-full flex flex-col items-center bg-transparent relative z-10 pb-20"> 
          <header className="w-full flex flex-col items-center pt-20 pb-4 shrink-0">
              <div className="bg-white px-6 py-3 rounded-full shadow-sm border border-orange-100 flex items-center gap-3 transform -rotate-2">
                  <ChefHat size={24} className="text-orange-500" />
                  <span className="text-2xl font-cartoon font-bold text-slate-800 tracking-wide">心境小食堂</span>
              </div>
              <p className="mt-3 text-slate-400 text-xs font-bold tracking-widest uppercase">心境食堂 · 治愈时刻</p>
          </header>

          <main ref={containerRef} className="w-full max-w-md px-6 flex-1 flex flex-col items-center relative">
            <div className="w-full flex items-center justify-center py-6">
                <CartoonPlate phase={visualPhase} dishData={dish} />
            </div>

            <div className="w-full flex flex-col items-center justify-start min-h-[280px] relative z-30">
                <AnimatePresence mode="wait">
                {appState === 'input' && (
                    <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full flex flex-col items-center gap-6">
                        <div className="relative w-full bg-white rounded-3xl p-2 shadow-lg shadow-orange-100/50 border-2 border-orange-50">
                            <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (inputText.trim()) handleStartCooking(); } }} placeholder="今天心情怎么样？是像云朵一样软，还是像柠檬一样酸？" className="w-full bg-transparent p-4 text-center text-lg text-slate-600 placeholder:text-slate-300 outline-none h-32 resize-none font-medium rounded-2xl" />
                        </div>
                        <motion.button onClick={handleStartCooking} disabled={!inputText.trim()} whileHover={{ scale: 1.05, rotate: -2 }} whileTap={{ scale: 0.95 }} className="px-8 py-4 rounded-full font-bold text-lg bg-orange-400 text-white shadow-[0_10px_20px_-5px_rgba(251,146,60,0.4)] hover:bg-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            <Sparkles size={20} /> 开始制作
                        </motion.button>
                    </motion.div>
                )}
                {appState === 'cooking' && (
                    <motion.div key="loader" className="w-full mt-8">
                        <CartoonLoader step={loadingText} />
                    </motion.div>
                )}
                {appState === 'result' && dish && (
                    <motion.div key="result" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-white rounded-3xl p-8 shadow-xl border-b-8 border-orange-100 flex flex-col items-center text-center">
                        <div className="inline-block px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold mb-4 tracking-wider uppercase">为你特调</div>
                        <h2 className="text-3xl font-cartoon font-black text-slate-800 mb-2">{dish.cnName}</h2>
                        {/* 移除英文名称 */}
                        <p className="text-lg text-slate-600 leading-relaxed font-medium mb-8 bg-slate-50 p-4 rounded-2xl w-full">“{dish.desc}”</p>
                        <div className="w-full grid gap-4 text-left">
                            {[{ label: '主料', val: dish.main, icon: '🥘', desc: dish.analysis.main }, { label: '配菜', val: dish.side, icon: '🥗', desc: dish.analysis.side }, { label: '魔法', val: dish.garnish, icon: '✨', desc: dish.analysis.garnish }].map((item, i) => (
                                <div key={i} className="flex gap-4 items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="text-2xl bg-white w-10 h-10 flex items-center justify-center rounded-full shadow-sm">{item.icon}</div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-slate-700">{item.val}</span>
                                            <span className="text-[10px] text-slate-400 uppercase bg-slate-200 px-1 rounded">{item.label}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-snug">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-4 mt-8 w-full">
                            <button onClick={() => setShowShareModal(true)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-sm"><Share2 size={16} /> 保存卡片</button>
                            <button onClick={handleReset} className="flex-1 py-3 bg-orange-100 text-orange-600 rounded-xl font-bold hover:bg-orange-200 transition-colors flex items-center justify-center gap-2 text-sm"><RefreshCw size={16} /> 再来一碗</button>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
          </main>
      </div>
      <ShareFoodCard isOpen={showShareModal} onClose={() => setShowShareModal(false)} dish={dish} captureRef={posterRef} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&family=M+PLUS+Rounded+1c:wght@300;400;500;700&display=swap');
        .font-cartoon { font-family: 'M PLUS Rounded 1c', 'Fredoka', sans-serif; }
      `}</style>
    </div>
  );
}

// ==========================================
// 🏠 模块三：Landing Page (总入口)
// ==========================================

const LandingPage = ({ onSelectMode }) => {
    return (
        <div className="relative w-full h-screen flex flex-col md:flex-row overflow-hidden font-serif">
            {/* 左侧：酒吧入口 */}
            <div className="relative flex-1 h-1/2 md:h-full group cursor-pointer overflow-hidden border-b md:border-b-0 md:border-r border-white/10" onClick={() => onSelectMode('mixology')}>
                <div className="absolute inset-0 bg-[#050505] transition-transform duration-700 group-hover:scale-105">
                     <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_120%,#1e1b4b,transparent)]" />
                     <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }} />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-8 transition-all duration-500 group-hover:bg-white/5">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                        <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center mb-6 text-white/70 group-hover:text-white group-hover:border-white/50 transition-all group-hover:scale-110 shadow-[0_0_30px_rgba(255,255,255,0.05)]"><Wine size={28} strokeWidth={1} /></div>
                    </motion.div>
                    <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-3xl font-light italic text-white tracking-widest mb-2 font-serif">Mood Bar</motion.h2>
                    <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="text-[10px] uppercase tracking-[0.4em] text-white/40 group-hover:text-white/70 transition-colors">Mixology Lab</motion.p>
                    <div className="mt-8 px-6 py-2 border border-white/20 text-white/60 text-xs tracking-widest uppercase transition-all duration-500 hover:bg-white/10 hover:text-white">Enter</div>
                </div>
            </div>

            {/* 右侧：食堂入口 */}
            <div className="relative flex-1 h-1/2 md:h-full group cursor-pointer overflow-hidden" onClick={() => onSelectMode('dining')}>
                <div className="absolute inset-0 bg-[#fff7ed] transition-transform duration-700 group-hover:scale-105">
                    <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#fed7aa 20%, transparent 20%)', backgroundSize: '24px 24px' }} />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-8 transition-all duration-500 group-hover:bg-orange-50/50">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                        <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-orange-100 flex items-center justify-center mb-6 text-orange-400 group-hover:text-orange-500 group-hover:scale-110 transition-all group-hover:shadow-md"><UtensilsCrossed size={28} strokeWidth={2} /></div>
                    </motion.div>
                    <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-3xl font-bold text-slate-800 tracking-wide mb-2" style={{ fontFamily: 'M PLUS Rounded 1c, sans-serif' }}>心境食堂</motion.h2>
                    <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="text-[10px] uppercase tracking-[0.4em] text-slate-400 group-hover:text-orange-400 transition-colors">治愈料理</motion.p>
                    <div className="mt-8 px-6 py-2 bg-orange-400 text-white text-xs font-bold tracking-widest uppercase rounded-full shadow-lg shadow-orange-200 transition-all duration-500 hover:scale-105 hover:bg-orange-500">进入</div>
                </div>
            </div>
            
            {/* 中间Logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none mix-blend-difference text-white text-center">
                 <h1 className="text-4xl md:text-6xl font-black tracking-tighter opacity-20">MOOD</h1>
            </div>
            
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300&family=M+PLUS+Rounded+1c:wght@700&display=swap');`}</style>
        </div>
    );
};

// ==========================================
// 🚀 主程序
// ==========================================

export default function App() {
  const [mode, setMode] = useState('landing'); // landing, mixology, dining

  return (
    <div className="w-full h-full">
      <AnimatePresence mode="wait">
        {mode === 'landing' && (
           <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
               <LandingPage onSelectMode={setMode} />
           </motion.div>
        )}
        {mode === 'mixology' && (
           <motion.div key="mixology" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="w-full h-full">
               <MoodMixologyApp onBack={() => setMode('landing')} />
           </motion.div>
        )}
        {mode === 'dining' && (
           <motion.div key="dining" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="w-full h-full">
               <MoodDiningApp onBack={() => setMode('landing')} />
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

