// 直接生成按年级单元分类的汉字数据
// 基于统编版一年级上册和下册教材

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

// 一年级上册汉字数据
const GRADE_ONE_UPPER: LearningItem[] = [
  // 第一单元
  { id: 'h1', term: '天', pronunciation: 'tiān', meaning: '天 (sky)', example: '天空很蓝', category: 'hanzi', grade: '一年级上', unit: '第一单元', subcategory: '自然·天文', isWritable: true },
  { id: 'h2', term: '地', pronunciation: 'dì', meaning: '地 (earth)', example: '地上有花', category: 'hanzi', grade: '一年级上', unit: '第一单元', subcategory: '自然·地理', isWritable: true },
  { id: 'h3', term: '人', pronunciation: 'rén', meaning: '人 (person)', example: '我是中国人', category: 'hanzi', grade: '一年级上', unit: '第一单元', subcategory: '人伦', isWritable: true },
  { id: 'h4', term: '你', pronunciation: 'nǐ', meaning: '你 (you)', example: '你好吗', category: 'hanzi', grade: '一年级上', unit: '第一单元', subcategory: '代词', isWritable: true },
  { id: 'h5', term: '我', pronunciation: 'wǒ', meaning: '我 (I)', example: '我是学生', category: 'hanzi', grade: '一年级上', unit: '第一单元', subcategory: '代词', isWritable: true },
  { id: 'h6', term: '他', pronunciation: 'tā', meaning: '他 (he)', example: '他是男孩', category: 'hanzi', grade: '一年级上', unit: '第一单元', subcategory: '代词', isWritable: true },
  { id: 'h7', term: '一', pronunciation: 'yī', meaning: '一 (one)', example: '一个苹果', category: 'hanzi', grade: '一年级上', unit: '第一单元', subcategory: '数字', isWritable: true },
  { id: 'h8', term: '二', pronunciation: 'èr', meaning: '二 (two)', example: '两个香蕉', category: 'hanzi', grade: '一年级上', unit: '第一单元', subcategory: '数字', isWritable: true },
  { id: 'h9', term: '三', pronunciation: 'sān', meaning: '三 (three)', example: '三个橘子', category: 'hanzi', grade: '一年级上', unit: '第一单元', subcategory: '数字', isWritable: true },
  { id: 'h10', term: '上', pronunciation: 'shàng', meaning: '上 (up)', example: '桌子上有书', category: 'hanzi', grade: '一年级上', unit: '第一单元', subcategory: '方位', isWritable: true },
  { id: 'h11', term: '下', pronunciation: 'xià', meaning: '下 (down)', example: '树下有猫', category: 'hanzi', grade: '一年级上', unit: '第一单元', subcategory: '方位', isWritable: true },
  
  // 第二单元
  { id: 'h12', term: '口', pronunciation: 'kǒu', meaning: '口 (mouth)', example: '张开嘴巴', category: 'hanzi', grade: '一年级上', unit: '第二单元', subcategory: '身体部位', isWritable: true },
  { id: 'h13', term: '耳', pronunciation: 'ěr', meaning: '耳 (ear)', example: '耳朵听话', category: 'hanzi', grade: '一年级上', unit: '第二单元', subcategory: '身体部位', isWritable: true },
  { id: 'h