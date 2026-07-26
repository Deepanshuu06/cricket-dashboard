import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloseSharp } from "react-icons/io5";
import api from '../api/cricketApi'; // ⚠️ Ensure this points to your Axios instance

let cachedMatchSummary = null;

// Animation Variants for staggering table rows
const tableContainerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

const rowVariant = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 120, damping: 15 } }
};

const MatchSummary = ({ onClose }) => {
  const [summaryData, setSummaryData] = useState(cachedMatchSummary);
  const [loading, setLoading] = useState(!cachedMatchSummary);
  const [activeInningsIndex, setActiveInningsIndex] = useState(0);

  // 1. ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 2. Fetch data (with global cache)
  useEffect(() => {
    // if (cachedMatchSummary) return;

    const fetchSummary = async () => {
      setLoading(true);
      try {
        const response = await api.get('/get_match_summary');
        if (response.data) {
          // cachedMatchSummary = response.data;
          setSummaryData(response.data);

        }
      } catch (error) {
        console.error("Error fetching match summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  // Safe extraction of current innings data
  const inningsList = summaryData?.innings || [];
  const currentInnings = inningsList[activeInningsIndex] || {};
  const battingList = currentInnings.batting || [];
  const bowlingList = currentInnings.bowling || [];

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
        className="w-[1450px] h-[820px] bg-[#071124] border-[6px] border-[#d4af37] shadow-[0_35px_90px_rgba(0,0,0,0.95)] flex flex-col relative overflow-hidden rounded-xl font-sans"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-40 w-[55px] h-[55px] bg-red-600 border-[3px] border-white flex items-center justify-center hover:bg-red-500 shadow-2xl cursor-pointer rounded-lg transition-colors"
        >
          <IoCloseSharp size={42} color="white" />
        </button>

        {/* --- TOP HEADER & INNINGS TABS --- */}
        <div className="h-[95px] bg-gradient-to-r from-[#0d1b33] via-[#1a2b50] to-[#0d1b33] border-b-[5px] border-[#d4af37] flex items-center justify-between px-8 pr-24 relative overflow-hidden">
          
          {/* Subtle Shine Effect for Header */}
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shine_4s_infinite_linear]" style={{ backgroundSize: '200% 100%' }} />
          <style>{`
            @keyframes shine {
              0% { transform: translateX(-100%) skewX(-15deg); }
              100% { transform: translateX(200%) skewX(-15deg); }
            }
          `}</style>

          <h2 className="text-white font-black text-5xl uppercase tracking-wider relative z-10" style={{ fontFamily: 'Oswald, sans-serif' }}>
            MATCH SUMMARY
          </h2>

          {/* Innings / Team Switcher Tabs */}
          {inningsList.length > 0 && (
            <div className="flex gap-4 relative z-10">
              {inningsList.map((inn, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveInningsIndex(idx)}
                  className={`relative px-8 py-3 font-black text-2xl uppercase rounded-lg border-2 transition-all cursor-pointer overflow-hidden ${
                    activeInningsIndex === idx 
                      ? 'bg-[#d4af37] text-black border-white shadow-[0_0_20px_rgba(212,175,55,0.7)] scale-105' 
                      : 'bg-[#13233f] text-white border-gray-600 hover:border-gray-300'
                  }`}
                  style={{ fontFamily: 'Oswald, sans-serif' }}
                >
                  {activeInningsIndex === idx && (
                    <motion.div layoutId="activeTabSummary" className="absolute inset-0 bg-white/20 pointer-events-none" />
                  )}
                  <span className="relative z-10">{inn.team ? `${inn.team} INNINGS` : `INNINGS ${idx + 1}`}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- MAIN SCORECARD CONTENT --- */}
        <div className="flex-1 p-8 overflow-y-auto bg-[#0a1628] flex flex-col gap-10">
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-[#d4af37] text-5xl font-black animate-pulse uppercase tracking-widest" style={{ fontFamily: 'Oswald, sans-serif' }}>
                Loading Match Summary...
              </span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeInningsIndex}
                variants={tableContainerVariant}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col gap-10"
              >
                {/* BATTING SCORECARD */}
                <div>
                  <motion.h3 
                    variants={rowVariant}
                    className="text-[#d4af37] text-3xl font-black uppercase tracking-widest mb-4 flex items-center gap-3" 
                    style={{ fontFamily: 'Oswald, sans-serif' }}
                  >
                    <span className="w-4 h-4 bg-[#d4af37] inline-block rounded-full shadow-[0_0_10px_#d4af37]"></span>
                    Batting Scorecard ({currentInnings.team || "Team"})
                  </motion.h3>

                  {/* Table Header */}
                  <motion.div variants={rowVariant} className="grid grid-cols-12 bg-[#0d1b33] text-gray-300 py-4 px-6 border-b-[4px] border-[#d4af37] font-black text-xl tracking-wider uppercase" style={{ fontFamily: 'Oswald, sans-serif' }}>
                    <div className="col-span-4">Batter</div>
                    <div className="col-span-3">Dismissal</div>
                    <div className="col-span-1 text-center text-white">R</div>
                    <div className="col-span-1 text-center">B</div>
                    <div className="col-span-1 text-center">4s</div>
                    <div className="col-span-1 text-center">6s</div>
                    <div className="col-span-1 text-center">S/R</div>
                  </motion.div>

                  {/* Batter Rows */}
                  <div className="divide-y divide-gray-800 border-b border-gray-800">
                    {battingList.length > 0 ? (
                      battingList.map((batter, idx) => (
                        <motion.div 
                          variants={rowVariant}
                          key={idx} 
                          className={`grid grid-cols-12 py-4 px-6 items-center transition-colors ${
                            idx % 2 === 0 ? 'bg-[#112240]/80' : 'bg-[#0d182e]/80'
                          } hover:bg-[#1b325c]`}
                        >
                          <div className="col-span-4 text-yellow-300 text-2xl font-extrabold uppercase tracking-wide truncate pr-2" style={{ fontFamily: 'Oswald, sans-serif' }}>
                            {batter.name}
                          </div>
                          <div className="col-span-3 text-gray-400 text-lg font-bold truncate pr-2 tracking-wide leading-tight">
                            {batter.dismissal}
                          </div>
                          <div className="col-span-1 text-center text-white font-black text-4xl drop-shadow-md" style={{ fontFamily: 'Oswald, sans-serif' }}>
                            {batter.runs}
                          </div>
                          <div className="col-span-1 text-center text-gray-300 text-2xl font-bold">{batter.balls}</div>
                          <div className="col-span-1 text-center text-blue-400 text-2xl font-bold">{batter.fours}</div>
                          <div className="col-span-1 text-center text-green-400 text-2xl font-bold">{batter.sixes}</div>
                          <div className="col-span-1 text-center text-gray-400 text-xl font-bold">{batter.sr}</div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-gray-400 font-bold text-2xl">No batting data available</div>
                    )}
                  </div>
                </div>

                {/* BOWLING SCORECARD (If bowling array contains data) */}
                {bowlingList.length > 0 && (
                  <div>
                    <motion.h3 
                      variants={rowVariant}
                      className="text-[#d4af37] text-3xl font-black uppercase tracking-widest mb-4 flex items-center gap-3" 
                      style={{ fontFamily: 'Oswald, sans-serif' }}
                    >
                      <span className="w-4 h-4 bg-[#d4af37] inline-block rounded-full shadow-[0_0_10px_#d4af37]"></span>
                      Bowling Stats
                    </motion.h3>

                    {/* Bowling Table Header */}
                    <motion.div variants={rowVariant} className="grid grid-cols-12 bg-[#0d1b33] text-gray-300 py-4 px-6 border-b-[4px] border-[#d4af37] font-black text-xl tracking-wider uppercase" style={{ fontFamily: 'Oswald, sans-serif' }}>
                      <div className="col-span-4">Bowler</div>
                      <div className="col-span-2 text-center">Overs</div>
                      <div className="col-span-2 text-center">Maidens</div>
                      <div className="col-span-2 text-center">Runs</div>
                      <div className="col-span-1 text-center text-red-400">Wkts</div>
                      <div className="col-span-1 text-center">Econ</div>
                    </motion.div>

                    {/* Bowler Rows */}
                    <div className="divide-y divide-gray-800 border-b border-gray-800">
                      {bowlingList.map((bowler, idx) => (
                        <motion.div 
                          variants={rowVariant}
                          key={idx} 
                          className={`grid grid-cols-12 py-4 px-6 items-center transition-colors ${
                            idx % 2 === 0 ? 'bg-[#112240]/80' : 'bg-[#0d182e]/80'
                          } hover:bg-[#1b325c]`}
                        >
                          <div className="col-span-4 text-yellow-300 text-2xl font-extrabold uppercase tracking-wide truncate pr-2" style={{ fontFamily: 'Oswald, sans-serif' }}>
                            {bowler.name}
                          </div>
                          <div className="col-span-2 text-center text-gray-300 text-2xl font-bold">{bowler.overs || "-"}</div>
                          <div className="col-span-2 text-center text-gray-300 text-2xl font-bold">{bowler.maidens || "0"}</div>
                          <div className="col-span-2 text-center text-gray-300 text-2xl font-bold">{bowler.runs || "0"}</div>
                          <div className="col-span-1 text-center text-red-500 font-black text-4xl drop-shadow-md" style={{ fontFamily: 'Oswald, sans-serif' }}>
                            {bowler.wickets || "0"}
                          </div>
                          <div className="col-span-1 text-center text-gray-400 text-xl font-bold">{bowler.econ || "-"}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MatchSummary;