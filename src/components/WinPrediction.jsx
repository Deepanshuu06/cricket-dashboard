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
  console.log("Win Prediction Data:", data);

  // Fallback safe extraction based on your JSON structure
  const teamLeft = winPredictionData?.team_left || { name: 'Team A', percent: 50 };
  const teamRight = winPredictionData?.team_right || { name: 'Team B', percent: 50 };
  
  const rates = data?.win_prediction?.projected_score?.rates || ['9.00', '9.00', '10.00', '11.00'];
  const scores = data?.win_prediction?.projected_score?.scores || ['180', '180', '190', '200'];
  
  // Extract overs from API if available (e.g., ['10', '20', '30', '40', '50'])
  const overs = data?.win_prediction?.projected_score?.overs || [];

  // FIX: Chunk the flat scores array into distinct rows based on the number of run rates
  const numRates = rates.length || 4;
  const chunkedScores = [];
  for (let i = 0; i < scores.length; i += numRates) {
    chunkedScores.push(scores.slice(i, i + numRates));
  }

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


       
        </div>

        <motion.div
          variants={containerVariant}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex flex-col w-full"
        >
          {/* --- WIN PROBABILITY SECTION --- */}
          {/* <motion.div variants={itemVariant} className="bg-[#112240] border-[2px] border-gray-700 p-6 rounded-2xl shadow-xl mb-8">
            <div className="flex justify-between items-center mb-4">
              
            </div>
          </motion.div> */}

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

              {/* Data Rows */}
              <div className="flex flex-col">
                {chunkedScores.map((rowScores, rowIndex) => {
                  // Fallback calculation for Over labels if the API doesn't provide them.
                  let overLabel = "20 Overs"; 
                  if (overs && overs[rowIndex]) {
                    overLabel = `${overs[rowIndex]} Overs`;
                  } else if (chunkedScores.length > 1) {
                    overLabel = `${(rowIndex + 1) * 10} Overs`;
                  }

                  return (
                    <div key={`row-${rowIndex}`} className="grid grid-cols-5 items-center border-b border-gray-800/50 last:border-b-0 hover:bg-white/5 transition-colors">
                      <div className="p-4 text-white font-black text-base uppercase tracking-wider">
                        {overLabel}
                      </div>
                      {rowScores.map((score, i) => (
                        <motion.div 
                          variants={popVariant} 
                          key={`score-${rowIndex}-${i}`} 
                          className="p-4 text-center text-[#d4af37] font-black text-4xl drop-shadow-md" 
                          style={{ fontFamily: 'Oswald, sans-serif' }}
                        >
                          {score}
                        </motion.div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>

      </motion.div>
    </motion.div>
  );
};

export default WinPrediction;