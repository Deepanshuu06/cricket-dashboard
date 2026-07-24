import React from "react";
import { motion } from "framer-motion";
import { GiCricketBat } from "react-icons/gi";
import { MdSportsCricket } from "react-icons/md";
import "../styles/scoreBanner.css";
// Import the CSS module for custom styles
import useScoreStore from "../hooks/useScoreStore";

// Accept the onTeamClick prop from App.jsx
const ScoreBanner = ({ onTeamClick , onScoreClick  }) => {

  // GRAB the data directly from Zustand
  const data = useScoreStore((state) => state.liveData);





  // Return early if no data is provided to prevent crashes
  if (!data) return null;

  // Define team gradient colors
  const team1 = {
    color: "from-[#3b5bdb] to-[#1d3557]",
  };
  const team2 = {
    color: "from-[#e63946] to-[#780000]",
  };

  // Determine if the match is in the second innings
  const isSecondInnings =
    (data.second_innings_header?.score ?? "") !== "" ||
    data.second_innings_header?.active === true;

  // Extract batting team details
  const batting = {
    name: data.batting_team,
    score: isSecondInnings
      ? data.second_innings_header?.score
      : data.first_innings?.score,
    overs: isSecondInnings
      ? data.second_innings_header?.overs
      : data.first_innings?.overs,
  };

  // Extract bowling team details
  const bowling = {
    name: data.bowling_team,
    score: data.first_innings?.score,
    overs: data.first_innings?.overs,
  };

  // Extract and evaluate the match result or status text
  const resultText = data?.result_number;
  const isLongText = resultText?.length > 3;

  return (
    <div className="relative w-[1920px] h-[250px] bg-transparent font-sans overflow-hidden ">
      {/* --- Main Scoreboard Layout --- */}
      <div className="absolute top-[20px] left-0 w-full flex h-[230px] shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-30 border-b-[6px] border-gray-400 bg-gray-900">
        
        {/* Leftmost Vertical 'SCORE' Tab */}
        <div onClick={onScoreClick} className=" cursor-pointer w-[70px] bg-gradient-to-b from-orange-500 to-orange-800 flex items-center justify-center border-r-[4px] border-gray-300 z-40 shadow-[4px_0_15px_rgba(0,0,0,0.5)] relative">
          <span className="transform -rotate-90 text-white font-black tracking-widest text-4xl whitespace-nowrap text-shadow-heavy">
            SCORE
          </span>
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
        </div>

        {/* --- Batting Team Section (Left) --- */}
        <div className="relative flex-1 flex flex-col">
          {/* Batting Team Header (CLICKABLE) */}
          <div 
            onClick={() => onTeamClick && onTeamClick(0)}
            className="h-[55px] bg-gradient-to-r from-orange-600 to-orange-500 border-b-[4px] border-gray-300 flex items-center justify-between px-8 z-20 cursor-pointer hover:bg-orange-400 transition-colors"
          >
            <span className="text-white font-black text-3xl tracking-widest uppercase text-shadow-heavy whitespace-nowrap pointer-events-none">
              {batting.name}
            </span>
            <GiCricketBat className="text-yellow-300 text-4xl drop-shadow-md origin-bottom-right -rotate-12 pointer-events-none" />
          </div>

          {/* Batting Team Score & Overs */}
          <div className={`relative flex-1 bg-gradient-to-b ${team1.color} flex items-center justify-start pl-8 pr-[160px] overflow-hidden`}>
            <div className="animate-shine" />

            <div className="flex items-baseline gap-4 z-20">
              <span className="text-white font-black text-[115px] leading-none text-shadow-outline tracking-tighter whitespace-nowrap">
                {batting.score}
              </span>
              <span className="text-yellow-400 font-black text-[55px] leading-none text-shadow-heavy whitespace-nowrap">
                {batting.overs}
              </span>
            </div>
          </div>

          {/* Left Team Flag Indicator */}
          <div className="absolute right-[-125px] top-1/2 -translate-y-1/2 z-50 pointer-events-none">
            <div className="relative flex items-center justify-center w-[250px] h-[250px] rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.8)] bg-white overflow-hidden">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute w-[150%] h-[150%] bg-[conic-gradient(from_0deg,#fff_0deg,#3b82f6_90deg,#fff_180deg,#f97316_270deg,#fff_360deg)]"
              />
              <div className="absolute inset-[10px] bg-white rounded-full overflow-hidden flex items-center justify-center z-10 border-[4px] border-gray-200">
                <img
                  src="https://img1.hscicdn.com/image/upload/f_auto/lsci/db/PICTURES/CMS/412600/412621.png"
                  alt="India"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- Center Section (Match Status / Waveform) --- */}
        <div className="relative w-[1100px] bg-[#0a0f1c] flex flex-col justify-center items-center border-x-[4px] border-gray-800 overflow-hidden z-10 px-[130px]">
          <div className="absolute inset-0 flex items-center justify-center gap-[6px] opacity-40 z-0">
            {[...Array(24)].map((_, i) => (
              <div
                key={i}
                className="wave-bar"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  height: `${Math.random() * 50 + 20}%`,
                }}
              />
            ))}
          </div>

          <span
            className={`text-white font-black text-center text-shadow-heavy z-10 ${
              isLongText
                ? "text-[55px] uppercase tracking-wider leading-[1.1]"
                : "text-[150px] leading-[0.8]"
            }`}
          >
            {resultText}
          </span>
        </div>

        {/* --- Bowling Team Section (Right) --- */}
        <div className="relative flex-1 flex flex-col">
          {/* Bowling Team Header (CLICKABLE) */}
          <div 
            onClick={() => onTeamClick && onTeamClick(1)}
            className="h-[55px] bg-gradient-to-l from-blue-800 to-blue-600 border-b-[4px] border-gray-300 flex items-center justify-between px-8 z-20 flex-row-reverse cursor-pointer hover:bg-blue-500 transition-colors"
          >
            <span className="text-white font-black text-3xl tracking-widest uppercase text-shadow-heavy whitespace-nowrap pointer-events-none">
              {bowling.name}
            </span>
            <MdSportsCricket className="text-red-500 bg-white rounded-full text-4xl shadow-[0_0_10px_rgba(255,255,255,0.5)] pointer-events-none" />
          </div>

          {/* Bowling Team Score & Overs */}
          <div className={`relative flex-1 bg-gradient-to-b ${team2.color} flex items-center justify-end pr-8 pl-[160px] overflow-hidden`}>
            <div className="animate-shine" style={{ animationDelay: "1.5s" }} />

            {isSecondInnings ? (
              <div className="flex items-baseline gap-4 z-20 flex-row-reverse">
                <span className="text-white font-black text-[115px] leading-none text-shadow-outline tracking-tighter whitespace-nowrap">
                  {bowling.score}
                </span>
                <span className="text-yellow-400 font-black text-[55px] leading-none text-shadow-heavy whitespace-nowrap">
                  {bowling.overs}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-white font-black text-[70px] tracking-widest text-shadow-heavy">
                  BOWLING
                </span>
              </div>
            )}
          </div>

          {/* Right Team Flag Indicator */}
          <div className="absolute left-[-125px] top-1/2 -translate-y-1/2 z-50 pointer-events-none ">
            <div className="relative flex items-center justify-center w-[250px] h-[250px] rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.8)] bg-white overflow-hidden">
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute w-[150%] h-[150%] bg-[conic-gradient(from_0deg,#fff_0deg,#dc2626_90deg,#fff_180deg,#1e3a8a_270deg,#fff_360deg)]"
              />
              <div className="absolute inset-[10px] bg-white rounded-full overflow-hidden flex items-center justify-center z-10 border-[4px] border-gray-200">
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/thumb/d/d7/Sunrisers_Leeds_Logo.svg/1280px-Sunrisers_Leeds_Logo.svg.png"
                  alt="England"
                  className="w-full h-full object-cover"
                  
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ScoreBanner;