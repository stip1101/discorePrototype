import React, { useState } from 'react';
import { Shield, Bot, Users, TrendingUp, Check, Star, Zap, Crown, Heart, Award } from 'lucide-react';

const ServicePackages = () => {
  const [selectedPackage, setSelectedPackage] = useState(null);

  const packages = [
    {
      id: 1,
      name: 'Discord Security Pro',
      icon: Shield,
      price: '$299',
      period: '/month',
      popular: false,
      color: 'blue',
      description: 'Complete security suite for your Discord server',
      features: [
        'Advanced anti-spam protection',
        'AI-powered threat detection',
        'User behavior analysis',
        'Automated moderation',
        'Real-time security alerts',
        'Custom security rules',
        'Ban/kick logging',
        '24/7 monitoring'
      ],
      benefits: [
        'Reduce spam by 95%',
        'Auto-detect malicious users',
        'Save 20+ hours/week on moderation'
      ]
    },
    {
      id: 2,
      name: 'Ambassador Program Setup',
      icon: Users,
      price: '$499',
      period: '/setup',
      popular: true,
      color: 'purple',
      description: 'Build a thriving community with structured ambassador program',
      features: [
        'Ambassador recruitment strategy',
        'Role-based permissions system',
        'Reward & incentive structure',
        'Performance tracking dashboard',
        'Community engagement tools',
        'Ambassador training materials',
        'KPI monitoring',
        'Monthly performance reports'
      ],
      benefits: [
        'Increase engagement by 300%',
        'Build loyal community base',
        'Organic growth acceleration'
      ]
    },
    {
      id: 3,
      name: 'Bot Ecosystem Premium',
      icon: Bot,
      price: '$199',
      period: '/month',
      popular: false,
      color: 'green',
      description: 'Custom bot development and management suite',
      features: [
        'Custom bot development',
        'Multi-purpose utility bots',
        'Game & entertainment bots',
        'Trading signal bots',
        'NFT/Web3 integration bots',
        'Analytics & reporting bots',
        'Bot hosting & maintenance',
        'Regular updates & features'
      ],
      benefits: [
        'Automate 80% of tasks',
        'Enhance user experience',
        'Boost server activity'
      ]
    },
    {
      id: 4,
      name: 'Complete Growth Package',
      icon: TrendingUp,
      price: '$899',
      period: '/month',
      popular: false,
      color: 'orange',
      description: 'All-in-one solution for explosive server growth',
      features: [
        'Everything from other packages',
        'KOL marketing campaigns',
        'Viral content strategy',
        'Cross-community partnerships',
        'Influencer collaborations',
        'Growth hacking techniques',
        'Analytics & optimization',
        'Dedicated growth manager'
      ],
      benefits: [
        'Scale to 10k+ members',
        'Industry partnerships',
        'Exponential growth rate'
      ]
    }
  ];

  const getPackageColors = (color) => {
    const colors = {
      blue: {
        bg: 'from-blue-600 to-blue-800',
        border: 'border-blue-500',
        accent: 'text-blue-400',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      purple: {
        bg: 'from-purple-600 to-purple-800',
        border: 'border-purple-500',
        accent: 'text-purple-400',
        button: 'bg-purple-600 hover:bg-purple-700'
      },
      green: {
        bg: 'from-green-600 to-green-800',
        border: 'border-green-500',
        accent: 'text-green-400',
        button: 'bg-green-600 hover:bg-green-700'
      },
      orange: {
        bg: 'from-orange-600 to-orange-800',
        border: 'border-orange-500',
        accent: 'text-orange-400',
        button: 'bg-orange-600 hover:bg-orange-700'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Server <span className="text-gradient">Upgrade Packages</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Professional services to take your Discord community to the next level
          </p>
        </div>

        {/* Package Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {packages.map((pkg) => {
            const colors = getPackageColors(pkg.color);
            const Icon = pkg.icon;
            
            return (
              <div
                key={pkg.id}
                className={`relative glass-effect rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer ${
                  selectedPackage?.id === pkg.id ? `${colors.border} border-2` : 'border border-gray-700'
                }`}
                onClick={() => setSelectedPackage(selectedPackage?.id === pkg.id ? null : pkg)}
              >
                {/* Popular Badge */}
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      MOST POPULAR
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${colors.bg} rounded-2xl flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                  <p className="text-gray-400 text-sm">{pkg.description}</p>
                </div>

                {/* Pricing */}
                <div className="text-center mb-6">
                  <div className="flex items-end justify-center">
                    <span className={`text-3xl font-bold ${colors.accent}`}>{pkg.price}</span>
                    <span className="text-gray-400 ml-1">{pkg.period}</span>
                  </div>
                </div>

                {/* Features Preview */}
                <div className="space-y-3 mb-6">
                  {pkg.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check className={`w-4 h-4 ${colors.accent} flex-shrink-0`} />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                  {pkg.features.length > 4 && (
                    <div className="text-center">
                      <span className="text-gray-400 text-sm">+{pkg.features.length - 4} more features</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <button className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${colors.button}`}>
                  Get Started
                </button>

                {/* Expanded Content */}
                {selectedPackage?.id === pkg.id && (
                  <div className="mt-6 pt-6 border-t border-gray-700 animate-fadeIn">
                    {/* All Features */}
                    <div className="mb-6">
                      <h4 className="text-white font-semibold mb-3">Complete Features</h4>
                      <div className="space-y-2">
                        {pkg.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <Check className={`w-4 h-4 ${colors.accent} flex-shrink-0`} />
                            <span className="text-gray-300 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="mb-6">
                      <h4 className="text-white font-semibold mb-3">Key Benefits</h4>
                      <div className="space-y-2">
                        {pkg.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <Zap className={`w-4 h-4 ${colors.accent} flex-shrink-0`} />
                            <span className="text-gray-300 text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact */}
                    <div className={`p-4 rounded-lg bg-gradient-to-br ${colors.bg}/20`}>
                      <div className="text-center">
                        <h5 className="text-white font-medium mb-2">Ready to get started?</h5>
                        <p className="text-gray-300 text-sm mb-3">Schedule a consultation with our experts</p>
                        <button className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${colors.button}`}>
                          Book Consultation
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Enterprise Solution */}
        <div className="glass-effect rounded-2xl p-8 border border-gradient-to-r from-yellow-500 to-orange-500">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Enterprise Solution</h3>
            <p className="text-gray-400 text-lg mb-6 max-w-2xl mx-auto">
              Custom solutions for large organizations, DAOs, and major projects with dedicated support and tailored features
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <h4 className="text-white font-semibold">Dedicated Team</h4>
                <p className="text-gray-400 text-sm">24/7 priority support</p>
              </div>
              <div className="text-center">
                <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <h4 className="text-white font-semibold">Custom Development</h4>
                <p className="text-gray-400 text-sm">Tailored to your needs</p>
              </div>
              <div className="text-center">
                <Heart className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <h4 className="text-white font-semibold">White-label Options</h4>
                <p className="text-gray-400 text-sm">Your brand, our technology</p>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-all">
                Contact Sales
              </button>
              <button className="border border-gray-600 hover:border-gray-500 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                View Case Studies
              </button>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Questions?</h3>
          <p className="text-gray-400 mb-6">
            Get in touch with our team for custom solutions and enterprise pricing
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-discord-500 hover:bg-discord-600 text-white px-6 py-3 rounded-lg transition-colors">
              Schedule Demo
            </button>
            <button className="border border-gray-600 hover:border-gray-500 text-white px-6 py-3 rounded-lg transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicePackages; 