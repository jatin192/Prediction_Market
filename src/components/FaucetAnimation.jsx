import React from 'react';
import { motion } from 'framer-motion';

const FaucetAnimation = () => {
  return (
    <div className="relative w-32 h-32 mx-auto mb-8">
      {/* Outer circle glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/30 to-indigo-500/30 blur-xl"
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Main faucet icon container */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {/* Coin elements */}
        {[...Array(8)].map((_, index) => (
          <motion.div
            key={index}
            className="absolute w-4 h-4"
            initial={{ rotate: index * 45, y: -40 }}
            style={{ rotate: index * 45 }}
          >
            <motion.div
              className="w-4 h-4 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Center coin */}
      <motion.div
        className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <motion.span
          className="text-2xl font-bold text-white"
          animate={{
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          M
        </motion.span>
      </motion.div>

      {/* Animated particles */}
      {[...Array(5)].map((_, index) => (
        <motion.div
          key={`particle-${index}`}
          className="absolute w-2 h-2 rounded-full bg-violet-400"
          initial={{ 
            x: 0, 
            y: 0, 
            scale: 0,
            opacity: 0 
          }}
          animate={{
            x: [0, (index % 2 ? 50 : -50) * Math.random()],
            y: [0, 50],
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.3,
            ease: "easeOut"
          }}
          style={{
            top: '50%',
            left: '50%',
          }}
        />
      ))}
    </div>
  );
};

export default FaucetAnimation;
