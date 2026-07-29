import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloseSharp } from "react-icons/io5";
import { FaCloudSun, FaMapMarkerAlt, FaCalendarAlt, FaTv } from "react-icons/fa";
import api from '../api/cricketApi'; // ⚠️ Ensure this points to your Axios instance

let cachedVenueData = null;

const tabContentVariant = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, staggerChildren: 0.1 } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2 } }
};

const cardVariant = {
  hidden: { opacity: 0, y: 15 },
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
        // Slightly increased the container width/height to comfortably fit the bigger text
        className="w-[1600px] h-[900px] bg-[#071124] border-[6px] border-[#d4af37] shadow-[0_35px_90px_rgba(0,0,0,0.95)] flex flex-col relative overflow-hidden rounded-xl font-sans"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-40 w-[65px] h-[65px] bg-red-600 border-[3px] border-white flex items-center justify-center hover:bg-red-500 shadow-2xl cursor-pointer rounded-lg transition-colors"
        >
          <IoCloseSharp size={50} color="white" />
        </button>

        {/* --- TOP HEADER & NAVIGATION TABS --- */}
        <div className="h-[100px] min-h-[100px] bg-gradient-to-r from-[#0d1b33] via-[#1a2b50] to-[#0d1b33] border-b-[5px] border-[#d4af37] flex items-center justify-between px-8 pr-24 relative overflow-hidden">
          
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shine_4s_infinite_linear]" style={{ backgroundSize: '200% 100%' }} />

          <style>{`
            @keyframes shine {
              0% { transform: translateX(-100%) skewX(-15deg); }
              100% { transform: translateX(200%) skewX(-15deg); }
            }
          `}</style>

          <div className="flex flex-col relative z-10">
            <h2 className="text-white font-black text-4xl uppercase tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>
              {data?.match_info?.series || "MATCH & VENUE DETAILS"}
            </h2>
            <span className="text-[#d4af37] text-lg font-bold flex items-center gap-2 mt-1">
              <FaMapMarkerAlt size={20} /> {data?.match_info?.venue}
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-3 relative z-10">
            {[
              { id: 'overview', label: 'Match Info' },
              { id: 'h2h', label: 'Head to Head' },
              { id: 'venue', label: 'Venue & Pitch' },
              { id: 'form', label: 'Form & Stats' } 
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-3 font-black text-xl uppercase rounded-lg border-2 transition-all cursor-pointer overflow-hidden ${
                  activeTab === tab.id 
                    ? 'bg-[#d4af37] text-black border-white shadow-[0_0_20px_rgba(212,175,55,0.7)] scale-105' 
                    : 'bg-[#13233f] text-white border-gray-500 hover:border-gray-300'
                }`}
                style={{ fontFamily: 'Oswald, sans-serif' }}
              >
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTabBg" className="absolute inset-0 bg-white/20 pointer-events-none" />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-1 p-8 overflow-y-auto bg-[#0a1628] flex flex-col gap-6 relative">
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-[#d4af37] text-5xl font-black animate-pulse uppercase tracking-widest" style={{ fontFamily: 'Oswald, sans-serif' }}>
                Loading Venue & Match Data...
              </span>
            </div>
          ) : data ? (
            <AnimatePresence mode="wait">
              
              {/* TAB 1: MATCH INFO & OVERVIEW */}
              {activeTab === 'overview' && (
                <motion.div key="overview" variants={tabContentVariant} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  {/* Match Info Banner */}
                  <motion.div variants={cardVariant} className="bg-[#112240] border-[2px] border-gray-700 p-8 rounded-xl shadow-lg flex flex-col gap-5">
                    <h3 className="text-[#d4af37] text-3xl font-black uppercase tracking-widest" style={{ fontFamily: 'Oswald, sans-serif' }}>
                      Match Overview
                    </h3>
                    <div className="text-gray-200 text-lg mb-2">{data.match_info?.title}</div>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="flex items-center gap-5 bg-[#0a1628] p-5 rounded-lg border border-gray-700">
                        <FaCalendarAlt className="text-[#d4af37] text-4xl" />
                        <div>
                          <div className="text-gray-300 text-sm font-bold uppercase tracking-wider mb-1">Date & Time</div>
                          <div className="text-white font-bold text-2xl">{data.match_info?.date_time}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 bg-[#0a1628] p-5 rounded-lg border border-gray-700">
                        <FaMapMarkerAlt className="text-[#d4af37] text-4xl" />
                        <div>
                          <div className="text-gray-300 text-sm font-bold uppercase tracking-wider mb-1">Venue</div>
                          <div className="text-white font-bold text-2xl truncate w-[320px]">{data.match_info?.venue}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 bg-[#0a1628] p-5 rounded-lg border border-gray-700">
                        <FaTv className="text-[#d4af37] text-4xl" />
                        <div>
                          <div className="text-gray-300 text-sm font-bold uppercase tracking-wider mb-1">Subscribe</div>
                          <div className="text-white font-bold text-2xl">For Commentaries</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Weather & Pitch Report Card */}
                  <div className="grid grid-cols-2 gap-6">
                    <motion.div variants={cardVariant} className="bg-[#112240] border-[2px] border-gray-700 p-8 rounded-xl shadow-lg flex flex-col justify-between">
                      <div>
                        <h3 className="text-[#d4af37] text-3xl font-black uppercase tracking-widest mb-4 flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
                          <motion.div animate={{ y: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}>
                            <FaCloudSun size={35} />
                          </motion.div>
                           Weather Conditions
                        </h3>
                        <div className="flex items-center justify-between bg-[#0a1628] p-6 rounded-lg border border-gray-700 my-4">
                          <div>
                            <div className="text-white text-5xl font-black mb-2">{data.weather?.temp}</div>
                            <div className="text-[#d4af37] text-2xl font-bold">{data.weather?.condition}</div>
                          </div>
                          <div className="text-right space-y-2">
                            <div className="text-gray-200 text-lg">Humidity: <b className="text-white">{data.weather?.humidity}</b></div>
                            <div className="text-gray-200 text-lg">Rain Chance: <b className="text-white">{data.weather?.rain_chance}</b></div>
                            <div className="text-gray-200 text-lg">{data.weather?.wind_speed}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div variants={cardVariant} className="bg-[#112240] border-[2px] border-gray-700 p-8 rounded-xl shadow-lg flex flex-col justify-between">
                      <div>
                        <h3 className="text-[#d4af37] text-3xl font-black uppercase tracking-widest mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>
                          Pitch Report Summary
                        </h3>
                        <p className="text-gray-100 text-xl leading-relaxed bg-[#0a1628] p-6 rounded-lg border border-gray-700 h-[170px] overflow-y-auto">
                          <span className="font-bold text-white block mb-2">{data.pitch_report?.summary}</span> 
                          <span className="text-gray-300">{data.pitch_report?.text}</span>
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Match Officials */}
                  <motion.div variants={cardVariant} className="bg-[#112240] border-[2px] border-gray-700 p-8 rounded-xl shadow-lg">
                    <h3 className="text-[#d4af37] text-2xl font-black uppercase tracking-widest mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>
                      Match Officials
                    </h3>
                    <div className="grid grid-cols-3 gap-6 text-white">
                      <div className="bg-[#0a1628] p-5 rounded-lg border border-gray-700">
                        <span className="text-gray-300 text-sm font-bold block uppercase mb-1">On-Field Umpires</span>
                        <span className="font-bold text-2xl">{data.umpires?.on_field}</span>
                      </div>
                      <div className="bg-[#0a1628] p-5 rounded-lg border border-gray-700">
                        <span className="text-gray-300 text-sm font-bold block uppercase mb-1">Third Umpire</span>
                        <span className="font-bold text-2xl">{data.umpires?.third_umpire}</span>
                      </div>
                      <div className="bg-[#0a1628] p-5 rounded-lg border border-gray-700">
                        <span className="text-gray-300 text-sm font-bold block uppercase mb-1">Match Referee</span>
                        <span className="font-bold text-2xl">{data.umpires?.referee}</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* TAB 2: HEAD TO HEAD */}
              {activeTab === 'h2h' && (
                <motion.div key="h2h" variants={tabContentVariant} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                  {/* Summary Box */}
                  <motion.div variants={cardVariant} className="bg-[#112240] border-[3px] border-[#d4af37] p-8 rounded-xl shadow-lg text-center">
                    <div className="text-gray-300 text-lg font-bold uppercase tracking-widest mb-2">Head to Head Record (Overall)</div>
                    <div className="text-white text-7xl font-black tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>
                      {data.head_to_head?.summary}
                    </div>
                  </motion.div>

                  {/* Matches List */}
                  <div className="space-y-4">
                    <h3 className="text-[#d4af37] text-2xl font-black uppercase tracking-widest" style={{ fontFamily: 'Oswald, sans-serif' }}>Previous Encounters</h3>
                    {data.head_to_head?.matches?.map((match, idx) => (
                      <motion.div 
                        key={idx}
                        variants={cardVariant}
                        className="bg-[#112240] border-[2px] border-gray-700 p-6 rounded-xl flex items-center justify-between shadow-md"
                      >
                        <div className="text-gray-200 text-lg font-bold w-[150px]">{match.date}</div>
                        <div className="text-yellow-400 font-extrabold text-2xl uppercase flex-1 text-center">{match.result}</div>
                        <div className="flex gap-6 text-white text-xl w-[450px] justify-end">
                          <span className="bg-[#0a1628] px-4 py-2 rounded-lg border border-gray-600">{match.team1}: <b className="text-[#d4af37]">{match.team1_score}</b></span>
                          <span className="bg-[#0a1628] px-4 py-2 rounded-lg border border-gray-600">{match.team2}: <b className="text-[#d4af37]">{match.team2_score}</b></span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: VENUE & PITCH STATS */}
              {activeTab === 'venue' && (
                <motion.div key="venue" variants={tabContentVariant} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Venue Stats Card */}
                    <motion.div variants={cardVariant} className="bg-[#112240] border-[2px] border-gray-700 p-8 rounded-xl shadow-lg flex flex-col justify-between">
                      <h3 className="text-[#d4af37] text-3xl font-black uppercase tracking-widest mb-6" style={{ fontFamily: 'Oswald, sans-serif' }}>
                        Venue Statistics <span className="text-xl font-normal text-gray-400">({data.venue_stats?.total_matches} Matches)</span>
                      </h3>
                      <div className="space-y-5">
                        <div className="flex justify-between items-center bg-[#0a1628] p-5 rounded-lg border border-gray-700">
                          <span className="text-gray-200 text-xl font-bold">Avg 1st Innings Score</span>
                          <span className="text-white text-3xl font-black">{data.venue_stats?.avg_1st_inn}</span>
                        </div>
                        <div className="flex justify-between items-center bg-[#0a1628] p-5 rounded-lg border border-gray-700">
                          <span className="text-gray-200 text-xl font-bold">Avg 2nd Innings Score</span>
                          <span className="text-white text-3xl font-black">{data.venue_stats?.avg_2nd_inn}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-3">
                          <div className="bg-[#0a1628] p-5 rounded-lg text-center border border-gray-700">
                            <div className="text-gray-300 text-sm uppercase font-bold mb-1">Win Bat First</div>
                            <div className="text-green-400 text-3xl font-black">{data.venue_stats?.win_bat_first}</div>
                          </div>
                          <div className="bg-[#0a1628] p-5 rounded-lg text-center border border-gray-700">
                            <div className="text-gray-300 text-sm uppercase font-bold mb-1">Win Bowl First</div>
                            <div className="text-blue-400 text-3xl font-black">{data.venue_stats?.win_bowl_first}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Pace vs Spin Graph/Bar Card */}
                    <motion.div variants={cardVariant} className="bg-[#112240] border-[2px] border-gray-700 p-8 rounded-xl shadow-lg flex flex-col justify-between">
                      <h3 className="text-[#d4af37] text-3xl font-black uppercase tracking-widest mb-6" style={{ fontFamily: 'Oswald, sans-serif' }}>
                        Pace vs Spin Wickets
                      </h3>
                      <div className="space-y-8 my-auto">
                        <div className="space-y-3">
                          <div className="flex justify-between text-white text-2xl font-bold">
                            <span>Pace ({data.pace_vs_spin?.pace_percentage})</span>
                            <span className="text-green-400">{data.pace_vs_spin?.pace_wickets}</span>
                          </div>
                          <div className="w-full bg-gray-800 h-8 rounded-full overflow-hidden border border-gray-600">
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: data.pace_vs_spin?.pace_percentage }}
                              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                              className="bg-green-500 h-full rounded-full" 
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-white text-2xl font-bold">
                            <span>Spin ({data.pace_vs_spin?.spin_percentage})</span>
                            <span className="text-blue-400">{data.pace_vs_spin?.spin_wickets}</span>
                          </div>
                          <div className="w-full bg-gray-800 h-8 rounded-full overflow-hidden border border-gray-600">
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: data.pace_vs_spin?.spin_percentage }}
                              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                              className="bg-blue-500 h-full rounded-full" 
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Venue Records */}
                  <motion.div variants={cardVariant} className="bg-[#112240] border-[2px] border-gray-700 p-8 rounded-xl shadow-lg">
                    <h3 className="text-[#d4af37] text-2xl font-black uppercase tracking-widest mb-5" style={{ fontFamily: 'Oswald, sans-serif' }}>Venue Records</h3>
                    <div className="grid grid-cols-3 gap-6 text-white">
                      <div className="bg-[#0a1628] p-6 rounded-lg border border-gray-700">
                        <div className="text-gray-300 text-sm uppercase font-bold mb-2">Highest Total</div>
                        <div className="text-2xl font-black text-yellow-300">{data.venue_stats?.highest_total}</div>
                      </div>
                      <div className="bg-[#0a1628] p-6 rounded-lg border border-gray-700">
                        <div className="text-gray-300 text-sm uppercase font-bold mb-2">Lowest Total</div>
                        <div className="text-2xl font-black text-red-400">{data.venue_stats?.lowest_total}</div>
                      </div>
                      <div className="bg-[#0a1628] p-6 rounded-lg border border-gray-700">
                        <div className="text-gray-300 text-sm uppercase font-bold mb-2">Highest Chased</div>
                        <div className="text-2xl font-black text-green-400 truncate">{data.venue_stats?.highest_chased}</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Recent Matches at Venue */}
                  <motion.div variants={cardVariant} className="bg-[#112240] border-[2px] border-gray-700 p-8 rounded-xl shadow-lg">
                    <h3 className="text-[#d4af37] text-2xl font-black uppercase tracking-widest mb-5" style={{ fontFamily: 'Oswald, sans-serif' }}>Recent Matches at Venue</h3>
                    <div className="space-y-4">
                      {data.recent_matches_at_venue?.map((match, idx) => (
                        <div key={idx} className="bg-[#0a1628] border border-gray-700 p-4 rounded-xl flex items-center justify-between">
                          <div className="text-gray-300 text-lg font-bold w-[150px]">{match.date}</div>
                          <div className="text-yellow-400 font-extrabold text-xl uppercase flex-1 text-center">{match.result}</div>
                          <div className="flex gap-4 text-white text-lg w-[420px] justify-end">
                            <span className="bg-[#112240] px-3 py-2 rounded-lg border border-gray-600">{match.team1}: <b className="text-[#d4af37]">{match.team1_score}</b></span>
                            <span className="bg-[#112240] px-3 py-2 rounded-lg border border-gray-600">{match.team2}: <b className="text-[#d4af37]">{match.team2_score}</b></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                </motion.div>
              )}

              {/* TAB 4: FORM & STATS */}
              {activeTab === 'form' && (
                <motion.div key="form" variants={tabContentVariant} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  
                  {/* Top Row: Form & Points Table */}
                  <div className="grid grid-cols-2 gap-6">
                    
                    {/* Team Form */}
                    <div className="bg-[#112240] border-[2px] border-gray-700 p-8 rounded-xl shadow-lg space-y-6 flex flex-col justify-center">
                      <h3 className="text-[#d4af37] text-3xl font-black uppercase tracking-widest" style={{ fontFamily: 'Oswald, sans-serif' }}>
                        Recent Form
                      </h3>

                      <motion.div variants={cardVariant} className="flex items-center justify-between bg-[#0a1628] p-5 rounded-xl border border-gray-700">
                        <div>
                          <span className="text-white text-2xl font-black uppercase" style={{ fontFamily: 'Oswald, sans-serif' }}>Team 1</span>
                          <span className="text-gray-300 block text-base mt-1 font-bold">String: {data.team_form?.team1_form}</span>
                        </div>
                        <div className="flex gap-3">
                          {data.team_form?.team1_detailed?.filter(res => res !== '*').map((res, i) => (
                            <motion.div key={`t1-${i}`} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, delay: i * 0.1 }}
                              className={`w-12 h-12 rounded-lg flex items-center justify-center font-black text-xl text-white shadow-lg ${res === 'W' ? 'bg-green-600' : 'bg-red-600'}`}
                            >
                              {res}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>

                      <motion.div variants={cardVariant} className="flex items-center justify-between bg-[#0a1628] p-5 rounded-xl border border-gray-700">
                        <div>
                          <span className="text-white text-2xl font-black uppercase" style={{ fontFamily: 'Oswald, sans-serif' }}>Team 2</span>
                          <span className="text-gray-300 block text-base mt-1 font-bold">String: {data.team_form?.team2_form}</span>
                        </div>
                        <div className="flex gap-3">
                          {data.team_form?.team2_detailed?.filter(res => res !== '*').map((res, i) => (
                            <motion.div key={`t2-${i}`} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.3 + (i * 0.1) }}
                              className={`w-12 h-12 rounded-lg flex items-center justify-center font-black text-xl text-white shadow-lg ${res === 'W' ? 'bg-green-600' : 'bg-red-600'}`}
                            >
                              {res}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </div>

                    {/* Points Table */}
                    <div className="bg-[#112240] border-[2px] border-gray-700 p-8 rounded-xl shadow-lg">
                      <h3 className="text-[#d4af37] text-3xl font-black uppercase tracking-widest mb-6" style={{ fontFamily: 'Oswald, sans-serif' }}>
                        Points Table
                      </h3>
                      {data.points_table && data.points_table.length > 0 ? (
                        <div className="overflow-hidden rounded-xl border-2 border-gray-700">
                          <table className="w-full text-left text-lg text-white">
                            <thead className="bg-[#0a1628] text-gray-300 font-black uppercase text-base">
                              <tr>
                                <th className="px-5 py-4 border-b border-gray-700">Rank</th>
                                <th className="px-5 py-4 border-b border-gray-700">Team</th>
                                <th className="px-5 py-4 border-b border-gray-700">P</th>
                                <th className="px-5 py-4 border-b border-gray-700">W</th>
                                <th className="px-5 py-4 border-b border-gray-700">L</th>
                                <th className="px-5 py-4 border-b border-gray-700">Pts</th>
                                <th className="px-5 py-4 border-b border-gray-700">NRR</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.points_table.map((team, idx) => (
                                <tr key={idx} className="border-b border-gray-700 bg-[#112240] hover:bg-[#1a2b50] transition-colors last:border-0">
                                  <td className="px-5 py-4 font-black">{team.rank}</td>
                                  <td className="px-5 py-4 font-bold text-[#d4af37] text-xl">{team.team_id}</td>
                                  <td className="px-5 py-4">{team.P}</td>
                                  <td className="px-5 py-4 text-green-400 font-bold">{team.W}</td>
                                  <td className="px-5 py-4 text-red-400 font-bold">{team.L}</td>
                                  <td className="px-5 py-4 font-black text-2xl">{team.Pts}</td>
                                  <td className="px-5 py-4">{team.NRR}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-gray-300 italic text-lg">Points table not available for this series.</div>
                      )}
                    </div>
                  </div>

                  {/* Team Comparisons */}
                  {data.team_comparison && (
                    <motion.div variants={cardVariant} className="bg-[#112240] border-[2px] border-gray-700 p-8 rounded-xl shadow-lg">
                      <h3 className="text-[#d4af37] text-3xl font-black uppercase tracking-widest mb-6" style={{ fontFamily: 'Oswald, sans-serif' }}>
                        Team Statistical Comparison
                      </h3>
                      <div className="grid grid-cols-2 gap-10">
                        
                        {/* Overall Comparison */}
                        <div>
                          <h4 className="text-white text-xl font-black mb-4 bg-[#0a1628] p-3 rounded-lg text-center border border-gray-700">Overall (Last 10 Matches)</h4>
                          <div className="space-y-4">
                            {data.team_comparison.overall?.map((team, idx) => (
                              <div key={`overall-${idx}`} className="p-5 bg-[#0a1628] border border-gray-700 rounded-xl">
                                <div className="flex justify-between items-end mb-3 border-b border-gray-600 pb-3">
                                  <span className="font-black text-3xl text-[#d4af37]">{team.team_id}</span> 
                                  <span className="text-green-400 font-bold text-xl">{team.wins} Wins <span className="text-gray-400 text-sm">/ {team.matches_played}M</span></span>
                                </div>
                                <div className="text-lg text-white grid grid-cols-3 gap-3 text-center">
                                  <div className="bg-[#112240] p-3 rounded-lg font-bold"><span className="block text-gray-300 text-sm uppercase mb-1">Avg</span>{team.avg_score}</div>
                                  <div className="bg-[#112240] p-3 rounded-lg font-bold"><span className="block text-gray-300 text-sm uppercase mb-1">High</span>{team.highest_score}</div>
                                  <div className="bg-[#112240] p-3 rounded-lg font-bold"><span className="block text-gray-300 text-sm uppercase mb-1">Low</span>{team.lowest_score}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* On Venue Comparison */}
                        <div>
                          <h4 className="text-white text-xl font-black mb-4 bg-[#0a1628] p-3 rounded-lg text-center border border-gray-700">Performance at this Venue</h4>
                          <div className="space-y-4">
                            {data.team_comparison.on_venue?.map((team, idx) => (
                              <div key={`venue-${idx}`} className="p-5 bg-[#0a1628] border border-gray-700 rounded-xl">
                                <div className="flex justify-between items-end mb-3 border-b border-gray-600 pb-3">
                                  <span className="font-black text-3xl text-[#d4af37]">{team.team_id}</span> 
                                  <span className="text-green-400 font-bold text-xl">{team.wins} Wins <span className="text-gray-400 text-sm">/ {team.matches_played}M</span></span>
                                </div>
                                <div className="text-lg text-white grid grid-cols-3 gap-3 text-center">
                                  <div className="bg-[#112240] p-3 rounded-lg font-bold"><span className="block text-gray-300 text-sm uppercase mb-1">Avg</span>{team.avg_score}</div>
                                  <div className="bg-[#112240] p-3 rounded-lg font-bold"><span className="block text-gray-300 text-sm uppercase mb-1">High</span>{team.highest_score}</div>
                                  <div className="bg-[#112240] p-3 rounded-lg font-bold"><span className="block text-gray-300 text-sm uppercase mb-1">Low</span>{team.lowest_score}</div>
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
              <span className="text-red-400 text-4xl font-bold uppercase tracking-wide">Failed to load venue data.</span>
            </div>
          )}

        </div>
      </motion.div>
    </motion.div>
  );
};

export default VenueInfoMatchDetails;