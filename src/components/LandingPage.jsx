import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeroAnimation from './HeroAnimation';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0f1629] text-white relative overflow-hidden">
      <HeroAnimation />
      


      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 relative">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="inline-block mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-lg rounded-full px-4 py-1 border border-white/10">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm text-gray-300">Live on Sepolia Network</span>
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Predict. Trade. Earn.
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-400 max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Experience the future of prediction markets on our decentralized platform. Create markets, trade positions, and earn rewards in a transparent, trustless environment.
          </motion.p>
          <motion.div
            className="flex items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link
              to="/markets"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] overflow-hidden transition-all duration-200"
            >
              <span className="relative z-10">Launch App</span>
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1]"></div>
                <div className="absolute bottom-0 right-0 block w-64 h-64 mb-32 mr-4 transition duration-500 origin-bottom-left transform rotate-45 translate-x-24 bg-purple-500 rounded-full opacity-30 group-hover:rotate-90"></div>
              </div>
            </Link>
            <Link
              to="/faucet"
              className="px-8 py-4 text-lg font-semibold rounded-xl border border-violet-500/30 hover:bg-violet-500/10 transition-all duration-200"
            >
              Get Test Tokens
            </Link>
          </motion.div>

         
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Our platform combines the power of blockchain technology with an intuitive user experience to bring you the future of prediction markets.</p>
        </motion.div>
        <motion.div 
          className="grid md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <FeatureCard
            title="Decentralized Markets"
            description="Create and participate in prediction markets without intermediaries. Smart contracts ensure transparency and fairness."
            icon="🔗"
            delay={0}
          />
          <FeatureCard
            title="Instant Settlement"
            description="Trade positions with instant settlement and low fees. No waiting periods or complex clearing processes."
            icon="⚡"
            delay={0.2}
          />
          <FeatureCard
            title="Reward System"
            description="Earn rewards for market creation, liquidity provision, and accurate predictions. Your expertise pays off."
            icon="💎"
            delay={0.4}
          />
        </motion.div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none"></div>
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Get Started in Minutes</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Follow these simple steps to start trading on our prediction markets platform.</p>
        </motion.div>
        <motion.div 
          className="grid md:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <StepCard
            number="1"
            title="Connect Wallet"
            description="Connect your Web3 wallet securely to access the platform"
            delay={0}
          />
          <StepCard
            number="2"
            title="Get Test Tokens"
            description="Visit our faucet to get free test tokens"
            delay={0.2}
          />
          <StepCard
            number="3"
            title="Choose Markets"
            description="Browse or create prediction markets"
            delay={0.4}
          />
          <StepCard
            number="4"
            title="Start Trading"
            description="Place your predictions and earn rewards"
            delay={0.6}
          />
        </motion.div>
      </div>
    </div>
  );
};

const StatCard = ({ value, label }) => (
  <motion.div 
    className="p-4 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10"
    whileHover={{ scale: 1.05 }}
    transition={{ duration: 0.2 }}
  >
    <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
      {value}
    </div>
    <div className="text-gray-400 mt-1">{label}</div>
  </motion.div>
);

const FeatureCard = ({ title, description, icon, delay }) => (
  <motion.div 
    className="p-6 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-200"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    whileHover={{ 
      scale: 1.05,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    }}
  >
    <motion.div 
      className="text-4xl mb-4"
      initial={{ scale: 0 }}
      whileInView={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, delay: delay + 0.2 }}
      viewport={{ once: true }}
    >
      {icon}
    </motion.div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </motion.div>
);

const StepCard = ({ number, title, description, delay }) => (
  <motion.div 
    className="relative p-6 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-200"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    whileHover={{ 
      scale: 1.05,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    }}
  >
    <motion.div 
      className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] flex items-center justify-center font-bold border border-white/20"
      initial={{ scale: 0, rotate: -180 }}
      whileInView={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, delay: delay + 0.2 }}
      viewport={{ once: true }}
    >
      {number}
    </motion.div>
    <h3 className="text-xl font-semibold mb-2 mt-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </motion.div>
);

export default LandingPage;
