import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloseSharp } from "react-icons/io5";
import { FaCloudSun, FaMapMarkerAlt, FaCalendarAlt, FaTv } from "react-icons/fa";
import api from '../api/cricketApi'; // ⚠️ Ensure this points to your Axios instance

let cachedVenueData = null;

// Reusable animation variants to keep the code clean and prevent layout shifts
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
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'h2h' | 'venue' | 'form'

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
    // if (cachedVenueData) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/get_venue_info');
        if (response.data) {
          cachedVenueData = response.data;
          setData(response.data);
          console.log("Fetched venue & match details:", response.data);
        }
      } catch (error) {
        console.error("Error fetching venue & match details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        className="w-[1500px] h-[850px] bg-[#071124] border-[6px] border-[#d4af37] shadow-[0_35px_90px_rgba(0,0,0,0.95)] flex flex-col relative overflow-hidden rounded-xl font-sans"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-40 w-[55px] h-[55px] bg-red-600 border-[3px] border-white flex items-center justify-center hover:bg-red-500 shadow-2xl cursor-pointer rounded-lg transition-colors"
        >
          <IoCloseSharp size={42} color="white" />
        </button>

        {/* --- TOP HEADER & NAVIGATION TABS --- */}
        <div className="h-[85px] bg-gradient-to-r from-[#0d1b33] via-[#1a2b50] to-[#0d1b33] border-b-[5px] border-[#d4af37] flex items-center justify-between px-8 pr-24 relative overflow-hidden">
          
          {/* Very lightweight shine effect on header (no layout shift) */}
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shine_4s_infinite_linear]" style={{ backgroundSize: '200% 100%' }} />

          <style>{`
            @keyframes shine {
              0% { transform: translateX(-100%) skewX(-15deg); }
              100% { transform: translateX(200%) skewX(-15deg); }
            }
          `}</style>

          <div className="flex flex-col relative z-10">
            <h2 className="text-white font-black text-3xl uppercase tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>
              {data?.match_info?.series || "MATCH & VENUE DETAILS"}
            </h2>
            <span className="text-[#d4af37] text-sm font-bold flex items-center gap-2">
              <FaMapMarkerAlt /> {data?.match_info?.venue}
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 relative z-10">
            {[
              { id: 'overview', label: 'Match Info' },
              { id: 'h2h', label: 'Head to Head' },
              { id: 'venue', label: 'Venue & Pitch' },
              { id: 'form', label: 'Team Form' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-2 font-black text-lg uppercase rounded-lg border-2 transition-all cursor-pointer overflow-hidden ${
                  activeTab === tab.id 
                    ? 'bg-[#d4af37] text-black border-white shadow-[0_0_20px_rgba(212,175,55,0.7)] scale-105' 
                    : 'bg-[#13233f] text-white border-gray-600 hover:border-gray-300'
                }`}
                style={{ fontFamily: 'Oswald, sans-serif' }}
              >
                {/* Active Tab indicator animation */}
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
              <span className="text-[#d4af37] text-4xl font-black animate-pulse uppercase tracking-widest" style={{ fontFamily: 'Oswald, sans-serif' }}>
                Loading Venue & Match Data...
              </span>
            </div>
          ) : data ? (
            <AnimatePresence mode="wait">
              {/* TAB 1: MATCH INFO & OVERVIEW */}
              {activeTab === 'overview' && (
                <motion.div key="overview" variants={tabContentVariant} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  {/* Match Info Banner */}
                  <motion.div variants={cardVariant} className="bg-[#112240] border-[2px] border-gray-700 p-6 rounded-xl shadow-lg flex flex-col gap-4">
                    <h3 className="text-[#d4af37] text-2xl font-black uppercase tracking-widest" style={{ fontFamily: 'Oswald, sans-serif' }}>
                      Match Overview
                    </h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="flex items-center gap-4 bg-[#0a1628] p-4 rounded-lg border border-gray-800">
                        <FaCalendarAlt className="text-[#d4af37] text-3xl" />
                        <div>
                          <div className="text-gray-400 text-xs font-bold uppercase">Date & Time</div>
                          <div className="text-white font-bold text-lg">{data.match_info?.date_time}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-[#0a1628] p-4 rounded-lg border border-gray-800">
                        <FaMapMarkerAlt className="text-[#d4af37] text-3xl" />
                        <div>
                          <div className="text-gray-400 text-xs font-bold uppercase">Venue</div>
                          <div className="text-white font-bold text-lg">{data.match_info?.venue}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-[#0a1628] p-4 rounded-lg border border-gray-800">
                        <FaTv className="text-[#d4af37] text-3xl" />
                        <div>
                          <div className="text-gray-400 text-xs font-bold uppercase">Subscribe</div>
                          <div className="text-white font-bold text-lg">Get Live Updates</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Weather & Pitch Report Card */}
                  <div className="grid grid-cols-2 gap-6">
                    <motion.div variants={cardVariant} className="bg-[#112240] border-[2px] border-gray-700 p-6 rounded-xl shadow-lg flex flex-col justify-between">
                      <div>
                        <h3 className="text-[#d4af37] text-2xl font-black uppercase tracking-widest mb-3 flex items-center gap-2" style={{ fontFamily: 'Oswald, sans-serif' }}>
                          <motion.div animate={{ y: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}>
                            <FaCloudSun />
                          </motion.div>
                           Weather Conditions
                        </h3>
                        <div className="flex items-center justify-between bg-[#0a1628] p-4 rounded-lg border border-gray-800 my-3">
                          <div>
                            <div className="text-white text-3xl font-black">{data.weather?.temp}</div>
                            <div className="text-[#d4af37] font-bold">{data.weather?.condition}</div>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="text-gray-300 text-sm">Humidity: <b>{data.weather?.humidity}</b></div>
                            <div className="text-gray-300 text-sm">Rain Chance: <b>{data.weather?.rain_chance}</b></div>
                            <div className="text-gray-300 text-sm">{data.weather?.wind_speed}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div variants={cardVariant} className="bg-[#112240] border-[2px] border-gray-700 p-6 rounded-xl shadow-lg flex flex-col justify-between">
                      <div>
                        <h3 className="text-[#d4af37] text-2xl font-black uppercase tracking-widest mb-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
                          Pitch Report Summary
                        </h3>
                        <p className="text-gray-200 text-base leading-relaxed bg-[#0a1628] p-4 rounded-lg border border-gray-800">
                          {data.pitch_report?.summary} || {data.pitch_report?.text}
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Match Officials */}
                  <motion.div variants={cardVariant} className="bg-[#112240] border-[2px] border-gray-700 p-6 rounded-xl shadow-lg">
                    <h3 className="text-[#d4af37] text-xl font-black uppercase tracking-widest mb-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
                      Match Officials
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-white">
                      <div className="bg-[#0a1628] p-3 rounded border border-gray-800">
                        <span className="text-gray-400 text-xs block uppercase">On-Field Umpires</span>
                        <span className="font-bold text-lg">{data.umpires?.on_field}</span>
                      </div>
                      <div className="bg-[#0a1628] p-3 rounded border border-gray-800">
                        <span className="text-gray-400 text-xs block uppercase">Third Umpire</span>
                        <span className="font-bold text-lg">{data.umpires?.third_umpire}</span>
                      </div>
                      <div className="bg-[#0a1628] p-3 rounded border border-gray-800">
                        <span className="text-gray-400 text-xs block uppercase">Match Referee</span>
                        <span className="font-bold text-lg">{data.umpires?.referee}</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* TAB 2: HEAD TO HEAD */}
              {activeTab === 'h2h' && (
                <motion.div key="h2h" variants={tabContentVariant} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  {/* Summary Box */}
                  <motion.div variants={cardVariant} className="bg-[#112240] border-[2px] border-[#d4af37] p-6 rounded-xl shadow-lg text-center">
                    <div className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Head to Head Record (Last Matches)</div>
                    <div className="text-white text-5xl font-black tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>
                      {data.head_to_head?.summary}
                    </div>
                  </motion.div>

                  {/* Matches List */}
                  <div className="space-y-3">
                    <h3 className="text-[#d4af37] text-xl font-black uppercase tracking-widest" style={{ fontFamily: 'Oswald, sans-serif' }}>Previous Encounters</h3>
                    {data.head_to_head?.matches?.map((match, idx) => (
                      <motion.div 
                        key={idx}
                        variants={cardVariant}
                        className="bg-[#112240] border border-gray-700 p-4 rounded-xl flex items-center justify-between shadow"
                      >
                        <div className="text-gray-400 text-sm font-bold">{match.date}</div>
                        <div className="text-yellow-400 font-extrabold text-lg uppercase">{match.result}</div>
                        <div className="flex gap-6 text-white font-bold">
                          <span>Team 1 Score: <b className="text-[#d4af37]">{match.team1_score}</b></span>
                          <span>Team 2 Score: <b className="text-[#d4af37]">{match.team2_score}</b></span>
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
                    <motion.div variants={cardVariant} className="bg-[#112240] border-[2px] border-gray-700 p-6 rounded-xl shadow-lg flex flex-col justify-between">
                      <h3 className="text-[#d4af37] text-2xl font-black uppercase tracking-widest mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>
                        Venue Statistics ({data.venue_stats?.total_matches} Matches)
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-[#0a1628] p-3 rounded border border-gray-800">
                          <span className="text-gray-300 font-bold">Avg 1st Innings Score</span>
                          <span className="text-white text-2xl font-black">{data.venue_stats?.avg_1st_inn}</span>
                        </div>
                        <div className="flex justify-between items-center bg-[#0a1628] p-3 rounded border border-gray-800">
                          <span className="text-gray-300 font-bold">Avg 2nd Innings Score</span>
                          <span className="text-white text-2xl font-black">{data.venue_stats?.avg_2nd_inn}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div className="bg-[#0a1628] p-3 rounded text-center border border-gray-800">
                            <div className="text-gray-400 text-xs uppercase font-bold">Win Bat First</div>
                            <div className="text-green-400 text-2xl font-black">{data.venue_stats?.win_bat_first}</div>
                          </div>
                          <div className="bg-[#0a1628] p-3 rounded text-center border border-gray-800">
                            <div className="text-gray-400 text-xs uppercase font-bold">Win Bowl First</div>
                            <div className="text-blue-400 text-2xl font-black">{data.venue_stats?.win_bowl_first}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Pace vs Spin Graph/Bar Card */}
                    <motion.div variants={cardVariant} className="bg-[#112240] border-[2px] border-gray-700 p-6 rounded-xl shadow-lg flex flex-col justify-between">
                      <h3 className="text-[#d4af37] text-2xl font-black uppercase tracking-widest mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>
                        Pace vs Spin Wickets
                      </h3>
                      <div className="space-y-6 my-auto">
                        <div className="space-y-2">
                          <div className="flex justify-between text-white font-bold">
                            <span>Pace ({data.pace_vs_spin?.pace_percentage})</span>
                            <span className="text-green-400">{data.pace_vs_spin?.pace_wickets}</span>
                          </div>
                          <div className="w-full bg-gray-800 h-5 rounded-full overflow-hidden border border-gray-600">
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: data.pace_vs_spin?.pace_percentage }}
                              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                              className="bg-green-500 h-full rounded-full" 
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-white font-bold">
                            <span>Spin ({data.pace_vs_spin?.spin_percentage})</span>
                            <span className="text-blue-400">{data.pace_vs_spin?.spin_wickets}</span>
                          </div>
                          <div className="w-full bg-gray-800 h-5 rounded-full overflow-hidden border border-gray-600">
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
                  <motion.div variants={cardVariant} className="bg-[#112240] border-[2px] border-gray-700 p-6 rounded-xl shadow-lg">
                    <h3 className="text-[#d4af37] text-xl font-black uppercase tracking-widest mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>Venue Records</h3>
                    <div className="grid grid-cols-3 gap-4 text-white">
                      <div className="bg-[#0a1628] p-4 rounded border border-gray-800">
                        <div className="text-gray-400 text-xs uppercase font-bold">Highest Total</div>
                        <div className="text-xl font-black text-yellow-300 mt-1">{data.venue_stats?.highest_total}</div>
                      </div>
                      <div className="bg-[#0a1628] p-4 rounded border border-gray-800">
                        <div className="text-gray-400 text-xs uppercase font-bold">Lowest Total</div>
                        <div className="text-xl font-black text-red-400 mt-1">{data.venue_stats?.lowest_total}</div>
                      </div>
                      <div className="bg-[#0a1628] p-4 rounded border border-gray-800">
                        <div className="text-gray-400 text-xs uppercase font-bold">Highest Chased</div>
                        <div className="text-xl font-black text-green-400 mt-1">{data.venue_stats?.highest_chased}</div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* TAB 4: TEAM FORM */}
              {activeTab === 'form' && (
                <motion.div key="form" variants={tabContentVariant} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <div className="bg-[#112240] border-[2px] border-gray-700 p-6 rounded-xl shadow-lg space-y-6">
                    <h3 className="text-[#d4af37] text-2xl font-black uppercase tracking-widest" style={{ fontFamily: 'Oswald, sans-serif' }}>
                      Recent Team Form (Last Matches)
                    </h3>

                    {/* Team 1 Form */}
                    <motion.div variants={cardVariant} className="flex items-center justify-between bg-[#0a1628] p-4 rounded-xl border border-gray-800">
                      <div>
                        <span className="text-white text-2xl font-black uppercase" style={{ fontFamily: 'Oswald, sans-serif' }}>Southern Brave</span>
                        <span className="text-gray-400 block text-xs">Form String: {data.team_form?.team1_form}</span>
                      </div>
                      <div className="flex gap-2">
                        {data.team_form?.team1_detailed?.filter(res => res !== '*').map((res, i) => (
                          <motion.div 
                            key={`t1-${i}`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: i * 0.1 }}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg text-white shadow ${
                              res === 'W' ? 'bg-green-600' : 'bg-red-600'
                            }`}
                          >
                            {res}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Team 2 Form */}
                    <motion.div variants={cardVariant} className="flex items-center justify-between bg-[#0a1628] p-4 rounded-xl border border-gray-800">
                      <div>
                        <span className="text-white text-2xl font-black uppercase" style={{ fontFamily: 'Oswald, sans-serif' }}>Welsh Fire</span>
                        <span className="text-gray-400 block text-xs">Form String: {data.team_form?.team2_form}</span>
                      </div>
                      <div className="flex gap-2">
                        {data.team_form?.team2_detailed?.filter(res => res !== '*').map((res, i) => (
                          <motion.div 
                            key={`t2-${i}`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.3 + (i * 0.1) }}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg text-white shadow ${
                              res === 'W' ? 'bg-green-600' : 'bg-red-600'
                            }`}
                          >
                            {res}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-red-400 text-3xl font-bold uppercase tracking-wide">Failed to load venue data.</span>
            </div>
          )}

        </div>
      </motion.div>
    </motion.div>
  );
};

export default VenueInfoMatchDetails;