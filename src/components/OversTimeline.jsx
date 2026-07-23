import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useScoreStore from '../hooks/useScoreStore';

const OversTimeline = () => {
  const data = useScoreStore((state) => state.liveData);

  
  // Safely extract stats
  const fours = data?.fours || 0;
  const sixes = data?.sixes || 0;
  const matchInfo = data?.matchInfo || "LIVE CRICKET MATCH";

  // Process the nested timeline structure based on your JSON payload
  const processTimeline = (timeline) => {
    if (!timeline || !Array.isArray(timeline)) return [];
    
    // Take up to 3 most recent overs and reverse them to read chronologically
    const recentOvers = [...timeline].slice(0, 3).reverse();
    const items = [];
    
    recentOvers.forEach((over, overIndex) => {
      // Add all balls for this over
      if (Array.isArray(over.balls)) {
        over.balls.forEach((ball) => {
          items.push({ 
            isBall: true, 
            value: ball.value, 
            type: ball.type 
          });
        });
      }
      
      // Add 'Ov' marker after completed overs 
      if (overIndex < recentOvers.length - 1) {
        items.push({ isOverMarker: true });
      }
    });
    
    return items;
  };

  const timelineItems = processTimeline(data?.overs_timeline);

  // Helper to determine ball styling based on its value
  const getBallStyles = (ballVal, isLatest) => {
    const val = String(ballVal).toLowerCase().trim();
    let bg = "bg-white"; 
    let text = "text-black";
    
    if (val === '0') {
      bg = "bg-gray-400";
      text = "text-gray-900";
    } else if (val === '4') {
      bg = "bg-[#1e88e5]"; // Blue for 4
      text = "text-white";
    } else if (val === '6') {
      bg = "bg-green-500";
      text = "text-white";
    } else if (val === 'w' || val === 'wicket') {
      bg = "bg-red-600";
      text = "text-white";
    }

    // Larger, brighter cyan glow for the scaled-up latest delivery
    const glowClass = isLatest ? "shadow-[0_0_20px_4px_#00e5ff] border-[7px] border-[#00e5ff] z-10 shadow-lg" : "border-black/50 z-0";
    return `${bg} ${text} ${glowClass}`;
  };

  return (
    <div className="relative w-[1920px] font-sans flex flex-col border-[4px] border-[#0a192f] shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-[#0b1b36] select-none">
      
      <style>{`
        .font-condensed { font-family: 'Oswald', 'Arial Narrow', sans-serif; font-stretch: condensed; }
        .text-shadow-outline { 
          text-shadow: -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 3px 4px 6px rgba(0,0,0,0.9); 
        }
        .text-shadow-heavy { text-shadow: 3px 3px 5px rgba(0,0,0,0.9); }
        .ball-ellipse { border-radius: 50% / 50%; }
      `}</style>

      {/* =========================================
          TOP ROW (Stats & Match Info)
          Height increased to 55px, font bumped to 36px
      ========================================= */}
      <div className="flex h-[75px] w-full border-b-[3px] border-black">
        <div className="w-[340px] bg-[#0b1b36] flex items-center justify-center px-4 border-r-[4px] border-white/20">
          <span className="text-white font-condensed font-bold text-[36px] tracking-wide text-shadow-outline">
            4s: {fours} <span className="text-gray-400 mx-2">|</span> 6s: {sixes}
          </span>
        </div>
        <div className="flex-1 bg-gradient-to-r from-[#285596] to-[#1a3a6c] flex items-center overflow-hidden px-6 shadow-inner">
          <span className="text-white font-condensed font-bold text-[36px] tracking-widest text-shadow-outline whitespace-nowrap uppercase">
            {matchInfo}
          </span>
        </div>
      </div>

      {/* =========================================
          BOTTOM ROW (Subscribe & Recent Balls)
          Height heavily increased to 85px to fit huge balls
      ========================================= */}
      <div className="flex h-[105px] w-full bg-[#03152d]">
        
        {/* Left Side: SUBSCRIBE Button Tab */}
        <div className="w-[340px] bg-gradient-to-b from-[#4ba3e3] to-[#2573b9] flex items-center justify-center border-r-[5px] border-[#0a192f] shadow-[6px_0_15px_rgba(0,0,0,0.7)] z-20">
          <span className="text-white font-condensed font-black text-[60px] tracking-widest uppercase text-shadow-heavy scale-y-110 pb-1">
            SUBSCRIBE
          </span>
        </div>

        {/* Right Side: Recent Balls Timeline */}
        <div className="flex-1 flex items-center px-6 overflow-hidden relative">
          
          {/* Increased gap from 6px to 14px for better spacing */}
          <div className="flex items-center gap-[14px] w-full justify-start overflow-hidden">
            <AnimatePresence initial={false}>
              {timelineItems.map((item, index) => {
                
                // OVER MARKER logic
                if (item.isOverMarker) {
                  return (
                    <motion.div
                      key={`ov-${index}`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mx-2 flex items-center justify-center"
                    >
                      <span className="text-white font-condensed font-black text-[45px] text-shadow-outline tracking-wider">Ov</span>
                    </motion.div>
                  );
                }

                // INDIVIDUAL BALL logic
                const isLatest = index === timelineItems.length - 1;
                const ballString = String(item.value).toUpperCase();
                
                // Dynamically shrink text if it's "1LB", "WD", or "NB" so it fits the circle
                const isLongText = ballString.length > 1;

                return (
                  <motion.div
                    key={`ball-${index}-${item.value}`}
                    initial={{ opacity: 0, scale: 0.5, x: 30 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`
                      relative flex items-center justify-center 
                      w-[75px] h-[65px] ball-ellipse font-condensed font-black leading-none
                      border-[3px] shadow-[inset_0_2px_5px_rgba(255,255,255,0.4),0_5px_10px_rgba(0,0,0,0.6)]
                      ${getBallStyles(item.value, isLatest)}
                      ${isLongText ? 'text-[28px] tracking-tighter' : 'text-[38px]'}
                    `}
                  >
                    <span className="mt-[4px]">{ballString}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OversTimeline;