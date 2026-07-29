import React from "react";
import { motion } from "framer-motion";
import { GiCricketBat } from "react-icons/gi";
import { MdSportsCricket } from "react-icons/md";
import "../styles/scoreBanner.css";
import useScoreStore from "../hooks/useScoreStore";

const ScoreBanner = ({ onTeamClick, onScoreClick, team1Logo, team2Logo, themeColors, onFlagClick }) => {
  const data = useScoreStore((state) => state.liveData);
  if (!data) return null;

  const isSecondInnings =
    (data.second_innings_header?.score ?? "") !== "" ||
    data.second_innings_header?.active === true;

  const batting = {
    name: data.batting_team,
    score: isSecondInnings ? data.second_innings_header?.score : data.first_innings?.score,
    overs: isSecondInnings ? data.second_innings_header?.overs : data.first_innings?.overs,
  };

  const bowling = {
    name: data.bowling_team,
    score: data.first_innings?.score,
    overs: data.first_innings?.overs,
  };

  const resultText = data?.result_number;
  const isLongText = resultText?.length > 3;

  // Format the result text for reliable comparison
  const resultType = String(resultText || "").toUpperCase().trim();

  // Function to render the dynamic center animation based on the result
  const renderResultAnimation = () => {
    const animKey = `${batting.score}-${resultType}`;

    if (resultType === "6") {
      return (
        <motion.div
          key={animKey}
          initial={{ scale: 0.2, opacity: 0, rotate: -20 }}
          animate={{ scale: [1.5, 1, 1.1, 1], opacity: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.6 }}
          className="text-yellow-400 font-black text-[180px] leading-[0.8] drop-shadow-[0_0_35px_rgba(250,204,21,0.8)] z-20 flex items-center justify-center"
        >
          {resultText}
        </motion.div>
      );
    }

    if (resultType === "4") {
      return (
        <motion.div
          key={animKey}
          initial={{ x: -200, skewX: -30, opacity: 0 }}
          animate={{ x: 0, skewX: 0, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
          className="text-blue-400 font-black text-[180px] leading-[0.8] drop-shadow-[0_0_35px_rgba(96,165,250,0.8)] z-20 flex items-center justify-center"
        >
          {resultText}
        </motion.div>
      );
    }

    if (resultType === "W" || resultType.includes("WICKET") || resultType.includes("OUT") || resultType.includes("LBW")) {
      return (
        <motion.div
          key={animKey}
          initial={{ y: -100, scale: 1.5, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, type: "spring", bounce: 0.7 }}
          // FIXED: Controlled flex layout to center-align multi-word strings like "LBW OUT" perfectly without misalignment
          className="text-red-500 font-black text-[70px] uppercase tracking-wider leading-[1.1] drop-shadow-[0_0_40px_rgba(239,68,68,0.9)] z-20 flex flex-col items-center justify-center text-center w-full px-2"
        >
          {resultText}
        </motion.div>
      );
    }

    // Default Fallback
    return (
      <motion.span
        key={animKey}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`text-white font-black text-center text-shadow-heavy z-10 flex items-center justify-center ${
          isLongText
            ? "text-[50px] uppercase tracking-wider leading-[1.1]"
            : "text-[180px] leading-[0.8]"
        }`}
      >
        {resultText}
      </motion.span>
    );
  };

  return (
    <div className="relative w-[1920px] h-[250px] bg-transparent font-sans overflow-hidden">
      <div className="absolute top-[20px] left-0 w-full flex h-[230px] shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-30 border-b-[6px] border-gray-400 bg-gray-900">
        
        {/* SCORE Tab */}
        <div onClick={onScoreClick} className="cursor-pointer w-[70px] bg-gradient-to-b from-orange-500 to-orange-800 flex items-center justify-center border-r-[4px] border-gray-300 z-40 shadow-[4px_0_15px_rgba(0,0,0,0.5)] relative">
          <span className="transform -rotate-90 text-white font-black tracking-widest text-4xl whitespace-nowrap text-shadow-heavy">
            SCORE
          </span>
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
        </div>

        {/* --- Batting Team Section (Left) --- */}
        <div className="relative flex-1 flex flex-col">
          <div 
            onClick={() => onTeamClick && onTeamClick(0)}
            style={{ backgroundColor: themeColors.t1Header }}
            className="h-[55px] border-b-[4px] border-gray-300 flex items-center justify-between px-8 z-20 cursor-pointer hover:brightness-110 transition-all"
          >
            <span className="text-white font-black text-3xl tracking-widest uppercase text-shadow-heavy whitespace-nowrap pointer-events-none">
              {batting.name}
            </span>
            <GiCricketBat className="text-yellow-300 text-4xl drop-shadow-md origin-bottom-right -rotate-12 pointer-events-none" />
          </div>

          <div 
            style={{ background: `linear-gradient(to bottom, ${themeColors.t1Bg}, #000000)` }}
            className="relative flex-1 flex items-center justify-start pl-8 pr-[160px] overflow-hidden"
          >
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

          {/* Left Flag */}
          <div 
            onClick={onFlagClick}
            className="absolute right-[-125px] top-1/2 -translate-y-1/2 z-50 pointer-events-auto cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-[250px] h-[250px] rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.8)] bg-white overflow-hidden group-hover:scale-105 transition-transform duration-300">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute w-[150%] h-[150%] bg-[conic-gradient(from_0deg,#fff_0deg,#3b82f6_90deg,#fff_180deg,#f97316_270deg,#fff_360deg)] pointer-events-none"
              />
              <div className="absolute inset-[10px] bg-white rounded-full overflow-hidden flex items-center justify-center z-10 border-[4px] border-gray-200 pointer-events-none">
                <img src={team1Logo} alt="Team 1 Flag" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* --- Center Section --- */}
        <div className="relative w-[1100px] bg-[#0a0f1c] flex flex-col justify-center items-center border-x-[4px] border-gray-800 overflow-hidden z-10 px-[40px]">
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

          {renderResultAnimation()}
        </div>

        {/* --- Bowling Team Section (Right) --- */}
        <div className="relative flex-1 flex flex-col">
          <div 
            onClick={() => onTeamClick && onTeamClick(1)}
            style={{ backgroundColor: themeColors.t2Header }}
            className="h-[55px] border-b-[4px] border-gray-300 flex items-center justify-between px-8 z-20 flex-row-reverse cursor-pointer hover:brightness-110 transition-all"
          >
            <span className="text-white font-black text-3xl tracking-widest uppercase text-shadow-heavy whitespace-nowrap pointer-events-none">
              {bowling.name}
            </span>
            <MdSportsCricket className="text-red-500 bg-white rounded-full text-4xl shadow-[0_0_10px_rgba(255,255,255,0.5)] pointer-events-none" />
          </div>

          <div 
            style={{ background: `linear-gradient(to bottom, ${themeColors.t2Bg}, #000000)` }}
            className="relative flex-1 flex items-center justify-end pr-8 pl-[160px] overflow-hidden"
          >
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

          {/* Right Flag */}
          <div 
            onClick={onFlagClick}
            className="absolute left-[-125px] top-1/2 -translate-y-1/2 z-50 pointer-events-auto cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-[250px] h-[250px] rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.8)] bg-white overflow-hidden group-hover:scale-105 transition-transform duration-300">
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute w-[150%] h-[150%] bg-[conic-gradient(from_0deg,#fff_0deg,#dc2626_90deg,#fff_180deg,#1e3a8a_270deg,#fff_360deg)] pointer-events-none"
              />
              <div className="absolute inset-[10px] bg-white rounded-full overflow-hidden flex items-center justify-center z-10 border-[4px] border-gray-200 pointer-events-none">
                <img src={team2Logo} alt="Team 2 Flag" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ScoreBanner;