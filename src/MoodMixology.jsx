import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, RefreshCw, Sparkles, Droplets, Wind, Heart, ChevronDown, Download, X, Loader2 } from 'lucide-react';

// --- 配置区域 ---

// [环境变量] 本地开发请在 .env 文件配置 VITE_GEMINI_API_KEY
// Vercel 部署请在 Settings -> Environment Variables 配置
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; 

// [关键配置] 指向 Vercel 的 Serverless Function 文件 api/proxy.js
const API_BASE_URL = "/api/proxy";

// 备用本地数据 (Fallback)
const FALLBACK_STYLES = [
  {
    name: "Midnight Echo",
    cnName: "午夜回声",
    liquidColor: "linear-gradient(180deg, rgba(30, 41, 59, 0.9) 0%, rgba(71, 85, 105, 0.95) 100%)",
    desc: "沉入海底的那句叹息，化作舌尖的冷冽。",
    base: "金酒", mid: "白桃", top: "薄荷",
    analysis: {
      base: "金酒的冷冽，回应你内心的静默时刻。",
      mid: "白桃的清甜，是记忆中模糊的温柔。",
      top: "薄荷带来的清凉，试图冲破此刻的压抑。"
    }
  },
  {
    name: "Velvet Sunset",
    cnName: "天鹅绒日落",
    liquidColor: "linear-gradient(180deg, rgba(154, 52, 18, 0.9) 0%, rgba(255, 166, 158, 0.85) 100%)",
    desc: "将笑意酿成晚霞，余温尚存。",
    base: "朗姆", mid: "玫瑰", top: "西柚",
    analysis: {
      base: "温润的陈年朗姆，呼应你原本昂扬的情绪。",
      mid: "玫瑰的馥郁，是对美好瞬间的留恋。",
      top: "西柚的微苦，是成熟后的清醒与克制。"
    }
  },
  {
    name: "Emerald Dream",
    cnName: "翡翠梦境",
    liquidColor: "linear-gradient(180deg, rgba(6, 78, 59, 0.9) 0%, rgba(52, 211, 153, 0.8) 100%)",
    desc: "迷失在雨后的森林，呼吸着潮湿的苔藓。",
    base: "伏特加", mid: "青柠", top: "罗勒",
    analysis: {
      base: "纯净的伏特加，让一切归于原本的空白。",
      mid: "青柠的酸涩，刺激着麻木的感官。",
      top: "罗勒的草本香气，带你逃离城市的喧嚣。"
    }
  }
];

