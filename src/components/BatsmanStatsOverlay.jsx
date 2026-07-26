import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloseSharp } from "react-icons/io5";
import api from '../api/cricketApi';

// --- Animation Variants ---
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  },
  exit: { 
    opacity: 0, 
    transition: { duration: 0.15 } 
  }
};

const popIn = {
  hidden: { opacity: 0, scale: 0.8, y: 15 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 180, damping: 14 } 
  }
};

const BatsmanStatsOverlay = ({ player, onClose }) => {


  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeFormat, setActiveFormat] = useState('ODI');

  const profileUrl = player?.profile_url || player?.["Profile URL"] || "";

  // --- 1. Close on ESC key press ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // --- 2. API Data Fetching Logic ---
  useEffect(() => {
    if (!profileUrl) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await api.get('/get_player_stats', {
          params: { profile_url: profileUrl }
        });
        
        if (response.data && !response.data.error) {
          setStats(response.data);

          if (response.data.batting && response.data.batting.length > 0) {
            const formats = response.data.batting.map(b => b.format);
            if (!formats.includes('ODI') && formats.length > 0) {
              setActiveFormat(formats[0]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching player stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [profileUrl]);

  const currentBatting = stats?.batting?.find(b => b.format === activeFormat) || {};
  const currentBowling = stats?.bowling?.find(b => b.format === activeFormat) || {};

  return (
    // Backdrop: Clicking outside or pressing ESC closes it
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center select-none font-sans text-white"
    >
      {/* Modal Container: 1500x780 Supersized Canvas */}
      <motion.div 
        initial={{ scale: 0.8, y: 50, opacity: 0 }} 
        animate={{ scale: 1, y: 0, opacity: 1 }} 
        exit={{ scale: 0.8, y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()} // Prevent outside click trigger from inside
        className="relative w-[1500px] h-[780px]  border-[4px] border-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex overflow-hidden box-border"
      >
        <style>{`
          .text-shadow-heavy { text-shadow: 3px 3px 6px rgba(0,0,0,0.9); }
        `}</style>
        
        {/* Absolute Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-40 w-[60px] h-[60px] bg-red-600 border-[3px] border-white flex items-center justify-center hover:bg-red-500 shadow-2xl cursor-pointer rounded-xl transition-colors"
        >
          <IoCloseSharp size={38} color="white" />
        </button>

        {/* --- LEFT SIDE: Big Player Card & Red Image Container --- */}
        <div className="w-[42%] h-full p-8 flex flex-col justify-between">
          <div className="w-full h-full bg-gradient-to-b from-[#f56505] to-[#684009] border-[8px] border-[#0026ff] rounded-[16px] relative flex justify-center items-end overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.6)]">
            
            {/* Jersey / Background Layer */}
            {player?.jersey && (
              <img src={player.jersey} alt="Jersey" className="absolute h-[240px] bottom-0 w-full z-20 object-cover object-bottom" />
            )}
            
            {/* Player Head / Photo Layer */}
            {player?.img  ? (
              <motion.img 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                src={player.profile_image || player.img} 
                alt={player?.name} 
                className="absolute h-[82%] w-full object-cover top-10 z-10 drop-shadow-[15px_15px_20px_rgba(0,0,0,0.7)]" 
              />
            ) : (
              <img 
                src="https://img.magnific.com/free-vector/cricket-player-silhouette-style_78370-9573.jpg" 
                alt="Fallback" 
                className="absolute h-[92%] w-full object-cover object-bottom z-20 drop-shadow-[15px_15px_20px_rgba(0,0,0,0.7)]" 
              />
            )}
          </div>
        </div>

        {/* --- RIGHT SIDE: Statistics & Format Tabs --- */}
        <div className="w-[58%] h-full flex flex-col justify-start pr-12 pl-4 py-8 overflow-y-auto">
          
          {/* Header Name & Format Selectors */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b-[3px] border-[#333] pb-4 mb-4 gap-4 pr-12">
            <div>
              <h1 className="text-[60px] font-black italic tracking-wider leading-none text-shadow-heavy uppercase">
                {player?.name || "JOSH TONGUE"}
              </h1>
              <h2 className="text-[34px] font-bold italic tracking-wide mt-1 text-gray-300 uppercase">
                {player?.role } {stats?.age ? `• AGE: ${stats.age} YEARS` : ""}
              </h2>
            </div>

            {/* Format Tabs (Test, ODI, T20, etc.) */}
            {stats?.batting && (
              <div className="flex gap-2 flex-wrap">
                {stats.batting.map((b) => (
                  <button
                    key={b.format}
                    onClick={() => setActiveFormat(b.format)}
                    className={`relative px-4 py-1.5 font-black text-lg uppercase rounded-lg border-2 transition-colors cursor-pointer overflow-hidden ${
                      activeFormat === b.format 
                        ? 'text-black border-white shadow-[0_0_15px_rgba(212,175,55,0.7)]' 
                        : 'bg-[#13233f] text-white border-gray-600 hover:border-gray-300'
                    }`}
                    style={{ fontFamily: 'Oswald, sans-serif' }}
                  >
                    {activeFormat === b.format && (
                      <motion.div 
                        layoutId="activeFormatTab" 
                        className="absolute inset-0 bg-[#d4af37]" 
                        style={{ zIndex: 0 }}
                      />
                    )}
                    <span className="relative z-10">{b.format}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-[400px] flex items-center justify-center"
              >
                <span className="text-[#d4af37] text-3xl font-black animate-pulse uppercase tracking-widest">Loading Statistics...</span>
              </motion.div>
            ) : stats ? (
              <motion.div 
                key={activeFormat}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                
                {/* Batting Stats Grid */}
                <div>
                  <h3 className="text-[#d4af37] text-xl font-black italic uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#d4af37] inline-block rounded-full shadow-[0_0_8px_#d4af37]"></span>
                    Batting Statistics ({activeFormat})
                  </h3>
                  
                  <div className="flex flex-col">
                    <div className="flex items-baseline py-[10px] border-b-[2px] border-[#333]">
                      <span className="text-[32px] font-bold italic tracking-wide uppercase">Matches: </span>
                      <span className="text-[36px] font-black italic ml-3 text-[#ffcc00]">{currentBatting.matches ?? player?.matches ?? "-"}</span>
                    </div>

                    <div className="flex items-baseline py-[10px] border-b-[2px] border-[#333]">
                      <span className="text-[32px] font-bold italic tracking-wide uppercase">Runs: </span>
                      <span className="text-[36px] font-black italic ml-3 text-[#ffcc00]">{currentBatting.runs ?? player?.runs ?? "-"}</span>
                    </div>

                    <div className="flex items-center border-b-[2px] border-[#333]">
                      <div className="flex-1 flex items-baseline py-[10px] border-r-[2px] border-[#333]">
                        <span className="text-[32px] font-bold italic tracking-wide uppercase">Avg: </span>
                        <span className="text-[36px] font-black italic ml-3 text-[#ffcc00]">{currentBatting.average ?? player?.avg ?? "-"}</span>
                      </div>
                      <div className="flex-1 flex items-baseline py-[10px] pl-6">
                        <span className="text-[32px] font-bold italic tracking-wide uppercase">SR: </span>
                        <span className="text-[36px] font-black italic ml-3 text-[#ffcc00]">{currentBatting.strike_rate ?? player?.sr ?? "-"}</span>
                      </div>
                    </div>

                    <div className="flex items-center border-b-[2px] border-[#333]">
                      <div className="flex-1 flex items-baseline py-[10px] border-r-[2px] border-[#333]">
                        <span className="text-[32px] font-bold italic tracking-wide uppercase">50s: </span>
                        <span className="text-[36px] font-black italic ml-3 text-[#ffcc00]">{currentBatting.fifties ?? player?.fifties ?? 0}</span>
                      </div>
                      <div className="flex-1 flex items-baseline py-[10px] pl-6">
                        <span className="text-[32px] font-bold italic tracking-wide uppercase">100s: </span>
                        <span className="text-[36px] font-black italic ml-3 text-[#ffcc00]">{currentBatting.hundreds ?? player?.hundreds ?? 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center border-b-[2px] border-[#333]">
                      <div className="flex-1 flex items-baseline py-[10px] border-r-[2px] border-[#333]">
                        <span className="text-[32px] font-bold italic tracking-wide uppercase">High Score: </span>
                        <span className="text-[36px] font-black italic ml-3 text-[#ffcc00]">{currentBatting.high_score ?? player?.highScore ?? "-"}</span>
                      </div>
                      <div className="flex-1 flex items-baseline py-[10px] pl-6">
                        <span className="text-[32px] font-bold italic tracking-wide uppercase">6s: </span>
                        <span className="text-[36px] font-black italic ml-3 text-[#ffcc00]">{currentBatting.sixes ?? player?.sixes ?? 0}</span>
                      </div>
                    </div>

                    <div className="flex items-baseline py-[10px] border-b-[2px] border-[#333]">
                      <span className="text-[32px] font-bold italic tracking-wide uppercase">Balls per boundary: </span>
                      <span className="text-[36px] font-black italic ml-3 text-[#ffcc00]">{currentBatting.balls_per_boundary ?? player?.ballsPerBoundary ?? "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Bowling Stats Section (If applicable) */}
                {currentBowling.matches > 0 && currentBowling.innings > 0 && (
                  <div className="pt-2">
                    <h3 className="text-[#d4af37] text-xl font-black italic uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#d4af37] inline-block rounded-full shadow-[0_0_8px_#d4af37]"></span>
                      Bowling ({activeFormat})
                    </h3>
                    <div className="flex items-center border-b-[2px] border-[#333]">
                      <div className="flex-1 flex items-baseline py-[10px] border-r-[2px] border-[#333]">
                        <span className="text-[32px] font-bold italic tracking-wide uppercase">Wickets: </span>
                        <span className="text-[36px] font-black italic ml-3 text-red-400">{currentBowling.wickets ?? "0"}</span>
                      </div>
                      <div className="flex-1 flex items-baseline py-[10px] pl-6">
                        <span className="text-[32px] font-bold italic tracking-wide uppercase">Econ: </span>
                        <span className="text-[36px] font-black italic ml-3 text-[#ffcc00]">{currentBowling.econ ?? "-"}</span>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            ) : (
              <motion.div 
                key="fallback"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                {/* Fallback Display if API call hasn't returned detailed data yet, rendering props */}
                <div>
                  <h3 className="text-[#d4af37] text-xl font-black italic uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#d4af37] inline-block rounded-full shadow-[0_0_8px_#d4af37]"></span>
                    Player Career Overview
                  </h3>
                  
                  <div className="flex flex-col">
                    <div className="flex items-baseline py-[10px] border-b-[2px] border-[#333]">
                      <span className="text-[32px] font-bold italic tracking-wide uppercase">Matches: </span>
                      <span className="text-[36px] font-black italic ml-3 text-[#ffcc00]">{player?.matches ?? 0}</span>
                    </div>

                    <div className="flex items-baseline py-[10px] border-b-[2px] border-[#333]">
                      <span className="text-[32px] font-bold italic tracking-wide uppercase">Runs: </span>
                      <span className="text-[36px] font-black italic ml-3 text-[#ffcc00]">{player?.runs ?? 0}</span>
                    </div>

                    <div className="flex items-center border-b-[2px] border-[#333]">
                      <div className="flex-1 flex items-baseline py-[10px] border-r-[2px] border-[#333]">
                        <span className="text-[32px] font-bold italic tracking-wide uppercase">Avg: </span>
                        <span className="text-[36px] font-black italic ml-3 text-[#ffcc00]">{player?.avg ?? 0}</span>
                      </div>
                      <div className="flex-1 flex items-baseline py-[10px] pl-6">
                        <span className="text-[32px] font-bold italic tracking-wide uppercase">SR: </span>
                        <span className="text-[36px] font-black italic ml-3 text-[#ffcc00]">{player?.sr ?? 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center border-b-[2px] border-[#333]">
                      <div className="flex-1 flex items-baseline py-[10px] border-r-[2px] border-[#333]">
                        <span className="text-[32px] font-bold italic tracking-wide uppercase">50s: </span>
                        <span className="text-[36px] font-black italic ml-3 text-[#ffcc00]">{player?.fifties ?? 0}</span>
                      </div>
                      <div className="flex-1 flex items-baseline py-[10px] pl-6">
                        <span className="text-[32px] font-bold italic tracking-wide uppercase">100s: </span>
                        <span className="text-[36px] font-black italic ml-3 text-[#ffcc00]">{player?.hundreds ?? 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center border-b-[2px] border-[#333]">
                      <div className="flex-1 flex items-baseline py-[10px] border-r-[2px] border-[#333]">
                        <span className="text-[32px] font-bold italic tracking-wide uppercase">High Score: </span>
                        <span className="text-[36px] font-black italic ml-3 text-[#ffcc00]">{player?.highScore ?? 0}</span>
                      </div>
                      <div className="flex-1 flex items-baseline py-[10px] pl-6">
                        <span className="text-[32px] font-bold italic tracking-wide uppercase">6s: </span>
                        <span className="text-[36px] font-black italic ml-3 text-[#ffcc00]">{player?.sixes ?? 0}</span>
                      </div>
                    </div>

                    <div className="flex items-baseline py-[10px] border-b-[2px] border-[#333]">
                      <span className="text-[32px] font-bold italic tracking-wide uppercase">Balls per boundary: </span>
                      <span className="text-[36px] font-black italic ml-3 text-[#ffcc00]">{player?.ballsPerBoundary ?? 0}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </motion.div>
  );
};

export default BatsmanStatsOverlay;