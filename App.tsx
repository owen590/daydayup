import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Languages,
  Calculator,
  Search,
  Star,
  Volume2,
  ArrowLeft,
  Sparkles,
  Trophy,
  BrainCircuit,
  Loader2,
  CheckCircle,
  Circle,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share,
  PlusSquare
} from 'lucide-react';
import { AppView, LearningItem, MathProblem } from './types';
import { INITIAL_ENGLISH } from './constants';
import { generateExplanation, searchNewItem, generateMathProblem, generateMathProblemWithOptions } from './services/aiService';

// 加载汉字数据的函数
const loadHanziData = async () => {
  try {
    const grades = [1, 2, 3, 4, 5, 6];
    const hanziData: LearningItem[] = [];
    
    for (const grade of grades) {
      try {
        const response = await fetch(`/汉字生字/${grade}年级_汉字数据.json`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const formattedData = data.map(item => ({
            ...item,
            category: 'hanzi',
            isRead: false,
            isWritable: item.isWritable !== undefined ? item.isWritable : true
          }));
          hanziData.push(...formattedData);
        } else if (data && typeof data === 'object') {
          // 处理按单元组织的结构
          Object.keys(data).forEach(unitKey => {
            const unitData = data[unitKey];
            if (Array.isArray(unitData)) {
              unitData.forEach((item: any) => {
                hanziData.push({
                  ...item,
                  grade: `${grade}年级`,
                  unit: unitKey,
                  category: 'hanzi',
                  isRead: false,
                  isWritable: item.isWritable !== undefined ? item.isWritable : true
                });
              });
            } else if (unitData && typeof unitData === 'object' && unitData.characters) {
              // 处理更复杂的结构，如包含characters数组
              unitData.characters.forEach((char: string) => {
                hanziData.push({
                  id: `h${grade}-${unitKey}-${char}`,
                  term: char,
                  pronunciation: '',
                  meaning: '',
                  example: '',
                  grade: `${grade}年级`,
                  unit: unitKey,
                  category: 'hanzi',
                  isRead: false,
                  isWritable: true
                });
              });
            }
          });
        }
      } catch (error) {
        console.error(`加载${grade}年级汉字数据失败:`, error);
      }
    }
    
    return hanziData;
  } catch (error) {
    console.error('加载汉字数据失败:', error);
    return [];
  }
};

// 加载英语数据的函数
const loadEnglishData = async () => {
  try {
    // 加载所有英语年级的JSON数据
    const grades = [
      { file: 'englishGrade1.json', grade: '一年级上' },
      { file: 'englishGrade1B.json', grade: '一年级下' },
      { file: 'englishGrade2.json', grade: '二年级上' },
      { file: 'englishGrade2B.json', grade: '二年级下' },
      { file: 'englishGrade3.json', grade: '三年级上' },
      { file: 'englishGrade3B.json', grade: '三年级下' }
    ];
    
    const englishData: LearningItem[] = [];
    
    for (const grade of grades) {
      try {
        const response = await fetch(`/英语生字/${grade.file}`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const formattedData = data.map((item: any) => ({
            ...item,
            category: 'english',
            isRead: false,
            isWritable: item.isWritable !== undefined ? item.isWritable : true
          }));
          englishData.push(...formattedData);
        }
      } catch (error) {
        console.error(`加载${grade.grade}英语数据失败:`, error);
      }
    }
    
    return englishData;
  } catch (error) {
    console.error('加载英语数据失败:', error);
    return [];
  }
};

// --- Components ---

