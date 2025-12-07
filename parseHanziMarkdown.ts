// 解析汉字生字Markdown文件的脚本
// 从汉字生字目录下的Markdown文件中提取汉字信息
// 生成包含年级、单元的LearningItem数组

import fs from 'fs';

// 定义所需类型
interface LearningItem {
  id: string;
  term: string;
  pronunciation: string;
  meaning: string;
  example: string;
  category: 'hanzi' | 'english';
  grade?: string; // 年级，如：一年级上, 一年级下
  unit?: string; // 单元，如：第一单元, 第二单元
  subcategory?: string; // 分类，如：numbers, nature, family等
  isWritable?: boolean; // 是否为要求会写的字
  isRead?: boolean;
}

// 读取Markdown文件
const readMarkdownFile = (filePath: string): string => {
  return fs.readFileSync(filePath, 'utf8');
};

// 解析一年级上的Markdown文件
const parseGradeOneUpper = (): LearningItem[] => {
  const filePath = path.join(__dirname, '汉字生字', '一年级上.md');
  console.log(`📄 正在读取文件: ${filePath}`);
  const content = readMarkdownFile(filePath);
  console.log(`📏 文件长度: ${content.length} 字符`);
  
  const result: LearningItem[] = [];
  let idCounter = 1;
  
  // 按单元解析
  const units = content.split('---');
  console.log(`📦 单元数量: ${units.length}`);
  
  // 跳过第一部分（标题和说明）
  for (let i = 1; i < units.length; i++) {
    const unitContent = units[i].trim();
    if (!unitContent) continue;
    
    console.log(`📋 处理单元 ${i}: ${unitContent.substring(0, 100)}...`);
    
    // 提取单元名称
    const unitMatch = unitContent.match(/### (第[一二三四五六七八九十]+单元)/);
    if (!unitMatch) {
      console.log(`⚠️  未找到单元名称`);
      continue;
    }
    const unitName = unitMatch[1];
    console.log(`🏷️  单元名称: ${unitName}`);
    
    // 提取表格内容
    const tableMatch = unitContent.match(/\|\s*汉字\s*\|\s*拼音\s*\|\s*分类\s*\|\s*备注\s*\|\s*\n\|\s*------\s*\|\s*------\s*\|\s*------\s*\|\s*------\s*\|\s*\n([\s\S]*?)(\n---|$)/);
    if (!tableMatch) {
      console.log(`⚠️  未找到表格`);
      continue;
    }
    
    const tableContent = tableMatch[1].trim();
    console.log(`📊 表格内容: ${tableContent.substring(0, 200)}...`);
    
    const tableRows = tableContent.split('\n');
    console.log(`🔢 表格行数: ${tableRows.length}`);
    
    // 解析每一行
    tableRows.forEach((row, rowIndex) => {
      // 跳过空行
      const trimmedRow = row.trim();
      if (!trimmedRow) {
        console.log(`⏭️  跳过空行 ${rowIndex}`);
        return;
      }
      
      console.log(`🔍 解析行 ${rowIndex}: ${row}`);
      
      // 解析表格行
      const columns = row.split('|').map(col => col.trim()).filter(col => col);
      console.log(`📋 列数: ${columns.length}, 内容: ${columns}`);
      if (columns.length < 4) {
        console.log(`⚠️  列数不足4列，跳过`);
        return;
      }
      
      let [hanzi, pinyin, category, note] = columns;
      
      // 处理带★的会写字
      const isWritable = hanzi.startsWith('★');
      hanzi = hanzi.replace('★', '').trim();
      
      console.log(`📝 处理汉字: ${hanzi}, 拼音: ${pinyin}, 分类: ${category}, 备注: ${note}, 会写: ${isWritable}`);
      
      // 跳过组合字（如：天地人）
      if (hanzi.length > 1) {
        console.log(`⏭️  跳过组合字: ${hanzi}`);
        return;
      }
      
      // 处理拼音
      pinyin = pinyin.replace(/[——]/g, '').trim();
      if (!pinyin) pinyin = 'zhōng';
      
      // 生成汉字信息
      result.push({
        id: `h${idCounter++}`,
        term: hanzi,
        pronunciation: pinyin,
        meaning: `${hanzi} (Chinese character)`,
        example: `${hanzi} is a common Chinese character.`,
        category: 'hanzi',
        grade: '一年级上',
        unit: unitName,
        subcategory: category,
        isWritable: isWritable
      });
      
      console.log(`✅ 添加汉字: ${hanzi}`);
    });
  }
  
  console.log(`🎯 提取到汉字数量: ${result.length}`);
  return result;
};

// 解析一年级下的Markdown文件
const parseGradeOneLower = (): LearningItem[] => {
  const filePath = path.join(__dirname, '汉字生字', '一年级下.md');
  const content = readMarkdownFile(filePath);
  const result: LearningItem[] = [];
  let idCounter = 300; // 从300开始，避免与一年级上冲突
  
  // 按单元解析
  const units = content.split('---');
  
  // 跳过第一部分（标题和说明）
  for (let i = 1; i < units.length; i++) {
    const unitContent = units[i].trim();
    if (!unitContent) continue;
    
    // 提取单元名称
    const unitMatch = unitContent.match(/### (第\w+单元)/);
    if (!unitMatch) continue;
    const unitName = unitMatch[1];
    
    // 提取表格内容
    const tableMatch = unitContent.match(/\| 汉字 \| 拼音 \| 分类 \| 备注 \|\n\|------\|------\|------\|------\|\n([\s\S]*?)(\n---|$)/);
    if (!tableMatch) continue;
    
    const tableRows = tableMatch[1].trim().split('\n');
    
    // 解析每一行
    tableRows.forEach(row => {
      // 跳过空行
      if (!row.trim()) return;
      
      // 解析表格行
      const columns = row.split('|').map(col => col.trim()).filter(col => col);
      if (columns.length < 4) return;
      
      let [hanzi, pinyin, category, note] = columns;
      
      // 处理带★的会写字
      const isWritable = hanzi.startsWith('★') || note.includes('★会写');
      hanzi = hanzi.replace('★', '').trim();
      
      // 跳过组合字
      if (hanzi.length > 1) return;
      
      // 处理拼音
      pinyin = pinyin.replace(/[——]/g, '').trim();
      if (!pinyin) pinyin = 'zhōng';
      
      // 生成汉字信息
      result.push({
        id: `h${idCounter++}`,
        term: hanzi,
        pronunciation: pinyin,
        meaning: `${hanzi} (Chinese character)`,
        example: `${hanzi} is a common Chinese character.`,
        category: 'hanzi',
        grade: '一年级下',
        unit: unitName,
        subcategory: category,
        isWritable: isWritable
      });
    });
  }
  
  return result;
};

// 生成TypeScript代码
const generateTypeScriptCode = (data: LearningItem[]): string => {
  return `// 小学汉字数据集（按年级单元分类）
// 从汉字生字Markdown文件中提取

import { LearningItem } from './types';

export const INITIAL_HANZI: LearningItem[] = ${JSON.stringify(data, null, 2)};

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
};

// 写入文件
const writeToFile = (data: LearningItem[]) => {
  const content = generateTypeScriptCode(data);
  
  try {
    fs.writeFileSync('./constants.ts', content, 'utf8');
    console.log('✅ 成功从Markdown文件中提取汉字数据！');
    console.log(`📊 生成结果：`);
    console.log(`   - 总汉字数：${data.length}`);
    
    // 统计年级数量
    const gradeStats: Record<string, number> = {};
    data.forEach(item => {
      gradeStats[item.grade || 'other'] = (gradeStats[item.grade || 'other'] || 0) + 1;
    });
    
    console.log(`   - 年级统计：`);
    Object.entries(gradeStats).forEach(([grade, count]) => {
      console.log(`     * ${grade}: ${count} 个`);
    });
    
    // 统计单元数量
    const unitStats: Record<string, number> = {};
    data.forEach(item => {
      const key = `${item.grade || 'other'} - ${item.unit || 'other'}`;
      unitStats[key] = (unitStats[key] || 0) + 1;
    });
    
    console.log(`   - 单元统计：`);
    Object.entries(unitStats).forEach(([unit, count]) => {
      console.log(`     * ${unit}: ${count} 个`);
    });
    
    console.log('\n🎉 生成完成！');
  } catch (error) {
    console.error('❌ 写入文件失败:', error);
  }
};

// 执行解析
const main = () => {
  // 解析一年级上和一年级下的文件
  const gradeOneUpper = parseGradeOneUpper();
  const gradeOneLower = parseGradeOneLower();
  
  // 合并结果
  const allData = [...gradeOneUpper, ...gradeOneLower];
  
  // 写入文件
  writeToFile(allData);
};

// 执行主函数
main();
