import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// ⚠️ Update this import path to point to your axios instance file
import api from '../api/cricketApi';

const PlayerStats = ({ player }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!player?.profile_url) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        // Axios handles query parameters cleanly through the 'params' object
        const response = await api.get('/get_player_stats', {
          params: { profile_url: player.profile_url }
        });
        
        const data = response.data;
        if (data && !data.error) {
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching player stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [player]);

  if (!player) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={player.id}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-[450px] h-full flex flex-col border-[4px] border-[#0a192f] shadow-2xl bg-gradient-to-b from-gray-200 to-gray-400 relative"
      >
        {/* Top Header */}
        <div className="h-[40px] bg-[#d4af37] flex items-center justify-center border-b-[3px] border-black shadow-md">
          <span className="font-black text-black text-[28px] tracking-widest uppercase" style={{ fontFamily: 'Oswald, sans-serif' }}>
            {player.roleTag || "PLAYER INFO"}
          </span>
        </div>

        {/* Player Image & Number */}
        <div className="relative flex-1 flex items-end justify-center overflow-hidden">
          <div className="absolute top-2 right-2 bg-black text-white font-black text-[45px] leading-none px-4 py-1 border-[2px] border-white shadow-lg">
            {player.number || "0"}
          </div>
          
          <img 
            src={player.image || "https://placehold.co/400x500/transparent/333?text=Player"} 
            alt={player.name}
            className="h-[110%] object-cover object-bottom drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* Name and Role Block */}
        <div className="flex flex-col border-t-[4px] border-black">
          <div className="bg-[#1a2b50] py-2 flex flex-col items-center justify-center">
            <span className="text-white font-bold text-[35px] leading-none uppercase tracking-wide" style={{ fontFamily: 'Oswald, sans-serif' }}>
              {player.name}
            </span>
          </div>
          <div className="bg-white py-1 flex items-center justify-center border-t-[2px] border-gray-400">
            <span className="text-black font-black text-[30px] leading-none uppercase" style={{ fontFamily: 'Oswald, sans-serif' }}>
              {player.role}
            </span>
          </div>
        </div>

        {/* Fetched Stats Overlay */}
        {loading ? (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
            <span className="text-white font-bold animate-pulse text-2xl">Loading Stats...</span>
          </div>
        ) : stats ? (
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }}
            className="absolute bottom-[115px] left-0 w-full bg-black/80 text-white p-4 border-y-[2px] border-[#d4af37]"
          >
            <div className="flex justify-around text-center font-bold text-xl uppercase">
              <div>
                <div className="text-[#d4af37] text-sm">Matches</div>
                <div>{stats.matches || "-"}</div>
              </div>
              <div>
                <div className="text-[#d4af37] text-sm">Runs/Wkts</div>
                <div>{stats.runs || stats.wickets || "-"}</div>
              </div>
              <div>
                <div className="text-[#d4af37] text-sm">Avg</div>
                <div>{stats.average || "-"}</div>
              </div>
            </div>
          </motion.div>
        ) : null}

      </motion.div>
    </AnimatePresence>
  );
};

export default PlayerStats;