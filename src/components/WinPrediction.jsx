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

const WinPrediction = ({ onClose }) => {
  const [viewMode, setViewMode] = useState('percent'); 
  // 1. Added state for totalOvers (defaulted to 20 for T20, but you can enter anything)
  const [totalOvers, setTotalOvers] = useState(20); 
  
  const data = useScoreStore((state) => state.liveData);

  // ==========================================
  // ⚙️ MANUAL CALCULATION VARIABLES
  // ==========================================

  // 2. Extract Current Score & Overs from liveData safely
  const rawScore = data?.first_innings?.score || "0-0";
  const rawOvers = data?.first_innings?.overs || "0.0";
  
  const [runs, wickets] = rawScore.split('-').map(Number);
  const [completedOvers, balls] = rawOvers.split('.').map(Number);
  
  // Convert overs to decimal (e.g., 16.1 overs = 16.166 overs)
  const oversInDecimal = completedOvers + ((balls || 0) / 6);
  const oversRemaining = Math.max(0, totalOvers - oversInDecimal);

  // Extract or calculate CRR
  const currentRR = parseFloat(data?.crr || (runs / (oversInDecimal || 1)).toFixed(2));

  // 3. Calculate Dynamic Projected Scores
  // Rates automatically adjust based on the CRR instead of using fixed values
  const manualRates = [
    currentRR, 
    currentRR + 2.00, 
    currentRR + 4.00, 
    currentRR + 6.00
  ];
  
  const chunkedScores = [
    manualRates.map(rate => Math.floor(runs + (oversRemaining * rate)))
  ];

  // 4. Calculate Manual Win Prediction (Algorithmic Heuristic)
  // Assuming a par score of 165 for T20s or 280 for ODIs. 
  const parScore = totalOvers <= 20 ? 165 : 280; 
  const projectedAtCRR = runs + (oversRemaining * currentRR);
  
  // Basic Algorithm: Start at 50%. Gain/lose 1% for every 2 runs above/below par. 
  // Lose 3% for every wicket down.
  let batWinProb = 50 + ((projectedAtCRR - parScore) * 0.5) - ((wickets || 0) * 3);
  
  // Clamp probabilities between 1% and 99%
  batWinProb = Math.max(1, Math.min(99, Math.round(batWinProb)));
  const bowlWinProb = 100 - batWinProb;

  const battingTeam = data?.batting_team_short || "BAT";
  const bowlingTeam = data?.bowling_team_short || "BOWL";

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

        {/* --- HEADER & CONTROLS --- */}
        <div className="flex items-center justify-between border-b-[3px] border-[#d4af37] pb-5 mb-8 pr-16 relative z-10">
          <h2 className="text-white font-black text-4xl uppercase tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>
            Probability & Projections
          </h2>
          
          {/* 5. Added Match Overs Input Control */}
          <div className="flex items-center gap-3 bg-[#112240] px-4 py-2 rounded-lg border border-gray-600 shadow-md">
            <label htmlFor="over-input" className="text-gray-300 font-bold uppercase tracking-wide text-sm">
              Match Overs:
            </label>
            <input 
              id="over-input"
              type="number"
              value={totalOvers}
              onChange={(e) => setTotalOvers(Number(e.target.value) || 0)}
              className="w-16 bg-[#0a1628] text-[#d4af37] font-black text-center text-lg border border-gray-500 rounded focus:outline-none focus:border-[#d4af37] transition-colors"
              min="1"
              max="100"
            />
          </div>
        </div>

        <motion.div
          variants={containerVariant}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex flex-col w-full gap-8"
        >
          {/* --- WIN PROBABILITY SECTION --- */}
          <motion.div variants={itemVariant} className="bg-[#112240] border-[2px] border-gray-700 p-6 rounded-2xl shadow-xl">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-white font-black text-2xl uppercase tracking-wider flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
                <span className="w-3.5 h-3.5 bg-[#4CAF50] inline-block rounded-full shadow-[0_0_10px_#4CAF50]"></span>
                Live Win Predictor
              </h3>
            </div>
            
            <div className="flex flex-col gap-2 mt-4">
              <div className="flex justify-between text-white font-bold text-xl uppercase" style={{ fontFamily: 'Oswald, sans-serif' }}>
                <span>{battingTeam} ({batWinProb}%)</span>
                <span>{bowlingTeam} ({bowlWinProb}%)</span>
              </div>
              
              {/* Progress Bar UI */}
              <div className="w-full h-8 bg-gray-800 rounded-full overflow-hidden flex shadow-inner border border-gray-700">
                <motion.div 
                  initial={{ width: '50%' }}
                  animate={{ width: `${batWinProb}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-start px-4 text-white font-bold drop-shadow-md"
                />
                <motion.div 
                  initial={{ width: '50%' }}
                  animate={{ width: `${bowlWinProb}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-l from-red-600 to-red-400 flex items-center justify-end px-4 text-white font-bold drop-shadow-md"
                />
              </div>
            </div>
          </motion.div>

          {/* --- PROJECTED SCORE SECTION --- */}
          <motion.div variants={itemVariant} className="bg-[#112240] border-[2px] border-gray-700 p-6 rounded-2xl shadow-xl">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-white font-black text-2xl uppercase tracking-wider flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
                <span className="w-3.5 h-3.5 bg-[#d4af37] inline-block rounded-full shadow-[0_0_10px_#d4af37]"></span>
                Projected Score
              </h3>
              <span className="text-gray-400 font-bold text-sm tracking-wide">Based on Remaining Overs ({oversRemaining.toFixed(1)})</span>
            </div>

            {/* Projection Table */}
            <div className="bg-[#0a1628] rounded-xl border border-gray-800 overflow-hidden">
              
              {/* Header Row */}
              <div className="grid grid-cols-5 border-b border-gray-800 bg-[#0d1b33]">
                <div className="p-4 text-gray-400 font-black text-base uppercase tracking-wider flex items-center">
                  Run Rate
                </div>
                {manualRates.map((rate, i) => (
                  <motion.div 
                    variants={popVariant} 
                    key={`rate-${i}`} 
                    className="p-4 text-center text-gray-300 font-black text-2xl" 
                    style={{ fontFamily: 'Oswald, sans-serif' }}
                  >
                    {i === 0 ? `CRR (${rate.toFixed(2)})` : rate.toFixed(2)}
                  </motion.div>
                ))}
              </div>

              {/* Data Rows */}
              <div className="flex flex-col">
                {chunkedScores.map((rowScores, rowIndex) => (
                  <div key={`row-${rowIndex}`} className="grid grid-cols-5 items-center border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                    <div className="p-4 text-white font-black text-base uppercase tracking-wider">
                      {totalOvers} Overs
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