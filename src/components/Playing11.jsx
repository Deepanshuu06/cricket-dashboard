import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloseSharp } from "react-icons/io5";
import PlayerStatsModal from './PlayerStatsModal';
import api from '../api/cricketApi';

let cachedPlaying11 = null;

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
      <div className="w-[1800px] h-[750px] flex flex-col items-center justify-center bg-[#0a192f] border-[4px] border-[#d4af37] shadow-2xl relative">
        <span className="text-[#d4af37] text-[40px] font-black uppercase tracking-widest animate-pulse font-condensed">
           Playing 11 Data Loading...
        </span>
        <button onClick={onClose} className="absolute top-4 right-4 w-[50px] h-[50px] bg-red-600 border-[3px] border-white flex items-center justify-center hover:bg-red-500 shadow-lg">
          <IoCloseSharp size={40} color="white" />
        </button>
      </div>
    );
  }

  // --- DATA EXTRACTION ---
  const activeTeamName = teamData.teams[activeTeamIndex];
  const currentPlayers = teamData.by_team[activeTeamName] || [];
  
  const captain = currentPlayers.find(p => p.role?.toLowerCase().includes('captain') || p.role?.toLowerCase() === 'c') || currentPlayers[0];
  const gridPlayers = currentPlayers.filter(p => p.name !== captain?.name);

  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
      className="relative w-[1800px] h-[750px] flex flex-col font-sans select-none items-center"
    >
      
      {/* HEADER */}
      <div className="w-full h-[80px] bg-gradient-to-b from-[#1a2b50] to-[#0d152a] border-[4px] border-[#0a192f] border-b-[#d4af37] border-b-[6px] shadow-2xl flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-6">
          <span className="text-white font-black text-[55px] uppercase tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>
            {activeTeamName} PROBABLE 11
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={() => handleTeamSwitch(0)} className={`px-6 py-2 font-black text-2xl uppercase border-2 ${activeTeamIndex === 0 ? 'bg-[#d4af37] text-black border-white' : 'bg-transparent text-white border-gray-500 hover:border-white'}`}>
            {teamData.teams[0]}
          </button>
          <button onClick={() => handleTeamSwitch(1)} className={`px-6 py-2 font-black text-2xl uppercase border-2 ${activeTeamIndex === 1 ? 'bg-[#d4af37] text-black border-white' : 'bg-transparent text-white border-gray-500 hover:border-white'}`}>
            {teamData.teams[1]}
          </button>
          <button onClick={onClose} className="ml-4 w-[50px] h-[50px] bg-red-600 border-[3px] border-white flex items-center justify-center hover:bg-red-500 shadow-lg">
            <IoCloseSharp size={40} color="white" />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="w-full h-[650px] flex gap-4 mt-2">
        
        {/* LEFT SIDE: FIXED CAPTAIN BOX */}
        {captain && (
          <motion.div 
            whileHover={{ scale: 1.01 }} 
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedStatPlayer(captain)}
            className="w-[450px] h-full flex flex-col border-[4px] border-[#0a192f] cursor-pointer shadow-2xl bg-gradient-to-b from-gray-200 to-gray-400 relative"
          >
            <div className="h-[40px] bg-[#d4af37] flex items-center justify-center border-b-[3px] border-black shadow-md z-10">
              <span className="font-black text-black text-[28px] tracking-widest uppercase" style={{ fontFamily: 'Oswald, sans-serif' }}>
                CAPTAIN
              </span>
            </div>
            
            {/* Perfectly Aligned Container */}
            <div className="relative flex-1 overflow-hidden bg-emerald-700">
              {captain.jersey_image && (
                <img 
                  src={captain.jersey_image} 
                  alt="Card Background" 
                  // FIXED: Added object-bottom here so it aligns exactly like the profile image
                  className="absolute  h-[240px] bottom-0 w-full z-10" 
                />
              )}
              {captain.profile_image && (
                <img 
                  src={captain.profile_image} 
                  alt={captain.name} 
                  className="absolute h-[380px] w-full mt-[4px]" 
                />
              )}
            </div>

            <div className="flex flex-col border-t-[4px] border-black z-10">
              <div className="bg-[#1a2b50] py-2 flex flex-col items-center justify-center">
                <span className="text-white font-bold text-[35px] leading-none uppercase tracking-wide" style={{ fontFamily: 'Oswald, sans-serif' }}>
                  {captain.name}
                </span>
              </div>
              <div className="bg-white py-1 flex items-center justify-center border-t-[2px] border-gray-400">
                <span className="text-black font-black text-[30px] leading-none uppercase" style={{ fontFamily: 'Oswald, sans-serif' }}>
                  {captain.role}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* RIGHT SIDE: GRID OF 10 */}
        <div className="flex-1 grid grid-cols-5 grid-rows-2 gap-3 h-full">
          {gridPlayers.slice(0, 10).map((player, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedStatPlayer(player)}
              className="flex flex-col bg-gradient-to-b from-gray-200 to-gray-400 border-[3px] border-[#0a192f] cursor-pointer shadow-lg overflow-hidden relative"
            >
              {/* Perfectly Aligned Container for Grid Cards */}
              <div className="relative flex-1 overflow-hidden bg-emerald-700">
                {player.jersey_image && (
                  <img 
                    src={player.jersey_image} 
                    alt="Card Background" 
                    // FIXED: Added object-bottom here to match the profile image
                    className="absolute bottom-0 w-full z-10" 
                  />
                )}
                {player.profile_image && (
                  <img 
                    src={player.profile_image} 
                    alt={player.name} 
                    className="absolute h-[180px] w-full mt-[12px]" 
                  />
                )}
              </div>

              <div className="flex flex-col border-t-[3px] border-black h-[75px] z-10">
                <div className="bg-[#1a2b50] flex-1 flex items-center justify-center px-1">
                  <span className="text-white font-bold text-[18px] leading-[1.1] uppercase text-center" style={{ fontFamily: 'Oswald, sans-serif' }}>{player.name}</span>
                </div>
                <div className="bg-white h-[28px] flex items-center justify-center border-t-[2px] border-gray-400">
                  <span className="text-black font-black text-[16px] uppercase" style={{ fontFamily: 'Oswald, sans-serif' }}>{player.role || "PLAYER"}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

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