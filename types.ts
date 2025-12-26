
export enum LineType {
  OldYin = 6,    // Moving Yin (--) X
  YoungYang = 7, // Stable Yang (—)
  YoungYin = 8,  // Stable Yin (--)
  OldYang = 9    // Moving Yang (—) O
}

export interface HexagramData {
  id: string;      // Binary string representation (e.g., "111111")
  number: number;  // 1-64
  name: string;    // Chinese name (e.g., "乾")
  fullName: string; // (e.g., "乾為天")
  symbol: string;  // Unicode character
  description: string;
}

export type Gender = 'male' | 'female' | 'other';

export interface DivinationResult {
  question: string;
  gender: Gender;
  lines: LineType[];
  originalHex: HexagramData;
  changedHex?: HexagramData;
  movingLinesIndexes: number[]; // 0-5
  aiInterpretation?: AIInterpretation;
}

export interface AIInterpretation {
  summary: string;
  analysis: string;
  advice: string;
}
