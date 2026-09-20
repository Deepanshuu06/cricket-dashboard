import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const RunRateOverlay = ({ onClose }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchRunRate = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5015/get_run_rate');
        const json = await response.json();
        if (json.success) setData(json);
      } catch (error) {}
    };
    fetchRunRate();
    const interval = setInterval(fetchRunRate, 5000);
    return () => clearInterval(interval);
  }, []);

  const overlayVariants = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }, exit: { opacity: 0, scale: 0.98, transition: { duration: 0.4 } } };
  const drawLine = { hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1, transition: { duration: 2.5, ease: "easeInOut", delay: 0.5 } } };
  const popInWicket = { hidden: { scale: 0, opacity: 0 }, visible: (i) => ({ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 15, delay: 1.5 + i * 0.1 } }) };

  if (!data) return null;

  // Pull short team names directly from the API response keys
  const team1Name = data.team1_short || "Team 1";
  const team2Name = data.team2_short || "Team 2";

  const width = 1500;
  const height = 600;
  const paddingX = 80;
  const paddingY = 80;
  const graphW = width - paddingX * 2;
  const graphH = height - paddingY * 2;

  // --- DYNAMIC SCALING LOGIC ---
  const highestOverInData = Math.max(...data.overs.map(o => o.over), 0);
  const maxOvers = highestOverInData > 50 ? Math.ceil(highestOverInData / 10) * 10 : highestOverInData > 20 ? 50 : 20;
  
  const maxRate = Math.max(...data.overs.map(o => Math.max(o.team1_crr || 0, o.team2_crr || 0, o.team2_rrr || 0)), 12) + 2;

  const getX = (over) => paddingX + (over / maxOvers) * graphW;
  const getY = (rate) => height - paddingY - (rate / maxRate) * graphH;

  const generatePath = (key) => {
    const points = data.overs.filter(o => o[key] !== null);
    if (points.length === 0) return "";
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.over)} ${getY(p[key])}`).join(" ");
  };

  return (
    <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit" className="absolute inset-0 w-full h-full bg-black/60 backdrop-blur-md z-50 flex items-center justify-center font-sans text-white">
      <div className="relative w-[1600px] h-[900px] bg-gradient-to-br from-[#0d1e57] via-[#112563] to-[#0a1538] border-[3px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden rounded-xl">
        
        {/* Header with Dynamic Team Names */}
        <div className="absolute top-0 left-0 w-full h-[100px] bg-[#2a4db5] border-b-[3px] border-white flex items-center justify-between px-12 shadow-lg z-20">
          <div className="flex items-center gap-8">
            <span className="text-[38px] font-black tracking-widest uppercase" style={{ textShadow: '2px 2px 5px rgba(0,0,0,0.9)' }}>Run Rate Comparison</span>
            
            {/* Legend using team1_short and team2_short */}
            <div className="flex items-center gap-6 bg-black/30 px-6 py-2 rounded-xl border border-white/20">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#22d3ee] rounded-full shadow-[0_0_8px_#22d3ee]"></div>
                <span className="text-[16px] font-bold">{team1Name} CRR</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#facc15] rounded-full shadow-[0_0_8px_#facc15]"></div>
                <span className="text-[16px] font-bold">{team2Name} CRR</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-[4px] bg-[#ef4444] rounded-full shadow-[0_0_8px_#ef4444]"></div>
                <span className="text-[16px] font-bold">Required RR</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#ef4444] border border-white rounded-full"></div>
                <span className="text-[16px] font-bold">Wicket</span>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {data.target ? (
              <div className="bg-red-600 border-2 border-white px-6 py-2 rounded-lg text-center shadow-lg">
                <div className="text-[16px] uppercase tracking-wider font-bold">Target</div>
                <div className="text-[36px] font-black leading-none">{data.target}</div>
              </div>
            ) : (
              <div className="bg-[#0a1538] border-2 border-white px-6 py-2 rounded-lg text-center shadow-lg flex flex-col justify-center">
                <div className="text-[20px] uppercase tracking-wider font-bold text-cyan-300">1st Innings</div>
              </div>
            )}
          </div>
        </div>

        {/* SVG Graph */}
        <div className="absolute bottom-[50px] left-1/2 -translate-x-1/2 w-[1500px] h-[600px] z-10">
          <svg width="1500" height="600" className="overflow-visible">
            {[...Array(6)].map((_, i) => {
              const y = paddingY + (i / 5) * graphH;
              return (
                <g key={`grid-y-${i}`}>
                  <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                  <text x={paddingX - 20} y={y + 8} fill="white" fontSize="22" fontWeight="bold" textAnchor="end">{Math.round(maxRate - (i / 5) * maxRate)}</text>
                </g>
              );
            })}
            
            {/* DYNAMIC GRID SPACING */}
            {[...Array(maxOvers + 1)].map((_, i) => {
              const step = maxOvers > 20 ? 5 : 2; 
              if (i === 0 || i % step !== 0) return null; 
              const x = getX(i);
              return (
                <g key={`grid-x-${i}`}>
                  <line x1={x} y1={paddingY} x2={x} y2={height - paddingY} stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="5,5" />
                  <text x={x} y={height - paddingY + 35} fill="white" fontSize="22" fontWeight="bold" textAnchor="middle">Over {i}</text>
                </g>
              );
            })}

            {data.overs.some(o => o.team1_crr) && <motion.path d={generatePath('team1_crr')} fill="none" stroke="#22d3ee" strokeWidth="6" variants={drawLine} />}
            {data.overs.some(o => o.team2_crr) && <motion.path d={generatePath('team2_crr')} fill="none" stroke="#facc15" strokeWidth="6" variants={drawLine} />}
            {data.overs.some(o => o.team2_rrr) && <motion.path d={generatePath('team2_rrr')} fill="none" stroke="#ef4444" strokeWidth="5" strokeDasharray="12, 8" variants={drawLine} />}

            {/* Wickets */}
            {data.overs.map((o, i) => {
              if (o.team1_crr !== null && o.team1_wickets > 0) {
                return [...Array(o.team1_wickets)].map((_, w) => (
                  <motion.circle key={`t1-w-${o.over}-${w}`} cx={getX(o.over)} cy={getY(o.team1_crr) - (w * 18)} r="8" fill="#ef4444" stroke="#ffffff" strokeWidth="2.5" custom={i + w} variants={popInWicket} />
                ));
              }
              return null;
            })}
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

export default RunRateOverlay;