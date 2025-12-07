// 简化版Markdown解析脚本
// 直接读取文件并提取汉字数据

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

// 读取并解析单个Markdown文件
const parseFile = (filePath: string, grade: string): LearningItem[] => {
  const content = fs.readFileSync(filePath, 'utf8');
  const result: LearningItem[] = [];
  
  // 按单元拆分
  const units = content.split('---');
  
  for (const unit of units) {
    const unitContent = unit.trim();
    if (!unitContent) continue;
    
    // 提取单元名称（支持带括号的单元名）
    const unitMatch = unitContent.match(/### (第[一二三四五六七八九十]+单元)(?:\s*\([^)]*\))?/);
    if (!unitMatch) continue;
    const unitName = unitMatch[1];
    
    // 提取表格
    const tableRegex = /\|\s*汉字\s*\|\s*拼音\s*\|\s*分类\s*\|\s*备注\s*\|\s*\n\|\s*-+\s*\|\s*-+\s*\|\s*-+\s*\|\s*-+\s*\|\s*\n([\s\S]*?)(\n---|$)/;
    const tableMatch = unitContent.match(tableRegex);
    if (!tableMatch) continue;
    
    const tableContent = tableMatch[1].trim();
    const rows = tableContent.split('\n');
    
    // 解析每行
    for (const row of rows) {
      const trimmed = row.trim();
      if (!trimmed) continue;
      
      const columns = row.split('|').map(c => c.trim()).filter(c => c);
      if (columns.length < 4) continue;
      
      let [hanzi, pinyin, category, note] = columns;
      
      // 处理会写字
      const isWritable = hanzi.startsWith('★');
      hanzi = hanzi.replace('★', '').trim();
      
      // 跳过组合字
      if (hanzi.length > 1) continue;
      
      // 处理拼音
      pinyin = pinyin.replace(/[—]/g, '').trim();
      if (!pinyin) continue;
      
      // 生成ID
      const id = `h${result.length + 1}`;
      
      // 添加到结果
      result.push({
        id: id,
        term: hanzi,
        pronunciation: pinyin,
        meaning: `${hanzi} (Chinese character)`,
        example: `${hanzi} is a common Chinese character.`,
        category: 'hanzi',
        grade: grade,
        unit: unitName,
        subcategory: category,
        isWritable: isWritable
      });
    }
  }
  
  return result;
};

// 主函数
const main = () => {
  console.log('开始解析汉字生字Markdown文件...');
  
  // 解析一年级上
  const gradeOneUpper = parseFile('汉字生字/一年级上.md', '一年级上');
  console.log(`一年级上：${gradeOneUpper.length} 个汉字`);
  
  // 解析一年级下
  const gradeOneLower = parseFile('汉字生字/一年级下.md', '一年级下');
  console.log(`一年级下：${gradeOneLower.length} 个汉字`);
  
  // 合并结果
  const allData = [...gradeOneUpper, ...gradeOneLower];
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
