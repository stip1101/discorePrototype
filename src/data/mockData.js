export const serverTypes = {
  focusType: [
    'Product/Technical',
    'Fun/Engagement', 
    'Trading/Speculations',
    'Development'
  ],
  sentimentType: [
    'Support/Contribution',
    'Positive Engagement',
    'Critical Discussion',
    'Neutral Information'
  ]
};

export const communityInterests = [
  'Deep-Tech Builders',
  'Traders & Speculators', 
  'Degens & Farmers',
  'Meme & Culture Lovers',
  'Community Contributors',
  'Web3 Newcomers',
  'Business (KOLs, Projects, Service Providers)'
];

export const hyperilyStrategies = {
  nonMonetary: [
    'Use KOLs for PR',
    'Use connections with KOLs/Projects/Investors',
    'Burst everyone via Outreach',
    'Use for Clients we manage'
  ],
  monetary: [
    'Ambassador Program with rewards',
    'KOL Marketing'
  ],
  organic: [
    'Ambassador Program without rewards (Roles Program)',
    'Shill that there will be a token'
  ]
};

export const userRoles = {
  ADMIN: 'Admin',
  MODERATOR: 'Moderator', 
  CONTRIBUTOR: 'Contributor',
  MEMBER: 'Member',
  LURKER: 'Lurker'
};

export const mockUsers = [
  {
    id: 1,
    username: 'CryptoBeast',
    avatar: '🦾',
    role: userRoles.ADMIN,
    score: 98,
    serverScore: 94,
    messagesCount: 15420,
    mentions: 342,
    reactions: 1240,
    banned: false,
    aiDetection: 5, // % of AI generated content
    languageRatio: { en: 80, ru: 15, es: 5 },
    joinDate: '2024-03-15',
    lastActive: '2025-01-05',
    badges: ['Founder', 'Tech Expert', 'Community Leader']
  },
  {
    id: 2,
    username: 'DeFiMaster',
    avatar: '💎',
    role: userRoles.CONTRIBUTOR,
    score: 87,
    serverScore: 87,
    messagesCount: 8750,
    mentions: 567,
    reactions: 890,
    banned: false,
    aiDetection: 12,
    languageRatio: { en: 70, ru: 20, zh: 10 },
    joinDate: '2024-05-20',
    lastActive: '2025-01-04',
    badges: ['Trading Pro', 'Alpha Caller', 'Market Analyst']
  },
  {
    id: 3,
    username: 'MemeLord420',
    avatar: '🚀',
    role: userRoles.CONTRIBUTOR,
    score: 76,
    serverScore: 76,
    messagesCount: 12340,
    mentions: 234,
    reactions: 2100,
    banned: false,
    aiDetection: 8,
    languageRatio: { en: 90, fr: 10 },
    joinDate: '2024-02-10',
    lastActive: '2025-01-05',
    badges: ['Meme King', 'Community Favorite', 'Content Creator']
  },
  {
    id: 4,
    username: 'Web3Newbie',
    avatar: '🌱',
    role: userRoles.MEMBER,
    score: 91,
    serverScore: 91,
    messagesCount: 2340,
    mentions: 89,
    reactions: 456,
    banned: false,
    aiDetection: 3,
    languageRatio: { en: 95, es: 5 },
    joinDate: '2024-11-01',
    lastActive: '2025-01-03',
    badges: ['Fast Learner', 'Active Member']
  },
  {
    id: 5,
    username: 'BusinessElite',
    avatar: '💼',
    role: userRoles.MODERATOR,
    score: 83,
    serverScore: 83,
    messagesCount: 3420,
    mentions: 156,
    reactions: 234,
    banned: false,
    aiDetection: 15,
    languageRatio: { en: 85, de: 15 },
    joinDate: '2024-04-08',
    lastActive: '2025-01-02',
    badges: ['Business Network', 'Professional']
  }
];

