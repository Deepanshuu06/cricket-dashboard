import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoCloseSharp } from "react-icons/io5";
import { FaLink, FaSyncAlt, FaTrophy, FaListOl, FaUsers, FaCalendarAlt } from "react-icons/fa";
import axios from "axios";
import PlayerStats from "./PlayerStats";

const BASE_API_URL = "https://cricket-series-scraper.onrender.com/api/seriesstats?series_url=";
const STORAGE_KEY = "saved_series_url";

const tabContentVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -30, transition: { duration: 0.2 } },
};

const SeriesStatsModal = ({ onClose }) => {
  const [seriesUrl, setSeriesUrl] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("key_stats");
  const [selectedSquadTeam, setSelectedSquadTeam] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (selectedPlayer) setSelectedPlayer(null);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, selectedPlayer]);

  useEffect(() => {
    const savedUrl = localStorage.getItem(STORAGE_KEY);
    if (savedUrl) {
      setSeriesUrl(savedUrl);
      fetchSeriesData(savedUrl);
    }
  }, []);

  const fetchSeriesData = async (urlToFetch) => {
    setLoading(true);
    setError(null);
    try {
      const fullUrl = `${BASE_API_URL}${encodeURIComponent(urlToFetch)}`;
      const response = await axios.get(fullUrl);

      if (response.data && response.data.success && response.data.data) {
        setData(response.data.data);
        localStorage.setItem(STORAGE_KEY, urlToFetch);
        setSeriesUrl(urlToFetch);

        const squadTeams = Object.keys(response.data.data.squads || {});
        if (squadTeams.length > 0) {
          setSelectedSquadTeam(squadTeams[0]);
        }
      } else {
        setError("Failed to retrieve valid series data.");
      }
    } catch (err) {
      console.error("Error fetching series stats:", err);
      setError("Unable to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUrl = (e) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    fetchSeriesData(inputUrl.trim());
  };

  const handleResetLink = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSeriesUrl("");
    setData(null);
    setInputUrl("");
    setError(null);
  };

  const handleOpenPlayer = (playerData, roleTag, teamName) => {
    setSelectedPlayer({
      name: playerData.player || playerData.name,
      image: playerData.player_img,
      profile_url: playerData.profile_url,
      roleTag: roleTag,
      role: teamName,
      number: "",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center select-none"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 25 }}
        className="w-[1800px] h-[1000px] bg-gradient-to-br from-[#060d1b] to-[#0a1630] border-[6px] border-[#fbbf24] rounded-2xl flex flex-col relative overflow-hidden font-sans shadow-[0_0_80px_rgba(251,191,36,0.3)]"
      >
        {/* MASSIVE TOP NAVIGATION BAR */}
        <div className="h-[140px] flex items-center justify-between px-10 border-b-[6px] border-[#fbbf24] bg-[#040812]">
          {/* Header Title */}
          <div className="flex items-center gap-6">
            <FaTrophy className="text-[#fbbf24] text-[70px]" />
            <div className="flex flex-col leading-none">
              <span className="text-white font-black text-[55px] uppercase tracking-widest drop-shadow-lg" style={{ fontFamily: "Oswald, sans-serif" }}>
                {data?.series_info?.series_name?.split(" ").slice(0, 2).join(" ") || "SERIES"}
              </span>
              <span className="text-[#fbbf24] font-black text-[45px] uppercase tracking-widest drop-shadow-lg" style={{ fontFamily: "Oswald, sans-serif" }}>
                {data?.series_info?.series_name?.split(" ").slice(2).join(" ") || "STATS DASHBOARD"}
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          {data && (
            <div className="flex items-center gap-3">
              <div className="flex gap-4">
                {[
                  { id: "key_stats", label: "Key Stats", icon: FaTrophy },
                  { id: "points_table", label: "Points Table", icon: FaListOl },
                  { id: "series_info", label: "Matches", icon: FaCalendarAlt },
                  { id: "squads", label: "Squads", icon: FaUsers },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-5 py-2 font-black text-[16px] uppercase rounded-xl border-[4px] transition-all flex items-center gap-3 ${
                        isActive
                          ? "bg-[#fbbf24] text-black border-white shadow-[0_0_30px_rgba(251,191,36,0.6)] scale-105"
                          : "bg-[#0b162c] text-white border-[#1e2d4a] hover:border-[#fbbf24] hover:bg-[#112240]"
                      }`}
                      style={{ fontFamily: "Oswald, sans-serif" }}
                    >
                      <Icon size={28} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* HUGE Change Link Button */}
              <button
                onClick={handleResetLink}
                className="px-1 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black rounded-xl border-[4px] border-[#fca5a5] flex items-center gap-1 transition-all shadow-xl hover:scale-105 ml-6"
                style={{ fontFamily: "Oswald, sans-serif" }}
              >
                <FaSyncAlt size={18} />

              </button>

              {/* HUGE Close Button */}
              <button
                onClick={onClose}
                className="w-[45px] h-[45px] bg-[#dc2626] border-[4px] border-white rounded-xl flex items-center justify-center hover:bg-[#b91c1c] transition-all shadow-xl hover:scale-105 ml-2"
              >
                <IoCloseSharp size={55} color="white" />
              </button>
            </div>
          )}
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 p-10 overflow-y-auto relative z-10">
          
          {/* STEP 1: LINK INPUT SCREEN */}
          {!seriesUrl && !data && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center max-w-[1200px] mx-auto w-full text-center mt-20">
              <div className="p-10 bg-[#0b162c] rounded-full border-[8px] border-[#fbbf24] mb-10 text-[#fbbf24] shadow-[0_0_80px_rgba(251,191,36,0.4)]">
                <FaLink size={100} />
              </div>
              <h3 className="text-white text-[70px] font-black uppercase tracking-widest mb-6 drop-shadow-xl" style={{ fontFamily: "Oswald, sans-serif" }}>
                Connect Series Stats
              </h3>
              <form onSubmit={handleSubmitUrl} className="w-full flex gap-6 mt-10">
                <input
                  type="url"
                  required
                  placeholder="Series URL"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="flex-1 px-10 py-8 bg-[#040812] text-white border-[4px] border-[#1e2d4a] rounded-2xl text-[35px] focus:outline-none focus:border-[#fbbf24] font-bold shadow-inner"
                />
                <button
                  type="submit"
                  className="px-16 py-8 bg-[#fbbf24] hover:bg-[#eab308] text-black font-black text-[40px] uppercase rounded-2xl border-[4px] border-white transition-all shadow-[0_0_40px_rgba(251,191,36,0.6)] hover:scale-105"
                  style={{ fontFamily: "Oswald, sans-serif" }}
                >
                  Fetch Data
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: LOADING */}
          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center h-full">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="w-[150px] h-[150px] border-[10px] border-[#fbbf24] border-t-transparent rounded-full mb-10 shadow-[0_0_50px_rgba(251,191,36,0.5)]" />
              <span className="text-[#fbbf24] text-[60px] font-black uppercase tracking-widest animate-pulse" style={{ fontFamily: "Oswald, sans-serif" }}>
                Series Data Loading..
              </span>
            </div>
          )}

          {/* STEP 3: DATA TABS */}
          {data && !loading && (
            <AnimatePresence mode="wait">
              
              {/* TAB 1: KEY STATS */}
              {activeTab === "key_stats" && (
                <motion.div key="key_stats" variants={tabContentVariant} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                  <h3 className="text-[#fbbf24] text-[50px] font-black uppercase tracking-widest mb-8 border-b-[4px] border-[#1e2d4a] pb-4 inline-block drop-shadow-md" style={{ fontFamily: "Oswald, sans-serif" }}>
                    Series Top Performers
                  </h3>

                  <div className="grid grid-cols-2 gap-10">
                    {[
                      { key: "most_runs", title: "Most Runs", valueKey: "runs", label: "Runs" },
                      { key: "most_wickets", title: "Most Wickets", valueKey: "wickets", label: "Wickets" },
                      { key: "highest_score", title: "Highest Score", valueKey: "score", label: "Score" },
                      { key: "best_bowling_figures", title: "Best Figures", valueKey: "figures", label: "Figures" },
                      { key: "best_strike_rate", title: "Best Strike Rate", valueKey: "strike_rate", label: "S/R" },
                      { key: "most_sixes", title: "Most Sixes", valueKey: "sixes", label: "Sixes" },
                      { key: "most_fours", title: "Most Fours", valueKey: "fours", label: "Fours" },
                    ].map((stat) => {
                      const item = data.key_stats?.[stat.key]?.[0];
                      if (!item) return null;

                      return (
                        <div
                          key={stat.key}
                          onClick={() => handleOpenPlayer(item, stat.title, item.team)}
                          className="bg-gradient-to-b from-[#112240] to-[#0a1428] border-[4px] border-[#1e2d4a] rounded-3xl p-8 flex flex-col justify-between cursor-pointer hover:border-[#fbbf24] hover:shadow-[0_0_40px_rgba(251,191,36,0.3)] transition-all group h-[290px]"
                        >
                          {/* Card Header */}
                          <div className="flex justify-between items-center mb-6 border-b-[3px] border-[#1e2d4a] pb-4">
                            <span className="text-[#fbbf24] font-black text-[30px] uppercase tracking-widest drop-shadow-md" style={{ fontFamily: "Oswald, sans-serif" }}>
                              {stat.title}
                            </span>
                            {item.team_logo && <img src={item.team_logo} alt={item.team} className="h-12 object-contain drop-shadow-lg" />}
                          </div>

                          {/* Player Info Row */}
                          <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                              <div className="w-[130px] h-[130px] rounded-full border-[4px] border-[#4b5563] group-hover:border-white overflow-hidden bg-[#040812] shadow-2xl transition-colors">
                                <img src={item.player_img} alt={item.player} className="w-full h-full object-cover object-top" />
                              </div>
                              <div className="flex flex-col w-[300px]">
                                <span className="text-white text-[38px] font-black leading-tight drop-shadow-md truncate">{item.player}</span>
                                <span className="text-gray-400 font-bold text-[22px] mt-1 truncate">{item.team}</span>
                              </div>
                            </div>

                            {/* Stat Value Box */}
                            <div className="bg-[#040812] border-[3px] border-[#1e2d4a] rounded-2xl px-6 py-4 flex flex-col items-center justify-center min-w-[140px] shadow-inner group-hover:border-[#fbbf24]/50 transition-colors">
                              <span className="text-gray-500 text-[18px] font-black uppercase tracking-widest leading-none mb-2">
                                {stat.label}
                              </span>
                              <span className="text-[#fbbf24] font-black text-[65px] leading-none drop-shadow-lg" style={{ fontFamily: "Oswald, sans-serif" }}>
                                {item[stat.valueKey]}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* TAB 2: POINTS TABLE */}
              {activeTab === "points_table" && (
                <motion.div key="points_table" variants={tabContentVariant} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                  <h3 className="text-[#fbbf24] text-[50px] font-black uppercase tracking-widest mb-8 border-b-[4px] border-[#1e2d4a] pb-4 inline-block drop-shadow-md" style={{ fontFamily: "Oswald, sans-serif" }}>
                    Points Table Standings
                  </h3>
                  {data.points_table && data.points_table.length > 0 ? (
                    <div className="overflow-hidden rounded-3xl border-[4px] border-[#1e2d4a] shadow-2xl">
                      <table className="w-full text-left">
                        <thead className="bg-[#0b162c] text-gray-400 font-black uppercase text-[28px] border-b-[4px] border-[#1e2d4a]">
                          <tr>
                            <th className="px-10 py-8">Rank</th>
                            <th className="px-10 py-8">Team</th>
                            <th className="px-10 py-8 text-center">M</th>
                            <th className="px-10 py-8 text-center">W</th>
                            <th className="px-10 py-8 text-center">L</th>
                            <th className="px-10 py-8 text-center text-white">Pts</th>
                            <th className="px-10 py-8 text-center">NRR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.points_table.map((row, idx) => (
                            <tr key={idx} className="border-b-[2px] border-[#1e2d4a] bg-[#040812] hover:bg-[#112240] transition-colors">
                              <td className="px-10 py-8 font-black text-[35px] text-gray-500">{idx + 1}</td>
                              <td className="px-10 py-8 font-bold text-white text-[40px] flex items-center gap-6">
                                {row.team_logo && <img src={row.team_logo} alt={row.team} className="w-[60px] h-[60px] object-contain drop-shadow-md" />}
                                <span>{row.team}</span>
                              </td>
                              <td className="px-10 py-8 text-center font-bold text-[35px] text-gray-300">{row.matches}</td>
                              <td className="px-10 py-8 text-center font-bold text-[35px] text-green-500">{row.won}</td>
                              <td className="px-10 py-8 text-center font-bold text-[35px] text-red-500">{row.lost}</td>
                              <td className="px-10 py-8 text-center font-black text-[55px] text-[#fbbf24] drop-shadow-lg" style={{ fontFamily: "Oswald, sans-serif" }}>
                                {row.points}
                              </td>
                              <td className="px-10 py-8 text-center font-mono font-bold text-[32px] text-gray-400">{row.nrr}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-[40px] italic font-bold mt-10">No points table available.</div>
                  )}
                </motion.div>
              )}

              {/* TAB 3: SERIES INFO */}
              {activeTab === "series_info" && (
                <motion.div key="series_info" variants={tabContentVariant} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                  <h3 className="text-[#fbbf24] text-[50px] font-black uppercase tracking-widest mb-8 border-b-[4px] border-[#1e2d4a] pb-4 inline-block drop-shadow-md" style={{ fontFamily: "Oswald, sans-serif" }}>
                    Match Schedule
                  </h3>
                  <div className="grid grid-cols-2 gap-10">
                    {data.series_info?.featured_matches?.map((match, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-[#0b162c] to-[#040812] border-[4px] border-[#1e2d4a] p-10 rounded-3xl shadow-xl hover:border-[#fbbf24] transition-colors">
                        <div className="flex justify-between items-center border-b-[3px] border-[#1e2d4a] pb-6 mb-8">
                          <span className="text-gray-300 font-black text-[28px] tracking-wider">{match.date}</span>
                          <span className="px-6 py-2 bg-yellow-500/20 text-[#fbbf24] font-black text-[22px] uppercase rounded-lg border-[2px] border-[#fbbf24]/50 tracking-widest shadow-lg">
                            {match.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6 w-5/12">
                            {match.team1_logo && <img src={match.team1_logo} alt={match.team1} className="w-[90px] h-[90px] object-contain drop-shadow-xl" />}
                            <span className="text-white font-black text-[38px] leading-tight">{match.team1}</span>
                          </div>
                          <span className="text-gray-600 font-black text-[45px] drop-shadow-md" style={{ fontFamily: "Oswald, sans-serif" }}>VS</span>
                          <div className="flex items-center justify-end gap-6 w-5/12 text-right">
                            <span className="text-white font-black text-[38px] leading-tight">{match.team2}</span>
                            {match.team2_logo && <img src={match.team2_logo} alt={match.team2} className="w-[90px] h-[90px] object-contain drop-shadow-xl" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 4: SQUADS */}
              {activeTab === "squads" && (
                <motion.div key="squads" variants={tabContentVariant} initial="hidden" animate="visible" exit="exit" className="space-y-10 flex flex-col h-full">
                  
                  {/* Huge Team Buttons */}
                  <div className="flex gap-6 border-b-[4px] border-[#1e2d4a] pb-8 overflow-x-auto">
                    {Object.keys(data.squads || {}).map((teamName) => {
                      const teamData = data.squads[teamName];
                      const isSelected = selectedSquadTeam === teamName;
                      return (
                        <button
                          key={teamName}
                          onClick={() => setSelectedSquadTeam(teamName)}
                          className={`px-10 py-5 rounded-2xl border-[4px] font-black text-[28px] uppercase transition-all flex items-center gap-4 ${
                            isSelected
                              ? "bg-[#fbbf24] text-black border-white shadow-[0_0_30px_rgba(251,191,36,0.5)] scale-105"
                              : "bg-[#0b162c] text-gray-300 border-[#1e2d4a] hover:bg-[#112240] hover:text-white"
                          }`}
                          style={{ fontFamily: "Oswald, sans-serif" }}
                        >
                          {teamData.team_logo && <img src={teamData.team_logo} alt={teamName} className="w-12 h-12 object-contain drop-shadow-md" />}
                          {teamName}
                        </button>
                      );
                    })}
                  </div>

                  {/* Player Grid */}
                  {selectedSquadTeam && data.squads[selectedSquadTeam] && (
                    <div className="grid grid-cols-4 gap-8 max-h-[580px] overflow-y-auto pr-4">
                      {data.squads[selectedSquadTeam].players.map((player, pIdx) => (
                        <div
                          key={pIdx}
                          onClick={() => handleOpenPlayer(player, "SQUAD MEMBER", selectedSquadTeam)}
                          className="bg-[#0b162c] border-[3px] border-[#1e2d4a] p-6 rounded-2xl flex items-center gap-6 hover:border-[#fbbf24] cursor-pointer hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:scale-105 transition-all group"
                        >
                          <div className="w-[100px] h-[100px] rounded-full border-[3px] border-gray-500 group-hover:border-white overflow-hidden bg-[#040812] flex-shrink-0 shadow-lg">
                            <img src={player.player_img} alt={player.name} className="w-full h-full object-cover object-top" />
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <h5 className="text-white font-black text-[28px] truncate drop-shadow-md">{player.name}</h5>
                            <span className="text-[#fbbf24] mt-1 text-[16px] uppercase font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">View Stats</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* OVERLAY: PLAYER STATS */}
      <AnimatePresence>
        {selectedPlayer && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center backdrop-blur-sm"
            onClick={() => setSelectedPlayer(null)} 
          >
            {/* FIXED WRAPPER: Exact size proportions for standard trading card graphic */}
            <div className="relative w-[500px] h-[750px] shadow-[0_0_80px_rgba(251,191,36,0.4)] rounded-xl" onClick={(e) => e.stopPropagation()}>
               
               {/* Massive Close Button for the Player Stats Modal */}
               <button 
                  onClick={() => setSelectedPlayer(null)}
                  className="absolute -top-6 -right-6 z-[70] w-16 h-16 bg-[#dc2626] border-[4px] border-white rounded-full flex items-center justify-center hover:bg-[#b91c1c] shadow-2xl cursor-pointer hover:scale-110 transition-transform"
               >
                 <IoCloseSharp size={40} color="white" />
               </button>

               {/* Your existing PlayerStats Component - It will now perfectly fill this 500x750 wrapper without breaking layout */}
               <PlayerStats player={selectedPlayer} />
               
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default SeriesStatsModal;