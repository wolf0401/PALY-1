
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Compass, RefreshCw, Send, HelpCircle, Loader2, User, Sparkles, X, MessageCircle } from 'lucide-react';

// --- 類型定義 (Types) ---
export enum LineType {
  OldYin = 6,    // 變陰 (--) X
  YoungYang = 7, // 少陽 (—)
  YoungYin = 8,  // 少陰 (--)
  OldYang = 9    // 變陽 (—) O
}

export interface HexagramData {
  id: string;
  number: number;
  name: string;
  fullName: string;
  symbol: string;
  description: string;
}

export type Gender = 'male' | 'female' | 'other';

export interface DivinationResult {
  question: string;
  gender: Gender;
  lines: LineType[];
  originalHex: HexagramData;
  changedHex?: HexagramData;
  movingLinesIndexes: number[];
  aiInterpretation?: {
    summary: string;
    analysis: string;
    advice: string;
  };
}

// --- 易經六十四卦資料 (Constants) ---
export const HEXAGRAMS: Record<string, HexagramData> = {
  "111111": { id: "111111", number: 1, name: "乾", fullName: "乾為天", symbol: "䷀", description: "天行健，君子以自強不息。" },
  "000000": { id: "000000", number: 2, name: "坤", fullName: "坤為地", symbol: "䷁", description: "地勢坤，君子以厚德載物。" },
  "100010": { id: "100010", number: 3, name: "屯", fullName: "水雷屯", symbol: "䷂", description: "雲雷屯，君子以經綸。" },
  "010001": { id: "010001", number: 4, name: "蒙", fullName: "山水蒙", symbol: "䷃", description: "山下出泉，蒙；君子以果行育德。" },
  "111010": { id: "111010", number: 5, name: "需", fullName: "水天需", symbol: "䷄", description: "雲上於天，需；君子以飲食宴樂。" },
  "010111": { id: "010111", number: 6, name: "訟", fullName: "天水訟", symbol: "䷅", description: "天與水違行，訟；君子以作事謀始。" },
  "010000": { id: "010000", number: 7, name: "師", fullName: "地水師", symbol: "䷆", description: "地中有水，師；君子以容民畜眾。" },
  "000010": { id: "000010", number: 8, name: "比", fullName: "水地比", symbol: "䷇", description: "地上有水，比；先王以建萬國，親諸侯。" },
  "111011": { id: "111011", number: 9, name: "小畜", fullName: "風天小畜", symbol: "䷈", description: "風行天上，小畜；君子以懿文德。" },
  "110111": { id: "110111", number: 10, name: "履", fullName: "天澤履", symbol: "䷉", description: "上天下澤，履；君子以辨上下，安民志。" },
  "111000": { id: "111000", number: 11, name: "泰", fullName: "地天泰", symbol: "䷊", description: "天地交，泰；后以財成天地之道，輔相天地之宜。" },
  "000111": { id: "000111", number: 12, name: "否", fullName: "天地否", symbol: "䷋", description: "天地不交，否；君子以儉德辟難，不可榮以祿。" },
  "101111": { id: "101111", number: 13, name: "同人", fullName: "天火同人", symbol: "䷌", description: "天與火，同人；君子以類族辨物。" },
  "111101": { id: "111101", number: 14, name: "大有", fullName: "火天大有", symbol: "䷍", description: "火在天上，大有；君子以遏惡揚善。" },
  "000100": { id: "000100", number: 15, name: "謙", fullName: "地山謙", symbol: "䷎", description: "地中有山，謙；君子以裒多益寡，稱物平施。" },
  "001000": { id: "001000", number: 16, name: "豫", fullName: "雷地豫", symbol: "䷏", description: "雷出地奮，豫。先王以作樂崇德。" },
  "100110": { id: "100110", number: 17, name: "隨", fullName: "澤雷隨", symbol: "䷐", description: "澤中有雷，隨；君子以嚮晦入宴息。" },
  "011001": { id: "011001", number: 18, name: "蠱", fullName: "山風蠱", symbol: "䷑", description: "山下有風，蠱；君子以振民育德。" },
  "110000": { id: "110000", number: 19, name: "臨", fullName: "地澤臨", symbol: "䷒", description: "澤上有地，臨；君子以教思無窮。" },
  "000011": { id: "000011", number: 20, name: "觀", fullName: "風地觀", symbol: "䷓", description: "風行地上，觀；先王以省方觀民設教。" },
  "100101": { id: "100101", number: 21, name: "噬嗑", fullName: "火雷噬嗑", symbol: "䷔", description: "雷電噬嗑；先王以明罰敕法。" },
  "101001": { id: "101001", number: 22, name: "賁", fullName: "山火賁", symbol: "䷕", description: "山下有火，賁；君子以明庶政。" },
  "000001": { id: "000001", number: 23, name: "剝", fullName: "山地剝", symbol: "䷖", description: "山附地上，剝；上以厚下安宅。" },
  "100000": { id: "100000", number: 24, name: "復", fullName: "地雷復", symbol: "䷗", description: "雷在地中，復；先王以至日閉關。" },
  "100111": { id: "100111", number: 25, name: "無妄", fullName: "天雷無妄", symbol: "䷘", description: "天下雷行，物與無妄；君子以茂對時育萬物。" },
  "111001": { id: "111001", number: 26, name: "大畜", fullName: "山天大畜", symbol: "䷙", description: "天在山中，大畜；君子以多識前言往行。" },
  "100001": { id: "100001", number: 27, name: "頤", fullName: "山雷頤", symbol: "䷚", description: "山下有雷，頤；君子以慎言語，節飲食。" },
  "011110": { id: "011110", number: 28, name: "大過", fullName: "澤風大過", symbol: "䷛", description: "澤滅木，大過；君子以獨立不懼。" },
  "010010": { id: "010010", number: 29, name: "坎", fullName: "坎為水", symbol: "䷜", description: "水洊至，習坎；君子以常德行，習教事。" },
  "101101": { id: "101101", number: 30, name: "離", fullName: "離為火", symbol: "䷝", description: "明兩作，離；大人以繼明照于四方。" },
  "001110": { id: "001110", number: 31, name: "咸", fullName: "澤山咸", symbol: "䷞", description: "山上有澤，咸；君子以虛受人。" },
  "011100": { id: "011100", number: 32, name: "恆", fullName: "雷風恆", symbol: "䷟", description: "雷風，恆；君子以立不易方。" },
  "001111": { id: "001111", number: 33, name: "遯", fullName: "天山遯", symbol: "䷠", description: "天下有山，遯；君子以遠小人，不惡而嚴。" },
  "111100": { id: "111100", number: 34, name: "大壯", fullName: "雷天大壯", symbol: "䷡", description: "雷在天上，大壯；君子以非禮弗履。" },
  "000101": { id: "000101", number: 35, name: "晉", fullName: "火地晉", symbol: "䷢", description: "明出地上，晉；君子以昭明德。" },
  "101000": { id: "101000", number: 36, name: "明夷", fullName: "地火明夷", symbol: "䷣", description: "明入地中，明夷；君子以蒞眾。" },
  "101011": { id: "101011", number: 37, name: "家人", fullName: "風火家人", symbol: "䷤", description: "風自火出，家人；君子以言有物而行有恆。" },
  "110101": { id: "110101", number: 38, name: "睽", fullName: "火澤睽", symbol: "䷥", description: "上火下澤，睽；君子以同而異。" },
  "001010": { id: "001010", number: 39, name: "蹇", fullName: "水山蹇", symbol: "䷦", description: "山上有水，蹇；君子以反身修德。" },
  "010100": { id: "010100", number: 40, name: "解", fullName: "雷水解", symbol: "䷧", description: "雷雨作，解；君子以赦過宥罪。" },
  "110001": { id: "110001", number: 41, name: "損", fullName: "山澤損", symbol: "䷨", description: "山下有澤，損；君子以懲忿窒欲。" },
  "100011": { id: "100011", number: 42, name: "益", fullName: "風雷益", symbol: "䷩", description: "風雷，益；君子以見善則遷。" },
  "111110": { id: "111110", number: 43, name: "夬", fullName: "澤天夬", symbol: "䷪", description: "澤上於天，夬；君子以施祿及下。" },
  "011111": { id: "011111", number: 44, name: "姤", fullName: "天風姤", symbol: "䷫", description: "天下有風，姤；后以施命誥四方。" },
  "000110": { id: "000110", number: 45, name: "萃", fullName: "澤地萃", symbol: "䷬", description: "澤上於地，萃；君子以除戎器。" },
  "011000": { id: "011000", number: 46, name: "升", fullName: "地風升", symbol: "䷭", description: "地中生木，升；君子以順德。" },
  "010110": { id: "010110", number: 47, name: "困", fullName: "澤水困", symbol: "䷮", description: "澤無水，困；君子以致命遂志。" },
  "011010": { id: "011010", number: 48, name: "井", fullName: "水風井", symbol: "䷯", description: "木上有水，井；君子以勞民勸相。" },
  "101110": { id: "101110", number: 49, name: "革", fullName: "澤火革", symbol: "䷰", description: "澤中有火，革；君子以治歷明時。" },
  "011101": { id: "011101", number: 50, name: "鼎", fullName: "火風鼎", symbol: "䷱", description: "木上有火，鼎；君子以正位凝命。" },
  "001001": { id: "001001", number: 51, name: "震", fullName: "震為雷", symbol: "䷲", description: "洊雷，震；君子以恐懼修省。" },
  "100100": { id: "100100", number: 52, name: "艮", fullName: "艮為山", symbol: "䷳", description: "兼山，艮；君子以思不出其位。" },
  "001011": { id: "001011", number: 53, name: "漸", fullName: "風山漸", symbol: "䷴", description: "山上有木，漸；君子以居賢德。" },
  "110100": { id: "110100", number: 54, name: "歸妹", fullName: "雷澤歸妹", symbol: "䷵", description: "澤上有雷，歸妹；君子以永終知敝。" },
  "101100": { id: "101100", number: 55, name: "豐", fullName: "雷火豐", symbol: "䷶", description: "雷電皆至，豐；君子以折獄致刑。" },
  "001101": { id: "001101", number: 56, name: "旅", fullName: "火山旅", symbol: "䷷", description: "山上有火，旅；君子以明慎用刑。" },
  "011011": { id: "011011", number: 57, name: "巽", fullName: "巽為風", symbol: "䷸", description: "隨風，巽；君子以申命行事。" },
  "110110": { id: "110110", number: 58, name: "兌", fullName: "兌為澤", symbol: "䷹", description: "麗澤，兌；君子以朋友講習。" },
  "010011": { id: "010011", number: 59, name: "渙", fullName: "風水渙", symbol: "䷺", description: "風行水上，渙；先王以享于帝立廟。" },
  "110010": { id: "110010", number: 60, name: "節", fullName: "水澤節", symbol: "䷻", description: "澤上有水，節；君子以制數度。" },
  "110011": { id: "110011", number: 61, name: "中孚", fullName: "風澤中孚", symbol: "䷼", description: "澤上有風，中孚；君子以議獄緩死。" },
  "001100": { id: "001100", number: 62, name: "小過", fullName: "雷山小過", symbol: "䷽", description: "山上有雷，小過；君子以行過乎恭。" },
  "101010": { id: "101010", number: 63, name: "既濟", fullName: "水火既濟", symbol: "䷾", description: "水在火上，既濟；君子以思患而豫防之。" },
  "010101": { id: "010101", number: 64, name: "未濟", fullName: "火水未濟", symbol: "䷿", description: "火在水上，未濟；君子以慎辨物居方。" },
};

