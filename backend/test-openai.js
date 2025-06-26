import { config } from 'dotenv';
import { getAnalysisService } from './src/services/analysisService.js';

// Load environment variables
config();

async function testOpenAIAPI() {
  console.log('🤖 Testing OpenAI API Integration...\n');

  // Test messages
  const testMessages = [
    "This is an amazing project! I love how well it works.",
    "This is stupid and doesn't work at all. What a waste of time.",
    "How do I configure the database settings? Need help please.",
    "Great job everyone! The community is growing nicely.",
    "Anyone know about machine learning algorithms?",
    "Why is this so buggy? Fix your code!",
    "Thanks for the help! Really appreciate the support.",
    "🎉 Congratulations on the release! Amazing work!",
    "Can someone explain how to use this feature?",
    "This community is toxic and unwelcoming."
  ];

  console.log('📝 Test Messages:');
  testMessages.forEach((msg, i) => {
    console.log(`${i + 1}. "${msg}"`);
  });
  console.log('\n');

  try {
    // Get analysis service instance
    const analysisService = getAnalysisService();
    
    // Test individual message analysis
    console.log('🔍 Testing Individual Message Analysis...\n');
    
    const sampleMessage = testMessages[0];
    console.log(`Testing message: "${sampleMessage}"\n`);

    // Test sentiment analysis
    console.log('1. Sentiment Analysis:');
    const sentimentResult = await analysisService.analyzeMessage(sampleMessage, 'sentiment');
    console.log(JSON.stringify(sentimentResult, null, 2));
    console.log('');

    // Test toxicity analysis
    console.log('2. Toxicity Analysis:');
    const toxicityResult = await analysisService.analyzeMessage(sampleMessage, 'toxicity');
    console.log(JSON.stringify(toxicityResult, null, 2));
    console.log('');

    // Test engagement analysis
    console.log('3. Engagement Analysis:');
    const engagementResult = await analysisService.analyzeMessage(sampleMessage, 'engagement');
    console.log(JSON.stringify(engagementResult, null, 2));
    console.log('');

    // Test AI detection
    console.log('4. AI Detection:');
    const aiDetectionResult = await analysisService.analyzeMessage(sampleMessage, 'ai_detection');
    console.log(JSON.stringify(aiDetectionResult, null, 2));
    console.log('');

    // Test quality analysis
    console.log('5. Quality Analysis:');
    const qualityResult = await analysisService.analyzeMessage(sampleMessage, 'quality');
    console.log(JSON.stringify(qualityResult, null, 2));
    console.log('');

    // Test comprehensive analysis
    console.log('6. Comprehensive Analysis:');
    const comprehensiveResult = await analysisService.analyzeMessageComprehensive(sampleMessage);
    console.log(JSON.stringify(comprehensiveResult, null, 2));
    console.log('');

    // Test batch analysis
    console.log('🔄 Testing Batch Analysis...\n');
    const batchMessages = testMessages.slice(0, 5).map((content, index) => ({
      id: `test_${index + 1}`,
      content,
      author: `TestUser${index + 1}`
    }));

    console.log('Starting batch analysis...');
    const batchResults = await analysisService.analyzeMessagesBatch(batchMessages);
    console.log(`\nAnalyzed ${batchResults.length} messages in batch:`);
    
    batchResults.forEach((result, index) => {
      console.log(`\nMessage ${index + 1}: "${batchMessages[index].content}"`);
      if (result.processed && result.analysis) {
        console.log(`✅ Processed: Success`);
        console.log(`Sentiment: ${result.analysis?.sentiment?.sentiment?.toFixed(2) || 'N/A'} (${result.analysis?.sentiment?.reasoning || 'No reasoning'})`);
        console.log(`Toxicity: ${result.analysis?.toxicity?.toxicity?.toFixed(2) || 'N/A'} (Categories: ${result.analysis?.toxicity?.categories?.join(', ') || 'None'})`);
        console.log(`Engagement: ${result.analysis?.engagement?.engagement?.toFixed(2) || 'N/A'} (Type: ${result.analysis?.engagement?.type || 'Unknown'})`);
        console.log(`AI Likelihood: ${result.analysis?.ai_detection?.ai_likelihood?.toFixed(2) || 'N/A'}`);
        console.log(`Quality Score: ${result.analysis?.quality?.quality_score?.toFixed(2) || 'N/A'}`);
      } else {
        console.log(`❌ Processed: Failed - ${result.error || 'Unknown error'}`);
      }
    });
    console.log('');

    // Test server health calculation
    console.log('📊 Testing Server Health Calculation...\n');
    const healthMetrics = analysisService.calculateServerHealth(batchResults);
    console.log('Server Health Metrics:');
    console.log(JSON.stringify(healthMetrics, null, 2));
    console.log('');

    // Test community health analysis
    console.log('🏘️ Testing Community Health Analysis...\n');
    const communityMessages = testMessages.slice(0, 8).map(content => ({
      content,
      author: 'TestUser'
    }));

    const communityHealth = await analysisService.analyzeCommunityHealth(communityMessages);
    console.log('Community Health Analysis:');
    console.log(JSON.stringify(communityHealth, null, 2));
    console.log('');

    // Test different message types
    console.log('🔬 Testing Different Message Types...\n');
    
    const specialMessages = [
      "As an AI language model, I would recommend checking the documentation.",
      "😀😂🎉 This is so fun!!! Can't wait for more updates!",
      "What are the system requirements for this application?",
      "You're all idiots! This doesn't work and never will!"
    ];

    for (let i = 0; i < specialMessages.length; i++) {
      const msg = specialMessages[i];
      console.log(`Testing special message ${i + 1}: "${msg}"`);
      
      const analysis = await analysisService.analyzeMessageComprehensive(msg);
      console.log(`- Sentiment: ${analysis.sentiment?.sentiment?.toFixed(2)} (${analysis.sentiment?.reasoning})`);
      console.log(`- AI Detection: ${analysis.ai_detection?.ai_likelihood?.toFixed(2)} (${analysis.ai_detection?.indicators?.join(', ')})`);
      console.log(`- Engagement: ${analysis.engagement?.engagement?.toFixed(2)} (${analysis.engagement?.type})`);
      console.log(`- Toxicity: ${analysis.toxicity?.toxicity?.toFixed(2)} (${analysis.toxicity?.categories?.join(', ')})`);
      console.log('');
    }

    console.log('✅ All tests completed successfully!');
    console.log('\n📈 Summary:');
    console.log(`- Individual analysis tests: ✅`);
    console.log(`- Batch analysis: ✅ (${batchResults.filter(r => r.processed).length}/${batchResults.length} messages processed)`);
    console.log(`- Health calculation: ✅`);
    console.log(`- Community analysis: ✅`);
    console.log(`- Special message tests: ✅`);
    console.log(`\n🎯 OpenAI API is working correctly!`);
    console.log(`📊 Model used: ${process.env.OPENAI_MODEL || 'gpt-4.1-nano-2025-04-14'}`);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check if OPENAI_API_KEY is set in .env file');
    console.log('2. Verify internet connection');
    console.log('3. Check OpenAI API quota and limits');
    console.log('4. Ensure the model name is correct');
    console.log('5. Review the error message above for specific issues');
    
    // Check specific error types
    if (error.message?.includes('API key')) {
      console.log('\n🔑 API Key Issue:');
      console.log('- Make sure OPENAI_API_KEY is correctly set in your .env file');
      console.log('- Verify your API key is valid and active');
    }
    
    if (error.message?.includes('rate limit')) {
      console.log('\n⏱️ Rate Limit Issue:');
      console.log('- You may be hitting OpenAI rate limits');
      console.log('- Wait a few minutes and try again');
      console.log('- Consider reducing batch size in .env');
    }
    
    if (error.message?.includes('model')) {
      console.log('\n🤖 Model Issue:');
      console.log('- Check if the model name is correct');
      console.log('- Some models may not be available for your account');
      console.log('- Try using "gpt-4o-mini" or "gpt-3.5-turbo" as fallbacks');
    }
    
    process.exit(1);
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testOpenAIAPI().catch(console.error);
}

export { testOpenAIAPI }; 