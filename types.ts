export enum AppView {
  HOME = 'HOME',
  HANZI = 'HANZI',
  ENGLISH = 'ENGLISH',
  MATH = 'MATH',
  SETTINGS = 'SETTINGS'
}

export interface LearningItem {
  id: string;
  term: string; // The character or word
  pronunciation: string; // Pinyin or IPA
  meaning: string;
  example: string;
  category: 'hanzi' | 'english';
  grade?: string; // 年级，如：一年级上, 一年级下
  unit?: string; // 单元，如：第一单元, 第二单元
  subcategory?: string; // 分类，如：numbers, nature, family等
  isWritable?: boolean; // 是否为要求会写的字
  isRead?: boolean;
}

export interface MathProblem {
  question: string;
  answer: number;
  options: number[];
  operation: '+' | '-' | '*' | '/';
}

export interface GeminiResponse {
  content: string;
  isError: boolean;
}