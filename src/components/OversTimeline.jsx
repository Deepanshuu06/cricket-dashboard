import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useScoreStore from '../hooks/useScoreStore';

const OversTimeline = () => {
  const data = useScoreStore((state) => state.liveData);
  console.log('result_number:', data?.result_number);

  // Process the nested timeline structure based on your JSON payload
  const processTimeline = (timeline) => {
    if (!timeline || !Array.isArray(timeline)) return [];
    
    // Take up to 3 most recent overs and reverse them to read chronologically
    const recentOvers = [...timeline].slice(0, 3).reverse();
    const items = [];
    
    recentOvers.forEach((over, overIndex) => {
      if (Array.isArray(over.balls)) {
        over.balls.forEach((ball) => {
          items.push({ isBall: true, value: ball.value, type: ball.type });
        });
      }
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
      bg = "bg-[#1e88e5]";
      text = "text-white";
    } else if (val === '6') {
      bg = "bg-green-500";
      text = "text-white";
    } else if (val === 'w' || val === 'wicket') {
      bg = "bg-red-600";
      text = "text-white";
    }

    const glowClass = isLatest 
      ? "border-[7px] border-[#00e5ff] z-10 animate-pulse-glow" 
      : "border-[3px] border-black/50 z-0 shadow-[inset_0_2px_5px_rgba(255,255,255,0.4),0_5px_10px_rgba(0,0,0,0.6)]";
      
    return `${bg} ${text} ${glowClass}`;
  };

  return (
    /* Outer wrapper for the running border effect */
    <div className="relative w-[1920px] font-sans running-border-wrapper shadow-[0_20px_50px_rgba(0,0,0,0.8)] select-none">
      
      <style>{`
        .font-condensed { font-family: 'Oswald', 'Arial Narrow', sans-serif; font-stretch: condensed; }
        .text-shadow-outline { text-shadow: -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 3px 4px 6px rgba(0,0,0,0.9); }
        .text-shadow-heavy { text-shadow: 3px 3px 5px rgba(0,0,0,0.9); }
        .ball-ellipse { border-radius: 50% / 50%; }

        /* --- 1. Minimal Running Border --- */
        .running-border-wrapper {
          position: relative;
          overflow: hidden;
          background: #0a192f;
        }
        .running-border-wrapper::before {
          content: '';
          position: absolute;
          top: -50%; left: -50%; width: 200%; height: 200%;
          background: conic-gradient(transparent, transparent, transparent, #00e5ff);
          animation: spin-border 4s linear infinite;
          z-index: 0;
        }
        @keyframes spin-border {
          100% { transform: rotate(360deg); }
        }
        .inner-content {
          position: relative;
          z-index: 1;
          margin: 3px; /* This creates the 3px running border thickness */
          background-color: #0b1b36;
          display: flex;
          flex-direction: column;
        }

        /* --- 2. Shining Effect --- */
        .shine-layer {
          position: absolute;
          top: 0; left: -100%;
          width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transform: skewX(-25deg);
          animation: shine-sweep 3.5s infinite;
          pointer-events: none;
        }
        @keyframes shine-sweep {
          0% { left: -100%; }
          50%, 100% { left: 200%; } /* Pauses for half the animation to feel natural */
        }

        /* --- 3. Live Text Pulse --- */
        .animate-live-text {
          animation: live-text-pulse 1.5s ease-in-out infinite;
        }
        @keyframes live-text-pulse {
          0%, 100% { text-shadow: -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 0 5px #ff0044; }
          50% { text-shadow: -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 0 20px #ff0044, 0 0 30px #ff0044; color: #ffcccc; }
        }

        /* Ball Glow Animation */
        @keyframes pulse-glow {
          0%, 100% { box-shadow: inset 0 2px 5px rgba(255,255,255,0.4), 0 0 15px 4px #00e5ff; }
          50% { box-shadow: inset 0 2px 5px rgba(255,255,255,0.6), 0 0 25px 8px #00e5ff; }
        }
        .animate-pulse-glow {
          animation: pulse-glow 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* Main Content inside the Running Border */}
      <div className="inner-content">
        
        {/* =========================================
            TOP ROW (Stats & Match Info)
        ========================================= */}
        <div className="flex h-[75px] w-full border-b-[3px] border-black">
          <div className="w-[340px] bg-[#0b1b36] flex items-center justify-center px-4 border-r-[4px] border-white/20 gap-3">
            {/* Blinking Red Dot for Broadcast effect */}
            <motion.div 
              animate={{ opacity: [1, 0, 1] }} 
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-4 h-4 bg-red-600 rounded-full shadow-[0_0_10px_#ff0000]"
            />
            {/* Animated Live Text */}
            <span className="text-white font-condensed font-bold text-[36px] tracking-wide animate-live-text">
              LIVE MATCH
            </span>
          </div>
          
          <div className="flex-1 bg-gradient-to-r from-[#285596] to-[#1a3a6c] flex items-center overflow-hidden px-6 shadow-inner relative">
            {/* Shining Sweep overlay */}
            <div className="shine-layer" />
            
            <span className="relative z-10 text-white font-condensed font-bold text-[36px] tracking-widest text-shadow-outline whitespace-nowrap uppercase">
              {`CRR: ${data?.crr || 0} | RRR: ${data?.rrr || 0} `} 
            </span>
          </div>
        </div>

        {/* =========================================
            BOTTOM ROW (Subscribe & Recent Balls)
        ========================================= */}
        <div className="flex h-[105px] w-full bg-[#03152d]">
          
          {/* Left Side: SUBSCRIBE Button Tab */}
          <div className="relative w-[340px] bg-gradient-to-b from-[#4ba3e3] to-[#2573b9] flex items-center justify-center border-r-[5px] border-[#0a192f] shadow-[6px_0_15px_rgba(0,0,0,0.7)] z-20 overflow-hidden">
            
            {/* Shining Sweep overlay */}
            <div className="shine-layer" style={{ animationDelay: '0.5s' }} />
            
            {/* Pulsing Subscriber Text */}
            <motion.span 
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              className="relative z-10 text-white font-condensed font-black text-[50px] tracking-widest uppercase text-shadow-heavy scale-y-110 pb-1 origin-center"
            >
              SUBSCRIBE
            </motion.span>
          </div>

          {/* Right Side: Recent Balls Timeline */}
          <div className="flex-1 flex items-center px-6 overflow-hidden relative">
            <div className="flex items-center gap-[14px] w-full justify-start ">
              
              <AnimatePresence mode="popLayout" initial={false}>
                {timelineItems.map((item, index) => {
                  
                  // OVER MARKER
                  if (item.isOverMarker) {
                    return (
                      <motion.div
                        layout
                        key={`ov-${index}`}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0, x: -30 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="mx-2 flex items-center justify-center"
                      >
                        <span className="text-white font-condensed font-black text-[45px] text-shadow-outline tracking-wider">Ov</span>
                      </motion.div>
                    );
                  }

                  // INDIVIDUAL BALL
                  const isLatest = index === timelineItems.length - 1;
                  const ballString = String(item.value).toUpperCase();
                  const isLongText = ballString.length > 1;

                  return (
                    <motion.div
                      layout
                      key={`ball-${index}-${item.value}`}
                      initial={{ opacity: 0, scale: 0.2, x: 50 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.5, x: -50 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className={`
                        relative flex items-center justify-center 
                        w-[75px] h-[65px] ball-ellipse font-condensed font-black leading-none
                        ${getBallStyles(item.value, isLatest)}
                        ${isLongText ? 'text-[28px] tracking-tighter' : 'text-[38px]'}
                      `}
                    >
                      <span className="mt-[4px] relative z-20">{ballString}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default OversTimeline;