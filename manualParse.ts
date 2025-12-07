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
      
      // 生成更有意义的含义和例句
      // 根据分类生成含义
      let meaning = '';
      if (category.includes('自然·天文')) {
        meaning = `指天空、天体等自然现象。`;
      } else if (category.includes('自然·地理')) {
        meaning = `指土地、山川等地理事物。`;
      } else if (category.includes('人伦')) {
        meaning = `指人类或人际关系。`;
      } else if (category.includes('代词')) {
        meaning = `用于指代人或事物。`;
      } else if (category.includes('身体部位')) {
        meaning = `指人体的某个部位。`;
      } else if (category.includes('植物')) {
        meaning = `指植物或植物的一部分。`;
      } else if (category.includes('动物')) {
        meaning = `指动物。`;
      } else if (category.includes('方位')) {
        meaning = `表示方向或位置。`;
      } else if (category.includes('动作')) {
        meaning = `表示某种动作或行为。`;
      } else if (category.includes('形容词')) {
        meaning = `用于描述事物的特征。`;
      } else if (category.includes('时间·季节')) {
        meaning = `表示时间或季节。`;
      } else if (category.includes('颜色')) {
        meaning = `表示颜色。`;
      } else {
        meaning = `常用汉字。`;
      }
      
      // 直接使用汉字作为主含义，后面跟具体解释
      const fullMeaning = `${hanzi}${meaning}`;
      
      // 生成更有意义的例句
      let example = '';
      if (hanzi === '天') {
        example = '今天天气真好！';
      } else if (hanzi === '地') {
        example = '地上有一朵花。';
      } else if (hanzi === '人') {
        example = '我们都是中国人。';
      } else if (hanzi === '你') {
        example = '你好，很高兴认识你。';
      } else if (hanzi === '我') {
        example = '我喜欢读书。';
      } else if (hanzi === '他') {
        example = '他在公园里玩。';
      } else if (hanzi === '口') {
        example = '张开嘴巴说"啊"。';
      } else if (hanzi === '耳') {
        example = '我用耳朵听音乐。';
      } else if (hanzi === '目') {
        example = '保护眼睛很重要。';
      } else if (hanzi === '手') {
        example = '我用手写字。';
      } else if (hanzi === '足') {
        example = '用脚走路。';
      } else if (hanzi === '日') {
        example = '太阳从东方升起。';
      } else if (hanzi === '月') {
        example = '今晚的月亮很圆。';
      } else if (hanzi === '水') {
        example = '多喝水对身体好。';
      } else if (hanzi === '火') {
        example = '小心火烛。';
      } else if (hanzi === '山') {
        example = '远处有一座高山。';
      } else if (hanzi === '石') {
        example = '地上有一块石头。';
      } else if (hanzi === '田') {
        example = '田里种满了庄稼。';
      } else if (hanzi === '禾') {
        example = '禾苗长得很茂盛。';
      } else {
        // 通用例句模板
        example = `${hanzi}是一个常用汉字。`;
      }
      
      // 添加到结果
      result.push({
        id: `h${idCounter++}`,
        term: hanzi,
        pronunciation: pinyin,
        meaning: fullMeaning,
        example: example,
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
