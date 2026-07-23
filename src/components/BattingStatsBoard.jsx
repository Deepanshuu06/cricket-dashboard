import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GiCricketBat } from "react-icons/gi";
import { MdSportsCricket } from "react-icons/md";
import { FaUserShield } from "react-icons/fa";
import useScoreStore from "../hooks/useScoreStore";

const BattingStatsBoard = ({ onBatsmanClick, onRunClick }) => {
  const data = useScoreStore((state) => state.liveData);

  const [overlay, setOverlay] = useState(null);
  const [strikeChangeOverlay, setStrikeChangeOverlay] = useState(false);
  const [showLastWicket, setShowLastWicket] = useState(false);

  const resultNumber = data?.result_number;
  const batsman1 = data?.players?.batsman1;
  const batsman2 = data?.players?.batsman2;
  const yet_to_bat = data?.yet_to_bat;
  const lastWicket = data?.last_wicket;
  
  const hasLastWicket = !!lastWicket; 

  const prevStrikerRef = useRef(null);

  useEffect(() => {
    if (!resultNumber) return;

    let bgColor = "";
    let text = "";
    const resultString = String(resultNumber).toLowerCase();

    if (resultString === "wicket" || resultString === "w") {
      bgColor = "bg-red-600";
      text = "WICKET";
    } else {
      const run = parseInt(resultNumber, 10);
      if (!isNaN(run) && run >= 1 && run <= 6) {
        text = `${run} RUN${run > 1 ? "S" : ""}`;

        if (run === 6) {
          bgColor = "bg-green-500 text-white";
        } else if (run === 4) {
          bgColor = "bg-yellow-400 text-black";
        } else {
          bgColor = "bg-blue-500 text-white";
        }
      }
    }

    if (bgColor && text) {
      setOverlay({ bgColor, text });
      const timer = setTimeout(() => setOverlay(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [resultNumber]);

  useEffect(() => {
    const currentStriker = batsman1?.onStrike
      ? batsman1?.name
      : batsman2?.onStrike
        ? batsman2?.name
        : null;

    if (
      prevStrikerRef.current !== null &&
      prevStrikerRef.current !== currentStriker &&
      currentStriker !== null
    ) {
      setStrikeChangeOverlay(true);
      const timer = setTimeout(() => setStrikeChangeOverlay(false), 1000);
      return () => clearTimeout(timer);
    }

    prevStrikerRef.current = currentStriker;
  }, [batsman1?.onStrike, batsman2?.onStrike, batsman1?.name, batsman2?.name]);

  useEffect(() => {
    if (!hasLastWicket) {
      setShowLastWicket(false);
      return;
    }

    const intervalId = setInterval(() => {
      setShowLastWicket((prev) => !prev);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [hasLastWicket]);

  if (!data) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-blue-950 text-white font-bold text-[30px] tracking-wider">
        <div className="animate-pulse">Loading Batting Stats...</div>
      </div>
    );
  }

  const batters = [batsman1, batsman2].filter(Boolean);
  const bowler = data.players?.bowler;

  const displayPartnership =
    typeof data.partnership === "object"
      ? `${data.partnership.runs || 0} (${data.partnership.balls || 0})`
      : data.partnership || "0 (0)";

  return (
    <motion.div
      initial={{ y: 50, opacity: 0, scale: 0.98 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className="w-full flex flex-col shadow-2xl font-sans border-[4px] border-blue-900 bg-blue-950 overflow-hidden relative"
    >
      <style>{`
        @keyframes marquee {
           from { transform: translateX(0); }
           to { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          align-items: center;
          white-space: nowrap;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee-container:hover .animate-marquee {
          animation-play-state: paused;
        }
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }

        /* --- NEW ANIMATIONS FOR BORDER & SHINE --- */
        @keyframes spin-border {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .running-border-container {
          position: relative;
          padding: 3px; 
          overflow: hidden;
          background: #000;
        }
        .running-border-container::before {
          content: '';
          position: absolute;
          top: -100%;
          left: -100%;
          width: 300%;
          height: 300%;
          /* A vibrant spinning gradient trailing off into transparency */
          background: conic-gradient(from 90deg, transparent 0%, transparent 60%, #38bdf8 80%, #fbbf24 100%);
          animation: spin-border 3.5s linear infinite;
          z-index: 0;
        }
        .running-border-inner {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          background-color: #172554; /* Match bg-blue-950 */
        }
        @keyframes soft-sweep {
          0% { transform: translateX(-100%) skewX(-15deg); }
          40% { transform: translateX(300%) skewX(-15deg); }
          100% { transform: translateX(300%) skewX(-15deg); } /* Pause interval */
        }
      `}</style>

      {/* --- BATTING SECTION (Wrapped in Running Border) --- */}
      <div className="running-border-container shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
        <div className="running-border-inner">
          
          <div className="h-[70px] flex items-center bg-gradient-to-b from-orange-500 to-orange-700 text-white font-black px-6 text-[45px] tracking-wider uppercase border-b-[4px] border-black shadow-[inset_0_4px_8px_rgba(255,255,255,0.3)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shine_3s_infinite]" />
            <div onClick={onBatsmanClick} className="w-[42%] cursor-pointer z-10">Batsman</div>
            <div onClick={onRunClick} className="w-[10%] text-center cursor-pointer z-10">R</div>
            <div className="w-[10%] text-center z-10">B</div>
            <div className="w-[10%] text-center z-10">4s</div>
            <div className="w-[10%] text-center z-10">6s</div>
            <div className="w-[18%] text-right cursor-pointer z-10">S.R</div>
          </div>

          {batters.map((batter, idx) => (
            <motion.div
              layout
              key={batter.name || idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative h-[120px] flex items-center bg-gradient-to-b from-blue-700 to-blue-900 text-white font-bold px-6 border-b-[4px] border-blue-950 overflow-hidden group"
            >
              {/* Subtle Lightweight Shine for rows */}
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[soft-sweep_4s_infinite_ease-in-out] pointer-events-none" />

              <AnimatePresence>
                {batter.onStrike && overlay && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className={`absolute inset-0 z-20 flex items-center justify-center ${overlay.bgColor}`}
                  >
                    <span className="text-[75px] font-black tracking-widest uppercase drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
                      {String(overlay.text)}
                    </span>
                  </motion.div>
                )}

                {batter.onStrike && strikeChangeOverlay && !overlay && (
                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "tween", duration: 0.3 }}
                    className="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-r from-orange-600 to-orange-400 text-white"
                  >
                    <span className="text-[65px] font-black tracking-widest uppercase drop-shadow-lg">
                      STRIKE CHANGE
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="w-[42%] flex items-center gap-3 text-[65px] tracking-tight whitespace-nowrap leading-none z-10">
                {batter.onStrike ? (
                  <motion.div
                    layoutId="striker-bar"
                    className="w-[20px] h-[80px] bg-green-500 rounded-sm mr-1 shadow-[0_0_15px_rgba(34,197,94,0.6)]"
                  />
                ) : (
                  <div className="w-[20px] h-[80px] bg-transparent mr-1" />
                )}

                {String(batter.name || "")}
                {batter.onStrike && (
                  <motion.div
                    animate={{ rotate: [-45, -25, -45] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <GiCricketBat className="text-yellow-400 drop-shadow-md ml-2" size={45} />
                  </motion.div>
                )}
              </div>

              <div className="w-[10%] text-center text-[65px] font-black leading-none z-10">
                {String(batter.runs || 0)}
              </div>
              <div className="w-[10%] text-center text-[55px] leading-none z-10">
                ({String(batter.balls || 0)})
              </div>
              <div className="w-[10%] text-center text-[55px] leading-none z-10">
                {String(batter.fours || 0)}
              </div>
              <div className="w-[10%] text-center text-[55px] leading-none z-10">
                {String(batter.sixes || 0)}
              </div>
              <div className="w-[18%] text-right text-[60px] font-black tracking-tighter leading-none z-10 text-yellow-300">
                {String(batter.strikeRate || 0)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- PROJECTED SCORE STRIP --- */}
      <div className="h-[65px] flex items-center justify-center bg-gradient-to-b from-red-700 to-red-900 border-b-[4px] border-black border-t-[2px] border-t-red-500 shadow-inner overflow-hidden">
        <motion.span
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-white font-black italic text-[42px] tracking-widest uppercase leading-none whitespace-nowrap"
          style={{ textShadow: "3px 4px 6px rgba(0,0,0,0.9)" }}
        >
          {String(data.match_status || data.match_decision)}
        </motion.span>
      </div>

      {/* --- BOWLER & PARTNERSHIP/LAST WICKET SECTION --- */}
      <div className="h-[60px] flex items-center bg-gradient-to-b from-orange-500 to-orange-700 text-white font-black px-4 text-[35px] tracking-wider uppercase border-b-[4px] border-black">
        <div className="w-[70%] flex items-center">
          <div className="w-[35%] flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-full">
              <MdSportsCricket size={24} />
            </div>
            BOWLER
          </div>
          <div className="w-[15%] text-center">Ov</div>
          <div className="w-[15%] text-center">R</div>
          <div className="w-[15%] text-center">W</div>
          <div className="w-[20%] text-center">ECO</div>
        </div>
        
        <div className="w-[4px] h-[40px] bg-black/50 rounded mx-2 shadow-inner" />
        
        <div className="w-[30%] flex items-center justify-center gap-3 relative overflow-hidden h-[60px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={showLastWicket ? "last-wicket-header" : "partnership-header"}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute flex items-center gap-3"
            >
              <div className="bg-white/20 p-1.5 rounded-full">
                <FaUserShield size={22} />
              </div>
              {showLastWicket ? "LAST WICKET" : "PARTNERSHIP"}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="h-[95px] flex items-center bg-gradient-to-b from-blue-700 to-blue-900 text-white font-bold px-4">
        <div className="w-[70%] flex items-center">
          <div className="w-[35%] text-[45px] leading-none tracking-tight whitespace-nowrap">
            {String(bowler?.name || "")}
          </div>
          <div className="w-[15%] text-center text-[55px] font-black text-blue-200 leading-none">
            {String(bowler?.overs || 0)}
          </div>
          <div className="w-[15%] text-center text-[55px] font-black leading-none">
            {String(bowler?.figures?.split("-")?.[1] || "0")}
          </div>
          <div className="w-[15%] text-center text-[55px] font-black leading-none text-red-400">
            {String(bowler?.figures?.split("-")?.[0] || "0")}
          </div>
          <div className="w-[20%] text-center text-[55px] font-black text-blue-200 leading-none">
            {String(bowler?.econ || 0)}
          </div>
        </div>

        <div className="w-[4px] h-[70px] bg-blue-950 rounded mx-2 shadow-inner" />

        <div className="w-[30%] flex items-center justify-center relative h-[95px] overflow-hidden px-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={showLastWicket ? "last-wicket-value" : "partnership-value"}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`absolute w-full flex flex-col items-center justify-center font-black tracking-tighter leading-none drop-shadow-md ${
                showLastWicket ? "text-red-400 text-[38px]" : "text-orange-400 text-[65px]"
              }`}
            >
              {showLastWicket ? (
                <>
                  <div className="truncate w-full text-center text-yellow-300 ">
                    {typeof lastWicket === "object" ? lastWicket.name || "" : lastWicket || ""}
                  </div>
                  <div className="text-[32px] opacity-90 mt-1 text-white">
                    {typeof lastWicket === "object" ? `(${lastWicket.score || 0})` : ""}
                  </div>
                </>
              ) : (
                displayPartnership
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* --- YET TO BAT SECTION (MARQUEE) --- */}
      {yet_to_bat && yet_to_bat.length > 0 && (
        <div className="h-[60px] flex items-center bg-gradient-to-b from-gray-800 to-gray-950 text-white font-bold border-t-[4px] border-black overflow-hidden relative animate-marquee-container">
          <div className="absolute left-0 top-0 bottom-0 z-10 bg-gradient-to-r from-gray-900 via-gray-900 to-transparent pr-12 pl-6 flex items-center border-r-[2px] border-gray-700/50">
            <span className="text-[32px] text-gray-300 font-black tracking-tighter uppercase whitespace-nowrap">
              Yet to Bat:
            </span>
          </div>

          <div className="w-full overflow-hidden">
            <div className="animate-marquee flex w-max items-center gap-10 text-[32px] font-bold tracking-tight text-gray-100">
              {[...yet_to_bat, ...yet_to_bat].map((player, index) => (
                <span
                  key={`${player.name}-${index}`}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <span className="inline-block w-[8px] h-[8px] rounded-full bg-orange-500" />
                  <span>{player.name}</span>
                  <span className="font-semibold text-yellow-300">
                    ({player.average ?? "-"})
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BattingStatsBoard;