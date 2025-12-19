import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, RefreshCw, Sparkles, Droplets, Wind, Heart, ChevronDown, Download, X, Loader2 } from 'lucide-react';

// --- 配置区域 ---
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; 
// API 地址指向我们刚才创建的 api/proxy.js
const API_BASE_URL = "/api/proxy";

// 备用数据
const FALLBACK_STYLES = [
  {
    name: "Midnight Echo",
    cnName: "午夜回声",
    liquidColor: "linear-gradient(180deg, rgba(30, 41, 59, 0.9) 0%, rgba(71, 85, 105, 0.95) 100%)",
    desc: "沉入海底的那句叹息，化作舌尖的冷冽。",
    base: "金酒", mid: "白桃", top: "薄荷",
    analysis: { base: "金酒的冷冽，回应内心的静默。", mid: "白桃的清甜，是模糊的温柔。", top: "薄荷带来的清凉，冲破压抑。" }
  },
  {
    name: "Velvet Sunset",
    cnName: "天鹅绒日落",
    liquidColor: "linear-gradient(180deg, rgba(154, 52, 18, 0.9) 0%, rgba(255, 166, 158, 0.85) 100%)",
    desc: "将笑意酿成晚霞，余温尚存。",
    base: "朗姆", mid: "玫瑰", top: "西柚",
    analysis: { base: "温润的陈年朗姆，呼应昂扬情绪。", mid: "玫瑰的馥郁，是对美好的留恋。", top: "西柚的微苦，是清醒与克制。" }
  },
  {
    name: "Emerald Dream",
    cnName: "翡翠梦境",
    liquidColor: "linear-gradient(180deg, rgba(6, 78, 59, 0.9) 0%, rgba(52, 211, 153, 0.8) 100%)",
    desc: "迷失在雨后的森林，呼吸着潮湿的苔藓。",
    base: "伏特加", mid: "青柠", top: "罗勒",
    analysis: { base: "纯净的伏特加，让一切归于空白。", mid: "青柠的酸涩，刺激麻木感官。", top: "罗勒的草本香，逃离城市喧嚣。" }
  }
];

// 核心逻辑：AI 情绪分析 (终极修正版)
const analyzeMoodWithGemini = async (text) => {
  if (!apiKey) return FALLBACK_STYLES[Math.floor(Math.random() * FALLBACK_STYLES.length)];

  const systemPrompt = `You are a master mixologist. Analyze the user's mood and create a custom cocktail. Output JSON only. Use Simplified Chinese. Schema: { "name": "String", "cnName": "String", "liquidColor": "String (css rgba gradient)", "base": "String", "mid": "String", "top": "String", "desc": "String", "analysis": { "base": "String", "mid": "String", "top": "String" } }`;
  
  // [关键修改] 前端只请求 /api/proxy，路径和模型在后端写死，防止转义错误
  const url = `${API_BASE_URL}?key=${apiKey}`;

  let delay = 1000;
  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `User's mood: "${text}"` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text.replace(/```json|```/g, '').trim();
        return JSON.parse(resultText);
      } else if (response.status === 429) {
        console.warn(`API 限流，${delay/1000}秒后重试...`);
      } else {
        // 如果出错，打印出后端返回的具体错误信息
        const errorText = await response.text();
        console.error("API Error Detail:", errorText);
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      console.warn(`请求尝试 ${i+1} 失败`);
    }
    await new Promise(r => setTimeout(r, delay));
    delay *= 2; 
  }
  
  return FALLBACK_STYLES[Math.floor(Math.random() * FALLBACK_STYLES.length)];
};


const AmbientBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden bg-[#080808]">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, background: 'radial-gradient(circle at 50% 120%, #1e1b4b 0%, #000000 80%)' }} transition={{ duration: 2 }} className="absolute inset-0" />
    <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }} />
    <motion.div animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
  </div>
);

