# Discore Backend

Advanced Discord server analytics with real-time AI analysis powered by OpenAI.

## Features

- **Real-time AI Analysis**: Uses OpenAI GPT models for sentiment, toxicity, engagement, quality, and AI detection analysis
- **Community Health Metrics**: Comprehensive server health scoring
- **Message Processing**: Automated message analysis and storage
- **RESTful API**: Complete API for frontend integration
- **Discord Bot Integration**: Automated data collection from Discord servers
- **Advanced Analytics**: Multi-faceted analysis including AI content detection and quality assessment

## Setup

### Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- Discord Bot Token
- OpenAI API Key

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id

# OpenAI Configuration  
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4.1-nano-2025-04-14

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# Application Settings
NODE_ENV=development
PORT=4000
```

3. Set up the database:
```bash
npm run db:migrate
npm run db:seed
```

## Testing OpenAI Integration

Before running the application, test if your OpenAI API integration is working:

```bash
npm run test:openai
```

This will run comprehensive tests including:
- Individual message analysis (sentiment, toxicity, engagement, AI detection, quality)
- Batch message processing
- Community health calculations
- API error handling
- Rate limiting tests

Expected output:
```
🤖 Testing OpenAI API Integration...

✅ All tests completed successfully!

📈 Summary:
- Individual analysis tests: ✅
- Batch analysis: ✅ (5/5 messages processed)
- Health calculation: ✅
- Community analysis: ✅
- Special message tests: ✅

🎯 OpenAI API is working correctly!
📊 Model used: gpt-4.1-nano-2025-04-14
```

## Running the Application

### Start the API Server
```bash
npm start
# or for development with auto-restart:
npm run dev
```

### Start the Discord Bot
```bash
npm run bot
```

## API Endpoints

### Server Analysis

- `GET /api/servers/public` - Get public servers list
- `GET /api/servers/:id/stats` - Get server statistics
- `POST /api/servers/:id/analyze` - **Trigger real-time OpenAI analysis**
- `GET /api/servers/:id/leaderboard` - Get server leaderboard

### Platform Statistics

- `GET /api/platform/stats` - Platform-wide statistics
- `GET /api/live/stats` - Real-time statistics

### Analysis Features

The `/analyze` endpoint performs comprehensive analysis using OpenAI:

1. **Message Collection**: Retrieves recent server messages
2. **OpenAI Analysis**: 
   - **Sentiment analysis** (-1 to 1 scale): Emotional tone detection
   - **Toxicity detection** (0 to 1 scale): Harmful content identification
   - **Engagement scoring** (0 to 1 scale): Community interaction potential
   - **AI detection** (0 to 1 scale): Identifies AI-generated content
   - **Quality assessment** (0 to 1 scale): Content quality and constructiveness
3. **Community Health**: Overall server health assessment
4. **Database Updates**: Stores analysis results

Example response:
```json
{
  "success": true,
  "data": {
    "message": "Analysis completed successfully",
    "analysis": {
      "healthScore": 0.75,
      "metrics": {
        "avgSentiment": 0.34,
        "avgToxicity": 0.12,
        "avgEngagement": 0.68,
        "avgAiLikelihood": 0.15,
        "avgQuality": 0.72,
        "totalAnalyzed": 47,
        "engagementLevel": "High"
      },
      "positive_indicators": ["Active community engagement", "High quality discussions"],
      "concerns": ["Occasional negativity detected"],
      "recommendations": ["Continue fostering positive interactions"]
    },
    "stats": {
      "messagesAnalyzed": 50,
      "validAnalyses": 47,
      "analysisDate": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

## Analysis Types

### 1. Sentiment Analysis
- **Range**: -1 (very negative) to 1 (very positive)
- **Purpose**: Understand emotional tone of conversations
- **Use case**: Monitor community mood

### 2. Toxicity Detection
- **Range**: 0 (not toxic) to 1 (very toxic)
- **Categories**: harassment, hate_speech, insults, threats, etc.
- **Purpose**: Identify harmful content
- **Use case**: Automated moderation assistance

### 3. Engagement Analysis
- **Range**: 0 (low) to 1 (high engagement)
- **Types**: question, discussion, announcement, general
- **Purpose**: Measure content interaction potential
- **Use case**: Identify engaging content patterns

### 4. AI Detection
- **Range**: 0 (human) to 1 (likely AI-generated)
- **Indicators**: Formal structure, AI self-identification, patterns
- **Purpose**: Identify AI-generated content
- **Use case**: Content authenticity verification

### 5. Quality Assessment
- **Metrics**: Quality score and constructiveness rating
- **Indicators**: Grammar, depth, helpfulness
- **Purpose**: Evaluate content value
- **Use case**: Highlight valuable contributions

## Troubleshooting

### OpenAI API Issues

1. **API Key Invalid**: Verify your `OPENAI_API_KEY` in `.env`
2. **Rate Limiting**: OpenAI has rate limits - the service includes automatic retry logic with exponential backoff
3. **Model Issues**: Check if the specified model is available for your account
4. **Network Issues**: Check internet connection and firewall settings

### Model Compatibility

The default model `gpt-4.1-nano-2025-04-14` is optimized for speed and cost. If unavailable, fallback options:
- `gpt-4o-mini`: Fast and efficient
- `gpt-3.5-turbo`: Reliable and well-tested
- `gpt-4`: Higher quality but slower/costlier

### Database Issues

1. **Connection Failed**: Verify MySQL is running and credentials are correct
2. **Migration Errors**: Run `npm run db:migrate` to ensure latest schema

### Discord Bot Issues

1. **Bot Not Responding**: Check `DISCORD_TOKEN` and bot permissions
2. **Missing Messages**: Ensure bot has "Read Message History" permission

## Development

### Adding New Analysis Types

1. Add new prompt to `ANALYSIS_PROMPTS` in `src/services/analysisService.js`
2. Implement analysis method in `AnalysisService` class
3. Update `analyzeMessageComprehensive` to include new analysis
4. Add tests to `test-openai.js`

### Optimizing API Usage

- Adjust `BATCH_SIZE` in .env to control concurrent requests
- Modify `ANALYSIS_DELAY_MS` to manage rate limiting
- Use different models based on analysis complexity

### Database Schema Changes

1. Create migration: `npx sequelize-cli migration:generate --name your-migration`
2. Edit migration file
3. Run: `npm run db:migrate`

## Production Deployment

1. Set `NODE_ENV=production`
2. Use production database credentials
3. Configure proper logging
4. Set up monitoring for OpenAI API usage
5. Implement proper error alerting
6. Configure rate limiting and retry policies
7. Set up API usage monitoring and billing alerts

## Cost Optimization

- Use `gpt-4.1-nano-2025-04-14` for cost-effective analysis
- Implement caching for repeated analyses
- Batch process messages to reduce API calls
- Monitor token usage and optimize prompts

## Architecture

```
├── src/
│   ├── api/           # REST API routes
│   ├── bot/           # Discord bot
│   ├── config/        # Database configuration
│   ├── models/        # Sequelize models
│   └── services/      # Business logic
│       ├── analysisService.js  # OpenAI integration
│       └── databaseService.js  # Database operations
├── test-openai.js     # API testing script
└── README.md
```

## API Rate Limits

OpenAI rate limits vary by model and tier:
- **Free tier**: Lower limits, may cause delays
- **Paid tier**: Higher limits, better performance
- **Automatic retry**: Built-in exponential backoff
- **Batch processing**: Respects rate limits automatically

## License

MIT License - see LICENSE file for details. 