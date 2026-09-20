import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

const WormOverlay = ({ onClose }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchWormData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5015/get_worm');
        const json = await response.json();
        if (json.success) setData(json);
      } catch (error) {
        console.error("Error fetching worm data:", error);
      }
    };
    fetchWormData();
    const interval = setInterval(fetchWormData, 5000);
    return () => clearInterval(interval);
  }, []);

  // 1. SAFE DATA CHECK (Prevents crashes before early return)
  const isDataValid = data && data.innings && data.innings.length > 0;

  // 2. MATH & SCALING CALCS (Done conditionally so they don't crash on null data)
  const width = 1500;
  const height = 600;
  const paddingX = 90;
  const paddingY = 80;
  const graphW = width - paddingX * 2;
  const graphH = height - paddingY * 2;

  const highestOverInData = isDataValid ? Math.max(
    ...data.innings.map(inn => inn.total_overs || 0),
    ...data.innings.flatMap(inn => inn.progression.map(p => p.over || 0))
  ) : 20;
  
  const maxOvers = highestOverInData > 50 ? Math.ceil(highestOverInData / 10) * 10 : highestOverInData > 20 ? 50 : 20;
  
  const highestRuns = isDataValid ? Math.max(...data.innings.flatMap(inn => inn.progression.map(p => p.cumulative_runs || 0)), 60) : 60;
  const maxRunsScale = Math.ceil((highestRuns + 15) / 20) * 20;

  const parseCricketOver = (overDecimal) => {
    const wholeOver = Math.floor(overDecimal);
    const balls = Math.round((overDecimal - wholeOver) * 10);
    return wholeOver + (balls / 6);
  };

  const getX = (over) => paddingX + (over / maxOvers) * graphW;
  const getY = (runs) => height - paddingY - (runs / maxRunsScale) * graphH;

  const inningColors = [
    { stroke: "#22d3ee", glow: "rgba(34, 211, 238, 0.8)", text: "text-cyan-300", bg: "bg-cyan-400", hex: "#22d3ee" },
    { stroke: "#facc15", glow: "rgba(250, 204, 21, 0.8)", text: "text-yellow-300", bg: "bg-yellow-400", hex: "#facc15" }
  ];

  // 3. USE MEMO HOOK (MUST be called before any early returns to satisfy React rules)
  const resolvedWicketPositions = useMemo(() => {
    if (!isDataValid) return [];

    const placedBoxes = [];
    const results = [];

    data.innings.forEach((inn, innIdx) => {
      const markers = inn.fall_of_wickets_markers || [];
      markers.forEach((w, wIdx) => {
        const exactOver = parseCricketOver(w.over);
        const cx = getX(exactOver);
        const cy = getY(w.cumulative_runs);
        
        const labelText = `${w.batsman?.name || `Wkt ${w.wicket_number}`} (${w.over})`;
        const rectWidth = labelText.length * 9 + 30; 
        const rectHeight = 30;
        
        let dir = wIdx % 2 === 0 ? -1 : 1; 
        let yOffset = 35 * dir; 
        
        let overlap = true;
        let attempts = 0;
        
        while (overlap && attempts < 15) {
          overlap = false;
          const box = {
            left: cx - rectWidth / 2 - 5,
            right: cx + rectWidth / 2 + 5,
            top: cy + yOffset - rectHeight / 2 - 5,
            bottom: cy + yOffset + rectHeight / 2 + 5
          };
          
          for (let p of placedBoxes) {
            if (!(box.right < p.left || box.left > p.right || box.bottom < p.top || box.top > p.bottom)) {
              overlap = true;
              break;
            }
          }
          
          if (overlap) {
            yOffset += 35 * dir;
            attempts++;
          }
        }
        
        placedBoxes.push({
          left: cx - rectWidth / 2,
          right: cx + rectWidth / 2,
          top: cy + yOffset - rectHeight / 2,
          bottom: cy + yOffset + rectHeight / 2
        });
        
        results.push({ innIdx, wIdx, cx, cy, labelText, rectWidth, rectHeight, yOffset });
      });
    });
    return results;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, maxOvers, maxRunsScale, isDataValid]);

  // --- Animation Variants ---
  const overlayVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.4 } }
  };
  const drawLine = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { pathLength: 1, opacity: 1, transition: { duration: 2.2, ease: "easeInOut", delay: 0.4 } }
  };
  const popInWicket = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i) => ({ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 15, delay: 1.2 + i * 0.15 } })
  };

  const getXLabels = () => {
    if (maxOvers <= 20) return [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
    if (maxOvers <= 50) return [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
    return Array.from({ length: Math.ceil(maxOvers / 10) + 1 }, (_, i) => i * 10);
  };

  // 4. EARLY RETURN (Now safely placed AFTER all hooks!)
  if (!isDataValid) return null;

  return (
    <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit" className="absolute inset-0 w-full h-full bg-black/60 backdrop-blur-md z-50 flex items-center justify-center font-sans text-white">
      <div className="relative w-[1600px] h-[900px] bg-gradient-to-br from-[#0d1e57] via-[#112563] to-[#0a1538] border-[3px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden rounded-xl">
        
        {/* Header */}
        <div className="absolute top-0 left-0 w-full h-[100px] bg-[#2a4db5] border-b-[3px] border-white flex items-center justify-between px-12 shadow-lg z-20">
          <span className="text-[42px] font-black tracking-widest uppercase" style={{ textShadow: '2px 2px 5px rgba(0,0,0,0.9)' }}>Worm Graph</span>
          <div className="flex gap-10">
            {data.innings.map((inn, idx) => (
              <div key={`header-${inn.team_id || idx}`} className="flex flex-col items-end">
                <span className={`text-[18px] font-bold uppercase tracking-widest ${inningColors[idx % 2].text}`}>{inn.team_name} ({inn.team_short_name})</span>
                <span className="text-[36px] font-black leading-none drop-shadow-md">{inn.total_runs}/{inn.total_wickets} <span className="text-[20px] text-gray-300 ml-2 font-semibold">({inn.total_overs} ov)</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="absolute top-[125px] w-full flex justify-center gap-12 z-20">
          {data.innings.map((inn, idx) => {
            const colors = inningColors[idx % 2];
            return (
              <div key={`legend-${idx}`} className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className={`w-[32px] h-[6px] rounded-full ${colors.bg}`}></div>
                  <span className="text-[20px] font-bold tracking-wider">{inn.team_short_name} Line</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-[14px] h-[14px] rounded-full border-2 border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" style={{ backgroundColor: colors.hex }}></div>
                  <span className="text-[18px] font-semibold text-gray-300">{inn.team_short_name} Wicket</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* SVG Graph */}
        <div className="absolute bottom-[45px] left-1/2 -translate-x-1/2 w-[1500px] h-[600px] z-10">
          <svg width="1500" height="600" className="overflow-visible">
            
            {/* Grid Y */}
            {[...Array(6)].map((_, i) => {
              const y = paddingY + (i / 5) * graphH;
              return (
                <g key={`grid-y-${i}`}>
                  <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
                  <text x={paddingX - 20} y={y + 8} fill="white" fontSize="22" fontWeight="bold" textAnchor="end">{Math.round(maxRunsScale - (i / 5) * maxRunsScale)}</text>
                </g>
              );
            })}

            {/* Grid X */}
            {getXLabels().map((overNum) => {
              const x = getX(overNum);
              return (
                <g key={`grid-x-${overNum}`}>
                  <line x1={x} y1={paddingY} x2={x} y2={height - paddingY} stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeDasharray="4,4" />
                  <text x={x} y={height - paddingY + 36} fill="white" fontSize="22" fontWeight="bold" textAnchor="middle">{overNum}</text>
                </g>
              );
            })}

            {/* Inning Paths */}
            {data.innings.map((inn, idx) => {
              let path = `M ${getX(0)} ${getY(0)}`;
              inn.progression.forEach((p) => { path += ` L ${getX(p.over)} ${getY(p.cumulative_runs)}`; });
              const colors = inningColors[idx % 2];
              return (
                <motion.path 
                  key={`worm-line-${idx}`} 
                  d={path} fill="none" stroke={colors.stroke} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" 
                  style={{ filter: `drop-shadow(0px 0px 10px ${colors.glow})` }} 
                  variants={drawLine} 
                />
              );
            })}

            {/* Collision-Resolved Wicket Markers (Color-matched to team) */}
            {resolvedWicketPositions.map((wp) => {
              const teamColor = inningColors[wp.innIdx % 2].hex;
              return (
                <motion.g key={`w-marker-${wp.innIdx}-${wp.wIdx}`} custom={wp.wIdx} variants={popInWicket}>
                  
                  {Math.abs(wp.yOffset) > 40 && (
                    <line 
                      x1={wp.cx} y1={wp.cy} 
                      x2={wp.cx} y2={wp.cy + wp.yOffset} 
                      stroke="rgba(255,255,255,0.5)" 
                      strokeWidth="2" 
                      strokeDasharray="4,4" 
                    />
                  )}

                  <circle cx={wp.cx} cy={wp.cy} r="10" fill={teamColor} stroke="#ffffff" strokeWidth="3" style={{ filter: `drop-shadow(0px 0px 8px ${teamColor})` }} />
                  <text x={wp.cx} y={wp.cy + 4} fill="#000000" fontSize="12" fontWeight="black" textAnchor="middle">W</text>
                  
                  <g transform={`translate(${wp.cx}, ${wp.cy + wp.yOffset})`}>
                    <rect 
                      x={-(wp.rectWidth / 2)} 
                      y={-(wp.rectHeight / 2)} 
                      width={wp.rectWidth} 
                      height={wp.rectHeight} 
                      rx="6" 
                      fill="#0d1e57" 
                      stroke={teamColor} 
                      strokeWidth="2" 
                      className="shadow-md"
                    />
                    <text x="0" y="5" fill="white" fontSize="15" fontWeight="bold" textAnchor="middle">
                      {wp.labelText}
                    </text>
                  </g>
                </motion.g>
              );
            })}

            <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="white" strokeWidth="4" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

export default WormOverlay;