const Jigger = ({ isVisible }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div key="jigger" initial={{ y: -400, opacity: 0, rotate: 0 }} animate={{ y: [-400, 75, 75, 75, -400], rotate: [0, 0, -115, -115, 0], opacity: [0, 1, 1, 1, 0] }} exit={{ y: -400, opacity: 0, rotate: 0, transition: { duration: 0.8, ease: "easeInOut" } }} transition={{ duration: 5, times: [0, 0.2, 0.3, 0.85, 1], ease: "easeInOut" }} className="absolute left-1/2 z-50 pointer-events-none" style={{ top: 0, marginLeft: '15px', transformOrigin: 'top left' }}>
        <div className="relative transform -rotate-12 scale-90">
           <div className="w-10 h-14" style={{ background: 'linear-gradient(90deg, #444, #eee, #666)', clipPath: 'polygon(0 0, 100% 0, 75% 100%, 25% 100%)', boxShadow: 'inset 0 0 8px rgba(0,0,0,0.8)' }} />
           <div className="w-5 h-2 bg-[#888] mx-auto -mt-[1px]" />
           <div className="w-8 h-10 mx-auto -mt-[1px]" style={{ background: 'linear-gradient(90deg, #333, #ccc, #444)', clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0 100%)' }} />
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
  let liquidHeight;
  if (cocktailData) { liquidHeight = 82; } else {
      switch (mixingPhase) {
          case 'pouring': liquidHeight = 60; break;
          case 'filled': liquidHeight = 60; break;
          case 'shaking': liquidHeight = 70; break;
          case 'settling': liquidHeight = 75; break;
          default: liquidHeight = Math.min(30 + inputLength * 0.5, 90);
      }
  }
  const currentLiquidColor = cocktailData?.liquidColor || (mixingPhase === 'idle' ? 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)' : 'linear-gradient(180deg, rgba(200,200,255,0.2) 0%, rgba(150,150,255,0.3) 100%)');

  return (
    <div className="relative w-full h-[380px] flex items-end justify-center perspective-[1000px] group">
      <div className="absolute bottom-0 w-24 h-4 bg-white/5 blur-xl opacity-30 rounded-full scale-x-150" />
      <div className="absolute top-0 left-0 w-full h-full z-40 pointer-events-none"><Jigger isVisible={mixingPhase === 'pouring'} /></div>

      <motion.div 
        className="relative z-20 flex flex-col items-center origin-bottom"
        animate={mixingPhase === 'shaking' ? { rotate: [0, -6, 0, 6, 0], x: [0, -4, 0, 4, 0], y: [0, 2, 0, 2, 0] } : { rotate: 0, x: 0, y: 0 }}
        transition={mixingPhase === 'shaking' ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.8, ease: "easeOut" }}
      >
        <div className="relative w-64 h-32 z-30">
            <div className="absolute inset-0 z-40 pointer-events-none" style={{ clipPath: 'polygon(-100% -1000%, 200% -1000%, 100% 0%, 50% 100%, 0% 0%)' }}><PremiumStream isVisible={mixingPhase === 'pouring'} /></div>
            <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-[1px]" />
                <motion.div className="absolute bottom-0 left-0 w-full z-10 flex items-end justify-center" initial={{ height: "5%" }} animate={{ height: `${liquidHeight}%` }} transition={{ height: { type: "spring", stiffness: 20, damping: 20 } }}>
                    <motion.div className="w-full h-full relative" style={{ background: currentLiquidColor }}>
                        {(mixingPhase !== 'idle' || cocktailData) && Array.from({ length: 10 }).map((_, i) => (
                            <motion.div key={i} className="absolute bg-white/40 rounded-full" style={{ width: 1.2, height: 1.2, left: `${Math.random() * 100}%`, top: '100%' }} animate={{ y: [0, -200], opacity: [0, 0.6, 0] }} transition={{ duration: 3, repeat: Infinity, delay: Math.random() * 2, ease: "linear" }} />
                        ))}
                        <motion.div className="absolute top-0 w-full h-[4px] bg-white/20" style={{ borderRadius: '100%' }} animate={mixingPhase === 'shaking' ? { rotate: [0, 6, 0, -6, 0], scaleX: [1, 1.1, 1] } : { rotate: 0, scaleX: 1 }} transition={mixingPhase === 'shaking' ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.5 }} />
                    </motion.div>
                </motion.div>
            </div>
            <div className="absolute inset-0 z-40 pointer-events-none" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }}>
                 <div className="absolute top-0 right-10 w-[2px] h-full bg-gradient-to-b from-white/30 to-transparent rotate-[26deg] blur-[1px] opacity-40" />
                 <div className="absolute top-0 w-full h-[1px] bg-white/40 opacity-50" />
            </div>
        </div>
        <div className="relative w-[1.5px] h-32 bg-gradient-to-r from-white/10 via-white/40 to-white/10 backdrop-blur-sm z-20" />
        <div className="relative w-20 h-2 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-sm rounded-[100%] border-t border-white/10 z-20 shadow-lg mt-[-1px]" />
      </motion.div>
    </div>
  );
};

