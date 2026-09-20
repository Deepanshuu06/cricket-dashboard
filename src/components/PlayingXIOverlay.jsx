// PlayingXIOverlay

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloseSharp } from "react-icons/io5";

export default function PlayingXIOverlay({ initialTeam = 0, onClose }) {
  const [xiData, setXiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTeam); // 0 for Team 1, 1 for Team 2

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);

    const fetchPlayingXI = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://127.0.0.1:5015/get_playing_xi');
        const json = await res.json();
        if (json.success) setXiData(json);
      } catch (err) {
        console.error("Error fetching playing XI:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayingXI();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const teams = xiData?.teams || [];
  const team1Name = teams[0] || "Team 1";
  const team2Name = teams[1] || "Team 2";
  
  const currentTeamName = teams[activeTab] || team1Name;
  const squadList = xiData?.by_team?.[currentTeamName] || [];

  // --- Smooth Animation Variants ---
  const overlayVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    },
    exit: { opacity: 0, y: 30, transition: { duration: 0.3 } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.02, delayChildren: 0.05 }
    },
    exit: { opacity: 0, transition: { duration: 0.15 } }
  };

  const cardItem = {
    hidden: { opacity: 0, scale: 0.92, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
  };

  return (
    <motion.div 
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute bottom-[70px] left-0 w-full h-[380px] border-y-[3px] border-white shadow-[0_15px_40px_rgba(0,0,0,0.9)] z-40 overflow-hidden font-sans text-white bg-gradient-to-r from-[#0d1e57] via-[#2a4db5] to-[#0d1e57]"
    >
      <style>{`
        .text-shadow-heavy { text-shadow: 2px 2px 4px rgba(0,0,0,0.8); }
        .text-shadow-light { text-shadow: 1px 1px 3px rgba(0,0,0,0.6); }
        .shine-container { position: relative; overflow: hidden; }
        .shine-container::after {
          content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: skewX(-25deg); animation: shine-sweep 3s infinite; pointer-events: none;
        }
        @keyframes shine-sweep { 0% { left: -100%; } 20%, 100% { left: 200%; } }
      `}</style>

      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-3 right-6 z-50 w-[38px] h-[38px] bg-red-600 border-[2px] border-white flex items-center justify-center hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.8)] rounded-lg cursor-pointer transition-colors"
      >
        <IoCloseSharp size={24} color="white" />
      </button>

      {/* TOP BANNER WITH TEAM TOGGLE TABS */}
      <div className="absolute top-2.5 w-full flex items-center justify-center gap-6 z-20">
        <span className="text-[26px] font-bold tracking-[0.15em] text-shadow-heavy uppercase shine-container px-4">
          Playing XI SQUADS
        </span>

        {/* Team Selector Tabs */}
        <div className="flex bg-[#0d1e57] p-1 rounded-lg border-[2px] border-white/30 shadow-inner">
          <button 
            onClick={() => setActiveTab(0)}
            className={`px-5 py-1 text-[15px] font-black uppercase rounded-md transition-all cursor-pointer ${activeTab === 0 ? 'bg-cyan-400 text-black shadow-[0_0_10px_#22d3ee]' : 'text-gray-300 hover:text-white'}`}
          >
            {team1Name}
          </button>
          <button 
            onClick={() => setActiveTab(1)}
            className={`px-5 py-1 text-[15px] font-black uppercase rounded-md transition-all cursor-pointer ${activeTab === 1 ? 'bg-cyan-400 text-black shadow-[0_0_10px_#22d3ee]' : 'text-gray-300 hover:text-white'}`}
          >
            {team2Name}
          </button>
        </div>
      </div>

      {/* SQUAD CARD DECK */}
      <div className="absolute bottom-2.5 left-0 w-full h-[295px] px-6 flex items-center">
        {loading ? (
          <div className="w-full text-center text-[28px] font-black text-cyan-400 animate-pulse uppercase">
            Loading Squad...
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full grid grid-cols-11 gap-2.5"
            >
              {squadList.map((player, idx) => (
                <motion.div 
                  key={`squad-card-${activeTab}-${idx}`}
                  variants={cardItem}
                  className="h-[275px] bg-[#0c1a4b]/95 border-[2px] border-white/25 rounded-xl flex flex-col justify-between overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.7)] hover:border-cyan-400 transition-all group relative"
                >
                  {/* Player Name Header Box */}
                  <div className="w-full bg-[#112563] border-b border-white/20 py-2 px-0.5 text-center z-10">
                    <span className="text-[12px] font-black uppercase tracking-tight text-white text-shadow-light block leading-tight truncate">
                      {player.name}
                    </span>
                  </div>

                  {/* Player Image / Avatar Container */}
                  <div className="absolute inset-0 flex items-end justify-center pt-6 overflow-hidden pointer-events-none">
                    <div className="absolute w-[100px] h-[100px] bg-cyan-400/20 rounded-full blur-2xl bottom-8"></div>
                    <img 
                      src={player.profile_image || "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/316500/316584.png"} 
                      alt={player.name}
                      className="w-[140px] h-[210px] object-cover object-top drop-shadow-[0_10px_15px_rgba(0,0,0,0.9)] group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Role Footer Box */}
                  <div className="w-full bg-[#071124]/95 py-2 px-0.5 text-center border-t border-white/10 z-10">
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 block truncate">
                      {player.role || "Player"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

    </motion.div>
  );
}