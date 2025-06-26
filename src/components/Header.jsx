import React from 'react';
import { Bot, TrendingUp, Users, Zap } from 'lucide-react';

const Header = () => {
  return (
    <header className="relative bg-gradient-to-r from-discord-900 via-discord-700 to-discord-500 overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0 gradient-bg opacity-50"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-float"></div>
        <div className="absolute top-32 right-1/3 w-1 h-1 bg-white/30 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/2 w-3 h-3 bg-white/10 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative container mx-auto px-6 py-16">
        <div className="text-center">
          {/* Logo and Title */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Bot className="w-16 h-16 text-white neon-glow" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="ml-4">
              <h1 className="text-5xl font-bold text-white mb-2">
                Dis<span className="text-gradient">core</span>
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-discord-400 to-purple-500 rounded-full"></div>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Unleash the power of AI to analyze Discord servers and discover community insights, 
            sentiment patterns, and engagement metrics that matter.
          </p>

          {/* Feature highlights */}
          <div className="flex justify-center items-center space-x-8 mb-8">
            <div className="flex items-center space-x-2 text-white/80">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-sm">Real-time Analytics</span>
            </div>
            <div className="flex items-center space-x-2 text-white/80">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-sm">Community Insights</span>
            </div>
            <div className="flex items-center space-x-2 text-white/80">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-sm">AI-Powered</span>
            </div>
          </div>

          {/* CTA Button */}
          <button className="bg-gradient-to-r from-discord-500 to-purple-600 hover:from-discord-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 neon-glow">
            Start Analyzing Servers
          </button>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-auto">
          <path
            fill="#1e293b"
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
          ></path>
        </svg>
      </div>
    </header>
  );
};

export default Header; 