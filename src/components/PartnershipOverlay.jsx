import React, { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import useScoreStore from '../hooks/useScoreStore';

// Custom Framer Motion Counter
const AnimatedNumber = ({ value }) => {
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const display = useTransform(spring, (current) => Math.round(current));
  
  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
};

const PartnershipOverlay = () => {
  const data = useScoreStore((state) => state.liveData);
  const players = data?.players;
  
  // YOUR LOGIC: Extract total partnership runs and balls
  const [runs, balls] = data?.partnership?.match(/^(\d+)\((\d+)\)$/)?.slice(1).map(Number) || [0, 0];

  // Get individual player runs for the circle and bottom displays
  const p1Runs = Number(players?.batsman1?.runs || 0);
  const p2Runs = Number(players?.batsman2?.runs || 0);

  // FIXED CIRCLE LOGIC:
  // The circle must be 100% full. We calculate the percentage based ONLY on the total 
  // runs scored by both batsmen combined. (If we use the overall partnership 'runs', 
  // extras like wides will break the 360-degree math).
  const totalBatsmanRuns = p1Runs + p2Runs;
  
  let p2Degrees = 180; // Defaults to a 50/50 split (180 degrees) if no runs are scored yet
  if (totalBatsmanRuns > 0) {
    p2Degrees = (p2Runs / totalBatsmanRuns) * 360;
  }

  // --- Animate the Pie Chart Sweep ---
  const pieDegreeSpring = useSpring(180, { stiffness: 45, damping: 25 });
  useEffect(() => {
    pieDegreeSpring.set(p2Degrees);
  }, [p2Degrees, pieDegreeSpring]);

  const matchData = {
    player1: { color: "bg-red-600", hex: "#ff0000" }, 
    player2: { color: "bg-yellow-400", hex: "#fff000" }, 
  };

  // Maps the spring value to a valid CSS conic-gradient string
  const pieBackground = useTransform(
    pieDegreeSpring,
    (deg) => `conic-gradient(from 0deg, ${matchData.player2.hex} 0deg ${deg}deg, ${matchData.player1.hex} ${deg}deg 360deg)`
  );

  // --- Animation Variants ---
  const overlayVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.15, delayChildren: 0.1 }
    },
    exit: { opacity: 0, y: 30, transition: { duration: 0.4 } }
  };

  const slideLeft = {
    hidden: { x: -100, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.7, ease: "easeOut", staggerChildren: 0.2 } }
  };

  const slideRight = {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.7, ease: "easeOut", staggerChildren: 0.2 } }
  };

  const popIn = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 250, damping: 20 } }
  };

  const drawHorizontalLine = {
    hidden: { width: 0, opacity: 0 },
    visible: { width: "100%", opacity: 1, transition: { duration: 0.8, ease: "easeInOut" } }
  };
  const dropVerticalLine = {
    hidden: { height: 0, opacity: 0 },
    visible: { height: "45px", opacity: 1, transition: { duration: 0.4, ease: "easeOut", delay: 0.7 } } 
  };
  
  const expandDivider = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: { scaleX: 1, opacity: 1, transition: { duration: 0.6, ease: "easeOut", delay: 0.5 } }
  };
  const swipeBarLeft = {
    hidden: { scaleX: 0, originX: 0 },
    visible: { scaleX: 1, transition: { duration: 0.5, ease: "easeOut", delay: 0.6 } }
  };
  const swipeBarRight = {
    hidden: { scaleX: 0, originX: 1 },
    visible: { scaleX: 1, transition: { duration: 0.5, ease: "easeOut", delay: 0.6 } }
  };

  return (
    <motion.div 
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute bottom-[70px] left-0 w-full h-[380px] border-y-[3px] border-white shadow-[0_15px_40px_rgba(0,0,0,0.9)] z-40 overflow-hidden font-sans text-white bg-gradient-to-r from-[#0d1e57] via-[#2a4db5] to-[#0d1e57]"
    >
      <style>{`
        .text-shadow-heavy { text-shadow: 2px 2px 4px rgba(0,0,0,0.8); }
        .text-shadow-light { text-shadow: 1px 1px 3px rgba(0,0,0,0.6); }
        .shine-container { position: relative; overflow: hidden; }
        .shine-container::after {
          content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: skewX(-25deg); animation: shine-sweep 3s infinite; pointer-events: none;
        }
        @keyframes shine-sweep { 0% { left: -100%; } 20%, 100% { left: 200%; } }
      `}</style>

      {/* ---------------- TOP BANNER: PARTNERSHIP ---------------- */}
      <motion.div variants={popIn} className="absolute top-4 w-full text-center z-20">
        <span className="relative inline-block text-[36px] font-bold tracking-[0.2em] text-shadow-heavy uppercase shine-container px-4">
          Partnership
        </span>
      </motion.div>

      {/* ---------------- CONNECTING LINES & RUNNING DOTS ---------------- */}
      <div className="absolute top-[60px] left-1/2 -translate-x-1/2 w-[900px] h-[80px] pointer-events-none z-10 flex flex-col items-center">
        <motion.div variants={dropVerticalLine} className="w-[4px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] relative z-20"></motion.div>
        
        <motion.div variants={drawHorizontalLine} className="h-[4px] bg-white relative shadow-[0_0_10px_rgba(255,255,255,0.8)] mx-auto z-10">
          <motion.div 
            animate={{ left: ['50%', '0%', '0%'], top: ['-2px', '-2px', '45px'], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1.5 }}
            className="absolute w-[8px] h-[8px] bg-cyan-300 rounded-full shadow-[0_0_15px_#00ffff]"
            style={{ transform: 'translateX(-50%)' }}
          />
          <motion.div 
            animate={{ left: ['50%', '100%', '100%'], top: ['-2px', '-2px', '45px'], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1.5 }}
            className="absolute w-[8px] h-[8px] bg-cyan-300 rounded-full shadow-[0_0_15px_#00ffff]"
            style={{ transform: 'translateX(-50%)' }}
          />
          
          <motion.div variants={dropVerticalLine} className="absolute left-0 top-0 w-[4px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[16px] h-[16px] bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)]"></div>
          </motion.div>
          <motion.div variants={dropVerticalLine} className="absolute right-0 top-0 w-[4px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]">
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[16px] h-[16px] bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)]"></div>
          </motion.div>
        </motion.div>
      </div>

      {/* ---------------- CENTER RING (Runs & Balls) ---------------- */}
      <motion.div 
        variants={popIn} 
        className="absolute left-1/2 bottom-[20px] -translate-x-1/2 w-[210px] h-[210px] rounded-full z-30 shadow-[0_8px_25px_rgba(0,0,0,0.6)] flex items-center justify-center"
        style={{ background: pieBackground }}
      >
        <motion.div 
          animate={{ boxShadow: ["inset 0 5px 15px rgba(0,0,0,0.5)", "inset 0 0 30px rgba(255,255,255,0.6)", "inset 0 5px 15px rgba(0,0,0,0.5)"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-[160px] h-[160px] bg-[#2a4db5] rounded-full flex flex-col items-center justify-center shadow-[inset_0_5px_15px_rgba(0,0,0,0.5)]"
        >
          <span className="text-[72px] font-black leading-none drop-shadow-lg">
            <AnimatedNumber value={runs} />
          </span>
          <span className="text-[32px] font-bold leading-none mt-1 drop-shadow-md text-gray-100">
            (<AnimatedNumber value={balls} />)
          </span>
        </motion.div>
      </motion.div>

      {/* ---------------- LEFT PLAYER SECTION ---------------- */}
      <motion.div variants={slideLeft} className="absolute inset-y-0 left-[10%] w-[400px] z-20">
        
        <div className="absolute top-8 left-0 w-[280px]">
          <div className="border-[2px] border-white bg-[#112563] py-[8px] text-center shadow-lg shine-container">
            <span className="text-[28px] font-bold tracking-wider uppercase text-shadow-light">
              {players?.batsman1?.name}
            </span>
          </div>
          <motion.div variants={swipeBarLeft} className={`h-[8px] w-[60px] rounded-full mt-3 ml-auto mr-4 shadow-sm ${matchData.player1.color}`}></motion.div>
        </div>

        <div className="absolute bottom-0 left-0 flex items-end h-[240px]">
          <motion.div 
            className="relative w-[200px] h-[240px]" 
            animate={{ y: [0, -6, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[150px] h-[150px] bg-blue-400/20 blur-[30px] rounded-full z-0 pointer-events-none"></div>
            
            <img 
              src={players?.batsman1?.jersey} 
              alt="jersey" 
              className="absolute inset-0 w-full h-full object-contain object-bottom z-20 drop-shadow-[8px_8px_15px_rgba(0,0,0,0.5)]" 
            />
            <img 
              src={players?.batsman1?.img} 
              alt={players?.batsman1?.name} 
              className="absolute inset-0 w-full h-full object-bottom z-10" 
            />
          </motion.div>
          
          <div className="mb-10 ml-4 flex flex-col items-center">
            <span className="text-[28px] font-bold tracking-wider uppercase text-shadow-heavy">
              Contribution
            </span>
            <motion.div variants={expandDivider} className="w-[120%] h-[3px] bg-white/80 my-[4px]"></motion.div>
            <span className="text-[48px] font-black text-shadow-heavy flex items-baseline gap-2">
              <AnimatedNumber value={p1Runs} /> 
              <span className="text-[32px] font-bold text-gray-100">
                (<AnimatedNumber value={Number(players?.batsman1?.balls || 0)} />)
              </span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* ---------------- RIGHT PLAYER SECTION ---------------- */}
      <motion.div variants={slideRight} className="absolute inset-y-0 right-[10%] w-[400px] z-20">
        
        <div className="absolute top-8 right-0 w-[280px]">
          <div className="border-[2px] border-white bg-[#112563] py-[8px] text-center shadow-lg shine-container" style={{ animationDelay: '1.5s' }}>
            <span className="text-[28px] font-bold tracking-wider uppercase text-shadow-light">
              {players?.batsman2?.name}
            </span>
          </div>
          <motion.div variants={swipeBarRight} className={`h-[8px] w-[60px] rounded-full mt-3 mr-auto ml-4 shadow-sm ${matchData.player2.color}`}></motion.div>
        </div>

        <div className="absolute bottom-0 right-0 flex items-end h-[240px] flex-row-reverse">
          <motion.div 
            className="relative w-[200px] h-[240px]"
            animate={{ y: [0, -6, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[150px] h-[150px] bg-blue-400/20 blur-[30px] rounded-full z-0 pointer-events-none"></div>

            <img 
              src={players?.batsman2?.jersey} 
              alt="jersey" 
              className="absolute inset-0 w-full h-full object-contain object-bottom z-20 drop-shadow-[-8px_8px_15px_rgba(0,0,0,0.5)] transform scale-x-[-1]" 
            />
            <img 
              src={players?.batsman2?.img} 
              alt={players?.batsman2?.name} 
              className="absolute inset-0 w-full h-full object-bottom z-10 transform scale-x-[-1]" 
            />
          </motion.div>
          
          <div className="mb-10 mr-4 flex flex-col items-center">
            <span className="text-[28px] font-bold tracking-wider uppercase text-shadow-heavy">
              Contribution
            </span>
            <motion.div variants={expandDivider} className="w-[120%] h-[3px] bg-white/80 my-[4px]"></motion.div>
            <span className="text-[48px] font-black text-shadow-heavy flex items-baseline gap-2">
              <AnimatedNumber value={p2Runs} /> 
              <span className="text-[32px] font-bold text-gray-100">
                (<AnimatedNumber value={Number(players?.batsman2?.balls || 0)} />)
              </span>
            </span>
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
};

export default PartnershipOverlay;