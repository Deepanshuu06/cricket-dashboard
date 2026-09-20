import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoCloseSharp } from "react-icons/io5";
import useScoreStore from '../hooks/useScoreStore';
import api from '../api/cricketApi';

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

const WinPrediction = ({ onClose, winPredictionData }) => {
  const [totalOvers, setTotalOvers] = useState(20); 
  const [livePred, setLivePred] = useState(winPredictionData || null);
  
  const data = useScoreStore((state) => state.liveData);

  // Fetch real projected score & win prediction from backend API
  useEffect(() => {
    let isMounted = true;
    const fetchPrediction = async () => {
      try {
        const response = await api.get('/get_win_prediction');
        if (response.data && response.data.success && isMounted) {
          setLivePred(response.data);
          if (response.data.projected_score?.total_overs) {
            setTotalOvers(response.data.projected_score.total_overs);
          }
        }
      } catch (err) {
        console.error("Failed to fetch prediction data", err);
      }
    };

    fetchPrediction();
    const interval = setInterval(fetchPrediction, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // ==========================================
  // ⚙️ API DATA MAPPING & CONDITIONAL FALLBACK
  // ==========================================
  
  const winData = livePred?.win_prediction;
  const projData = livePred?.projected_score;
  
  const team1API = livePred?.team_left || winData?.team1;
  const team2API = livePred?.team_right || winData?.team2;

  const hasWinProbAPI = team1API?.percent !== undefined && team2API?.percent !== undefined;
  const hasProjAPI = projData?.rates?.length > 0 && projData?.table?.length > 0;

  let batWinProb = team1API?.percent;
  let bowlWinProb = team2API?.percent;
  let displayRates = projData?.rates || [];
  let displayTable = projData?.table || [];
  let oversRemainingDisplay = projData?.overs_remaining;

  if (!hasWinProbAPI || !hasProjAPI || oversRemainingDisplay === undefined) {
    const rawScore = data?.first_innings?.score || "0-0";
    const rawOvers = data?.first_innings?.overs || "0.0";
    
    const [runs, wickets] = rawScore.split('-').map(Number);
    const [completedOvers, balls] = rawOvers.split('.').map(Number);
    
    const oversInDecimal = completedOvers + ((balls || 0) / 6);
    const calculatedOversRemaining = Math.max(0, totalOvers - (oversInDecimal || 0));
    
    if (oversRemainingDisplay === undefined) {
      oversRemainingDisplay = calculatedOversRemaining.toFixed(1);
    }

    const currentRR = parseFloat(data?.crr || ((runs / (oversInDecimal || 1)).toFixed(2)));

    if (!hasWinProbAPI) {
      const parScore = totalOvers <= 20 ? 165 : 280; 
      const projectedAtCRR = (runs || 0) + (calculatedOversRemaining * currentRR);
      let heuristicBat = 50 + ((projectedAtCRR - parScore) * 0.5) - ((wickets || 0) * 3);
      heuristicBat = Math.max(1, Math.min(99, Math.round(heuristicBat)));
      
      batWinProb = heuristicBat;
      bowlWinProb = 100 - heuristicBat;
    }

    if (!hasProjAPI) {
      displayRates = [
        `CRR (${currentRR.toFixed(2)})`, 
        (currentRR + 2.00).toFixed(2), 
        (currentRR + 4.00).toFixed(2), 
        (currentRR + 6.00).toFixed(2)
      ];
      
      const manualRates = [currentRR, currentRR + 2.00, currentRR + 4.00, currentRR + 6.00];
      const chunkedScores = manualRates.map(rate => Math.floor((runs || 0) + (calculatedOversRemaining * rate)));
      
      displayTable = [{ overs: `${totalOvers} Overs`, scores: chunkedScores.map(String) }];
    }
  }

  const team1Name = team1API?.short_name || team1API?.name || data?.batting_team_short || "BAT";
  const team2Name = team2API?.short_name || team2API?.name || data?.bowling_team_short || "BOWL";
  
  const team1Logo = team1API?.logo;
  const team2Logo = team2API?.logo;

  // DYNAMIC GRID STYLE (Adapts automatically if API sends 3, 4, 5+ columns)
  const gridColumnsCount = displayRates.length > 0 ? displayRates.length : 4;
  const dynamicGridStyle = {
    display: 'grid',
    gridTemplateColumns: `minmax(140px, 1.2fr) repeat(${gridColumnsCount}, minmax(0, 1fr))`
  };

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
        className="w-[1400px] h-[860px] bg-gradient-to-br from-[#0d1e57] via-[#112563] to-[#0a1538] border-[4px] border-cyan-500/50 shadow-[0_35px_90px_rgba(0,0,0,0.95)] flex flex-col relative overflow-hidden rounded-2xl font-sans p-8"
      >
        <style>{`
          .text-shadow-heavy { text-shadow: 2px 2px 5px rgba(0,0,0,0.9); }
          .shine-container { position: relative; overflow: hidden; }
          .shine-container::after {
            content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transform: skewX(-25deg); animation: shine-sweep 4s infinite; pointer-events: none;
          }
          @keyframes shine-sweep { 0% { left: -100%; } 20%, 100% { left: 200%; } }
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #22d3ee; border-radius: 10px; }
        `}</style>
        
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shine_5s_infinite_linear] pointer-events-none" style={{ backgroundSize: '200% 100%' }} />

        <button 
          onClick={onClose}
          className="absolute top-5 right-5 z-40 w-[50px] h-[50px] bg-red-600 border-[3px] border-white flex items-center justify-center hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.8)] cursor-pointer rounded-xl transition-colors"
        >
          <IoCloseSharp size={36} color="white" />
        </button>

        {/* --- HEADER --- */}
        <div className="flex items-center justify-between border-b-[4px] border-cyan-400 pb-4 mb-6 pr-16 relative z-10 shine-container">
          <h2 className="text-white font-black text-4xl uppercase tracking-widest text-shadow-heavy" style={{ fontFamily: 'Oswald, sans-serif' }}>
            Probability & Projections
          </h2>
          
          <div className="flex items-center gap-3 bg-[#071124] px-5 py-2.5 rounded-xl border-[2px] border-white/20 shadow-inner">
            <span className="text-cyan-300/80 font-bold uppercase tracking-wider text-lg">
              Match:
            </span>
            <span className="text-white font-black text-xl tracking-wide">
              {totalOvers} Overs
            </span>
          </div>
        </div>

        <motion.div
          variants={containerVariant}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex flex-col w-full gap-6 flex-1 min-h-0"
        >
          {/* --- WIN PROBABILITY SECTION --- */}
          <motion.div variants={itemVariant} className="bg-[#0c1a4b]/90 border-[3px] border-white/20 p-6 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex flex-col gap-4 shrink-0">
             <div className="flex justify-between items-center mb-1">
               <h3 className="text-cyan-400 font-black text-2xl uppercase tracking-widest flex items-center gap-3 text-shadow-heavy" style={{ fontFamily: 'Oswald, sans-serif' }}>
                <span className="w-3.5 h-3.5 bg-green-500 inline-block rounded-full shadow-[0_0_15px_#22c55e]"></span>
                Live Win Predictor
              </h3>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-white font-black text-3xl uppercase" style={{ fontFamily: 'Oswald, sans-serif' }}>
                <div className="flex items-center gap-4 min-w-0">
                  {team1Logo && <img src={team1Logo} alt={team1Name} className="w-12 h-12 object-contain drop-shadow-md shrink-0" />}
                  <span className="truncate">{team1Name} <span className="text-cyan-400 whitespace-nowrap">({batWinProb}%)</span></span>
                </div>
                <div className="flex items-center gap-4 flex-row-reverse min-w-0">
                  {team2Logo && <img src={team2Logo} alt={team2Name} className="w-12 h-12 object-contain drop-shadow-md shrink-0" />}
                  <span className="truncate text-right">{team2Name} <span className="text-red-400 whitespace-nowrap">({bowlWinProb}%)</span></span>
                </div>
              </div>
              
              <div className="w-full h-10 bg-[#071124] rounded-full overflow-hidden flex shadow-inner border-[2px] border-white/20 relative">
                <motion.div 
                  initial={{ width: '50%' }}
                  animate={{ width: `${batWinProb}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 border-r-[3px] border-white shadow-[0_0_20px_#22d3ee]"
                />
                <motion.div 
                  initial={{ width: '50%' }}
                  animate={{ width: `${bowlWinProb}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-l from-red-600 to-red-400 border-l-[3px] border-white shadow-[0_0_20px_#f87171]"
                />
              </div>

              {winData?.summary && (
                <div className="text-center mt-1">
                  <span className="text-yellow-400 text-lg font-bold tracking-widest uppercase bg-[#071124] px-6 py-2 rounded-xl border-[2px] border-white/10 shadow-inner inline-block truncate max-w-full">
                    {winData.summary}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* --- PROJECTED SCORE SECTION --- */}
          <motion.div variants={itemVariant} className="bg-[#0c1a4b]/90 border-[3px] border-white/20 p-6 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex-1 flex flex-col min-h-0">
            <div className="flex items-baseline justify-between mb-4 shrink-0">
              <h3 className="text-cyan-400 font-black text-2xl uppercase tracking-widest flex items-center gap-3 text-shadow-heavy" style={{ fontFamily: 'Oswald, sans-serif' }}>
                <span className="w-3.5 h-3.5 bg-yellow-400 inline-block rounded-full shadow-[0_0_15px_#facc15]"></span>
                Projected Score
              </h3>
              <span className="text-gray-300 font-bold text-lg tracking-wider truncate">
                Based on Remaining Overs <span className="text-white">({oversRemainingDisplay})</span>
              </span>
            </div>

            {/* Projection Table Container */}
            <div className="bg-[#071124] rounded-2xl border-[2px] border-white/20 overflow-hidden shadow-inner flex-1 flex flex-col min-h-0">
              
              {/* Header Row (Dynamic Grid) */}
              <div className="border-b-[2px] border-white/20 bg-[#112563] shrink-0" style={dynamicGridStyle}>
                <div className="py-4 px-4 text-cyan-300/80 font-black text-xl uppercase tracking-widest flex items-center min-w-0 truncate">
                  Run Rate
                </div>
                {displayRates.map((rate, i) => (
                  <motion.div 
                    variants={popVariant} 
                    key={`rate-${i}`} 
                    className="py-4 px-2 text-center text-white font-black text-2xl min-w-0 truncate" 
                    style={{ fontFamily: 'Oswald, sans-serif' }}
                  >
                    {rate}
                  </motion.div>
                ))}
              </div>

              {/* Data Rows (Scrolls if too many rows, scales if standard) */}
              <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar">
                {displayTable.map((row, rowIndex) => (
                  <div key={`row-${rowIndex}`} className="border-b-[2px] border-white/10 hover:bg-[#112563] transition-colors last:border-b-0 min-h-[90px]" style={dynamicGridStyle}>
                    <div className="py-4 px-4 flex items-center text-gray-200 font-black text-xl uppercase tracking-widest min-w-0 truncate h-full">
                      {row.overs}
                    </div>
                    {row.scores.map((score, i) => (
                      <motion.div 
                        variants={popVariant} 
                        key={`score-${rowIndex}-${i}`} 
                        className="py-4 px-2 flex items-center justify-center text-yellow-400 font-black text-[38px] drop-shadow-md leading-none min-w-0 truncate h-full" 
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