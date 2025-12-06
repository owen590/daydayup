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