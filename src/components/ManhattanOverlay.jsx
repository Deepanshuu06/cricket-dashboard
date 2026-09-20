import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ManhattanOverlay = ({ onClose }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5015/get_manhattan');
        const json = await response.json();
        if (json.success) setData(json);
      } catch (error) {}
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const overlayVariants = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }, exit: { opacity: 0, scale: 0.98, transition: { duration: 0.4 } } };
  const drawBar = { hidden: { scaleY: 0, originY: 1 }, visible: (i) => ({ scaleY: 1, transition: { duration: 0.6, ease: "easeOut", delay: 0.2 + i * 0.03 } }) };
  const popInWicket = { hidden: { scale: 0, opacity: 0 }, visible: (i) => ({ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 15, delay: 0.6 + i * 0.03 } }) };

  if (!data) return null;

  const width = 1500;
  const height = 600;
  const paddingX = 80;
  const paddingY = 80;
  const graphW = width - paddingX * 2;
  const graphH = height - paddingY * 2;

  // --- DYNAMIC SCALING LOGIC ---
  const highestOverInData = Math.max(
    ...data.team1_bars.map(b => b.over || 0),
    ...data.team2_bars.map(b => b.over || 0),
    0
  );
  const maxOvers = highestOverInData > 50 ? Math.ceil(highestOverInData / 10) * 10 : highestOverInData > 20 ? 50 : 20;
  
  // Shrink bar width if match is 50 overs to fit nicely
  const barWidth = maxOvers > 20 ? 8 : 18; 

  const allRuns = [...data.team1_bars.map(b => b.runs || 0), ...data.team2_bars.map(b => b.runs || 0)];
  const maxRuns = Math.max(...allRuns, 15);

  const getX = (over, teamIndex) => {
     const overSpacing = graphW / maxOvers;
     const base = paddingX + (over - 1) * overSpacing + (overSpacing / 2);
     return teamIndex === 1 ? base - barWidth / 2 - 1 : base + barWidth / 2 + 1;
  };
  
  const getY = (runs) => height - paddingY - (runs / maxRuns) * graphH;
  const getH = (runs) => (runs / maxRuns) * graphH;

  return (
    <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit" className="absolute inset-0 w-full h-full bg-black/60 backdrop-blur-md z-50 flex items-center justify-center font-sans text-white">
      <div className="relative w-[1600px] h-[900px] bg-gradient-to-br from-[#0d1e57] via-[#112563] to-[#0a1538] border-[3px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden rounded-xl">
        
        {/* Header */}
        <div className="absolute top-0 left-0 w-full h-[100px] bg-[#2a4db5] border-b-[3px] border-white flex items-center justify-between px-12 shadow-lg z-20">
          <span className="text-[42px] font-black tracking-widest uppercase" style={{ textShadow: '2px 2px 5px rgba(0,0,0,0.9)' }}>Manhattan Chart</span>
          <div className="flex gap-10">
            <div className="flex flex-col items-end">
                <span className="text-[18px] font-bold text-cyan-300 uppercase tracking-widest">{data.team1.name}</span>
                <span className="text-[36px] font-black leading-none drop-shadow-md">{data.team1.total_runs}/{data.team1.total_wickets} <span className="text-[20px] text-gray-300">({data.team1.overs})</span></span>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-[18px] font-bold text-red-400 uppercase tracking-widest">{data.team2.name}</span>
                <span className="text-[36px] font-black leading-none drop-shadow-md">{data.team2.total_runs}/{data.team2.total_wickets} <span className="text-[20px] text-gray-300">({data.team2.overs})</span></span>
            </div>
          </div>
        </div>

        {/* SVG Graph */}
        <div className="absolute bottom-[50px] left-1/2 -translate-x-1/2 w-[1500px] h-[600px] z-10">
          <svg width="1500" height="600" className="overflow-visible">
            {[...Array(6)].map((_, i) => {
              const y = paddingY + (i / 5) * graphH;
              return (
                <g key={`grid-y-${i}`}>
                  <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                  <text x={paddingX - 20} y={y + 8} fill="white" fontSize="22" fontWeight="bold" textAnchor="end">{Math.round(maxRuns - (i / 5) * maxRuns)}</text>
                </g>
              );
            })}
            
            {/* DYNAMIC X-AXIS LABELS */}
            {[...Array(maxOvers)].map((_, i) => {
              const overNum = i + 1;
              const step = maxOvers > 20 ? 5 : 1; // Only print labels every 5 overs if ODI
              if (overNum % step !== 0 && overNum !== 1) return null;
              
              const x = paddingX + i * (graphW / maxOvers) + (graphW / maxOvers / 2);
              return (
                <text key={`over-label-${i}`} x={x} y={height - paddingY + 35} fill="white" fontSize="20" fontWeight="bold" textAnchor="middle">{overNum}</text>
              );
            })}

            {/* Team 1 Bars */}
            {data.team1_bars.map((bar, i) => (
              <g key={`t1-${bar.over}`}>
                <motion.rect x={getX(bar.over, 1)} y={getY(bar.runs)} width={barWidth} height={getH(bar.runs)} fill="#22d3ee" custom={i} variants={drawBar} />
                {[...Array(bar.wickets)].map((_, w) => (
                    <motion.circle key={`t1-w-${bar.over}-${w}`} cx={getX(bar.over, 1) + barWidth / 2} cy={getY(bar.runs) - 15 - (w * 22)} r={maxOvers > 20 ? "5" : "7"} fill="white" stroke="#0d1e57" strokeWidth="3" custom={i} variants={popInWicket} />
                ))}
              </g>
            ))}

            {/* Team 2 Bars */}
            {data.team2_bars.map((bar, i) => (
              <g key={`t2-${bar.over}`}>
                <motion.rect x={getX(bar.over, 2)} y={getY(bar.runs)} width={barWidth} height={getH(bar.runs)} fill="#ef4444" custom={i + maxOvers} variants={drawBar} />
                 {[...Array(bar.wickets)].map((_, w) => (
                    <motion.circle key={`t2-w-${bar.over}-${w}`} cx={getX(bar.over, 2) + barWidth / 2} cy={getY(bar.runs) - 15 - (w * 22)} r={maxOvers > 20 ? "5" : "7"} fill="white" stroke="#0d1e57" strokeWidth="3" custom={i + maxOvers} variants={popInWicket} />
                ))}
              </g>
            ))}
            
            <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="white" strokeWidth="4" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};
export default ManhattanOverlay;