export const mockServers = [
  {
    id: 1,
    name: 'CryptoBuilders Hub',
    memberCount: 15420,
    focusType: 'Product/Technical',
    sentimentType: 'Support/Contribution', 
    communityInterests: ['Deep-Tech Builders', 'Community Contributors'],
    score: 94,
    scoreChange: +7,
    engagement: 'High',
    sentiment: 'Very Positive',
    lastAnalyzed: '2025-01-05',
    trending: true,
    topUsers: [mockUsers[0], mockUsers[3], mockUsers[4]],
    events: [
      { type: 'member_join', count: 450, date: '2025-01-04' },
      { type: 'big_message', content: 'Major protocol update announced!', author: 'CryptoBeast', date: '2025-01-03' },
      { type: 'moderation', action: 'Warning issued', target: 'spammer123', date: '2025-01-02' }
    ],
    analysis: {
      strengths: ['Strong technical discussions', 'Active community support', 'Regular developer updates'],
      weaknesses: ['Limited marketing presence', 'Could improve onboarding'],
      recommendations: ['Implement mentor program', 'Create technical blog series']
    }
  },
  {
    id: 2,
    name: 'DeFi Degen Central',
    memberCount: 28750,
    focusType: 'Trading/Speculations',
    sentimentType: 'Critical Discussion',
    communityInterests: ['Traders & Speculators', 'Degens & Farmers'],
    score: 87,
    scoreChange: -3,
    engagement: 'Very High',
    sentiment: 'Mixed',
    lastAnalyzed: '2025-01-04',
    trending: false,
    topUsers: [mockUsers[1], mockUsers[0], mockUsers[2]],
    events: [
      { type: 'trading_alert', content: 'SOL breaking resistance!', author: 'DeFiMaster', date: '2025-01-04' },
      { type: 'member_join', count: 340, date: '2025-01-03' },
      { type: 'message_deleted', reason: 'Spam', count: 12, date: '2025-01-02' }
    ],
    analysis: {
      strengths: ['High activity levels', 'Quick alpha sharing', 'Strong trading community'],
      weaknesses: ['High volatility in discussions', 'Some toxic behavior'],
      recommendations: ['Implement better moderation', 'Create educational content']
    }
  },
  {
    id: 3,
    name: 'Meme Lords Kingdom',
    memberCount: 42180,
    focusType: 'Fun/Engagement',
    sentimentType: 'Positive Engagement',
    communityInterests: ['Meme & Culture Lovers', 'Community Contributors'],
    score: 76,
    scoreChange: +12,
    engagement: 'High',
    sentiment: 'Very Positive',
    lastAnalyzed: '2025-01-05',
    trending: true,
    topUsers: [mockUsers[2], mockUsers[0], mockUsers[3]],
    events: [
      { type: 'meme_contest', content: 'Weekly meme contest winners announced!', date: '2025-01-05' },
      { type: 'member_join', count: 890, date: '2025-01-04' },
      { type: 'big_message', content: 'New partnership with major meme project!', author: 'MemeLord420', date: '2025-01-03' }
    ],
    analysis: {
      strengths: ['Great community vibe', 'Creative content', 'Strong engagement'],
      weaknesses: ['Limited utility discussion', 'Could focus more on projects'],
      recommendations: ['Balance memes with utility', 'Host project showcases']
    }
  },
  {
    id: 4,
    name: 'Web3 Newcomers Academy',
    memberCount: 8960,
    focusType: 'Development',
    sentimentType: 'Support/Contribution',
    communityInterests: ['Web3 Newcomers', 'Community Contributors'],
    score: 91,
    scoreChange: +5,
    engagement: 'Medium',
    sentiment: 'Positive',
    lastAnalyzed: '2025-01-03',
    trending: false,
    topUsers: [mockUsers[3], mockUsers[0], mockUsers[4]],
    events: [
      { type: 'educational_event', content: 'Smart Contract Security Workshop', date: '2025-01-03' },
      { type: 'member_join', count: 156, date: '2025-01-02' },
      { type: 'achievement', content: '100 graduates milestone reached!', date: '2025-01-01' }
    ],
    analysis: {
      strengths: ['Educational focus', 'Supportive community', 'Good beginner resources'],
      weaknesses: ['Lower activity levels', 'Need more advanced content'],
      recommendations: ['Create advanced learning paths', 'Increase community events']
    }
  },
  {
    id: 5,
    name: 'Business Network Elite',
    memberCount: 5420,
    focusType: 'Product/Technical',
    sentimentType: 'Neutral Information',
    communityInterests: ['Business (KOLs, Projects, Service Providers)'],
    score: 83,
    scoreChange: +1,
    engagement: 'Medium',
    sentiment: 'Neutral',
    lastAnalyzed: '2025-01-02',
    trending: false,
    topUsers: [mockUsers[4], mockUsers[0], mockUsers[1]],
    events: [
      { type: 'networking_event', content: 'Monthly investor meetup', date: '2025-01-02' },
      { type: 'partnership', content: 'New VC partnership announced', date: '2025-01-01' },
      { type: 'member_join', count: 67, date: '2024-12-31' }
    ],
    analysis: {
      strengths: ['Professional networking', 'Quality connections', 'Business focus'],
      weaknesses: ['Lower engagement', 'Could be more interactive'],
      recommendations: ['Host networking events', 'Create collaboration opportunities']
    }
  },
  {
    id: 6,
    name: 'NFT Collectors Paradise',
    memberCount: 23456,
    focusType: 'Trading/Speculations',
    sentimentType: 'Positive Engagement',
    communityInterests: ['Traders & Speculators', 'Meme & Culture Lovers'],
    score: 79,
    scoreChange: +8,
    engagement: 'High',
    sentiment: 'Positive',
    lastAnalyzed: '2025-01-04',
    trending: true,
    topUsers: [mockUsers[1], mockUsers[2], mockUsers[0]],
    events: [
      { type: 'nft_drop', content: 'Exclusive collection mint started!', date: '2025-01-04' },
      { type: 'member_join', count: 567, date: '2025-01-03' },
      { type: 'big_message', content: 'Floor price reached new ATH!', author: 'NFTCollector', date: '2025-01-02' }
    ],
    analysis: {
      strengths: ['Active trading community', 'Exclusive drops', 'High engagement'],
      weaknesses: ['Price-focused discussions', 'Some FOMO behavior'],
      recommendations: ['Add educational content', 'Promote long-term thinking']
    }
  }
];

export const analyticsData = {
  totalServersAnalyzed: 1247,
  averageScore: 82.4,
  topPerformingCategory: 'Product/Technical',
  growthTrend: '+12.3% this month',
  totalCommunityMembers: 2840000
};

export const leaderboardData = {
  topServers: mockServers.sort((a, b) => b.score - a.score).slice(0, 10),
  topUsers: mockUsers.sort((a, b) => b.score - a.score),
  risingStars: mockServers.filter(s => s.scoreChange > 5),
  alerts: [
    { type: 'security', message: 'Potential scam detected in server "FakeProject"', severity: 'high', date: '2025-01-05' },
    { type: 'compromise', message: 'Server "OldDAO" may be compromised', severity: 'critical', date: '2025-01-04' },
    { type: 'news', message: 'New Discord policy updates released', severity: 'info', date: '2025-01-03' }
  ]
}; 