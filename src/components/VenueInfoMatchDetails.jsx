import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloseSharp } from "react-icons/io5";
import { FaCloudSun, FaMapMarkerAlt, FaCalendarAlt, FaTv } from "react-icons/fa";
import api from '../api/cricketApi'; // ⚠️ Ensure this points to your Axios instance

let cachedVenueData = null;

const tabContentVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, staggerChildren: 0.1 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

const VenueInfoMatchDetails = ({ onClose }) => {
  const [data, setData] = useState(cachedVenueData);
  const [loading, setLoading] = useState(!cachedVenueData);
  const [activeTab, setActiveTab] = useState('overview'); 

  // 1. ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 2. Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/get_venue_info');
        if (response.data) {
          cachedVenueData = response.data;
          setData(response.data);
        }
      } catch (error) {
        console.error("Error fetching venue & match details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!cachedVenueData) fetchData();
    else setLoading(false);
  }, []);

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
        // INCREASED SIZE to 1800x960
        className="w-[1800px] h-[960px] bg-gradient-to-br from-[#0d1e57] via-[#112563] to-[#0a1538] border-[4px] border-cyan-500/50 shadow-[0_35px_90px_rgba(0,0,0,0.95)] flex flex-col relative overflow-hidden rounded-2xl font-sans"
      >
        <style>{`
          .text-shadow-heavy { text-shadow: 2px 2px 5px rgba(0,0,0,0.9); }
          .text-shadow-light { text-shadow: 1px 1px 3px rgba(0,0,0,0.6); }
          .shine-container { position: relative; overflow: hidden; }
          .shine-container::after {
            content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transform: skewX(-25deg); animation: shine-sweep 4s infinite; pointer-events: none;
          }
          @keyframes shine-sweep { 0% { left: -100%; } 20%, 100% { left: 200%; } }
          .custom-scrollbar::-webkit-scrollbar { width: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #22d3ee; border-radius: 10px; }
        `}</style>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-40 w-[60px] h-[60px] bg-red-600 border-[3px] border-white flex items-center justify-center hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.8)] cursor-pointer rounded-xl transition-colors"
        >
          <IoCloseSharp size={46} color="white" />
        </button>

        {/* --- TOP HEADER & NAVIGATION TABS --- */}
        <div className="h-[120px] min-h-[120px] bg-[#2a4db5] border-b-[4px] border-white flex items-center justify-between px-10 pr-28 relative overflow-hidden shadow-lg shine-container">
          
          <div className="flex flex-col relative z-10">
            <h2 className="text-white font-black text-5xl uppercase tracking-widest text-shadow-heavy" style={{ fontFamily: 'Oswald, sans-serif' }}>
              {data?.match_info?.series || "MATCH & VENUE DETAILS"}
            </h2>
            <span className="text-cyan-300 text-2xl font-bold flex items-center gap-3 mt-2 text-shadow-light">
              <FaMapMarkerAlt size={26} /> {data?.match_info?.venue}
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-4 relative z-10">
            {[
              { id: 'overview', label: 'Match Info' },
              { id: 'h2h', label: 'Head to Head' },
              { id: 'venue', label: 'Venue & Pitch' },
              { id: 'form', label: 'Form & Stats' } 
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-8 py-3.5 font-black text-2xl uppercase rounded-xl border-[3px] transition-all cursor-pointer overflow-hidden ${
                  activeTab === tab.id 
                    ? 'bg-cyan-400 text-[#0d1e57] border-white shadow-[0_0_20px_#22d3ee] scale-105' 
                    : 'bg-[#0d1e57]/80 text-white border-white/50 hover:bg-[#112563] hover:border-white'
                }`}
                style={{ fontFamily: 'Oswald, sans-serif' }}
              >
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar flex flex-col gap-8 relative">
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-cyan-400 text-5xl font-black animate-pulse uppercase tracking-widest text-shadow-heavy" style={{ fontFamily: 'Oswald, sans-serif' }}>
                Loading Venue & Match Data...
              </span>
            </div>
          ) : data ? (
            <AnimatePresence mode="wait">
              
              {/* TAB 1: MATCH INFO & OVERVIEW */}
              {activeTab === 'overview' && (
                <motion.div key="overview" variants={tabContentVariant} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                  
                  {/* Match Info Banner */}
                  <motion.div variants={cardVariant} className="bg-[#0c1a4b]/90 border-[3px] border-white/20 p-10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex flex-col gap-6">
                    <h3 className="text-cyan-400 text-4xl font-black uppercase tracking-widest text-shadow-heavy" style={{ fontFamily: 'Oswald, sans-serif' }}>
                      Match Overview
                    </h3>
                    <div className="text-white text-3xl font-bold mb-2">{data.match_info?.title}</div>
                    <div className="grid grid-cols-3 gap-8">
                      <div className="flex items-center gap-6 bg-[#071124] p-6 rounded-xl border-[2px] border-white/10 shadow-inner">
                        <FaCalendarAlt className="text-cyan-400 text-5xl drop-shadow-md" />
                        <div>
                          <div className="text-cyan-300/80 text-lg font-bold uppercase tracking-wider mb-1">Date & Time</div>
                          <div className="text-white font-black text-3xl">{data.match_info?.date_time}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 bg-[#071124] p-6 rounded-xl border-[2px] border-white/10 shadow-inner">
                        <FaMapMarkerAlt className="text-cyan-400 text-5xl drop-shadow-md" />
                        <div className="min-w-0">
                          <div className="text-cyan-300/80 text-lg font-bold uppercase tracking-wider mb-1">Venue</div>
                          <div className="text-white font-black text-3xl truncate leading-tight">{data.match_info?.venue}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 bg-[#071124] p-6 rounded-xl border-[2px] border-white/10 shadow-inner">
                        <FaTv className="text-cyan-400 text-5xl drop-shadow-md" />
                        <div>
                          <div className="text-cyan-300/80 text-lg font-bold uppercase tracking-wider mb-1">Subscribe</div>
                          <div className="text-white font-black text-3xl">For Commentaries</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Weather & Pitch Report Card */}
                  <div className="grid grid-cols-2 gap-8">
                    <motion.div variants={cardVariant} className="bg-[#0c1a4b]/90 border-[3px] border-white/20 p-10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex flex-col justify-between">
                      <div>
                        <h3 className="text-cyan-400 text-4xl font-black uppercase tracking-widest mb-6 flex items-center gap-4 text-shadow-heavy" style={{ fontFamily: 'Oswald, sans-serif' }}>
                          <motion.div animate={{ y: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
                            <FaCloudSun size={45} />
                          </motion.div>
                           Weather Conditions
                        </h3>
                        <div className="flex items-center justify-between bg-[#071124] p-8 rounded-xl border-[2px] border-white/10 my-4 shadow-inner">
                          <div>
                            <div className="text-white text-7xl font-black mb-3 leading-none drop-shadow-lg">{data.weather?.temp}</div>
                            <div className="text-yellow-400 text-3xl font-black uppercase tracking-wider">{data.weather?.condition}</div>
                          </div>
                          <div className="text-right space-y-3">
                            <div className="text-gray-300 text-2xl font-bold">Humidity: <b className="text-white">{data.weather?.humidity}</b></div>
                            <div className="text-gray-300 text-2xl font-bold">Rain Chance: <b className="text-white">{data.weather?.rain_chance}</b></div>
                            <div className="text-gray-300 text-2xl font-bold">{data.weather?.wind_speed}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div variants={cardVariant} className="bg-[#0c1a4b]/90 border-[3px] border-white/20 p-10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex flex-col justify-between">
                      <div>
                        <h3 className="text-cyan-400 text-4xl font-black uppercase tracking-widest mb-6 text-shadow-heavy" style={{ fontFamily: 'Oswald, sans-serif' }}>
                          Pitch Report Summary
                        </h3>
                        <p className="text-gray-100 text-2xl leading-relaxed bg-[#071124] p-8 rounded-xl border-[2px] border-white/10 h-[220px] overflow-y-auto custom-scrollbar shadow-inner">
                          <span className="font-black text-white block mb-3 text-3xl drop-shadow-md">{data.pitch_report?.summary}</span> 
                          <span className="text-gray-300 font-medium">{data.pitch_report?.text}</span>
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Match Officials */}
                  <motion.div variants={cardVariant} className="bg-[#0c1a4b]/90 border-[3px] border-white/20 p-10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                    <h3 className="text-cyan-400 text-4xl font-black uppercase tracking-widest mb-6 text-shadow-heavy" style={{ fontFamily: 'Oswald, sans-serif' }}>
                      Match Officials
                    </h3>
                    <div className="grid grid-cols-3 gap-8 text-white">
                      <div className="bg-[#071124] p-6 rounded-xl border-[2px] border-white/10 shadow-inner">
                        <span className="text-cyan-300/80 text-lg font-bold block uppercase mb-2 tracking-wider">On-Field Umpires</span>
                        <span className="font-black text-3xl">{data.umpires?.on_field}</span>
                      </div>
                      <div className="bg-[#071124] p-6 rounded-xl border-[2px] border-white/10 shadow-inner">
                        <span className="text-cyan-300/80 text-lg font-bold block uppercase mb-2 tracking-wider">Third Umpire</span>
                        <span className="font-black text-3xl">{data.umpires?.third_umpire}</span>
                      </div>
                      <div className="bg-[#071124] p-6 rounded-xl border-[2px] border-white/10 shadow-inner">
                        <span className="text-cyan-300/80 text-lg font-bold block uppercase mb-2 tracking-wider">Match Referee</span>
                        <span className="font-black text-3xl">{data.umpires?.referee}</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* TAB 2: HEAD TO HEAD */}
              {activeTab === 'h2h' && (
                <motion.div key="h2h" variants={tabContentVariant} initial="hidden" animate="visible" exit="exit" className="space-y-10">
                  {/* Summary Box */}
                  <motion.div variants={cardVariant} className="bg-[#0c1a4b]/90 border-[4px] border-cyan-400 p-10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] text-center">
                    <div className="text-cyan-300 text-2xl font-black uppercase tracking-widest mb-4">Head to Head Record (Overall)</div>
                    <div className="text-white text-[80px] leading-tight font-black tracking-wider text-shadow-heavy" style={{ fontFamily: 'Oswald, sans-serif' }}>
                      {data.head_to_head?.summary}
                    </div>
                  </motion.div>

                  {/* Matches List */}
                  <div className="space-y-5">
                    <h3 className="text-cyan-400 text-4xl font-black uppercase tracking-widest text-shadow-heavy mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>Previous Encounters</h3>
                    {data.head_to_head?.matches?.map((match, idx) => (
                      <motion.div 
                        key={idx}
                        variants={cardVariant}
                        className="bg-[#0c1a4b]/90 border-[3px] border-white/20 p-8 rounded-2xl flex items-center justify-between shadow-lg hover:border-cyan-400 transition-colors"
                      >
                        <div className="text-gray-200 text-2xl font-black w-[200px]">{match.date}</div>
                        <div className="text-yellow-400 font-black text-3xl uppercase flex-1 text-center tracking-wide">{match.result}</div>
                        <div className="flex gap-6 text-white text-3xl font-bold justify-end min-w-[500px]">
                          <span className="bg-[#071124] px-6 py-3 rounded-xl border border-white/20 shadow-inner">{match.team1}: <b className="text-cyan-400">{match.team1_score}</b></span>
                          <span className="bg-[#071124] px-6 py-3 rounded-xl border border-white/20 shadow-inner">{match.team2}: <b className="text-cyan-400">{match.team2_score}</b></span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: VENUE & PITCH STATS */}
              {activeTab === 'venue' && (
                <motion.div key="venue" variants={tabContentVariant} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    {/* Venue Stats Card */}
                    <motion.div variants={cardVariant} className="bg-[#0c1a4b]/90 border-[3px] border-white/20 p-10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex flex-col justify-between">
                      <h3 className="text-cyan-400 text-4xl font-black uppercase tracking-widest mb-8 text-shadow-heavy" style={{ fontFamily: 'Oswald, sans-serif' }}>
                        Venue Statistics <span className="text-2xl font-bold text-gray-400 ml-3 tracking-normal">({data.venue_stats?.total_matches} Matches)</span>
                      </h3>
                      <div className="space-y-6">
                        <div className="flex justify-between items-center bg-[#071124] p-6 rounded-xl border-[2px] border-white/10 shadow-inner">
                          <span className="text-gray-200 text-2xl font-black uppercase">Avg 1st Innings Score</span>
                          <span className="text-white text-5xl font-black drop-shadow-md">{data.venue_stats?.avg_1st_inn}</span>
                        </div>
                        <div className="flex justify-between items-center bg-[#071124] p-6 rounded-xl border-[2px] border-white/10 shadow-inner">
                          <span className="text-gray-200 text-2xl font-black uppercase">Avg 2nd Innings Score</span>
                          <span className="text-white text-5xl font-black drop-shadow-md">{data.venue_stats?.avg_2nd_inn}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-6 pt-4">
                          <div className="bg-[#071124] p-6 rounded-xl text-center border-[2px] border-white/10 shadow-inner">
                            <div className="text-cyan-300/80 text-lg uppercase font-bold mb-2 tracking-wider">Win Bat First</div>
                            <div className="text-green-400 text-5xl font-black drop-shadow-md">{data.venue_stats?.win_bat_first}</div>
                          </div>
                          <div className="bg-[#071124] p-6 rounded-xl text-center border-[2px] border-white/10 shadow-inner">
                            <div className="text-cyan-300/80 text-lg uppercase font-bold mb-2 tracking-wider">Win Bowl First</div>
                            <div className="text-yellow-400 text-5xl font-black drop-shadow-md">{data.venue_stats?.win_bowl_first}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Pace vs Spin Graph/Bar Card */}
                    <motion.div variants={cardVariant} className="bg-[#0c1a4b]/90 border-[3px] border-white/20 p-10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex flex-col justify-between">
                      <h3 className="text-cyan-400 text-4xl font-black uppercase tracking-widest mb-8 text-shadow-heavy" style={{ fontFamily: 'Oswald, sans-serif' }}>
                        Pace vs Spin Wickets
                      </h3>
                      <div className="space-y-12 my-auto">
                        <div className="space-y-4">
                          <div className="flex justify-between text-white text-3xl font-black">
                            <span className="uppercase">Pace ({data.pace_vs_spin?.pace_percentage})</span>
                            <span className="text-cyan-400 text-4xl">{data.pace_vs_spin?.pace_wickets}</span>
                          </div>
                          <div className="w-full bg-[#071124] h-10 rounded-full overflow-hidden border-[2px] border-white/20 shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: data.pace_vs_spin?.pace_percentage }}
                              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                              className="bg-cyan-400 h-full rounded-full shadow-[0_0_15px_#22d3ee]" 
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between text-white text-3xl font-black">
                            <span className="uppercase">Spin ({data.pace_vs_spin?.spin_percentage})</span>
                            <span className="text-purple-400 text-4xl">{data.pace_vs_spin?.spin_wickets}</span>
                          </div>
                          <div className="w-full bg-[#071124] h-10 rounded-full overflow-hidden border-[2px] border-white/20 shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: data.pace_vs_spin?.spin_percentage }}
                              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                              className="bg-purple-500 h-full rounded-full shadow-[0_0_15px_#a855f7]" 
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Venue Records */}
                  <motion.div variants={cardVariant} className="bg-[#0c1a4b]/90 border-[3px] border-white/20 p-10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                    <h3 className="text-cyan-400 text-4xl font-black uppercase tracking-widest mb-6 text-shadow-heavy" style={{ fontFamily: 'Oswald, sans-serif' }}>Venue Records</h3>
                    <div className="grid grid-cols-3 gap-8 text-white">
                      <div className="bg-[#071124] p-8 rounded-xl border-[2px] border-white/10 shadow-inner">
                        <div className="text-cyan-300/80 text-xl uppercase font-bold mb-3 tracking-wider">Highest Total</div>
                        <div className="text-4xl font-black text-yellow-400 drop-shadow-md">{data.venue_stats?.highest_total}</div>
                      </div>
                      <div className="bg-[#071124] p-8 rounded-xl border-[2px] border-white/10 shadow-inner">
                        <div className="text-cyan-300/80 text-xl uppercase font-bold mb-3 tracking-wider">Lowest Total</div>
                        <div className="text-4xl font-black text-red-400 drop-shadow-md">{data.venue_stats?.lowest_total}</div>
                      </div>
                      <div className="bg-[#071124] p-8 rounded-xl border-[2px] border-white/10 shadow-inner">
                        <div className="text-cyan-300/80 text-xl uppercase font-bold mb-3 tracking-wider">Highest Chased</div>
                        <div className="text-4xl font-black text-green-400 truncate drop-shadow-md">{data.venue_stats?.highest_chased}</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Recent Matches at Venue */}
                  <motion.div variants={cardVariant} className="bg-[#0c1a4b]/90 border-[3px] border-white/20 p-10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                    <h3 className="text-cyan-400 text-4xl font-black uppercase tracking-widest mb-6 text-shadow-heavy" style={{ fontFamily: 'Oswald, sans-serif' }}>Recent Matches at Venue</h3>
                    <div className="space-y-5">
                      {data.recent_matches_at_venue?.map((match, idx) => (
                        <div key={idx} className="bg-[#071124] border-[2px] border-white/10 p-6 rounded-xl flex items-center justify-between shadow-inner">
                          <div className="text-gray-300 text-2xl font-black w-[200px]">{match.date}</div>
                          <div className="text-yellow-400 font-black text-3xl uppercase flex-1 text-center tracking-wide">{match.result}</div>
                          <div className="flex gap-5 text-white text-2xl font-bold min-w-[450px] justify-end">
                            <span className="bg-[#112563] px-5 py-3 rounded-lg border border-white/20 shadow-md">{match.team1}: <b className="text-cyan-400">{match.team1_score}</b></span>
                            <span className="bg-[#112563] px-5 py-3 rounded-lg border border-white/20 shadow-md">{match.team2}: <b className="text-cyan-400">{match.team2_score}</b></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                </motion.div>
              )}

              {/* TAB 4: FORM & STATS */}
              {activeTab === 'form' && (
                <motion.div key="form" variants={tabContentVariant} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                  
                  {/* Top Row: Form & Points Table */}
                  <div className="grid grid-cols-2 gap-8">
                    
                    {/* Team Form */}
                    <div className="bg-[#0c1a4b]/90 border-[3px] border-white/20 p-10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] space-y-8 flex flex-col justify-center">
                      <h3 className="text-cyan-400 text-4xl font-black uppercase tracking-widest text-shadow-heavy" style={{ fontFamily: 'Oswald, sans-serif' }}>
                        Recent Form
                      </h3>

                      <motion.div variants={cardVariant} className="flex items-center justify-between bg-[#071124] p-6 rounded-xl border-[2px] border-white/10 shadow-inner">
                        <div>
                          <span className="text-white text-3xl font-black uppercase" style={{ fontFamily: 'Oswald, sans-serif' }}>Team 1</span>
                          <span className="text-cyan-300/80 block text-lg mt-2 font-bold tracking-widest">STRING: {data.team_form?.team1_form}</span>
                        </div>
                        <div className="flex gap-4">
                          {data.team_form?.team1_detailed?.filter(res => res !== '*').map((res, i) => (
                            <motion.div key={`t1-${i}`} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, delay: i * 0.1 }}
                              className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-2xl text-white shadow-[0_5px_15px_rgba(0,0,0,0.5)] ${res === 'W' ? 'bg-green-600 border-[2px] border-green-400' : 'bg-red-600 border-[2px] border-red-400'}`}
                            >
                              {res}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>

                      <motion.div variants={cardVariant} className="flex items-center justify-between bg-[#071124] p-6 rounded-xl border-[2px] border-white/10 shadow-inner">
                        <div>
                          <span className="text-white text-3xl font-black uppercase" style={{ fontFamily: 'Oswald, sans-serif' }}>Team 2</span>
                          <span className="text-cyan-300/80 block text-lg mt-2 font-bold tracking-widest">STRING: {data.team_form?.team2_form}</span>
                        </div>
                        <div className="flex gap-4">
                          {data.team_form?.team2_detailed?.filter(res => res !== '*').map((res, i) => (
                            <motion.div key={`t2-${i}`} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.3 + (i * 0.1) }}
                              className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-2xl text-white shadow-[0_5px_15px_rgba(0,0,0,0.5)] ${res === 'W' ? 'bg-green-600 border-[2px] border-green-400' : 'bg-red-600 border-[2px] border-red-400'}`}
                            >
                              {res}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </div>

                    {/* Points Table */}
                    <div className="bg-[#0c1a4b]/90 border-[3px] border-white/20 p-10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                      <h3 className="text-cyan-400 text-4xl font-black uppercase tracking-widest mb-8 text-shadow-heavy" style={{ fontFamily: 'Oswald, sans-serif' }}>
                        Points Table
                      </h3>
                      {data.points_table && data.points_table.length > 0 ? (
                        <div className="overflow-hidden rounded-xl border-[2px] border-white/20 shadow-lg">
                          <table className="w-full text-left text-2xl text-white">
                            <thead className="bg-[#112563] text-cyan-300 font-black uppercase text-xl border-b-[2px] border-white/20">
                              <tr>
                                <th className="px-6 py-5">Rank</th>
                                <th className="px-6 py-5">Team</th>
                                <th className="px-6 py-5">P</th>
                                <th className="px-6 py-5">W</th>
                                <th className="px-6 py-5">L</th>
                                <th className="px-6 py-5">Pts</th>
                                <th className="px-6 py-5">NRR</th>
                              </tr>
                            </thead>
                            <tbody className="bg-[#071124]">
                              {data.points_table.map((team, idx) => (
                                <tr key={idx} className="border-b border-white/10 hover:bg-[#112563] transition-colors last:border-0">
                                  <td className="px-6 py-5 font-black text-gray-300">{team.rank}</td>
                                  <td className="px-6 py-5 font-black text-yellow-400 text-3xl">{team.team_id}</td>
                                  <td className="px-6 py-5 font-bold text-white">{team.P}</td>
                                  <td className="px-6 py-5 text-green-400 font-black">{team.W}</td>
                                  <td className="px-6 py-5 text-red-400 font-black">{team.L}</td>
                                  <td className="px-6 py-5 font-black text-3xl text-cyan-400">{team.Pts}</td>
                                  <td className="px-6 py-5 font-bold text-gray-200">{team.NRR}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-gray-300 italic text-2xl font-bold bg-[#071124] p-6 rounded-xl border border-white/10 text-center">Points table not available for this series.</div>
                      )}
                    </div>
                  </div>

                  {/* Team Comparisons */}
                  {data.team_comparison && (
                    <motion.div variants={cardVariant} className="bg-[#0c1a4b]/90 border-[3px] border-white/20 p-10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                      <h3 className="text-cyan-400 text-4xl font-black uppercase tracking-widest mb-8 text-shadow-heavy" style={{ fontFamily: 'Oswald, sans-serif' }}>
                        Team Statistical Comparison
                      </h3>
                      <div className="grid grid-cols-2 gap-12">
                        
                        {/* Overall Comparison */}
                        <div>
                          <h4 className="text-white text-2xl font-black mb-5 bg-[#112563] p-4 rounded-xl text-center border-[2px] border-white/20 uppercase tracking-widest shadow-md">Overall (Last 10 Matches)</h4>
                          <div className="space-y-5">
                            {data.team_comparison.overall?.map((team, idx) => (
                              <div key={`overall-${idx}`} className="p-6 bg-[#071124] border-[2px] border-white/10 rounded-xl shadow-inner">
                                <div className="flex justify-between items-end mb-4 border-b-[2px] border-white/10 pb-4">
                                  <span className="font-black text-4xl text-yellow-400 drop-shadow-md">{team.team_id}</span> 
                                  <span className="text-green-400 font-black text-2xl uppercase">{team.wins} Wins <span className="text-gray-400 text-lg font-bold">/ {team.matches_played}M</span></span>
                                </div>
                                <div className="text-2xl text-white grid grid-cols-3 gap-4 text-center">
                                  <div className="bg-[#112563] p-4 rounded-xl font-black shadow-md border border-white/10"><span className="block text-cyan-300/80 text-sm uppercase mb-1 tracking-wider">Avg</span>{team.avg_score}</div>
                                  <div className="bg-[#112563] p-4 rounded-xl font-black shadow-md border border-white/10"><span className="block text-cyan-300/80 text-sm uppercase mb-1 tracking-wider">High</span>{team.highest_score}</div>
                                  <div className="bg-[#112563] p-4 rounded-xl font-black shadow-md border border-white/10"><span className="block text-cyan-300/80 text-sm uppercase mb-1 tracking-wider">Low</span>{team.lowest_score}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* On Venue Comparison */}
                        <div>
                          <h4 className="text-white text-2xl font-black mb-5 bg-[#112563] p-4 rounded-xl text-center border-[2px] border-white/20 uppercase tracking-widest shadow-md">Performance at this Venue</h4>
                          <div className="space-y-5">
                            {data.team_comparison.on_venue?.map((team, idx) => (
                              <div key={`venue-${idx}`} className="p-6 bg-[#071124] border-[2px] border-white/10 rounded-xl shadow-inner">
                                <div className="flex justify-between items-end mb-4 border-b-[2px] border-white/10 pb-4">
                                  <span className="font-black text-4xl text-yellow-400 drop-shadow-md">{team.team_id}</span> 
                                  <span className="text-green-400 font-black text-2xl uppercase">{team.wins} Wins <span className="text-gray-400 text-lg font-bold">/ {team.matches_played}M</span></span>
                                </div>
                                <div className="text-2xl text-white grid grid-cols-3 gap-4 text-center">
                                  <div className="bg-[#112563] p-4 rounded-xl font-black shadow-md border border-white/10"><span className="block text-cyan-300/80 text-sm uppercase mb-1 tracking-wider">Avg</span>{team.avg_score}</div>
                                  <div className="bg-[#112563] p-4 rounded-xl font-black shadow-md border border-white/10"><span className="block text-cyan-300/80 text-sm uppercase mb-1 tracking-wider">High</span>{team.highest_score}</div>
                                  <div className="bg-[#112563] p-4 rounded-xl font-black shadow-md border border-white/10"><span className="block text-cyan-300/80 text-sm uppercase mb-1 tracking-wider">Low</span>{team.lowest_score}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-red-500 text-5xl font-black uppercase tracking-widest drop-shadow-md">Failed to load venue data.</span>
            </div>
          )}

        </div>
      </motion.div>
    </motion.div>
  );
};

export default VenueInfoMatchDetails;