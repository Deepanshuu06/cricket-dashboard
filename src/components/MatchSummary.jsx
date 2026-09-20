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
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 150, damping: 20 } }
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
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const response = await api.get('/get_match_summary');
        if (response.data) {
          cachedMatchSummary = response.data;
          setSummaryData(response.data);
        }
      } catch (error) {
        console.error("Error fetching match summary:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!cachedMatchSummary) {
      fetchSummary();
    } else {
      setLoading(false);
    }
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
      className="absolute inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center select-none"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 40, opacity: 0 }} 
        animate={{ scale: 1, y: 0, opacity: 1 }} 
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        onClick={(e) => e.stopPropagation()} 
        className="w-[1600px] h-[900px] bg-gradient-to-br from-[#0d1e57] via-[#112563] to-[#0a1538] border-[3px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col relative overflow-hidden rounded-xl font-sans text-white"
      >
        {/* Visual Broadcast Effects */}
        <style>{`
          .text-shadow-heavy { text-shadow: 2px 2px 5px rgba(0,0,0,0.9); }
          .shine-container { position: relative; overflow: hidden; }
          .shine-container::after {
            content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transform: skewX(-25deg); animation: shine-sweep 3s infinite; pointer-events: none;
          }
          @keyframes shine-sweep { 0% { left: -100%; } 20%, 100% { left: 200%; } }
        `}</style>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-[22px] right-6 z-40 w-[50px] h-[50px] bg-red-600 border-[2px] border-white flex items-center justify-center hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.8)] cursor-pointer rounded-lg transition-colors"
        >
          <IoCloseSharp size={36} color="white" />
        </button>

        {/* --- TOP HEADER & INNINGS TABS --- */}
        <div className="absolute top-0 left-0 w-full h-[100px] bg-[#2a4db5] border-b-[3px] border-white flex items-center justify-between px-12 pr-[100px] shadow-lg shine-container z-20">
          
          <h2 className="text-[42px] font-black uppercase tracking-widest text-shadow-heavy">
            Match Summary
          </h2>

          {/* Innings Switcher Tabs */}
          {inningsList.length > 0 && (
            <div className="flex gap-6 relative z-10">
              {inningsList.map((inn, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveInningsIndex(idx)}
                  className={`relative px-8 py-2 font-black text-[22px] uppercase tracking-wider rounded-md border-[2px] transition-all cursor-pointer overflow-hidden ${
                    activeInningsIndex === idx 
                      ? 'bg-cyan-400 text-[#0a1538] border-white shadow-[0_0_20px_#22d3ee] scale-105' 
                      : 'bg-transparent text-white border-white/40 hover:border-white'
                  }`}
                >
                  <span className="relative z-10">{inn.team ? `${inn.team} Innings` : `Innings ${idx + 1}`}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- MAIN SCORECARD CONTENT --- */}
        <div className="flex-1 mt-[100px] p-10 overflow-y-auto flex flex-col gap-8 custom-scrollbar">
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-cyan-400 text-5xl font-black animate-pulse uppercase tracking-widest text-shadow-heavy">
                Loading Data...
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
                className="flex flex-col gap-12"
              >
                {/* ================= BATTING SCORECARD ================= */}
                <div>
                  <motion.h3 variants={rowVariant} className="text-white text-[32px] font-black uppercase tracking-widest mb-4 flex items-center gap-4 text-shadow-heavy">
                    <span className="w-6 h-6 bg-cyan-400 inline-block shadow-[0_0_12px_#22d3ee]"></span>
                    Batting Scorecard
                  </motion.h3>

                  {/* Table Header */}
                  <motion.div variants={rowVariant} className="grid grid-cols-12 bg-black/40 text-cyan-300 py-3 px-6 border-y-[3px] border-white font-black text-[20px] tracking-wider uppercase shadow-md">
                    <div className="col-span-4">Batter</div>
                    <div className="col-span-3">Dismissal</div>
                    <div className="col-span-1 text-center text-white">R</div>
                    <div className="col-span-1 text-center">B</div>
                    <div className="col-span-1 text-center">4s</div>
                    <div className="col-span-1 text-center">6s</div>
                    <div className="col-span-1 text-center">S/R</div>
                  </motion.div>

                  {/* Batter Rows */}
                  <div className="divide-y divide-white/10 border-b-[3px] border-white/20">
                    {battingList.length > 0 ? (
                      battingList.map((batter, idx) => (
                        <motion.div 
                          variants={rowVariant}
                          key={idx} 
                          className={`grid grid-cols-12 py-3 px-6 items-center transition-colors ${
                            idx % 2 === 0 ? 'bg-[#112563]/50' : 'bg-transparent'
                          } hover:bg-white/10`}
                        >
                          <div className="col-span-4 text-yellow-400 text-[26px] font-black uppercase tracking-wide truncate pr-2 text-shadow-heavy">
                            {batter.name}
                          </div>
                          <div className="col-span-3 text-gray-300 text-[18px] font-bold truncate pr-2 tracking-wide">
                            {batter.dismissal}
                          </div>
                          <div className="col-span-1 text-center text-white font-black text-[42px] leading-none text-shadow-heavy">
                            {batter.runs}
                          </div>
                          <div className="col-span-1 text-center text-gray-200 text-[24px] font-bold">{batter.balls}</div>
                          <div className="col-span-1 text-center text-cyan-400 text-[24px] font-black">{batter.fours}</div>
                          <div className="col-span-1 text-center text-cyan-400 text-[24px] font-black">{batter.sixes}</div>
                          <div className="col-span-1 text-center text-gray-300 text-[20px] font-bold">{batter.sr}</div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-gray-400 font-bold text-2xl">No batting data available</div>
                    )}
                  </div>
                </div>

                {/* ================= BOWLING SCORECARD ================= */}
                {bowlingList.length > 0 && (
                  <div>
                    <motion.h3 variants={rowVariant} className="text-white text-[32px] font-black uppercase tracking-widest mb-4 flex items-center gap-4 text-shadow-heavy">
                      <span className="w-6 h-6 bg-red-500 inline-block shadow-[0_0_12px_#ef4444]"></span>
                      Bowling Stats
                    </motion.h3>

                    {/* Bowling Table Header */}
                    <motion.div variants={rowVariant} className="grid grid-cols-12 bg-black/40 text-red-400 py-3 px-6 border-y-[3px] border-white font-black text-[20px] tracking-wider uppercase shadow-md">
                      <div className="col-span-4">Bowler</div>
                      <div className="col-span-2 text-center">Overs</div>
                      <div className="col-span-2 text-center">Maidens</div>
                      <div className="col-span-2 text-center">Runs</div>
                      <div className="col-span-1 text-center text-white">Wkts</div>
                      <div className="col-span-1 text-center">Econ</div>
                    </motion.div>

                    {/* Bowler Rows */}
                    <div className="divide-y divide-white/10 border-b-[3px] border-white/20">
                      {bowlingList.map((bowler, idx) => (
                        <motion.div 
                          variants={rowVariant}
                          key={idx} 
                          className={`grid grid-cols-12 py-3 px-6 items-center transition-colors ${
                            idx % 2 === 0 ? 'bg-[#112563]/50' : 'bg-transparent'
                          } hover:bg-white/10`}
                        >
                          <div className="col-span-4 text-yellow-400 text-[26px] font-black uppercase tracking-wide truncate pr-2 text-shadow-heavy">
                            {bowler.name}
                          </div>
                          <div className="col-span-2 text-center text-gray-200 text-[24px] font-bold">{bowler.overs || "-"}</div>
                          <div className="col-span-2 text-center text-gray-200 text-[24px] font-bold">{bowler.maidens || "0"}</div>
                          <div className="col-span-2 text-center text-gray-200 text-[24px] font-bold">{bowler.runs || "0"}</div>
                          <div className="col-span-1 text-center text-red-500 font-black text-[42px] leading-none text-shadow-heavy">
                            {bowler.wickets || "0"}
                          </div>
                          <div className="col-span-1 text-center text-gray-300 text-[20px] font-bold">{bowler.econ || "-"}</div>
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