// --- 子組件: 銅錢 (Coin) ---
const Coin: React.FC<{ isHeads: boolean; isSpinning: boolean }> = ({ isHeads, isSpinning }) => (
  <div className={`relative w-20 h-20 md:w-24 md:h-24 transition-all duration-500 transform-gpu ${isSpinning ? 'animate-bounce' : ''}`}>
    <div className={`w-full h-full rounded-full border-[6px] border-[#3d2b1f] flex items-center justify-center shadow-2xl bg-gradient-to-br from-[#8b5a2b] via-[#5d3a1a] to-[#2d1b0d] text-amber-100 font-bold text-2xl transition-transform duration-700 ${isHeads ? 'rotate-0' : 'rotate-180'}`} style={{ transformStyle: 'preserve-3d' }}>
      <div className="absolute inset-0 flex items-center justify-center backface-hidden lishu-font">
        <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-amber-900/30 flex items-center justify-center bg-[#2d1b0d]/50">
          {isHeads ? '陽' : '陰'}
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center backface-hidden rotate-180 lishu-font" style={{ transform: 'rotateY(180deg)' }}>
        <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-amber-900/30 flex items-center justify-center bg-[#2d1b0d]/50">
          {isHeads ? '陰' : '陽'}
        </div>
      </div>
      <div className="absolute w-6 h-6 border-2 border-amber-900/20 bg-transparent"></div>
    </div>
  </div>
);

// --- 子組件: 卦爻線 (HexagramLine) ---
const HexagramLine: React.FC<{ type: LineType; label?: string; isMoving?: boolean }> = ({ type, label, isMoving }) => {
  const isYang = type === LineType.YoungYang || type === LineType.OldYang;
  return (
    <div className="flex items-center space-x-6 w-full h-10 group">
      {label && <span className="text-sm text-amber-100/40 w-16 lishu-font">{label}</span>}
      <div className="flex-1 flex justify-center items-center h-full">
        {isYang ? (
          <div className={`h-3 w-full max-w-[180px] bg-amber-50 rounded-none shadow-[0_0_10px_rgba(251,191,36,0.1)] relative transition-all ${isMoving ? 'ring-4 ring-amber-600 bg-amber-100' : 'opacity-80'}`}>
            {type === LineType.OldYang && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full border-4 border-[#1a1a1a] bg-amber-600 animate-pulse"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex w-full max-w-[180px] justify-between items-center h-full space-x-4">
            <div className={`h-3 w-[45%] bg-amber-50 rounded-none shadow-[0_0_10px_rgba(251,191,36,0.1)] transition-all ${isMoving ? 'ring-4 ring-amber-600 bg-amber-100' : 'opacity-80'}`} />
            {type === LineType.OldYin && <div className="text-amber-500 font-bold text-lg lishu-font drop-shadow-md">✕</div>}
            <div className={`h-3 w-[45%] bg-amber-50 rounded-none shadow-[0_0_10px_rgba(251,191,36,0.1)] transition-all ${isMoving ? 'ring-4 ring-amber-600 bg-amber-100' : 'opacity-80'}`} />
          </div>
        )}
      </div>
    </div>
  );
};

// --- 子組件: 老師親算彈窗 (MasterModal) ---
const MasterModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in lishu-font" onClick={onClose}>
      <div className="relative w-full max-w-sm bg-[#2a241f] border-4 border-amber-900/50 p-8 shadow-2xl ink-border" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-amber-100/50 hover:text-amber-100 transition-colors"><X className="w-6 h-6" /></button>
        <div className="text-center space-y-6">
          <div className="flex justify-center"><div className="p-3 bg-amber-900/20 rounded-full border border-amber-500/30"><Sparkles className="w-8 h-8 text-amber-400" /></div></div>
          <h3 className="text-3xl font-bold text-amber-200 tracking-widest">老師親算諮詢</h3>
          <div className="space-y-4">
            <p className="text-amber-100/70 text-lg leading-relaxed">欲求更深層的命理指引與建議，請掃描下方 QR Code 加入 LINE 與老師聯繫。</p>
            <div className="flex justify-center py-4">
              <div className="bg-white p-2 border-4 border-amber-900/20 shadow-inner">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://line.me/ti/p/h9zrZnC4Xx" alt="LINE QR Code" className="w-48 h-48" />
              </div>
            </div>
          </div>
          <p className="text-amber-100/30 text-sm italic pt-4">諮詢服務由專業命理師提供，誠信為本。</p>
        </div>
      </div>
    </div>
  );
};

// --- 主程式 (App Component) ---
const App: React.FC = () => {
  const [step, setStep] = useState<'input' | 'toss' | 'result'>('input');
  const [question, setQuestion] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [tosses, setTosses] = useState<LineType[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentCoins, setCurrentCoins] = useState<boolean[]>([true, true, true]);
  const [divinationResult, setDivinationResult] = useState<DivinationResult | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const startDivination = () => {
    if (!question.trim()) { setError("請先輸入您想占卜的問題。"); return; }
    setError(null); setTosses([]); setStep('toss');
  };

  const tossCoins = () => {
    if (isSpinning || tosses.length >= 6) return;
    setIsSpinning(true);
    const interval = setInterval(() => setCurrentCoins([Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5]), 100);
    setTimeout(() => {
      clearInterval(interval);
      const finalCoins = [Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5];
      setCurrentCoins(finalCoins);
      const score = finalCoins.reduce((acc, isHead) => acc + (isHead ? 3 : 2), 0);
      setTosses(prev => [...prev, score as LineType]);
      setIsSpinning(false);
    }, 1000);
  };

  useEffect(() => { if (tosses.length === 6) calculateResult(); }, [tosses]);

  const calculateResult = useCallback(() => {
    const originalBinary = tosses.map(line => (line === LineType.YoungYang || line === LineType.OldYang) ? '1' : '0').join('');
    const changedBinary = tosses.map(line => {
      if (line === LineType.OldYang) return '0';
      if (line === LineType.OldYin) return '1';
      return (line === LineType.YoungYang) ? '1' : '0';
    }).join('');
    const originalHex = HEXAGRAMS[originalBinary];
    const changedHex = originalBinary !== changedBinary ? HEXAGRAMS[changedBinary] : undefined;
    const movingLinesIndexes = tosses.reduce((acc, line, idx) => { if (line === LineType.OldYang || line === LineType.OldYin) acc.push(idx); return acc; }, [] as number[]);
    const result: DivinationResult = { question, gender, lines: tosses, originalHex, changedHex, movingLinesIndexes };
    setDivinationResult(result); setStep('result'); fetchAIResult(result);
  }, [tosses, question, gender]);

  const fetchAIResult = async (result: DivinationResult) => {
    setLoadingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const prompt = `你是一位精通易經的大師。問事：「${result.question}」。性別：${result.gender === 'male' ? '男' : '女'}。本卦：${result.originalHex.fullName}。變卦：${result.changedHex?.fullName || '無'}。請給予優雅的總結、詳細分析與具體建議。`;
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 16384 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              analysis: { type: Type.STRING },
              advice: { type: Type.STRING }
            },
            required: ["summary", "analysis", "advice"]
          }
        }
      });
      const data = JSON.parse(response.text || "{}");
      setDivinationResult(prev => prev ? { ...prev, aiInterpretation: data } : null);
    } catch (e) {
      console.error(e);
      setDivinationResult(prev => prev ? { ...prev, aiInterpretation: { summary: "卦象深邃，吉凶在誠。", analysis: "局勢正處於轉化點。", advice: "靜心觀測，隨緣而動。" } } : null);
    } finally { setLoadingAI(false); }
  };

  const reset = () => { setStep('input'); setQuestion(''); setTosses([]); setDivinationResult(null); };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 oriental-pattern">
      <MasterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <header className="w-full max-w-4xl text-center mb-12 flex flex-col items-center kaiti-font">
        <h1 className="text-4xl md:text-6xl font-bold text-amber-200 mb-4 tracking-[0.2em] drop-shadow-lg">芷月閣東方占卜</h1>
        <p className="text-amber-100/80 text-xl md:text-3xl tracking-widest mb-6">承襲千年智慧，指引迷途心靈</p>
      </header>

      <main className="w-full max-w-4xl bg-[#2a241f] shadow-2xl rounded-sm p-6 md:p-12 border-4 border-[#3d3028] ink-border flex-1 flex flex-col">
        {step === 'input' && (
          <div className="flex flex-col items-center space-y-8 animate-fade-in lishu-font">
            <div className="w-full max-w-md space-y-8 text-center">
              <div className="space-y-4">
                <label className="block text-2xl font-medium text-amber-100/90 tracking-wide flex items-center justify-center"><User className="mr-2 w-6 h-6" /> 您的性別：</label>
                <div className="flex justify-center space-x-4">
                  {(['male', 'female', 'other'] as Gender[]).map((g) => (
                    <button key={g} onClick={() => setGender(g)} className={`px-8 py-3 border-2 transition-all text-xl ${gender === g ? 'bg-amber-700 border-amber-500 text-amber-50 shadow-lg scale-105' : 'bg-[#1a1512] border-amber-900/30 text-amber-100/40'}`}>
                      {g === 'male' ? '乾 (男)' : g === 'female' ? '坤 (女)' : '其他'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-2xl font-medium text-amber-100/90 mb-6 tracking-wide">請專注思考您的問題，然後輸入：</label>
                <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="例如：我接下來半年的職場發展如何？" className="w-full p-6 border-4 border-[#3d3028] rounded-none focus:border-amber-600 focus:ring-0 text-xl h-40 resize-none bg-white text-stone-900 shadow-inner lishu-font" />
              </div>
              {error && <p className="mt-4 text-red-400 text-lg">{error}</p>}
            </div>
            <button onClick={startDivination} className="px-12 py-5 bg-gradient-to-r from-amber-800 to-amber-700 text-amber-50 rounded-none font-bold text-2xl hover:from-amber-700 transform hover:scale-105 flex items-center shadow-2xl tracking-widest">立刻算 <Send className="ml-3 w-6 h-6" /></button>
          </div>
        )}

        {step === 'toss' && (
          <div className="flex-1 flex flex-col items-center justify-between py-4 animate-fade-in lishu-font">
            <div className="text-center"><h2 className="text-3xl font-bold text-amber-100 mb-3 tracking-widest brush-font">正在起卦</h2><p className="text-amber-500 text-xl">目前第 {tosses.length + 1} 爻 (共六爻)</p></div>
            <div className="flex flex-col items-center">
              <div className="flex flex-col-reverse space-y-reverse space-y-6 mb-16 w-64">
                {[...Array(6)].map((_, i) => tosses[i] ? <HexagramLine key={i} type={tosses[i]} label={`第${i+1}爻`} /> : <div key={i} className="flex items-center space-x-4 w-full h-8 opacity-10"><span className="text-sm text-amber-100 w-12 lishu-font">第{i+1}爻</span><div className="flex-1 h-2 bg-amber-100 rounded-sm" /></div>)}
              </div>
              <div className="flex space-x-10 mb-16"><Coin isHeads={currentCoins[0]} isSpinning={isSpinning} /><Coin isHeads={currentCoins[1]} isSpinning={isSpinning} /><Coin isHeads={currentCoins[2]} isSpinning={isSpinning} /></div>
              <button onClick={tossCoins} disabled={isSpinning || tosses.length >= 6} className={`px-16 py-6 rounded-none font-bold text-3xl transition-all transform flex items-center shadow-2xl border-2 ${isSpinning ? 'bg-stone-800 text-stone-600 cursor-not-allowed' : 'bg-amber-800 text-amber-50 hover:bg-amber-700 hover:scale-105'}`}>{isSpinning ? '銅錢轉動中...' : '請按六次'} <RefreshCw className={`ml-4 w-8 h-8 ${isSpinning ? 'animate-spin' : ''}`} /></button>
            </div>
            <div className="text-amber-100/30 text-lg italic tracking-widest mt-8">請誠心投擲，卦象隨機而發。</div>
          </div>
        )}

        {step === 'result' && divinationResult && (
          <div className="animate-fade-in space-y-16 lishu-font">
            <div className="text-center border-b border-amber-900/30 pb-10"><h2 className="text-4xl font-bold text-amber-50 text-shadow-lg">「{divinationResult.question}」</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="flex flex-col items-center p-10 bg-stone-900/50 rounded-none border-2 border-[#3d3028] relative overflow-hidden ink-border">
                <h3 className="text-2xl font-bold text-amber-500 mb-8 tracking-widest lishu-font">本卦：{divinationResult.originalHex.fullName}</h3>
                <div className="flex flex-col-reverse space-y-reverse space-y-6 w-56 mb-10">{divinationResult.lines.map((line, i) => <HexagramLine key={i} type={line} />)}</div>
                <p className="text-amber-100/70 text-center italic text-xl">「{divinationResult.originalHex.description}」</p>
              </div>
              <div className="flex flex-col items-center p-10 bg-amber-950/20 rounded-none border-2 border-amber-900/30 relative overflow-hidden ink-border">
                {divinationResult.changedHex ? (<>
                  <h3 className="text-2xl font-bold text-amber-400 mb-8 tracking-widest lishu-font">變卦：{divinationResult.changedHex.fullName}</h3>
                  <div className="flex flex-col-reverse space-y-reverse space-y-6 w-56 mb-10">{divinationResult.lines.map((line, i) => {
                    let c = line; if(line===9) c=8; if(line===6) c=7; return <HexagramLine key={i} type={c} isMoving={line===9||line===6} />;
                  })}</div>
                  <p className="text-amber-200/60 text-center italic text-xl">「{divinationResult.changedHex.description}」</p>
                </>) : <div className="flex items-center justify-center h-full text-amber-100/20"><p className="text-2xl lishu-font">無變爻，守常即安。</p></div>}
              </div>
            </div>

            <div className="bg-[#1f1a16] border-4 border-amber-900/40 p-10 relative shadow-2xl">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-700 text-amber-50 px-10 py-2 rounded-none text-xl font-bold border-2 border-amber-600 lishu-font tracking-widest">芷月大師靈感解析</div>
              {loadingAI ? <div className="py-16 flex flex-col items-center space-y-6"><Loader2 className="w-16 h-16 text-amber-500 animate-spin" /><p className="text-amber-200/50 text-2xl animate-pulse lishu-font">天地感應乾坤萬象 分析中</p></div> : divinationResult.aiInterpretation && (
                <div className="space-y-12 prose prose-invert max-w-none text-xl lishu-font">
                  <section><h4 className="text-2xl font-bold text-amber-500 border-l-4 border-amber-600 pl-4 mb-6">總體運勢</h4><p className="text-amber-50 leading-relaxed">{divinationResult.aiInterpretation.summary}</p></section>
                  <section><h4 className="text-2xl font-bold text-amber-500 border-l-4 border-amber-600 pl-4 mb-6">卦象分析</h4><p className="text-amber-100/80 leading-loose text-justify">{divinationResult.aiInterpretation.analysis}</p></section>
                  <section><h4 className="text-2xl font-bold text-amber-500 border-l-4 border-amber-600 pl-4 mb-6">誠心建議</h4><div className="bg-amber-950/30 p-8 text-amber-200 border border-amber-900/50">{divinationResult.aiInterpretation.advice}</div></section>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row justify-center gap-6 pt-12 border-t border-amber-900/20 pb-12">
              <button onClick={reset} className="flex items-center px-10 py-4 bg-stone-800 text-amber-200 font-bold text-xl hover:bg-stone-700 transition-colors border border-amber-900/50 lishu-font w-full md:w-1/2 justify-center"><RefreshCw className="mr-3 w-5 h-5" /> 重新占卜</button>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center px-10 py-4 bg-gradient-to-r from-amber-700 to-amber-900 text-white font-bold text-xl transform hover:scale-105 border-2 border-amber-500 shadow-lg lishu-font w-full md:w-1/2 justify-center group"><Sparkles className="mr-3 w-5 h-5 group-hover:animate-ping" /> 老師親算</button>
            </div>
          </div>
        )}
      </main>
      <footer className="w-full max-w-4xl text-center py-12 text-amber-100/20 text-sm tracking-[0.5em] uppercase lishu-font">© 2024 芷月閣 • 東方占卜 ‧ 智慧傳承 ‧ Powered by Gemini 3</footer>
    </div>
  );
};

export default App;