const Button: React.FC<{ 
  onClick: () => void; 
  children: React.ReactNode; 
  color: string; 
  className?: string;
  disabled?: boolean;
}> = ({ onClick, children, color, className = "", disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-4 rounded-2xl font-bold text-white shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2 ${color} ${className} ${disabled ? 'opacity-50 cursor-not-allowed active:shadow-[0_4px_0_rgba(0,0,0,0.2)] active:translate-y-0' : ''}`}
  >
    {children}
  </button>
);

const Card: React.FC<{
  item: LearningItem;
  onAskAI: (item: LearningItem) => void;
  onToggleRead: (item: LearningItem) => void;
}> = ({ item, onAskAI, onToggleRead }) => {
  const [flipped, setFlipped] = useState(false);
  const isRead = item.isRead || false;

  // Synthesize speech
  const speak = (e: React.MouseEvent) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(item.term);
    utterance.lang = item.category === 'hanzi' ? 'zh-CN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  return (
    <div 
      className="relative w-full h-80 perspective-1000 cursor-pointer group select-none"
      onClick={handleFlip}
    >
      <div className={`relative w-full h-full transition-all duration-500 preserve-3d ${flipped ? 'rotate-y-180' : ''}`}>
        
        {/* Front */}
        <div className={`absolute top-0 left-0 w-full h-full backface-hidden bg-white rounded-[2rem] shadow-xl flex flex-col items-center justify-center p-4 border-4 transition-colors overflow-hidden z-10 ${isRead ? 'border-kid-green bg-green-50' : 'border-kid-blue'}`}>
           
           {/* Read Toggle */}
           <button 
             onClick={(e) => { e.stopPropagation(); onToggleRead(item); }}
             className={`absolute top-3 right-3 p-3 rounded-full transition-all z-20 ${isRead ? 'text-kid-green bg-green-100' : 'text-gray-300 hover:text-gray-400'}`}
           >
              {isRead ? <CheckCircle size={28} className="fill-current" /> : <Circle size={28} />}
           </button>

           {isRead && (
             <div className="absolute top-4 left-4 bg-kid-green text-white text-[12px] font-bold px-3 py-1 rounded-full animate-fade-in shadow-sm">
               已学会
             </div>
           )}

           {/* Content Area */}
           <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
              <div className={`font-black text-center break-words w-full px-1 overflow-hidden leading-relaxed ${                  item.category === 'hanzi' 
                  ? 'text-8xl text-kid-purple' 
                  : 'text-5xl text-kid-pink'
              }`} style={{ fontFamily: item.category === 'hanzi' ? 'Noto Serif SC, serif' : 'Fredoka, sans-serif' }}>
                {item.term}
              </div>

              {/* Show Chinese translation on front for English cards */}
              {item.category === 'english' && (
                <div className="text-3xl text-kid-purple font-bold mt-1" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                  {item.meaning}
                </div>
              )}

              <div className="text-xl text-gray-500 font-bold font-sans mt-1">{item.pronunciation}</div>
              
              <button 
                onClick={speak}
                className="mt-4 p-3 bg-kid-yellow rounded-full active:scale-90 transition-transform text-white shadow-md"
              >
                <Volume2 size={24} />
              </button>
           </div>
           
           <div className="absolute bottom-3 text-gray-300 text-[10px] font-bold uppercase tracking-widest">点击翻面</div>
        </div>

        {/* Back */}
        <div className={`absolute top-0 left-0 w-full h-full backface-hidden rotate-y-180 rounded-[2rem] shadow-xl flex flex-col p-5 text-white overflow-y-auto ${isRead ? 'bg-gradient-to-br from-kid-green to-emerald-400' : 'bg-gradient-to-br from-kid-blue to-blue-400'}`}>
          <div className="flex-1 flex flex-col justify-center gap-4">
            
            {/* Meaning Section */}
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 block mb-1">
                含义
              </span>
              <div className={`font-bold leading-tight ${item.category === 'english' ? 'text-2xl' : 'text-xl'}`} style={{ fontFamily: item.category === 'hanzi' ? 'Noto Serif SC, serif' : 'inherit' }}>
                {item.meaning}
              </div>
            </div>

            {/* Example Section */}
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 block mb-1">
                例句
              </span>
              <div className="text-lg font-medium italic leading-relaxed opacity-95" style={{ fontFamily: item.category === 'hanzi' ? 'Noto Serif SC, serif' : 'inherit' }}>
                "{item.example}"
              </div>
            </div>

          </div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onAskAI(item); }}
            className={`mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold shadow-lg transition-colors active:scale-95 ${isRead ? 'bg-white text-kid-green' : 'bg-white text-kid-blue'}`}
          >
            <Sparkles size={18} />
            {item.category === 'hanzi' ? '听故事' : '问AI老师'}
          </button>
        </div>

      </div>
    </div>
  );
};

// --- Main App ---

const ITEMS_PER_PAGE = 4;

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [items, setItems] = useState<LearningItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<LearningItem[]>([]);
  const [score, setScore] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  
  // 汉字两级分类状态
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  
  // 加载状态
  const [isLoading, setIsLoading] = useState(false);
  
  // Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  // Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiContent, setAiContent] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Math State
  const [mathProblem, setMathProblem] = useState<MathProblem | null>(null);
  const [mathFeedback, setMathFeedback] = useState<string | null>(null);

  // Install Prompt Listener
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
      });
    } else {
      setShowInstallGuide(true);
    }
  };

  // Initialize Data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      let newItems: LearningItem[] = [];
      
      if (currentView === AppView.HANZI) {
        // 从汉字生字文件夹加载数据
        newItems = await loadHanziData();
      }
      
      if (currentView === AppView.ENGLISH) {
        // 从英语生字文件夹加载数据
        newItems = await loadEnglishData();
      }
      
      setItems(newItems);
      
      // 重置状态
      setSelectedCategory(null);
      setSelectedGrade(null);
      setSelectedUnit(null);
      setCurrentPage(1);
      setIsLoading(false);
    };
    
    fetchData();
  }, [currentView]);

  // Search Logic with Grade and Unit Filter
  useEffect(() => {
    if (!items.length) return;
    
    const lower = searchTerm.toLowerCase();
    let filtered = items;
    
    // 年级筛选
    if (selectedGrade) {
      filtered = filtered.filter(i => i.grade === selectedGrade);
    }
    
    // 单元筛选
    if (selectedUnit) {
      filtered = filtered.filter(i => i.unit === selectedUnit);
    }
    
    // 分类筛选（保留原功能，用于英语学习）
    if (selectedCategory) {
      filtered = filtered.filter(i => i.subcategory === selectedCategory);
    }
    
    // 搜索筛选
    if (searchTerm) {
      filtered = filtered.filter(i => 
        i.term.toLowerCase().includes(lower) || 
        i.meaning.toLowerCase().includes(lower)
      );
    }
    
    setFilteredItems(filtered);
    
    // 筛选条件变化时重置页码
    if (searchTerm || selectedCategory || selectedGrade || selectedUnit) {
      setCurrentPage(1);
    }
  }, [searchTerm, items, selectedCategory, selectedGrade, selectedUnit]);

  const handleGlobalSearch = async () => {
    if (!searchTerm || filteredItems.length > 0) return;
    
    setIsAiLoading(true);
    setShowAiModal(true);
    setAiContent("正在魔法图书馆搜索...");
    
    const newItem = await searchNewItem(searchTerm, currentView === AppView.HANZI ? 'hanzi' : 'english');
    
    if (newItem) {
      setItems(prev => [newItem, ...prev]);
      setSearchTerm('');
      setAiContent(`找到啦！已把 "${newItem.term}" 放入你的生词本。`);
    } else {
      setAiContent("抱歉，魔法书里没有找到这个词。");
    }
    setIsAiLoading(false);
  };

  const handleAskAI = async (item: LearningItem) => {
    setShowAiModal(true);
    setIsAiLoading(true);
    setAiContent("正在思考...");
    const explanation = await generateExplanation(item.term, item.category);
    setAiContent(explanation);
    setIsAiLoading(false);
  };

  const handleToggleRead = (targetItem: LearningItem) => {
    setItems(currentItems => 
      currentItems.map(item => 
        item.id === targetItem.id ? { ...item, isRead: !item.isRead } : item
      )
    );
    if (!targetItem.isRead) {
      setScore(s => s + 5);
    }
  };

  // --- Math Logic ---
  const [mathDifficulty, setMathDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  
  const generateMath = useCallback(async (useAiForWordProblem = false, useAiWithOptions = false) => {
    setMathFeedback(null);
    
    if (useAiWithOptions) {
      // 使用AI生成带有答案和选项的完整数学题
      const aiProblem = await generateMathProblemWithOptions(mathDifficulty);
      setMathProblem(aiProblem);
      return;
    }
    
    if (useAiForWordProblem) {
       const problemText = await generateMathProblem(mathDifficulty);
       setMathProblem({
         question: problemText,
         answer: -999, // Special state for text-only problems
         options: [], 
         operation: '+'
       });
       return;
    }

    // 根据难度调整数学题类型和复杂度
    let mathTypes: string[];
    let maxDigitCount: number;
    
    switch (mathDifficulty) {
      case 'easy':
        mathTypes = ['addition', 'subtraction'];
        maxDigitCount = 1;
        break;
      case 'medium':
        mathTypes = ['addition', 'subtraction', 'multiplication', 'division'];
        maxDigitCount = 2;
        break;
      case 'hard':
        mathTypes = ['addition', 'subtraction', 'multiplication', 'division', 'decimal'];
        maxDigitCount = 3;
        break;
      default:
        mathTypes = ['addition', 'subtraction'];
        maxDigitCount = 1;
    }
    
    const type = mathTypes[Math.floor(Math.random() * mathTypes.length)];
    let question = '';
    let answer = 0;
    let operation = '';

    switch (type) {
      case 'addition': {
        // 根据难度调整位数
        const digitCount = Math.random() > 0.5 ? maxDigitCount : maxDigitCount - 1;
        const a = Math.floor(Math.random() * Math.pow(10, digitCount)) + 1;
        const b = Math.floor(Math.random() * Math.pow(10, digitCount)) + 1;
        answer = a + b;
        question = `${a} + ${b} = ?`;
        operation = '+';
        break;
      }
      case 'subtraction': {
        // 根据难度调整位数，确保结果为正
        const digitCount = Math.random() > 0.5 ? maxDigitCount : maxDigitCount - 1;
        const a = Math.floor(Math.random() * Math.pow(10, digitCount)) + 1;
        const b = Math.floor(Math.random() * a) + 1;
        answer = a - b;
        question = `${a} - ${b} = ?`;
        operation = '-';
        break;
      }
      case 'multiplication': {
        // 简单乘法，根据难度调整范围
        if (mathDifficulty === 'easy') {
          // 表内乘法（1-5）
          const a = Math.floor(Math.random() * 5) + 1;
          const b = Math.floor(Math.random() * 5) + 1;
          answer = a * b;
          question = `${a} × ${b} = ?`;
        } else if (mathDifficulty === 'medium') {
          // 表内乘法（1-9）
          const a = Math.floor(Math.random() * 9) + 1;
          const b = Math.floor(Math.random() * 9) + 1;
          answer = a * b;
          question = `${a} × ${b} = ?`;
        } else {
          // 一位数乘两位数
          const a = Math.floor(Math.random() * 9) + 1;
          const b = Math.floor(Math.random() * 99) + 10;
          answer = a * b;
          question = `${a} × ${b} = ?`;
        }
        operation = '*';
        break;
      }
      case 'division': {
        // 简单除法，根据难度调整范围
        if (mathDifficulty === 'easy') {
          // 表内除法（1-5）
          const a = Math.floor(Math.random() * 5) + 1;
          const b = Math.floor(Math.random() * 5) + 1;
          answer = a;
          const dividend = a * b;
          question = `${dividend} ÷ ${b} = ?`;
        } else if (mathDifficulty === 'medium') {
          // 表内除法（1-9）
          const a = Math.floor(Math.random() * 9) + 1;
          const b = Math.floor(Math.random() * 9) + 1;
          answer = a;
          const dividend = a * b;
          question = `${dividend} ÷ ${b} = ?`;
        } else {
          // 两位数除以一位数（整除）
          const a = Math.floor(Math.random() * 9) + 1;
          const b = Math.floor(Math.random() * 9) + 2;
          answer = b;
          const dividend = a * b;
          question = `${dividend} ÷ ${a} = ?`;
        }
        operation = '/';
        break;
      }
      case 'decimal': {
        // 简单小数加减法（一位小数）
        const a = (Math.floor(Math.random() * 99) + 1) / 10;
        const b = (Math.floor(Math.random() * 99) + 1) / 10;
        if (Math.random() > 0.5) {
          answer = a + b;
          question = `${a} + ${b} = ?`;
          operation = '+';
        } else {
          answer = Math.max(a, b) - Math.min(a, b);
          question = `${Math.max(a, b)} - ${Math.min(a, b)} = ?`;
          operation = '-';
        }
        answer = Math.round(answer * 10) / 10; // 保留一位小数
        break;
      }
      default:
        // 默认回退到基础运算
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        answer = a + b;
        question = `${a} + ${b} = ?`;
        operation = '+';
    }

    // 生成选项（考虑小数情况）
    const opts = new Set<number>([answer]);
    while (opts.size < 4) {
      const range = type === 'decimal' ? 1 : 10;
      const offset = (Math.random() - 0.5) * range;
      const newOption = Math.round((answer + offset) * (type === 'decimal' ? 10 : 1)) / (type === 'decimal' ? 10 : 1);
      opts.add(newOption);
    }

    setMathProblem({
      question: question,
      answer: answer,
      options: Array.from(opts).sort(() => Math.random() - 0.5),
      operation: operation as '+' | '-' | '*' | '/' | 'word'
    });
  }, [mathDifficulty]);

  const handleMathAnswer = (selected: number) => {
    if (!mathProblem) return;
    if (selected === mathProblem.answer) {
      setScore(s => s + 10);
      setMathFeedback("太棒了！答对了！🌟");
      setTimeout(() => generateMath(), 1500);
    } else {
      setMathFeedback("加油，再试一次！");
    }
  };

  useEffect(() => {
    if (currentView === AppView.MATH) generateMath();
  }, [currentView, generateMath]);


  // --- Render Views ---

  const renderHome = () => (
    <div className="flex flex-col items-center min-h-screen p-6 pb-24 space-y-8 bg-gradient-to-b from-kid-bg to-white">
      <div className="text-center pt-10">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-kid-purple to-kid-pink mb-4 leading-tight drop-shadow-sm chinese-text">
          天天向上
        </h1>
        <p className="text-xl text-gray-500 font-medium">小学生APP</p>
      </div>

      <div className="flex flex-col gap-6 w-full max-w-md">
        <div 
          onClick={() => setCurrentView(AppView.HANZI)}
          className="bg-white p-6 rounded-[2rem] shadow-[0_10px_20px_-10px_rgba(0,0,0,0.1)] active:scale-95 transition-all cursor-pointer border border-gray-100 flex items-center gap-6 relative overflow-hidden group"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-kid-green/10 rounded-bl-[100px] transition-transform group-hover:scale-110"></div>
          <div className="w-16 h-16 bg-kid-green/20 rounded-2xl flex items-center justify-center text-kid-green shrink-0 shadow-sm">
            <Languages size={32} />
          </div>
          <div className="flex-1 z-10">
            <h2 className="text-2xl font-bold text-gray-800 chinese-text">学汉字</h2>
            <span className="text-gray-400 font-medium">常用汉字</span>
          </div>
        </div>

        <div 
          onClick={() => setCurrentView(AppView.ENGLISH)}
          className="bg-white p-6 rounded-[2rem] shadow-[0_10px_20px_-10px_rgba(0,0,0,0.1)] active:scale-95 transition-all cursor-pointer border border-gray-100 flex items-center gap-6 relative overflow-hidden group"
        >
           <div className="absolute right-0 top-0 w-24 h-24 bg-kid-blue/10 rounded-bl-[100px] transition-transform group-hover:scale-110"></div>
          <div className="w-16 h-16 bg-kid-blue/20 rounded-2xl flex items-center justify-center text-kid-blue shrink-0 shadow-sm">
            <BookOpen size={32} />
          </div>
          <div className="flex-1 z-10">
            <h2 className="text-2xl font-bold text-gray-800 chinese-text">学英语</h2>
            <span className="text-gray-400 font-medium">基础单词</span>
          </div>
        </div>

        <div 
          onClick={() => setCurrentView(AppView.MATH)}
          className="bg-white p-6 rounded-[2rem] shadow-[0_10px_20px_-10px_rgba(0,0,0,0.1)] active:scale-95 transition-all cursor-pointer border border-gray-100 flex items-center gap-6 relative overflow-hidden group"
        >
           <div className="absolute right-0 top-0 w-24 h-24 bg-kid-yellow/10 rounded-bl-[100px] transition-transform group-hover:scale-110"></div>
          <div className="w-16 h-16 bg-kid-yellow/20 rounded-2xl flex items-center justify-center text-kid-yellow shrink-0 shadow-sm">
            <Calculator size={32} />
          </div>
          <div className="flex-1 z-10">
            <h2 className="text-2xl font-bold text-gray-800 chinese-text">趣味数学</h2>
            <span className="text-gray-400 font-medium">加减乘除大挑战</span>
          </div>
        </div>
      </div>
      
      {/* Download App Button */}
      <div className="w-full max-w-md pt-4">
        <button 
          onClick={handleInstallClick}
          className="w-full bg-gray-900 text-white p-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 border-2 border-transparent hover:border-gray-700"
        >
          <Download size={24} className="animate-bounce" />
          <span className="font-bold text-lg">下载 APP (安装到手机)</span>
        </button>
        <p className="text-center text-gray-400 text-xs mt-3 px-4">
            支持 Android / iOS / Desktop
        </p>
      </div>

      <div className="fixed bottom-6 right-6 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-kid-yellow/30 flex items-center gap-3 z-50">
        <Trophy className="text-kid-yellow fill-current animate-pulse" size={24} />
        <span className="font-bold text-2xl text-gray-700">{score}</span>
      </div>
    </div>
  );

  const renderDictionary = () => {
    const readCount = items.filter(i => i.isRead).length;
    const progress = items.length ? Math.round((readCount / items.length) * 100) : 0;
    
    // Pagination Calculations
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const paginatedItems = filteredItems.slice(
        (currentPage - 1) * ITEMS_PER_PAGE, 
        currentPage * ITEMS_PER_PAGE
    );
    
    // 提取唯一的年级列表
    const grades = Array.from(new Set(items.filter(i => i.grade).map(i => i.grade)));
    
    // 提取当前年级下的唯一单元列表
    const units = selectedGrade 
      ? Array.from(new Set(items.filter(i => i.grade === selectedGrade).map(i => i.unit))) 
      : [];

    return (
      <div className="min-h-screen bg-kid-bg flex flex-col">
        {/* Mobile Sticky Header */}
        <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-40 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            {selectedUnit ? (
              <button onClick={() => {
                setSelectedUnit(null);
                setSearchTerm('');
              }} className="p-2 -ml-2 hover:bg-gray-100 rounded-full active:scale-90 transition-transform">
                <ArrowLeft size={28} className="text-gray-600" />
              </button>
            ) : selectedGrade ? (
              <button onClick={() => {
                setSelectedGrade(null);
                setSelectedUnit(null);
                setSearchTerm('');
              }} className="p-2 -ml-2 hover:bg-gray-100 rounded-full active:scale-90 transition-transform">
                <ArrowLeft size={28} className="text-gray-600" />
              </button>
            ) : (
              <button onClick={() => setCurrentView(AppView.HOME)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full active:scale-90 transition-transform">
                <ArrowLeft size={28} className="text-gray-600" />
              </button>
            )}
            <h2 className="text-xl font-bold text-gray-800 chinese-text">
              {selectedUnit 
                ? `${selectedGrade} - ${selectedUnit}`
                : selectedGrade 
                  ? `${selectedGrade}`
                  : currentView === AppView.HANZI ? '语文课' : '英语课'}
            </h2>
            <div className="flex items-center gap-1 bg-kid-yellow/10 px-3 py-1 rounded-full">
              <Star className="text-kid-yellow fill-current" size={18} />
              <span className="font-bold text-base text-gray-700">{score}</span>
            </div>
          </div>

          {selectedUnit && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-kid-green transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="text-xs font-bold text-gray-400 whitespace-nowrap">{readCount} / {items.length}</span>
            </div>
          )}
        </div>

        <div className="flex-1 w-full max-w-6xl mx-auto p-4 flex flex-col gap-6">
          {/* 加载状态 */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={48} className="text-kid-blue animate-spin" />
              <span className="ml-3 text-xl font-bold text-gray-500 chinese-text">正在加载...</span>
            </div>
          ) : (
            <>
              {/* 年级选择界面（只有当存在grade信息时才显示） */}
              {((currentView === AppView.HANZI || currentView === AppView.ENGLISH) && !selectedGrade && items.some(i => i.grade)) && (
                <div className="grid grid-cols-2 gap-4">
                  {grades.map(grade => (
                    <button
                      key={grade}
                      onClick={() => setSelectedGrade(grade)}
                      className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex flex-col items-center gap-3"
                    >
                      <div className={`w-16 h-16 ${currentView === AppView.HANZI ? 'bg-kid-green/20 text-kid-green' : 'bg-kid-blue/20 text-kid-blue'} rounded-2xl flex items-center justify-center`}>
                        <Languages size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 chinese-text">
                        {grade}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {items.filter(i => i.grade === grade).length} {currentView === AppView.HANZI ? '个汉字' : '个单词'}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {/* 单元选择界面（只有当选择了年级且存在unit信息时才显示） */}
              {((currentView === AppView.HANZI || currentView === AppView.ENGLISH) && !selectedUnit && selectedGrade) && (
                <div className="grid grid-cols-2 gap-4">
                  {units.map(unit => (
                    <button
                      key={unit}
                      onClick={() => setSelectedUnit(unit)}
                      className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex flex-col items-center gap-3"
                    >
                      <div className={`w-16 h-16 ${currentView === AppView.HANZI ? 'bg-kid-green/20 text-kid-green' : 'bg-kid-blue/20 text-kid-blue'} rounded-2xl flex items-center justify-center`}>
                        <Languages size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 chinese-text">
                        {unit}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {items.filter(i => i.grade === selectedGrade && i.unit === unit).length} {currentView === AppView.HANZI ? '个汉字' : '个单词'}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {/* 搜索和字卡界面 */}
              {(!((currentView === AppView.HANZI || currentView === AppView.ENGLISH) && !selectedGrade && items.some(i => i.grade)) && 
                !((currentView === AppView.HANZI || currentView === AppView.ENGLISH) && !selectedUnit && selectedGrade)) && (
                <>
                  {/* Search Bar */}
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder={currentView === AppView.HANZI ? "搜索 (例如：火)..." : "搜索..."}
                      className="w-full p-4 pl-12 rounded-2xl border-none outline-none text-lg shadow-[0_2px_10px_rgba(0,0,0,0.05)] bg-white placeholder:text-gray-300 transition-all focus:ring-2 focus:ring-kid-blue/50"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                            <X size={20} />
                        </button>
                    )}
                  </div>

                  {searchTerm && filteredItems.length === 0 && !isAiLoading && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
                      <p className="mb-4 text-gray-500">书里没找到这个词哦。</p>
                      <Button color="bg-kid-pink" onClick={handleGlobalSearch} className="w-full">
                         <Sparkles size={18} /> 问问魔法老师
                      </Button>
                    </div>
                  )}

                  {/* Items Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedItems.map(item => (
                      <Card 
                        key={item.id} 
                        item={item} 
                        onAskAI={handleAskAI}
                        onToggleRead={handleToggleRead}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Spacer for bottom controls */}
          <div className="h-20"></div>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (selectedUnit || currentView === AppView.ENGLISH || (currentView === AppView.HANZI && !items.some(i => i.grade))) && (
            <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-100 p-4 z-40 flex items-center justify-between safe-area-bottom shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                <Button 
                    color="bg-kid-blue" 
                    onClick={() => {
                        setCurrentPage(p => Math.max(1, p - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="py-3 text-sm flex-1 max-w-[120px]"
                >
                    <ChevronLeft size={20} /> 上一页
                </Button>
                
                <span className="font-bold text-gray-500">
                    {currentPage} / {totalPages}
                </span>

                <Button 
                    color="bg-kid-blue" 
                    onClick={() => {
                        setCurrentPage(p => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className="py-3 text-sm flex-1 max-w-[120px]"
                >
                    下一页 <ChevronRight size={20} />
                </Button>
            </div>
        )}
      </div>
    );
  };

  const renderMath = () => (
    <div className="min-h-screen bg-kid-bg pb-24">
       {/* Header */}
       <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-40 flex items-center justify-between">
          <button onClick={() => setCurrentView(AppView.HOME)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full active:scale-90 transition-transform">
            <ArrowLeft size={28} className="text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-800 chinese-text">数学大师</h2>
          <div className="flex items-center gap-1 bg-kid-yellow/10 px-3 py-1 rounded-full">
              <Star className="text-kid-yellow fill-current" size={18} />
              <span className="font-bold text-base text-gray-700">{score}</span>
          </div>
       </div>

      <div className="p-4 max-w-lg mx-auto mt-4">
        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border-b-[6px] border-kid-yellow animate-fade-in-up">
          <div className="bg-kid-yellow p-4 text-center">
            <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2 chinese-text">
              <BrainCircuit size={24} /> 每日挑战
            </h2>
          </div>
          
          <div className="p-6 flex flex-col items-center">
             {/* Difficulty Selection */}
             <div className="flex gap-2 mb-4">
               {(['easy', 'medium', 'hard'] as const).map(diff => (
                 <button
                   key={diff}
                   onClick={() => setMathDifficulty(diff)}
                   className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${mathDifficulty === diff ? 'bg-kid-yellow text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                 >
                   {diff === 'easy' ? '简单' : diff === 'medium' ? '中等' : '困难'}
                 </button>
               ))}
             </div>
              
             {/* Ask AI for a Word Problem */}
             <div className="flex gap-3 mb-8">
               <button 
                 onClick={() => generateMath(true)}
                 className="text-sm text-kid-blue font-bold flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full active:bg-blue-100"
               >
                 <Sparkles size={14} /> 生成趣味数学题
               </button>
               
               <button 
                 onClick={() => generateMath(false, true)}
                 className="text-sm text-kid-green font-bold flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full active:bg-green-100"
               >
                 <Sparkles size={14} /> AI智能出题
               </button>
             </div>
  
             <div className="mb-8 text-center w-full min-h-[6rem] flex items-center justify-center">
               <h3 className="text-4xl md:text-5xl font-black text-gray-800 leading-tight break-words">
                 {mathProblem?.question}
               </h3>
             </div>
             
             {mathProblem?.answer === -999 && (
                 <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6 animate-pulse">
                   请读题并解答
                 </p>
             )}
  
             {mathFeedback && (
               <div className="mb-6 text-xl font-bold text-kid-green animate-bounce text-center chinese-text">
                 {mathFeedback}
               </div>
             )}
  
             <div className="grid grid-cols-2 gap-4 w-full">
               {mathProblem?.answer !== -999 ? (
                 mathProblem?.options.map((opt, idx) => (
                   <Button 
                     key={idx} 
                     color={["bg-kid-blue", "bg-kid-pink", "bg-kid-green", "bg-kid-purple"][idx % 4]}
                     onClick={() => handleMathAnswer(opt)}
                     className="text-3xl h-24 rounded-2xl font-black shadow-[0_4px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-1"
                   >
                     {opt}
                   </Button>
                 ))
               ) : (
                  <Button color="bg-kid-blue" onClick={() => generateMath()} className="col-span-2">
                    下一题
                  </Button>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  // --- Modal ---
  const renderAiModal = () => {
    if (!showAiModal) return null;
    return (
      <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative animate-scale-in">
          <button 
            onClick={() => setShowAiModal(false)}
            className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
          >
            <X size={20} />
          </button>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gradient-to-tr from-kid-purple to-kid-pink rounded-full flex items-center justify-center text-white mb-4 animate-bounce shadow-lg">
              <Sparkles size={32} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-4 chinese-text">魔法老师说：</h3>
            
            {isAiLoading ? (
              <div className="flex gap-2 py-8">
                <div className="w-3 h-3 bg-kid-blue rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-kid-pink rounded-full animate-bounce delay-100"></div>
                <div className="w-3 h-3 bg-kid-yellow rounded-full animate-bounce delay-200"></div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-xl w-full">
                <p className="text-lg text-gray-700 leading-relaxed font-medium">
                  {aiContent}
                </p>
              </div>
            )}
            
            <button 
              onClick={() => setShowAiModal(false)}
              className="mt-6 w-full py-3 bg-kid-blue text-white rounded-xl font-bold shadow-md active:scale-95 transition-transform"
            >
              谢谢老师！
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderInstallGuide = () => {
    if (!showInstallGuide) return null;
    return (
       <div className="fixed inset-0 bg-black/80 z-[70] flex flex-col justify-end sm:justify-center animate-fade-in" onClick={() => setShowInstallGuide(false)}>
          <div className="bg-white rounded-t-[2rem] sm:rounded-[2rem] p-8 max-w-md mx-auto w-full relative" onClick={e => e.stopPropagation()}>
             <h3 className="text-2xl font-bold text-gray-800 mb-4 chinese-text text-center">如何安装 APP?</h3>
             <div className="space-y-6">
                <div className="flex items-start gap-4">
                   <div className="bg-gray-100 p-3 rounded-xl"><Share className="text-blue-500" /></div>
                   <div>
                      <p className="font-bold text-lg">第 1 步</p>
                      <p className="text-gray-500">点击浏览器底部的 <span className="font-bold text-blue-500">分享</span> 按钮 (iOS) 或右上角的菜单 (Android)。</p>
                   </div>
                </div>
                <div className="flex items-start gap-4">
                   <div className="bg-gray-100 p-3 rounded-xl"><PlusSquare className="text-gray-700" /></div>
                   <div>
                      <p className="font-bold text-lg">第 2 步</p>
                      <p className="text-gray-500">向下滑动并选择 <span className="font-bold text-gray-800">添加到主屏幕</span>。</p>
                   </div>
                </div>
             </div>
             <button onClick={() => setShowInstallGuide(false)} className="mt-8 w-full bg-kid-green text-white py-4 rounded-xl font-bold text-lg shadow-lg">知道了</button>
          </div>
       </div>
    );
  };

  return (
    <div className="min-h-screen bg-kid-bg text-gray-800 font-sans selection:bg-kid-yellow selection:text-black">
      {currentView === AppView.HOME && renderHome()}
      {(currentView === AppView.HANZI || currentView === AppView.ENGLISH) && renderDictionary()}
      {currentView === AppView.MATH && renderMath()}
      {renderAiModal()}
      {renderInstallGuide()}
    </div>
  );
}