# 天天向上 - 儿童学习应用

## 1. 项目概述

天天向上是一款专为儿童设计的互动学习应用，提供汉字、英语和数学学习功能，结合AI技术增强学习体验。应用采用游戏化设计，通过卡片翻转、发音练习、AI故事讲解等方式激发儿童学习兴趣。

### 主要特点
- 📚 **双语学习**：支持汉字和英语学习
- 🎮 **游戏化体验**：卡片翻转、进度追踪、分数系统
- 🤖 **AI辅助**：基于Google Gemini的智能解释和故事生成
- 🎵 **发音练习**：内置语音合成功能
- 📱 **响应式设计**：支持移动设备和安装为PWA应用

## 2. 技术栈

| 技术/库 | 版本 | 用途 |
|---------|------|------|
| React | ^19.2.0 | 前端框架 |
| TypeScript | ~5.8.2 | 类型系统 |
| Vite | ^6.2.0 | 构建工具 |
| Lucide React | ^0.555.0 | 图标库 |
| @google/genai | ^1.30.0 | Google Gemini API客户端 |

## 3. 项目结构

```
.
├── App.tsx                 # 主应用组件
├── index.tsx               # 应用入口
├── types.ts                # TypeScript类型定义
├── constants.ts            # 初始学习数据
├── services/
│   └── geminiService.ts    # AI服务集成
├── package.json            # 项目依赖
├── tsconfig.json           # TypeScript配置
├── vite.config.ts          # Vite配置
└── .env.local              # 环境变量（API密钥）
```

## 4. 核心功能模块

### 4.1 学习卡片系统

#### 汉字学习卡片
- **正面**：显示汉字、拼音、发音按钮
- **反面**：显示含义、例句、AI故事按钮
- **状态管理**：已学会标记、学习进度追踪

#### 英语学习卡片
- **正面**：显示英文单词、音标、中文含义、发音按钮
- **反面**：显示详细含义、例句、AI解释按钮
- **状态管理**：已学会标记、学习进度追踪

### 4.2 搜索功能

- **本地搜索**：在现有学习项中搜索
- **AI搜索**：当本地无结果时，通过Gemini API搜索并添加新学习项
- **搜索范围**：支持按术语和含义搜索

### 4.3 AI辅助学习

- **汉字故事**：为每个汉字生成生动有趣的小故事
- **英语解释**：用简单语言解释英语单词
- **数学题生成**：创建趣味数学应用题

### 4.4 语音功能

- **文本转语音**：支持汉字和英语单词的发音
- **多语言支持**：自动切换中文和英文语音

### 4.5 进度追踪

- **分数系统**：每学会一个新单词获得5分
- **已学会标记**：直观显示学习进度
- **页面导航**：分页显示学习卡片

### 4.6 PWA支持

- **应用安装**：支持添加到主屏幕
- **离线访问**：基本功能离线可用

## 5. 数据结构

### 5.1 类型定义（types.ts）

```typescript
// 应用视图枚举
export enum AppView {
  HOME = 'HOME',
  HANZI = 'HANZI',
  ENGLISH = 'ENGLISH',
  MATH = 'MATH',
  SETTINGS = 'SETTINGS'
}

// 学习项接口
export interface LearningItem {
  id: string;
  term: string; // 汉字或单词
  pronunciation: string; // 拼音或音标
  meaning: string; // 含义
  example: string; // 例句
  category: 'hanzi' | 'english'; // 类别
  isRead?: boolean; // 是否已学会
}

// 数学问题接口
export interface MathProblem {
  question: string; // 问题描述
  answer: number; // 答案
  options: number[]; // 选项
  operation: '+' | '-' | '*' | '/'; // 运算类型
}

// AI响应接口
export interface GeminiResponse {
  content: string;
  isError: boolean;
}
```

### 5.2 初始数据（constants.ts）

- **INITIAL_HANZI**: 50个基础汉字，包括数字、自然、人物、学校等类别
- **INITIAL_ENGLISH**: 60个基础英语单词，包括动物、颜色、家庭、学校等类别

