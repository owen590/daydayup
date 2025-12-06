// 定义AI服务接口
interface AIService {
  generateExplanation(term: string, category: 'hanzi' | 'english'): Promise<string>;
  searchNewItem(query: string, category: 'hanzi' | 'english'): Promise<any>;
  generateMathProblem(difficulty: 'easy' | 'medium' | 'hard'): Promise<string>;
  generateMathProblemWithOptions(difficulty: 'easy' | 'medium' | 'hard'): Promise<any>;
}

// 本地模拟AI服务适配器
class LocalAIService implements AIService {
  // 生成汉字解释的模拟数据
  private hanziExplanations: Record<string, string> = {
    '火': '从前，有个小朋友叫火火，他最喜欢玩火。一天，他发现两根木头摩擦会产生火，于是发明了钻木取火的方法，大家都叫他火的发明者。',
    '水': '水是生命之源，就像小精灵一样。它可以变成雨滴从天而降，汇成小溪流，又变成江河湖海，滋养着大地上的每一个生命。',
    '山': '山是大地的脊梁，高高的山峰直插云霄。山上有茂密的森林，清澈的泉水，还有可爱的小动物，是大自然的宝库。',
    '日': '太阳公公每天从东边升起，西边落下，给我们带来光明和温暖。它就像一个大火球，照亮了整个世界。',
    '月': '月亮姐姐晚上出来工作，有时候像弯弯的小船，有时候像圆圆的玉盘。她陪伴着夜晚的人们，给大家带来温柔的月光。'
  };

  // 生成英语解释的模拟数据
  private englishExplanations: Record<string, string> = {
    'apple': 'An apple is a red or green fruit. It\'s good for your health. You can eat it as a snack!',
    'cat': 'A cat is a cute animal with fur. It likes to chase mice and sleep a lot. Many people keep cats as pets.',
    'dog': 'A dog is a friendly animal. It likes to play fetch and wag its tail. Dogs are called "man\'s best friend".',
    'book': 'A book has pages with words and pictures. You can read books to learn new things and have fun!',
    'school': 'School is a place where you learn and make friends. You go to school every day to study with teachers.'
  };

  // 生成数学题的模拟数据
  private mathProblems: Record<string, string[]> = {
    'easy': [
      '小明有3个苹果，妈妈又给了他2个，现在他一共有几个苹果？',
      '小红有5块糖，她吃了1块，还剩下几块？',
      '教室里有4张桌子，每张桌子坐2个小朋友，一共可以坐几个小朋友？',
      '树上有6只鸟，飞走了3只，还剩下几只？',
      '妈妈买了8个鸡蛋，用了4个做蛋糕，还剩下几个？'
    ],
    'medium': [
      '学校组织春游，一年级有35个学生，二年级有42个学生，两个年级一共有多少个学生？',
      '小明从家到学校要走15分钟，他每天往返两次，一周（5天）一共要走多少分钟？',
      '妈妈买了3千克苹果，每千克8元，又买了2千克香蕉，每千克6元，一共花了多少钱？',
      '一个长方形的长是8厘米，宽是5厘米，它的周长是多少厘米？',
      '小明今年8岁，爸爸的年龄是他的4倍，爸爸今年多少岁？'
    ],
    'hard': [
      '一辆汽车每小时行驶60千米，从A城到B城需要行驶3小时，A城到B城的距离是多少千米？如果返回时速度提高到每小时90千米，需要多长时间？',
      '学校图书馆有故事书450本，科技书比故事书少120本，两种书一共有多少本？',
      '一个工程队修一条路，第一天修了全长的1/3，第二天修了全长的1/4，两天一共修了全长的几分之几？还剩下全长的几分之几？',
      '一个正方形的边长是12厘米，它的面积是多少平方厘米？如果把它分成4个相同的小正方形，每个小正方形的面积是多少？',
      '小明参加数学竞赛，一共20道题，答对一题得5分，答错一题扣2分，小明得了72分，他答对了几道题？'
    ]
  };

  // 生成汉字解释
  async generateExplanation(term: string, category: 'hanzi' | 'english'): Promise<string> {
    if (category === 'hanzi') {
      return this.hanziExplanations[term] || `这是汉字 "${term}" 的故事，它的意思是...`;
    } else {
      return this.englishExplanations[term] || `This is the English word "${term}". It means...`;
    }
  }

  // 搜索新项 - 返回null，表示不支持在线搜索
  async searchNewItem(query: string, category: 'hanzi' | 'english'): Promise<any> {
    return null;
  }

  // 生成数学题
  async generateMathProblem(difficulty: 'easy' | 'medium' | 'hard'): Promise<string> {
    const problems = this.mathProblems[difficulty] || this.mathProblems['easy'];
    const randomIndex = Math.floor(Math.random() * problems.length);
    return problems[randomIndex];
  }

  // 生成带选项的数学题
  async generateMathProblemWithOptions(difficulty: 'easy' | 'medium' | 'hard'): Promise<any> {
    // 使用本地数学题生成逻辑
    const problemText = await this.generateMathProblem(difficulty);
    
    // 简单的数学题解析和选项生成（仅支持加法和减法）
    // 这里简化处理，实际应用中需要更复杂的解析逻辑
    let answer = 0;
    let operation: '+' | '-' | '*' | '/' = '+';
    
    // 简单解析示例
    if (problemText.includes('一共')) {
      // 尝试解析加法
      const numbers = problemText.match(/\d+/g)?.map(Number) || [];
      if (numbers.length >= 2) {
        answer = numbers[0] + numbers[1];
        operation = '+';
      }
    } else if (problemText.includes('还剩下')) {
      // 尝试解析减法
      const numbers = problemText.match(/\d+/g)?.map(Number) || [];
      if (numbers.length >= 2) {
        answer = numbers[0] - numbers[1];
        operation = '-';
      }
    } else if (problemText.includes('多少个')) {
      // 尝试解析乘法
      const numbers = problemText.match(/\d+/g)?.map(Number) || [];
      if (numbers.length >= 2) {
        answer = numbers[0] * numbers[1];
        operation = '*';
      }
    }
    
    // 生成干扰选项
    const options = [answer];
    while (options.length < 4) {
      const offset = Math.floor(Math.random() * 5) - 2;
      const newOption = answer + offset;
      if (newOption >= 0 && !options.includes(newOption)) {
        options.push(newOption);
      }
    }
    
    // 随机排序选项
    const shuffledOptions = options.sort(() => Math.random() - 0.5);
    
    return {
      question: problemText,
      answer: answer,
      options: shuffledOptions,
      operation: operation
    };
  }
}

// 创建本地AI服务实例
const aiService = new LocalAIService();

// 导出函数
export const generateExplanation = (term: string, category: 'hanzi' | 'english') => aiService.generateExplanation(term, category);
export const searchNewItem = (query: string, category: 'hanzi' | 'english') => aiService.searchNewItem(query, category);
export const generateMathProblem = (difficulty: 'easy' | 'medium' | 'hard') => aiService.generateMathProblem(difficulty);
export const generateMathProblemWithOptions = (difficulty: 'easy' | 'medium' | 'hard') => aiService.generateMathProblemWithOptions(difficulty);
