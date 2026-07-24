import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IoCloseSharp } from "react-icons/io5";
import useScoreStore from '../hooks/useScoreStore';

// --- Animation Variants ---
const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 120, damping: 15 } 
  }
};

const popVariant = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { type: "spring", stiffness: 200, damping: 12 } 
  }
};

const WinPrediction = ({ winPredictionData, onClose }) => {
  const [viewMode, setViewMode] = useState('percent'); // 'percent' or 'number'

  const data = useScoreStore((state) => state.liveData);


  // Fallback safe extraction based on your JSON structure
  const teamLeft = winPredictionData?.team_left || { name: 'Team A', percent: 50 };
  const teamRight = winPredictionData?.team_right || { name: 'Team B', percent: 50 };
  const rates = data?.win_prediction?.projected_score?.rates || ['9.00', '9.00', '10.00', '11.00'];
  const scores = data?.win_prediction?.projected_score?.scores || ['180', '180', '190', '200'];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center select-none"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.85, y: 30, opacity: 0 }} 
        animate={{ scale: 1, y: 0, opacity: 1 }} 
        exit={{ scale: 0.85, y: 30, opacity: 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
        onClick={(e) => e.stopPropagation()} 
        className="w-[1100px] bg-[#071124] border-[6px] border-[#d4af37] shadow-[0_35px_90px_rgba(0,0,0,0.95)] flex flex-col relative overflow-hidden rounded-xl font-sans p-8"
      >
        
        {/* Subtle animated shine effect across the top */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shine_5s_infinite_linear] pointer-events-none" style={{ backgroundSize: '200% 100%' }} />
        <style>{`
          @keyframes shine {
            0% { transform: translateX(-100%) skewX(-15deg); }
            100% { transform: translateX(200%) skewX(-15deg); }
          }
        `}</style>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-40 w-[50px] h-[50px] bg-red-600 border-[3px] border-white flex items-center justify-center hover:bg-red-500 shadow-2xl cursor-pointer rounded-lg transition-colors"
        >
          <IoCloseSharp size={38} color="white" />
        </button>

        {/* --- HEADER & VIEW TOGGLE --- */}
        <div className="flex items-center justify-between border-b-[3px] border-[#d4af37] pb-5 mb-8 pr-16 relative z-10">
          <h2 className="text-white font-black text-4xl uppercase tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>
            Probability & Projections
          </h2>

          {/* Toggle Switch */}
          <div className="flex bg-[#112240] p-1.5 rounded-xl border border-gray-600 relative">
            <button
              onClick={() => setViewMode('percent')}
              className={`relative px-5 py-2 font-black text-lg uppercase rounded-lg transition-colors cursor-pointer ${
                viewMode === 'percent' ? 'text-black' : 'text-white hover:text-gray-300'
              }`}
              style={{ fontFamily: 'Oswald, sans-serif' }}
            >
              {viewMode === 'percent' && (
                <motion.div layoutId="activeToggleBG" className="absolute inset-0 bg-[#d4af37] rounded-lg shadow-lg" style={{ zIndex: -1 }} />
              )}
              % View
            </button>
            <button
              onClick={() => setViewMode('number')}
              className={`relative px-5 py-2 font-black text-lg uppercase rounded-lg transition-colors cursor-pointer ${
                viewMode === 'number' ? 'text-black' : 'text-white hover:text-gray-300'
              }`}
              style={{ fontFamily: 'Oswald, sans-serif' }}
            >
              {viewMode === 'number' && (
                <motion.div layoutId="activeToggleBG" className="absolute inset-0 bg-[#d4af37] rounded-lg shadow-lg" style={{ zIndex: -1 }} />
              )}
              Number View
            </button>
          </div>
        </div>

        <motion.div
          variants={containerVariant}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex flex-col w-full"
        >
          {/* --- WIN PROBABILITY SECTION --- */}
          <motion.div variants={itemVariant} className="bg-[#112240] border-[2px] border-gray-700 p-6 rounded-2xl shadow-xl mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <span className="text-white font-black text-2xl uppercase tracking-wide" style={{ fontFamily: 'Oswald, sans-serif' }}>
                  {teamLeft.name}
                </span>
                <span className="text-[#d4af37] text-3xl font-black min-w-[70px]">
                  {viewMode === 'percent' ? `${teamLeft.percent}%` : Math.round((teamLeft.percent / 100) * 100)}
                </span>
              </div>

              <div className="flex items-center gap-3 text-right">
                <span className="text-[#d4af37] text-3xl font-black min-w-[70px] text-right">
                  {viewMode === 'percent' ? `${teamRight.percent}%` : Math.round((teamRight.percent / 100) * 100)}
                </span>
                <span className="text-white font-black text-2xl uppercase tracking-wide" style={{ fontFamily: 'Oswald, sans-serif' }}>
                  {teamRight.name}
                </span>
              </div>
            </div>

            {/* Split Progress Bar */}
            <div className="w-full bg-gray-700 h-6 rounded-full overflow-hidden flex border-2 border-gray-600 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${teamLeft.percent}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                className="bg-gradient-to-r from-blue-600 to-blue-400 h-full" 
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${teamRight.percent}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                className="bg-gradient-to-l from-red-600 to-red-400 h-full ml-auto" 
              />
            </div>
          </motion.div>

          {/* --- PROJECTED SCORE SECTION --- */}
          <motion.div variants={itemVariant} className="bg-[#112240] border-[2px] border-gray-700 p-6 rounded-2xl shadow-xl">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-white font-black text-2xl uppercase tracking-wider flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
                <span className="w-3.5 h-3.5 bg-[#d4af37] inline-block rounded-full shadow-[0_0_10px_#d4af37]"></span>
                Projected Score
              </h3>
              <span className="text-gray-400 font-bold text-sm tracking-wide">as per RR*</span>
            </div>

            {/* Projection Table */}
            <div className="bg-[#0a1628] rounded-xl border border-gray-800 overflow-hidden">
              
              {/* Header Row */}
              <div className="grid grid-cols-5 border-b border-gray-800 bg-[#0d1b33]">
                <div className="p-4 text-gray-400 font-black text-base uppercase tracking-wider flex items-center">
                  Run Rate
                </div>
                {rates.map((rate, i) => (
                  <motion.div 
                    variants={popVariant} 
                    key={`rate-${i}`} 
                    className="p-4 text-center text-gray-300 font-black text-2xl" 
                    style={{ fontFamily: 'Oswald, sans-serif' }}
                  >
                    {rate}
                  </motion.div>
                ))}
              </div>

              {/* Data Row */}
              <div className="grid grid-cols-5 items-center">
                <div className="p-4 text-white font-black text-base uppercase tracking-wider">
                  20 Overs
                </div>
                {scores.map((score, i) => (
                  <motion.div 
                    variants={popVariant} 
                    key={`score-${i}`} 
                    className="p-4 text-center text-[#d4af37] font-black text-4xl drop-shadow-md" 
                    style={{ fontFamily: 'Oswald, sans-serif' }}
                  >
                    {score}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

      </motion.div>
    </motion.div>
  );
};

export default WinPrediction;