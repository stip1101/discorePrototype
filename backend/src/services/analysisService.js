import { GoogleGenerativeAI } from '@google/generative-ai';

export class AnalysisService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-001",
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 0.8,
        maxOutputTokens: 1024,
      }
    });
  }

  /**
   * Анализирует сообщение пользователя
   */
  async analyzeMessage(messageData) {
    try {
      const prompt = this.buildAnalysisPrompt(messageData);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return this.parseAnalysisResponse(response.text());
    } catch (error) {
      console.error('Ошибка анализа сообщения:', error);
      return this.getDefaultAnalysis();
    }
  }

  /**
   * Создает промпт для анализа сообщения
   */
  buildAnalysisPrompt(messageData) {
    return `Проанализируй это Discord сообщение и верни результат СТРОГО в JSON формате:

СООБЩЕНИЕ: "${messageData.content}"

КОНТЕКСТ:
- Канал: ${messageData.channelId}
- Есть вложения: ${messageData.hasAttachments}
- Количество упоминаний: ${messageData.mentions}
- Это ответ: ${!!messageData.replyToId}

АНАЛИЗИРУЙ:
1. Тональность (от -1 до 1, где -1 = негативная, 0 = нейтральная, 1 = позитивная)
2. Токсичность (от 0 до 1, где 0 = не токсично, 1 = очень токсично)
3. Конструктивность (от 0 до 1, где 0 = неконструктивно, 1 = очень конструктивно)
4. Вероятность AI-генерации (от 0 до 1)
5. Категория активности: "discussion", "question", "announcement", "casual", "support", "spam"
6. Эмоциональные маркеры: массив эмоций ["happy", "angry", "sad", "excited", "frustrated", "helpful", "neutral"]
7. Ключевые темы: массив тем, о которых говорится в сообщении

ВЕРНИ ТОЛЬКО JSON:
{
  "sentiment": 0.5,
  "toxicity": 0.1,
  "constructiveness": 0.8,
  "aiLikelihood": 0.2,
  "activityCategory": "discussion",
  "emotions": ["helpful", "neutral"],
  "topics": ["технологии", "вопрос"],
  "qualityScore": 0.75,
  "engagementPotential": 0.6
}`;
  }

  /**
   * Парсит ответ от Gemini
   */
  parseAnalysisResponse(responseText) {
    try {
      // Извлекаем JSON из ответа
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON не найден в ответе');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Валидируем данные
      return {
        sentiment: this.clamp(parsed.sentiment || 0, -1, 1),
        toxicity: this.clamp(parsed.toxicity || 0, 0, 1),
        constructiveness: this.clamp(parsed.constructiveness || 0.5, 0, 1),
        aiLikelihood: this.clamp(parsed.aiLikelihood || 0, 0, 1),
        activityCategory: parsed.activityCategory || 'casual',
        emotions: Array.isArray(parsed.emotions) ? parsed.emotions : ['neutral'],
        topics: Array.isArray(parsed.topics) ? parsed.topics : [],
        qualityScore: this.clamp(parsed.qualityScore || 0.5, 0, 1),
        engagementPotential: this.clamp(parsed.engagementPotential || 0.5, 0, 1),
        analyzedAt: new Date()
      };
    } catch (error) {
      console.error('Ошибка парсинга анализа:', error);
      return this.getDefaultAnalysis();
    }
  }

  /**
   * Анализирует общую активность сервера
   */
  async analyzeServerActivity(serverData) {
    try {
      const prompt = `Проанализируй активность Discord сервера за последние данные:

ДАННЫЕ СЕРВЕРА:
- Название: ${serverData.name}
- Участников: ${serverData.memberCount}
- Сообщений за день: ${serverData.dailyMessages}
- Активных пользователей: ${serverData.activeUsers}
- Средняя тональность: ${serverData.avgSentiment}
- Средняя токсичность: ${serverData.avgToxicity}

ТОП КАТЕГОРИИ АКТИВНОСТИ:
${serverData.topCategories.map(cat => `- ${cat.name}: ${cat.count} сообщений`).join('\n')}

АНАЛИЗИРУЙ И ВЕРНИ JSON:
{
  "healthScore": 0.85,
  "engagementLevel": "high",
  "communityType": "tech_focused",
  "growthTrend": "positive",
  "recommendedActions": ["increase_moderation", "create_events"],
  "strengths": ["active_discussions", "helpful_community"],
  "concerns": ["occasional_toxicity"],
  "overallRating": 4.2
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return this.parseServerAnalysis(response.text());
    } catch (error) {
      console.error('Ошибка анализа сервера:', error);
      return this.getDefaultServerAnalysis();
    }
  }

  /**
   * Анализирует конкретного пользователя
   */
  async analyzeUser(userData) {
    try {
      const prompt = `Проанализируй пользователя Discord:

ДАННЫЕ ПОЛЬЗОВАТЕЛЯ:
- Username: ${userData.username}
- Сообщений всего: ${userData.messageCount}
- Средняя тональность: ${userData.avgSentiment}
- Средняя токсичность: ${userData.avgToxicity}
- Получено реакций: ${userData.reactionsReceived}
- Упоминаний: ${userData.mentions}
- Дней активности: ${userData.activeDays}

ПАТТЕРНЫ АКТИВНОСТИ:
${userData.activityPatterns.map(p => `- ${p.category}: ${p.percentage}%`).join('\n')}

ВЕРНИ JSON АНАЛИЗ:
{
  "userType": "contributor",
  "engagementLevel": "high", 
  "influenceScore": 0.8,
  "riskLevel": "low",
  "specialties": ["technical_help", "community_building"],
  "behaviorTags": ["helpful", "active", "positive"],
  "recommendedRole": "moderator",
  "overallScore": 0.85
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return this.parseUserAnalysis(response.text());
    } catch (error) {
      console.error('Ошибка анализа пользователя:', error);
      return this.getDefaultUserAnalysis();
    }
  }

  parseServerAnalysis(responseText) {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        healthScore: this.clamp(parsed.healthScore || 0.5, 0, 1),
        engagementLevel: parsed.engagementLevel || 'medium',
        communityType: parsed.communityType || 'general',
        growthTrend: parsed.growthTrend || 'stable',
        recommendedActions: parsed.recommendedActions || [],
        strengths: parsed.strengths || [],
        concerns: parsed.concerns || [],
        overallRating: this.clamp(parsed.overallRating || 3, 1, 5),
        analyzedAt: new Date()
      };
    } catch (error) {
      return this.getDefaultServerAnalysis();
    }
  }

  parseUserAnalysis(responseText) {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        userType: parsed.userType || 'member',
        engagementLevel: parsed.engagementLevel || 'medium',
        influenceScore: this.clamp(parsed.influenceScore || 0.5, 0, 1),
        riskLevel: parsed.riskLevel || 'low',
        specialties: parsed.specialties || [],
        behaviorTags: parsed.behaviorTags || ['neutral'],
        recommendedRole: parsed.recommendedRole || 'member',
        overallScore: this.clamp(parsed.overallScore || 0.5, 0, 1),
        analyzedAt: new Date()
      };
    } catch (error) {
      return this.getDefaultUserAnalysis();
    }
  }

  getDefaultAnalysis() {
    return {
      sentiment: 0,
      toxicity: 0,
      constructiveness: 0.5,
      aiLikelihood: 0,
      activityCategory: 'casual',
      emotions: ['neutral'],
      topics: [],
      qualityScore: 0.5,
      engagementPotential: 0.5,
      analyzedAt: new Date()
    };
  }

  getDefaultServerAnalysis() {
    return {
      healthScore: 0.5,
      engagementLevel: 'medium',
      communityType: 'general',
      growthTrend: 'stable',
      recommendedActions: [],
      strengths: [],
      concerns: [],
      overallRating: 3,
      analyzedAt: new Date()
    };
  }

  getDefaultUserAnalysis() {
    return {
      userType: 'member',
      engagementLevel: 'medium',
      influenceScore: 0.5,
      riskLevel: 'low',
      specialties: [],
      behaviorTags: ['neutral'],
      recommendedRole: 'member',
      overallScore: 0.5,
      analyzedAt: new Date()
    };
  }

  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
} 