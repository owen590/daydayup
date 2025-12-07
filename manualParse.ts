// 手动解析Markdown文件
// 不使用复杂正则表达式，直接按行读取

import fs from 'fs';

// 定义所需类型
interface LearningItem {
  id: string;
  term: string;
  pronunciation: string;
  meaning: string;
  example: string;
  category: 'hanzi' | 'english';
  grade?: string;
  unit?: string;
  subcategory?: string;
  isWritable?: boolean;
  isRead?: boolean;
}

// 通用解析函数，支持解析所有年级的Markdown文件
const parseGradeFile = (filePath: string, gradeName: string, startId: number): LearningItem[] => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const result: LearningItem[] = [];
  let currentUnit = '';
  let isInTable = false;
  let idCounter = startId;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // 灵活提取单元名称，支持任何以### 开头的单元
    if (trimmed.startsWith('### ') && (trimmed.includes('单元') || trimmed.includes('Unit'))) {
      // 提取单元名称，格式：### 第X单元（XXX） 或 ### 第X单元
      const unitMatch = trimmed.match(/###\s+([^\n]+)/);
      if (unitMatch && unitMatch[1]) {
        // 清理单元名称，只保留"第X单元"部分
        const unitName = unitMatch[1].match(/第[一二三四五六七八九十]+单元/)?.[0] || '';
        if (unitName) {
          currentUnit = unitName;
          isInTable = false;
        }
      }
    }
    
    // 检查是否进入表格
    if (trimmed.includes('| 汉字 | 拼音 | 分类 | 备注 |') || trimmed.includes('| 汉字 | 拼音 | 分类 |')) {
      isInTable = true;
      continue;
    }
    
    // 检查是否离开表格
    if (isInTable && (trimmed.startsWith('---') || trimmed === '')) {
      isInTable = false;
      continue;
    }
    
    // 解析表格行
    if (isInTable && trimmed.startsWith('|')) {
      // 分割表格行
      const columns = trimmed.split('|').map(c => c.trim()).filter(c => c);
      if (columns.length < 3) continue;
      
      // 支持不同表格格式：| 汉字 | 拼音 | 分类 | 备注 | 或 | 汉字 | 拼音 | 分类 |
      let [hanzi, pinyin, category, note] = columns;
      note = note || '';
      
      // 处理会写字
      const isWritable = hanzi.startsWith('★') || note.includes('★会写');
      hanzi = hanzi.replace('★', '').trim();
      
      // 跳过组合字
      if (hanzi.length > 1) continue;
      
      // 处理拼音
      pinyin = pinyin.replace(/[—]/g, '').trim();
      if (!pinyin) continue;
      
      // 添加到结果
      result.push({
        id: `h${idCounter++}`,
        term: hanzi,
        pronunciation: pinyin,
        meaning: `${hanzi} (Chinese character)`,
        example: `${hanzi} is a common Chinese character.`,
        category: 'hanzi',
        grade: gradeName,
        unit: currentUnit,
        subcategory: category,
        isWritable: isWritable
      });
    }
  }
  
  return result;
};

// 手动解析一年级上的汉字
const parseGradeOneUpper = (): LearningItem[] => {
  return parseGradeFile('汉字生字/一年级上.md', '一年级上', 1);
};

// 手动解析一年级下的汉字
const parseGradeOneLower = (): LearningItem[] => {
  return parseGradeFile('汉字生字/一年级下.md', '一年级下', 100);
};

// 手动解析二年级上的汉字
const parseGradeTwoUpper = (): LearningItem[] => {
  return parseGradeFile('汉字生字/二年级上.md', '二年级上', 200);
};

// 手动解析二年级下的汉字
const parseGradeTwoLower = (): LearningItem[] => {
  return parseGradeFile('汉字生字/二年级下.md', '二年级下', 300);
};

// 手动解析三年级上的汉字
const parseGradeThreeUpper = (): LearningItem[] => {
  return parseGradeFile('汉字生字/三年级上.md', '三年级上', 400);
};

// 手动解析三年级下的汉字
const parseGradeThreeLower = (): LearningItem[] => {
  return parseGradeFile('汉字生字/三年级下.md', '三年级下', 500);
};

// 主函数
const main = () => {
  console.log('开始手动解析汉字生字Markdown文件...');
  
  // 解析一年级上
  const gradeOneUpper = parseGradeOneUpper();
  console.log(`一年级上：${gradeOneUpper.length} 个汉字`);
  
  // 解析一年级下
  const gradeOneLower = parseGradeOneLower();
  console.log(`一年级下：${gradeOneLower.length} 个汉字`);
  
  // 解析二年级上
  const gradeTwoUpper = parseGradeTwoUpper();
  console.log(`二年级上：${gradeTwoUpper.length} 个汉字`);
  
  // 解析二年级下
  const gradeTwoLower = parseGradeTwoLower();
  console.log(`二年级下：${gradeTwoLower.length} 个汉字`);
  
  // 解析三年级上
  const gradeThreeUpper = parseGradeThreeUpper();
  console.log(`三年级上：${gradeThreeUpper.length} 个汉字`);
  
  // 解析三年级下
  const gradeThreeLower = parseGradeThreeLower();
  console.log(`三年级下：${gradeThreeLower.length} 个汉字`);
  
  // 合并结果
  const allData = [...gradeOneUpper, ...gradeOneLower, ...gradeTwoUpper, ...gradeTwoLower, ...gradeThreeUpper, ...gradeThreeLower];
  console.log(`总汉字数：${allData.length} 个`);
  
  // 生成TypeScript代码
  const tsCode = `// 小学汉字数据集（按年级单元分类）
// 从汉字生字Markdown文件中提取

import { LearningItem } from './types';

export const INITIAL_HANZI: LearningItem[] = ${JSON.stringify(allData, null, 2)};

// English data remains unchanged
export const INITIAL_ENGLISH: LearningItem[] = [
  // Numbers
  { id: 'e1', term: 'one', pronunciation: '/wʌn/', meaning: '一', example: 'one apple', category: 'english' },
  { id: 'e2', term: 'two', pronunciation: '/tuː/', meaning: '二', example: 'two books', category: 'english' },
  { id: 'e3', term: 'three', pronunciation: '/θriː/', meaning: '三', example: 'three cats', category: 'english' },
  { id: 'e4', term: 'four', pronunciation: '/fɔː(r)/', meaning: '四', example: 'four dogs', category: 'english' },
  { id: 'e5', term: 'five', pronunciation: '/faɪv/', meaning: '五', example: 'five birds', category: 'english' },
];
`;
  
  // 写入文件
  fs.writeFileSync('constants.ts', tsCode, 'utf8');
  console.log('✅ 成功写入constants.ts文件！');
};

// 执行
main();