## 6. API接口

### 6.1 Gemini API服务（geminiService.ts）

#### generateExplanation
```typescript
export const generateExplanation = async (
  term: string, 
  category: 'hanzi' | 'english'
): Promise<string>
```
**功能**：为汉字或英语单词生成解释或故事
**参数**：
- `term`: 要解释的汉字或单词
- `category`: 内容类别（汉字或英语）
**返回**：生成的解释或故事文本

#### searchNewItem
```typescript
export const searchNewItem = async (
  query: string, 
  category: 'hanzi' | 'english'
): Promise<LearningItem | null>
```
**功能**：搜索新的学习项并添加到列表
**参数**：
- `query`: 搜索关键词
- `category`: 内容类别（汉字或英语）
**返回**：新创建的学习项或null

#### generateMathProblem
```typescript
export const generateMathProblem = async (
  difficulty: 'easy' | 'hard'
): Promise<string>
```
**功能**：生成数学应用题
**参数**：
- `difficulty`: 难度级别（简单或困难）
**返回**：生成的数学应用题文本

## 7. 核心组件

### 7.1 App组件（App.tsx）

主应用组件，管理应用状态和视图切换：
- 视图状态管理（首页、汉字、英语、数学、设置）
- 学习项数据管理
- 搜索功能实现
- AI交互处理
- 数学问题生成

### 7.2 Card组件

学习卡片组件，实现卡片翻转效果：
- 正面显示术语和发音
- 反面显示含义和例句
- 已学会标记功能
- 发音和AI交互按钮

### 7.3 Button组件

自定义按钮组件，提供统一的样式和交互：
- 颜色主题支持
- 禁用状态处理
- 活动状态动画

## 8. 状态管理

应用使用React Hooks进行状态管理：

- **useState**: 管理组件状态（视图、学习项、搜索词等）
- **useEffect**: 处理副作用（数据初始化、搜索过滤等）
- **useCallback**: 优化回调函数性能（数学问题生成）

## 9. 样式设计

- **响应式布局**：适配不同屏幕尺寸
- **动画效果**：卡片翻转、按钮点击、加载动画
- **色彩方案**：明亮活泼的儿童友好色调
- **阴影效果**：增强视觉层次感

## 10. 环境配置

### 10.1 API密钥配置

在`.env.local`文件中配置Google Gemini API密钥：

```
API_KEY=your_google_gemini_api_key
```

### 10.2 开发环境设置

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 11. 使用说明

### 11.1 汉字学习
1. 点击首页的汉字学习图标
2. 浏览汉字卡片，点击卡片翻转查看详情
3. 点击发音按钮听汉字发音
4. 点击"听故事"按钮获取AI生成的汉字故事
5. 标记已学会的汉字获取分数

### 11.2 英语学习
1. 点击首页的英语学习图标
2. 浏览英语单词卡片，点击卡片翻转查看详情
3. 点击发音按钮听单词发音
4. 点击"问AI老师"按钮获取AI生成的单词解释
5. 标记已学会的单词获取分数

### 11.3 数学学习
1. 点击首页的数学图标
2. 生成数学问题并解答
3. 查看反馈和学习进度

### 11.4 搜索功能
1. 在搜索框中输入关键词
2. 应用会先在本地搜索
3. 若无结果，会通过AI搜索新内容

## 12. 未来扩展

- [ ] 添加更多学习类别（如拼音、乘法表）
- [ ] 实现学习进度统计和报告
- [ ] 支持用户自定义学习列表
- [ ] 添加游戏化奖励系统
- [ ] 支持多用户模式
- [ ] 增加离线学习功能

## 13. 贡献指南

欢迎提交Issue和Pull Request来改进应用！

### 开发流程
1. Fork仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 14. 许可证

本项目采用MIT许可证 - 查看LICENSE文件了解详情。

## 15. 联系方式

如有问题或建议，请通过以下方式联系：

- 项目地址：https://github.com/yourusername/tiantianxiangshang
- 电子邮件：your@email.com
