import React from 'react';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import ServerGrid from './components/ServerGrid';
import Leaderboard from './components/Leaderboard';
import UserAnalyzer from './components/UserAnalyzer';
import ServicePackages from './components/ServicePackages';
import Footer from './components/Footer';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <StatsOverview />
      <ServerGrid />
      <Leaderboard />
      <UserAnalyzer />
      <ServicePackages />
      <Footer />
    </div>
  );
}

export default App; 