// 核心逻辑：AI 情绪分析 (环境自适应版)
const analyzeMoodWithGemini = async (text) => {
  if (!apiKey) {
    console.log("未检测到 API Key，使用离线模式。");
    return FALLBACK_STYLES[Math.floor(Math.random() * FALLBACK_STYLES.length)];
  }

  // [兼容性处理] 将 System Prompt 合并到 User Prompt 中，适配 Gemma 模型
  const prompt = `
    Role: Expert Mixologist.
    Task: Create a unique cocktail based on the user's mood.
    
    User Mood: "${text}"

    REQUIREMENTS:
    1. Output VALID JSON ONLY. No markdown (no \`\`\`json), no intro text, no explanations.
    2. Language: Simplified Chinese for ALL fields. Ensure all text values are in Chinese.

    JSON SCHEMA:
    {
      "name": "String (English Name)",
      "cnName": "String (Creative Chinese Name)",
      "liquidColor": "String (CSS linear-gradient e.g. 'linear-gradient(180deg, red 0%, black 100%)')",
      "base": "String (Base Spirit)",
      "mid": "String (Middle Note)",
      "top": "String (Garnish/Top Note)",
      "desc": "String (Poetic description)",
      "analysis": {
        "base": "String (Reason)",
        "mid": "String (Reason)",
        "top": "String (Reason)"
      }
    }
  `;
  
  // [关键修复] 动态决定 URL
  // 如果是 Vercel 生产环境 (hostname 包含 vercel.app)，使用代理防止跨域/隐藏Key
  // 如果是 预览环境 (blob/localhost)，使用直连 Google (前提是网络能通)
  const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
  
  let url;
  if (isVercel) {
      // 生产环境：请求后端代理 (proxy.js 中需要确保已更新为 gemma-3-4b-it)
      url = `/api/proxy?key=${apiKey}`;
  } else {
      // 预览/本地环境：直连 Google API
      // 这里切换为 gemma-3-4b-it
      url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-4b-it:generateContent?key=${apiKey}`;
  }

  let delay = 1000;
  for (let i = 0; i < 3; i++) {
    try {
      console.log(`📡 [Attempt ${i+1}] Requesting: ${isVercel ? 'Vercel Proxy' : 'Google Direct (Gemma 3 4B)'}...`);
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          // 移除可能导致 400 的高级配置，Gemma 不需要 responseMimeType
          generationConfig: { 
            temperature: 0.8,
            maxOutputTokens: 1024
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        console.log("✅ API 响应成功");
        
        try {
            // 提取 JSON (处理可能存在的 Markdown 包裹)
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            const cleanJson = jsonMatch ? jsonMatch[0] : rawText;
            return JSON.parse(cleanJson);
        } catch (e) {
            console.warn("❌ JSON解析失败:", e);
        }
      } else {
        const errText = await response.text();
        console.error(`❌ API Error ${response.status}:`, errText);
      }
    } catch (error) {
      console.error(`❌ 网络或执行错误 (Attempt ${i+1}):`, error);
    }
    // 指数退避等待
    await new Promise(r => setTimeout(r, delay));
    delay *= 2;
  }
  
  console.warn("⚠️ 所有重试失败，切换至备用数据");
  return FALLBACK_STYLES[Math.floor(Math.random() * FALLBACK_STYLES.length)];
};

// --- 背景组件 ---
const AmbientBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden bg-[#080808]">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        background: 'radial-gradient(circle at 50% 120%, #1e1b4b 0%, #000000 80%)'
      }}
      transition={{ duration: 2 }}
      className="absolute inset-0"
    />
    <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay" 
         style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }} />
    <motion.div 
      animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/5 blur-[120px] rounded-full pointer-events-none"
    />
  </div>
);

// --- 金属量酒器组件 (Jigger) ---
const Jigger = ({ isVisible }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        key="jigger-actor"
        initial={{ y: -400, opacity: 0, rotate: 0 }}
        animate={{ 
          y: [-400, 75, 75, 75, -400], 
          rotate: [0, 0, -115, -115, 0], 
          opacity: [0, 1, 1, 1, 0]
        }}
        exit={{ y: -400, opacity: 0, rotate: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
        transition={{ 
          duration: 4.5, 
          times: [0, 0.2, 0.3, 0.85, 1],
          ease: "easeInOut"
        }}
        className="absolute left-1/2 z-50 pointer-events-none"
        style={{ 
          top: 0, 
          marginLeft: '15px', 
          transformOrigin: 'top left' 
        }} 
      >
        <div className="relative transform -rotate-12 scale-90">
           <div className="w-10 h-14"
                style={{
                  background: 'linear-gradient(90deg, #444, #eee, #666)', 
                  clipPath: 'polygon(0 0, 100% 0, 75% 100%, 25% 100%)',
                  boxShadow: 'inset 0 0 8px rgba(0,0,0,0.8)'
                }}
           />
           <div className="w-5 h-2 bg-[#888] mx-auto -mt-[1px]" />
           <div className="w-8 h-10 mx-auto -mt-[1px]"
                style={{
                  background: 'linear-gradient(90deg, #333, #ccc, #444)',
                  clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0 100%)'
                }}
           />
           <div className="absolute top-0 left-3 w-[1px] h-full bg-white/40 blur-[1px]" />
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// --- 高级水柱组件 ---
const PremiumStream = ({ isVisible }) => (
    <AnimatePresence>
        {isVisible && (
            <div className="absolute left-1/2 -translate-x-1/2 origin-top" style={{ top: '-35px' }}>
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "280px", opacity: 0.4 }}
                    exit={{ height: 0, opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
                    transition={{ delay: 1.5, duration: 0.5 }}
                    className="absolute left-1/2 -translate-x-1/2 w-[10px] blur-[4px] bg-white/40"
                />
                
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "280px", opacity: 0.95 }}
                    exit={{ height: 0, opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
                    transition={{ delay: 1.5, duration: 0.5, ease: "circIn" }}
                    className="relative overflow-hidden w-[3.5px] rounded-[2px]"
                    style={{ 
                        background: 'linear-gradient(90deg, rgba(255,255,255,0.4), rgba(255,255,255,1) 50%, rgba(255,255,255,0.4))',
                        boxShadow: '0 0 5px rgba(255,255,255,0.3)',
                    }}
                >
                        <motion.div 
                        className="absolute inset-0 w-full h-[300%]"
                        style={{
                            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.7) 10%, transparent 20%)',
                            backgroundSize: '100% 80px'
                        }}
                        animate={{ y: [0, 180] }}
                        transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
                        />
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

// --- 马天尼杯组件 ---
const MartiniGlass = ({ mixingPhase, inputLength, cocktailData }) => {
  const targetHeight = Math.min(30 + inputLength * 0.5, 90); 
  
  let liquidHeight;
  if (cocktailData) {
      liquidHeight = 82; 
  } else {
      switch (mixingPhase) {
          case 'pouring': liquidHeight = 60; break;
          case 'filled': liquidHeight = 60; break;
          case 'shaking': liquidHeight = 70; break;
          case 'settling': liquidHeight = 75; break;
          default: liquidHeight = Math.min(30 + inputLength * 0.5, 90);
      }
  }

  const currentLiquidColor = cocktailData?.liquidColor || 
    (mixingPhase === 'idle' 
      ? 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)' 
      : 'linear-gradient(180deg, rgba(200,200,255,0.2) 0%, rgba(150,150,255,0.3) 100%)');

  return (
    <div className="relative w-full h-[380px] flex items-end justify-center perspective-[1000px] group">
      <div className="absolute bottom-0 w-24 h-4 bg-white/5 blur-xl opacity-30 rounded-full scale-x-150" />
      
      <div className="absolute top-0 left-0 w-full h-full z-40 pointer-events-none">
        <Jigger isVisible={mixingPhase === 'pouring'} />
      </div>

      <motion.div 
        className="relative z-20 flex flex-col items-center origin-bottom"
        animate={mixingPhase === 'shaking' ? { 
            rotate: [0, -6, 0, 6, 0], 
            x: [0, -4, 0, 4, 0],
            y: [0, 2, 0, 2, 0]
        } : { rotate: 0, x: 0, y: 0 }}
        transition={mixingPhase === 'shaking' ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.8, ease: "easeOut" }}
      >
        <div className="relative w-64 h-32 z-30">
            
            <div className="absolute inset-0 z-40 pointer-events-none" 
                 style={{ clipPath: 'polygon(-100% -1000%, 200% -1000%, 100% 0%, 50% 100%, 0% 0%)' }}>
                <PremiumStream isVisible={mixingPhase === 'pouring'} />
            </div>

            <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-[1px]" />
                
                <motion.div 
                    className="absolute bottom-0 left-0 w-full z-10 flex items-end justify-center"
                    initial={{ height: "5%" }}
                    animate={{ height: `${liquidHeight}%` }}
                    transition={{ 
                        height: { type: "spring", stiffness: 20, damping: 20 } 
                    }}
                >
                    <motion.div className="w-full h-full relative" style={{ background: currentLiquidColor }}>
                        {(mixingPhase !== 'idle' || cocktailData) && Array.from({ length: 10 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute bg-white/40 rounded-full"
                                style={{ width: 1.2, height: 1.2, left: `${Math.random() * 100}%`, top: '100%' }}
                                animate={{ y: [0, -200], opacity: [0, 0.6, 0] }}
                                transition={{ duration: 3, repeat: Infinity, delay: Math.random() * 2, ease: "linear" }}
                            />
                        ))}
                        
                        {mixingPhase === 'pouring' && (
                            <motion.div 
                                className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-3 bg-white/30 blur-md rounded-full"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
                                transition={{ duration: 0.6, repeat: Infinity }}
                            />
                        )}

                        <motion.div 
                             className="absolute top-0 w-full h-[4px] bg-white/20"
                             style={{ borderRadius: '100%' }}
                             animate={mixingPhase === 'shaking' ? { rotate: [0, 6, 0, -6, 0], scaleX: [1, 1.1, 1] } : { rotate: 0, scaleX: 1 }}
                             transition={mixingPhase === 'shaking' ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.5 }}
                        />
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

// --- 加载状态组件 ---
const PoeticLoader = ({ step }) => (
    <div className="flex flex-col items-center gap-6 min-h-[60px]">
        <div className="flex gap-2">
            {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-1 h-1 bg-white/80 rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }} />
            ))}
        </div>
        <AnimatePresence mode="wait">
            <motion.p key={step} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-sm font-premium text-white/70 tracking-[0.2em] font-light italic text-center">
                {step}
            </motion.p>
        </AnimatePresence>
    </div>
);

// --- Share Modal ---
const ShareModal = ({ isOpen, onClose, cocktail, captureRef }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (!window.html2canvas) {
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js';
                document.body.appendChild(script);
            }
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleGeneratePoster = async () => {
        if (!window.html2canvas || !captureRef.current) return;
        setIsGenerating(true);
        try {
            const canvas = await window.html2canvas(captureRef.current, {
                backgroundColor: '#050505',
                scale: 2,
                useCORS: true,
                logging: false,
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




