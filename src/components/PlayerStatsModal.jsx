import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoCloseSharp } from "react-icons/io5";
import api from '../api/cricketApi';

const PlayerStatsModal = ({ player, onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeFormat, setActiveFormat] = useState('ODI');


  const profileUrl = player?.profile_url || player?.["Profile URL"] || "";

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
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center select-none"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.85, y: 30, opacity: 0 }} 
        animate={{ scale: 1, y: 0, opacity: 1 }} 
        exit={{ scale: 0.85, y: 30, opacity: 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
        onClick={(e) => e.stopPropagation()} 
        className="w-[1450px] h-[820px] bg-[#071124] border-[6px] border-[#d4af37] shadow-[0_35px_90px_rgba(0,0,0,0.95)] flex relative overflow-hidden rounded-xl"
      >
        
        {/* Absolute Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 z-40 w-[60px] h-[60px] bg-red-600 border-[3px] border-white flex items-center justify-center hover:bg-red-500 shadow-2xl cursor-pointer rounded-lg"
        >
          <IoCloseSharp size={42} color="white" />
        </button>

        {/* --- LEFT SIDE: Big Player Card --- */}
        <div className="w-[450px] bg-gradient-to-b from-gray-300 to-gray-500 relative flex flex-col border-r-[5px] border-[#d4af37]">
          <div className="h-[75px] bg-[#0d1b33] flex items-center justify-center border-b-[4px] border-black">
            <span className="text-white font-black text-[34px] tracking-widest uppercase" style={{ fontFamily: 'Oswald, sans-serif' }}>
              PLAYER PROFILE
            </span>
          </div>
          
          <div className="relative flex-1 overflow-hidden bg-emerald-900">
            {player.jersey_image && (
              <img src={player.jersey_image} alt="Background" className="absolute  h-[220px] bottom-0 w-full z-10" />
            )}
            {player.profile_image && (
              <img src={player.profile_image} alt={player.name} className="absolute h-[380px] w-full mt-[100px] drop-shadow-2xl" />
            )}
          </div>
          
          <div className="bg-[#0d1b33] py-5 px-4 flex flex-col items-center justify-center border-t-[5px] border-black z-10">
            <span className="text-white font-black text-[42px] leading-tight uppercase tracking-wide text-center" style={{ fontFamily: 'Oswald, sans-serif' }}>
              {player.name}
            </span>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-[#d4af37] font-black text-[26px] uppercase tracking-wider">{player.role}</span>
              {stats?.age && <span className="text-gray-300 font-bold text-[24px]">({stats.age})</span>}
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: Clean, Large, Readable Stats --- */}
        <div className="flex-1 bg-[#0a1628] p-10 flex flex-col justify-start relative overflow-y-auto">
          
          {/* Header & Format Buttons Container */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b-[4px] border-[#d4af37] pb-6 mb-6 gap-4 pr-20">
            <h2 className="text-white font-black text-5xl uppercase tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>
              CAREER STATISTICS
            </h2>

            {stats?.batting && (
              <div className="flex gap-2 flex-wrap">
                {stats.batting.map((b) => (
                  <button
                    key={b.format}
                    onClick={() => setActiveFormat(b.format)}
                    className={`px-4 py-1.5 font-black text-base uppercase rounded-lg border-2 transition-all cursor-pointer ${
                      activeFormat === b.format 
                        ? 'bg-[#d4af37] text-black border-white shadow-[0_0_15px_rgba(212,175,55,0.7)] scale-105' 
                        : 'bg-[#13233f] text-white border-gray-600 hover:border-gray-300'
                    }`}
                    style={{ fontFamily: 'Oswald, sans-serif' }}
                  >
                    {b.format}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <div className="h-[450px] flex items-center justify-center">
              <span className="text-[#d4af37] text-4xl font-black animate-pulse uppercase tracking-widest" style={{ fontFamily: 'Oswald, sans-serif' }}>Loading Statistics...</span>
            </div>
          ) : stats ? (
            <div className="space-y-6">
              
              {/* Batting Stats Section */}
              <div>
                <h3 className="text-[#d4af37] text-2xl font-black uppercase tracking-widest mb-3 flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
                  <span className="w-3 h-3 bg-[#d4af37] inline-block rounded-full"></span>
                  Batting ({activeFormat})
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-[#13233f] p-4 border-[2px] border-gray-700 rounded-xl text-center shadow-lg">
                    <div className="text-gray-300 text-xs font-black uppercase tracking-widest whitespace-nowrap">MATCHES</div>
                    <div className="text-white text-4xl font-black mt-2" style={{ fontFamily: 'Oswald, sans-serif' }}>{currentBatting.matches ?? "-"}</div>
                  </div>
                  <div className="bg-[#13233f] p-4 border-[2px] border-gray-700 rounded-xl text-center shadow-lg">
                    <div className="text-gray-300 text-xs font-black uppercase tracking-widest whitespace-nowrap">INNINGS</div>
                    <div className="text-white text-4xl font-black mt-2" style={{ fontFamily: 'Oswald, sans-serif' }}>{currentBatting.innings ?? "-"}</div>
                  </div>
                  <div className="bg-[#13233f] p-4 border-[2px] border-gray-700 rounded-xl text-center shadow-lg">
                    <div className="text-gray-300 text-xs font-black uppercase tracking-widest whitespace-nowrap">RUNS</div>
                    <div className="text-white text-4xl font-black mt-2" style={{ fontFamily: 'Oswald, sans-serif' }}>{currentBatting.runs ?? "-"}</div>
                  </div>
                  <div className="bg-[#13233f] p-4 border-[2px] border-gray-700 rounded-xl text-center shadow-lg">
                    <div className="text-gray-300 text-xs font-black uppercase tracking-widest whitespace-nowrap">HIGH SCORE</div>
                    <div className="text-white text-4xl font-black mt-2" style={{ fontFamily: 'Oswald, sans-serif' }}>{currentBatting.high_score ?? "-"}</div>
                  </div>
                  <div className="bg-[#13233f] p-4 border-[2px] border-gray-700 rounded-xl text-center shadow-lg">
                    <div className="text-gray-300 text-xs font-black uppercase tracking-widest whitespace-nowrap">AVERAGE</div>
                    <div className="text-white text-4xl font-black mt-2" style={{ fontFamily: 'Oswald, sans-serif' }}>{currentBatting.average ?? "-"}</div>
                  </div>
                  <div className="bg-[#13233f] p-4 border-[2px] border-gray-700 rounded-xl text-center shadow-lg">
                    <div className="text-gray-300 text-xs font-black uppercase tracking-widest whitespace-nowrap">STRIKE RATE</div>
                    <div className="text-white text-4xl font-black mt-2" style={{ fontFamily: 'Oswald, sans-serif' }}>{currentBatting.strike_rate ?? "-"}</div>
                  </div>
                  <div className="bg-[#13233f] p-4 border-[2px] border-gray-700 rounded-xl text-center shadow-lg">
                    <div className="text-gray-300 text-xs font-black uppercase tracking-widest whitespace-nowrap">50S / 100S</div>
                    <div className="text-white text-4xl font-black mt-2" style={{ fontFamily: 'Oswald, sans-serif' }}>{currentBatting.fifties ?? 0} / {currentBatting.hundreds ?? 0}</div>
                  </div>
                  <div className="bg-[#13233f] p-4 border-[2px] border-gray-700 rounded-xl text-center shadow-lg">
                    <div className="text-gray-300 text-xs font-black uppercase tracking-widest whitespace-nowrap">4S / 6S</div>
                    <div className="text-white text-4xl font-black mt-2" style={{ fontFamily: 'Oswald, sans-serif' }}>{currentBatting.fours ?? 0} / {currentBatting.sixes ?? 0}</div>
                  </div>
                </div>
              </div>

              {/* Bowling Stats Section (If applicable) */}
              {currentBowling.matches > 0 && currentBowling.innings > 0 && (
                <div>
                  <h3 className="text-[#d4af37] text-2xl font-black uppercase tracking-widest mb-3 flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
                    <span className="w-3 h-3 bg-[#d4af37] inline-block rounded-full"></span>
                    Bowling ({activeFormat})
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-[#13233f] p-4 border-[2px] border-gray-700 rounded-xl text-center shadow-lg">
                      <div className="text-gray-300 text-xs font-black uppercase tracking-widest whitespace-nowrap">WICKETS</div>
                      <div className="text-white text-4xl font-black mt-2" style={{ fontFamily: 'Oswald, sans-serif' }}>{currentBowling.wickets ?? "0"}</div>
                    </div>
                    <div className="bg-[#13233f] p-4 border-[2px] border-gray-700 rounded-xl text-center shadow-lg">
                      <div className="text-gray-300 text-xs font-black uppercase tracking-widest whitespace-nowrap">ECONOMY</div>
                      <div className="text-white text-4xl font-black mt-2" style={{ fontFamily: 'Oswald, sans-serif' }}>{currentBowling.econ ?? "-"}</div>
                    </div>
                    <div className="bg-[#13233f] p-4 border-[2px] border-gray-700 rounded-xl text-center shadow-lg">
                      <div className="text-gray-300 text-xs font-black uppercase tracking-widest whitespace-nowrap">AVERAGE</div>
                      <div className="text-white text-4xl font-black mt-2" style={{ fontFamily: 'Oswald, sans-serif' }}>{currentBowling.average ?? "-"}</div>
                    </div>
                    <div className="bg-[#13233f] p-4 border-[2px] border-gray-700 rounded-xl text-center shadow-lg">
                      <div className="text-gray-300 text-xs font-black uppercase tracking-widest whitespace-nowrap">BEST FIG</div>
                      <div className="text-white text-4xl font-black mt-2" style={{ fontFamily: 'Oswald, sans-serif' }}>{currentBowling.best ?? "-"}</div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="h-[450px] flex items-center justify-center">
              <span className="text-red-400 text-3xl font-bold uppercase tracking-wide">Failed to load statistics.</span>
            </div>
          )}

        </div>
      </motion.div>
    </motion.div>
  );
};

export default PlayerStatsModal;