const PoeticLoader = ({ step }) => (
    <div className="flex flex-col items-center gap-6 min-h-[60px]">
        <div className="flex gap-2">
            {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-1 h-1 bg-white/80 rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }} />
            ))}
        </div>
        <AnimatePresence mode="wait">
            <motion.p key={step} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-sm font-premium text-white/70 tracking-[0.2em] font-light italic text-center">{step}</motion.p>
        </AnimatePresence>
    </div>
);

// --- Share Modal (CDN 修复: 使用 unpkg) ---
const ShareModal = ({ isOpen, onClose, cocktail, captureRef }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // 确保只在点击分享时检测和加载
            if (!window.html2canvas) {
                // 如果 index.html 里加载失败，这里做一个最后的补救
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js';
                document.body.appendChild(script);
            }
        } else { document.body.style.overflow = ''; }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleGeneratePoster = async () => {
        if (!window.html2canvas || !captureRef.current) return;
        setIsGenerating(true);
        try {
            const canvas = await window.html2canvas(captureRef.current, {
                backgroundColor: '#050505', scale: 2, useCORS: true, logging: false,
                onclone: (clonedDoc) => {
                    const buttons = clonedDoc.querySelectorAll('button');
                    buttons.forEach(b => b.style.display = 'none'); 
                }
            });
            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = image;
            link.download = `MoodLab-${cocktail.name.replace(/\s+/g, '-')}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-title italic text-white tracking-widest">保存回忆</h3>
                            <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><X size={16} className="text-white/60" /></button>
                        </div>
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
                <div className="flex flex-col items-center gap-2">
                     <span className="text-[10px] tracking-[0.3em] uppercase font-premium" style={{ color: 'rgba(255, 255, 255, 0.95)', textShadow: '0 0 8px rgba(100, 200, 255, 0.8), 0 0 15px rgba(100, 200, 255, 0.5)' }}>下滑 · 阅览心绪特调</span>
                     <ChevronDown size={18} style={{ color: 'rgba(255, 255, 255, 0.9)', filter: 'drop-shadow(0 0 5px rgba(100, 200, 255, 0.8))' }} />
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default function MoodMixologyApp() {
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
    
    const apiCall = analyzeMoodWithGemini(inputText);
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
      <AmbientBackground />
      <div ref={posterRef} className="w-full flex flex-col items-center bg-[#050505]"> 
          <header className="w-full flex flex-col items-center pt-12 pb-2 shrink-0 z-40">
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
      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} cocktail={cocktail} captureRef={posterRef} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,400;1,500&family=Noto+Serif+SC:wght@200;300;400&display=swap');
        .font-premium { font-family: 'Noto Serif SC', serif; }
        .font-title { font-family: 'Cormorant Garamond', serif; }
        textarea { caret-color: white; }
        ::-webkit-scrollbar { width: 3px; background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
}

