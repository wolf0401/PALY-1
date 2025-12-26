import { GoogleGenAI, Type } from "@google/genai";
import { AIInterpretation, DivinationResult } from "../types";

export const getInterpretation = async (result: DivinationResult): Promise<AIInterpretation> => {
  // 每次調用時初始化以確保獲取最新的 API Key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const movingLinesText = result.movingLinesIndexes.length > 0 
    ? `變爻在第 ${result.movingLinesIndexes.map(i => i + 1).join(', ')} 爻` 
    : "無變爻";

  const genderText = result.gender === 'male' ? '男性' : result.gender === 'female' ? '女性' : '保密/其他';

  const prompt = `
    你是一位精通《易經》與東方命理的占卜大師「芷月」。
    
    【基本資料】
    使用者性別：${genderText}
    問事內容：「${result.question}」
    本卦：${result.originalHex.fullName} (${result.originalHex.name}) - ${result.originalHex.description}
    變卦：${result.changedHex ? result.changedHex.fullName + " (" + result.changedHex.name + ") - " + result.changedHex.description : "無變卦"}
    變爻狀況：${movingLinesText}
    
    【指令】
    1. 請根據易經哲學、卦辭、象辭以及具體變爻的含義，為使用者提供精準且深入的解讀。
    2. 分析需考慮陰陽消長、五行生剋、時位中正等因素。
    3. 針對其性別背景（乾造/坤造）給予貼切的語氣與具體建議。
    4. 語氣應溫雅、神祕且具備指引性。
    5. 必須返回符合 JSON 格式的內容。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        // 使用思維預算來進行更深度的卦象推演
        thinkingConfig: { thinkingBudget: 16384 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "一句話總結目前的運勢，語氣需優雅。",
            },
            analysis: {
              type: Type.STRING,
              description: "詳細的卦象與變爻分析，結合現實生活中的應對方法。",
            },
            advice: {
              type: Type.STRING,
              description: "針對使用者的具體問題給出的具體行動建議。",
            }
          },
          required: ["summary", "analysis", "advice"],
        }
      },
    });

    // 使用屬性訪問方式獲取 text
    const text = response.text || "";
    const data = JSON.parse(text);
    return data as AIInterpretation;
  } catch (error) {
    console.error("Gemini AI 解析失敗:", error);
    return {
      summary: "卦象深邃，陰陽轉化，吉凶隱於誠心之中。",
      analysis: "目前局勢正處於關鍵的能量交會點，卦象顯示雖有波動但亦藏生機，需靜心觀測。",
      advice: "建議近日保持內心的安定，不宜躁進，隨緣而動方能避凶趨吉。"
    };
  }
};