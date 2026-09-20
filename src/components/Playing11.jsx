import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloseSharp } from "react-icons/io5";
import PlayerStatsModal from './PlayerStatsModal';
import api from '../api/cricketApi';

let cachedPlaying11 = null;

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  },
  exit: { 
    opacity: 0, 
    transition: { duration: 0.2 } 
  }
};

const captainVariant = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { type: "spring", stiffness: 120, damping: 15 } 
  }
};

const gridPlayerVariant = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { type: "spring", stiffness: 150, damping: 12 } 
  }
};

const Playing11 = ({ initialTeamIndex = 0, onClose }) => {
  const [activeTeamIndex, setActiveTeamIndex] = useState(initialTeamIndex);
  const [teamData, setTeamData] = useState(cachedPlaying11);
  const [isLoading, setIsLoading] = useState(!cachedPlaying11);
  
  // State for the popup stats modal
  const [selectedStatPlayer, setSelectedStatPlayer] = useState(null);

  // 1. Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedStatPlayer) {
          setSelectedStatPlayer(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, selectedStatPlayer]);

  // 2. Fetch data (with cache)
  useEffect(() => {
    if (cachedPlaying11) return;

    const fetchPlayingXI = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/get_playing_xi');
        if (response.data && response.data.success) {
          cachedPlaying11 = response.data;
          setTeamData(response.data);
          console.log("Playing XI data fetched and cached:", response.data);

        }
      } catch (error) {
        console.error("Failed to fetch playing XI:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlayingXI();
  }, []);

  const handleTeamSwitch = (index) => {
    setActiveTeamIndex(index);
    setSelectedStatPlayer(null);
  };

  // --- LOADING SCREEN ---
  if (isLoading || !teamData) {
    return (
      <div className="w-[1800px] h-[750px] flex flex-col items-center justify-center bg-gradient-to-br from-[#0d1e57] via-[#2a4db5] to-[#0d1e57] border-[4px] border-white shadow-[0_25px_60px_rgba(0,0,0,0.7)] relative rounded-2xl">
        <span className="text-white text-[40px] font-black uppercase tracking-widest animate-pulse font-sans drop-shadow-md">
           Playing 11 Data Loading...
        </span>
        <button onClick={onClose} className="absolute top-6 right-6 w-[55px] h-[55px] bg-red-600 border-[3px] border-white flex items-center justify-center hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.8)] rounded-xl transition-colors cursor-pointer">
          <IoCloseSharp size={36} color="white" />
        </button>
      </div>
    );
  }

  // --- DATA EXTRACTION ---
  const activeTeamName = teamData.teams[activeTeamIndex];
  const currentPlayers = teamData.by_team[activeTeamName] || [];
  
  const captain = currentPlayers.find(p => p.is_captain === true) || currentPlayers[0];
  const gridPlayers = currentPlayers.filter(p => p.name !== captain?.name);

  return (
    <motion.div 
      initial={{ y: 50, opacity: 0, scale: 0.98 }} 
      animate={{ y: 0, opacity: 1, scale: 1 }} 
      exit={{ y: 50, opacity: 0, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 150, damping: 20 }}
      className="relative w-[1800px] h-[750px] flex flex-col font-sans select-none items-center bg-gradient-to-br from-[#0d1e57] via-[#112563] to-[#0a1538] border-[4px] border-white shadow-[0_25px_60px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden p-6"
    >
      <style>{`
        .text-shadow-heavy { text-shadow: 2px 2px 4px rgba(0,0,0,0.8); }
        .shine-container { position: relative; overflow: hidden; }
        .shine-container::after {
          content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: skewX(-25deg); animation: shine-sweep 4s infinite; pointer-events: none;
        }
        @keyframes shine-sweep { 0% { left: -100%; } 20%, 100% { left: 200%; } }
      `}</style>
      
      {/* HEADER - Bright Royal Blue */}
      <div className="w-full h-[85px] bg-[#2a4db5] border-[3px] border-white rounded-2xl flex items-center justify-between px-8 z-20 relative overflow-hidden shadow-lg shine-container">
        <div className="flex items-center gap-6 relative z-10">
          <span className="text-white font-black text-[46px] uppercase tracking-wider text-shadow-heavy" style={{ fontFamily: 'Oswald, sans-serif' }}>
            {activeTeamName} PLAYING 11
          </span>
        </div>
        <div className="flex gap-4 items-center relative z-10">
          {[0, 1].map((index) => (
            <button 
              key={index}
              onClick={() => handleTeamSwitch(index)} 
              className={`relative px-8 py-2.5 font-black text-2xl uppercase rounded-xl border-[3px] transition-all duration-300 cursor-pointer ${
                activeTeamIndex === index 
                  ? 'bg-white text-[#0d1e57] border-white shadow-[0_0_20px_rgba(255,255,255,0.6)] scale-105' 
                  : 'bg-[#0d1e57]/80 text-white border-white/50 hover:bg-[#112563] hover:border-white'
              }`}
            >
              {teamData.teams[index]}
            </button>
          ))}
          <button onClick={onClose} className="ml-4 w-[50px] h-[50px] bg-red-600 border-[3px] border-white flex items-center justify-center hover:bg-red-500 transition-colors shadow-[0_5px_15px_rgba(0,0,0,0.5)] rounded-xl cursor-pointer">
            <IoCloseSharp size={36} color="white" />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTeamIndex}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full h-[600px] flex gap-5 mt-5"
        >
          
          {/* LEFT SIDE: FIXED CAPTAIN BOX - Vibrant & Prominent */}
          {captain && (
            <motion.div 
              variants={captainVariant}
              whileHover={{ scale: 1.01 }} 
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedStatPlayer(captain)}
              className="w-[420px] h-full flex flex-col border-[4px] border-white rounded-2xl cursor-pointer shadow-2xl bg-[#0d1e57] overflow-hidden relative group"
            >
              <div className="h-[45px] bg-red-600 flex items-center justify-center border-b-[3px] border-white shadow-md z-10">
                <span className="font-black text-white text-[28px] tracking-widest uppercase text-shadow-heavy" style={{ fontFamily: 'Oswald, sans-serif' }}>
                  CAPTAIN
                </span>
              </div>
              
              <div className="relative flex-1 overflow-hidden bg-gradient-to-b from-[#3b5bdb] to-[#112563] flex items-end justify-center">
                <div className="absolute w-[220px] h-[220px] bg-white/10 rounded-full blur-3xl bottom-12"></div>
                {captain.jersey_image && (
                  <img 
                    src={captain.jersey_image} 
                    alt="Card Background" 
                    className="absolute h-[240px] bottom-0 w-full z-10 object-contain opacity-40 pointer-events-none" 
                  />
                )}
                {captain.profile_image && (
                  <motion.img 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    src={captain.profile_image} 
                    alt={captain.name} 
                    className="absolute h-[420px] w-full object-cover object-top z-20 group-hover:scale-105 transition-transform drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]" 
                  />
                )}
              </div>

              <div className="flex flex-col border-t-[4px] border-white z-20">
                <div className="bg-white py-3 px-3 flex flex-col items-center justify-center border-b-[2px] border-gray-300">
                  <span className="text-[#0a192f] font-black text-[32px] leading-tight uppercase tracking-wide text-center truncate w-full" style={{ fontFamily: 'Oswald, sans-serif' }}>
                    {captain.name}
                    {captain.is_wicket_keeper && <span className="text-[#ea580c] text-[20px] ml-2 font-bold">(WK)</span>}
                  </span>
                </div>
                <div className="bg-[#ea580c] py-2.5 flex items-center justify-center">
                  <span className="text-white font-black text-[24px] leading-none uppercase tracking-wider text-shadow-heavy" style={{ fontFamily: 'Oswald, sans-serif' }}>
                    {captain.role}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* RIGHT SIDE: GRID OF 10 */}
          <div className="flex-1 grid grid-cols-5 grid-rows-2 gap-4 h-full">
            {gridPlayers.slice(0, 10).map((player, idx) => (
              <motion.div 
                variants={gridPlayerVariant}
                key={idx}
                whileHover={{ scale: 1.03, borderColor: '#22d3ee' }} 
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedStatPlayer(player)}
                className="flex flex-col bg-[#0d1e57] border-[3px] border-white/80 rounded-xl cursor-pointer shadow-xl overflow-hidden relative group"
              >
                <div className="relative flex-1 overflow-hidden bg-gradient-to-b from-[#2a4db5] to-[#112563] flex items-end justify-center">
                  <div className="absolute w-[120px] h-[120px] bg-white/10 rounded-full blur-2xl bottom-6"></div>
                  {player.jersey_image && (
                    <img 
                      src={player.jersey_image} 
                      alt="Card Background" 
                      className="absolute bottom-0 w-full z-10 object-contain opacity-30 pointer-events-none" 
                    />
                  )}
                  {player.profile_image && (
                    <motion.img 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + (idx * 0.05), duration: 0.4 }}
                      src={player.profile_image} 
                      alt={player.name} 
                      className="absolute h-[190px] w-full object-cover object-top z-20 group-hover:scale-105 transition-transform drop-shadow-[0_8px_10px_rgba(0,0,0,0.6)]" 
                    />
                  )}
                </div>

                <div className="flex flex-col border-t-[3px] border-white/80 h-[72px] z-20">
                  <div className="bg-white flex-1 flex flex-col items-center justify-center px-1 border-b-[2px] border-gray-300">
                    <span className="text-[#0a192f] font-black text-[22px] leading-[1.1] uppercase text-center truncate w-full" style={{ fontFamily: 'Oswald, sans-serif' }}>
                      {player.name}
                      {player.is_wicket_keeper && <span className="text-[#ea580c] text-[14px] ml-1">(WK)</span>}
                      {player.is_vice_captain && <span className="text-[#3b5bdb] text-[14px] ml-1">(VC)</span>}
                    </span>
                  </div>
                  <div className="bg-[#0d1e57] h-[28px] flex items-center justify-center">
                    <span className="text-cyan-300 font-bold text-[15px] uppercase tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>{player.role || "PLAYER"}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </motion.div>
      </AnimatePresence>

      {/* --- POPUP STATS OVERLAY --- */}
      <AnimatePresence>
        {selectedStatPlayer && (
          <PlayerStatsModal 
            player={selectedStatPlayer} 
            onClose={() => setSelectedStatPlayer(null)} 
          />
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default Playing11;