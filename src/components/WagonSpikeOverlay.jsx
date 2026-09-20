import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloseSharp } from "react-icons/io5";

export default function WagonSpikeOverlay({ onClose }) {
  const [spikeData, setSpikeData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [selectedBatterId, setSelectedBatterId] = useState('');
  const [selectedBowlerId, setSelectedBowlerId] = useState('ALL');
  const [runFilter, setRunFilter] = useState('ALL'); 
  const [viewMode, setViewMode] = useState('spike');

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://127.0.0.1:5015/get_spike_graph');
        const json = await res.json();
        
        if (json.success) {
          setSpikeData(json);
          const batters = json.batters || [];
          if (batters.length > 0) {
            const striker = batters.find(b => b.is_striker) || batters[0];
            setSelectedBatterId(String(striker.player_id));
            
            const currentBowler = striker.bowlers_faced?.find(b => b.is_current_bowler);
            if (currentBowler) {
              setSelectedBowlerId(String(currentBowler.bowler_id));
            } else if (striker.bowlers_faced?.length > 1) {
              const lastBowler = striker.bowlers_faced[striker.bowlers_faced.length - 1];
              setSelectedBowlerId(String(lastBowler.bowler_id));
            }
          }
        }
      } catch (err) {
        console.error("Error fetching spike graph:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const battersList = spikeData?.batters || [];
  const activeBatter = useMemo(() => battersList.find(p => String(p.player_id) === selectedBatterId) || battersList[0], [battersList, selectedBatterId]);
  const availableBowlers = useMemo(() => activeBatter?.bowlers_faced || [], [activeBatter]);
  
  const selectedBowlerData = useMemo(() => {
    if (!activeBatter) return null;
    if (selectedBowlerId === 'ALL') return activeBatter.selected_bowler;
    return availableBowlers.find(b => String(b.bowler_id) === selectedBowlerId);
  }, [activeBatter, selectedBowlerId, availableBowlers]);

  const allActiveSpikes = selectedBowlerData?.spikes || [];
  const counts = selectedBowlerData?.counts || { dots: 0, ones: 0, twos: 0, threes: 0, fours: 0, sixes: 0 };

  const displayedShots = useMemo(() => {
    return allActiveSpikes.filter(shot => runFilter === 'ALL' || shot.runs === Number(runFilter));
  }, [allActiveSpikes, runFilter]);

  const zoneStats = useMemo(() => {
    let offRuns = 0; 
    let legRuns = 0;

    const zones = {
      thirdMan: 0, fineLeg: 0, squareLeg: 0, midWicket: 0,
      longOn: 0, longOff: 0, covers: 0, point: 0
    };

    displayedShots.forEach(shot => {
      const cx = shot.to_x !== undefined ? shot.to_x : shot.wagonX;
      const cy = shot.to_y !== undefined ? shot.to_y : shot.wagonY;
      const runs = shot.runs || 0;

      if (cx === undefined || cy === undefined) return;

      // Batter is at Top (180, 170) facing Down (y=360).
      // Left side of screen (x < 180) is Off-side. Right side (x > 180) is Leg-side.
      if (cx < 180) offRuns += runs;
      else legRuns += runs;

      const dx = cx - 180;
      const dy = cy - 170;
      let angle = Math.atan2(dy, dx) * (180 / Math.PI); 
      if (angle < 0) angle += 360; 

      // Correct Angle Mapping for Batter at Top facing Down:
      // 90° = Straight Down (Long On / Long Off)
      // 0° = Right (Square Leg)
      // 180° = Left (Point)
      // 270° = Up / Behind (Third Man / Fine Leg)
      if (angle >= 270 && angle < 315) zones.fineLeg += runs;
      else if (angle >= 315 && angle < 360) zones.squareLeg += runs;
      else if (angle >= 0 && angle < 45) zones.midWicket += runs;
      else if (angle >= 45 && angle < 90) zones.longOn += runs;
      else if (angle >= 90 && angle < 135) zones.longOff += runs;
      else if (angle >= 135 && angle < 180) zones.covers += runs;
      else if (angle >= 180 && angle < 225) zones.point += runs;
      else if (angle >= 225 && angle < 270) zones.thirdMan += runs;
    });

    return { offRuns, legRuns, zones };
  }, [displayedShots]);

  const getShotColor = (runs) => {
    if (runs === 4) return '#00ffff'; 
    if (runs === 6) return '#bf00ff'; 
    if (runs === 3) return '#ff9100'; 
    if (runs === 2) return '#ffd500'; 
    if (runs === 1) return '#ffffff'; 
    return '#ef4444'; 
  };

  const GROUND_SIZE = 700;
  const SCALE = GROUND_SIZE / 360; 
  const START_X = 180 * SCALE; 
  const START_Y = 170 * SCALE;

  return (
    <div className="absolute inset-0 w-[1920px] h-[1080px] z-50 flex text-white select-none overflow-hidden bg-gradient-to-r from-[#0d1e57] via-[#2a4db5] to-[#0d1e57] font-sans">
      <style>{`
        .text-shadow-heavy { text-shadow: 2px 2px 5px rgba(0,0,0,0.9); }
        .shine-container { position: relative; overflow: hidden; }
        .shine-container::after {
          content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transform: skewX(-25deg); animation: shine-sweep 3s infinite; pointer-events: none;
        }
        @keyframes shine-sweep { 0% { left: -100%; } 20%, 100% { left: 200%; } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #22d3ee; border-radius: 10px; }
      `}</style>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-[42px] font-black text-cyan-400 animate-pulse uppercase text-shadow-heavy">
          Loading Ground Data...
        </div>
      ) : activeBatter ? (
        <>
          <div className="w-[1248px] h-full flex flex-col items-center justify-center relative bg-[radial-gradient(ellipse_at_center,_#06183d_0%,_#030919_100%)] shadow-[20px_0_60px_rgba(0,0,0,0.9)] z-20 overflow-hidden">
            
            <div className="absolute top-8 flex bg-[#112563] rounded-xl p-1 border-[2px] border-white/25 shadow-2xl z-40 shine-container">
              <button onClick={() => setViewMode('wagon')} className={`px-8 py-3 text-[18px] font-black uppercase rounded-lg transition-all ${viewMode === 'wagon' ? 'bg-cyan-400 text-black shadow-[0_0_20px_#22d3ee]' : 'text-gray-300 hover:text-white'}`}>
                Wagon Zone (Pizza)
              </button>
              <button onClick={() => setViewMode('spike')} className={`px-8 py-3 text-[18px] font-black uppercase rounded-lg transition-all ${viewMode === 'spike' ? 'bg-cyan-400 text-black shadow-[0_0_20px_#22d3ee]' : 'text-gray-300 hover:text-white'}`}>
                3D Spike Ground
              </button>
            </div>

            {/* OFF & LEG BADGES FIXED PLACEMENT: Off is Left (x<180), Leg is Right (x>180) */}
            <div className="absolute left-10 top-1/2 -translate-y-1/2 bg-[#071124] border-[3px] border-white/30 rounded-2xl flex flex-col overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.8)] z-30">
              <div className="bg-white text-black text-[24px] font-black uppercase px-6 py-1 text-center">OFF</div>
              <div className="text-white text-[56px] font-black text-center px-6 py-2 leading-none text-shadow-heavy">{zoneStats.offRuns}</div>
            </div>
            <div className="absolute right-10 top-1/2 -translate-y-1/2 bg-[#071124] border-[3px] border-white/30 rounded-2xl flex flex-col overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.8)] z-30">
              <div className="bg-white text-black text-[24px] font-black uppercase px-6 py-1 text-center">LEG</div>
              <div className="text-white text-[56px] font-black text-center px-6 py-2 leading-none text-shadow-heavy">{zoneStats.legRuns}</div>
            </div>

            <div className="relative flex items-center justify-center w-full h-full pt-12">
              <AnimatePresence mode="wait">
                
                {viewMode === 'wagon' && (
                  <motion.div key="wagon-pie" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: "spring", stiffness: 150 }}>
                    <div className="relative w-[700px] h-[700px] rounded-full overflow-hidden border-[16px] border-[#d7d7d7] shadow-[0_30px_70px_rgba(0,0,0,0.9)] bg-[#28a745]">
                      
                      <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full">
                        {[
                          { id: 'thirdMan', d: "M 200 200 L 200 0 A 200 200 0 0 0 58.58 58.58 Z", runs: zoneStats.zones.thirdMan, label: "THIRD MAN", x: 125, y: 95 },
                          { id: 'point', d: "M 200 200 L 58.58 58.58 A 200 200 0 0 0 0 200 Z", runs: zoneStats.zones.point, label: "POINT", x: 75, y: 155 },
                          { id: 'covers', d: "M 200 200 L 0 200 A 200 200 0 0 0 58.58 341.42 Z", runs: zoneStats.zones.covers, label: "COVERS", x: 90, y: 260 },
                          { id: 'longOff', d: "M 200 200 L 58.58 341.42 A 200 200 0 0 0 200 400 Z", runs: zoneStats.zones.longOff, label: "LONG OFF", x: 155, y: 320 },
                          { id: 'longOn', d: "M 200 200 L 200 400 A 200 200 0 0 0 341.42 341.42 Z", runs: zoneStats.zones.longOn, label: "LONG ON", x: 245, y: 320 },
                          { id: 'midWicket', d: "M 200 200 L 341.42 341.42 A 200 200 0 0 0 400 200 Z", runs: zoneStats.zones.midWicket, label: "MID WICKET", x: 310, y: 260 },
                          { id: 'squareLeg', d: "M 200 200 L 400 200 A 200 200 0 0 0 341.42 58.58 Z", runs: zoneStats.zones.squareLeg, label: "SQUARE LEG", x: 325, y: 155 },
                          { id: 'fineLeg', d: "M 200 200 L 341.42 58.58 A 200 200 0 0 0 200 0 Z", runs: zoneStats.zones.fineLeg, label: "FINE LEG", x: 275, y: 95 }
                        ].map((slice, idx) => {
                          const fillColor = slice.runs > 5 ? '#14532d' : slice.runs > 2 ? '#16a34a' : slice.runs > 0 ? '#4ade80' : '#86efac';
                          return (
                            <g key={slice.id}>
                              <motion.path
                                d={slice.d}
                                fill={fillColor}
                                stroke="#ffffff"
                                strokeWidth="4"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, delay: idx * 0.05 }}
                              />
                              <motion.text
                                x={slice.x}
                                y={slice.y}
                                fill="#ffffff"
                                fontSize="36"
                                fontWeight="black"
                                textAnchor="middle"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, delay: 0.3 + idx * 0.05 }}
                                className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                              >
                                {slice.runs}
                              </motion.text>
                            </g>
                          );
                        })}
                      </svg>

                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50px] h-[150px] bg-[#d2b48c] border-2 border-white z-10 shadow-2xl pointer-events-none">
                        <div className="absolute top-[20px] left-[3px] w-[40px] h-[3px] bg-white" />
                        <div className="absolute bottom-[20px] left-[3px] w-[40px] h-[3px] bg-white" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {viewMode === 'spike' && (
                  <motion.div key="spike-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div 
                      className="relative w-[750px] h-[750px] rounded-full overflow-hidden border-[16px] border-[#d7d7d7]"
                      style={{
                        transform: 'perspective(1200px) rotateX(15deg)',
                        background: 'repeating-linear-gradient(90deg, #79b800 0px, #79b800 35px, #8ccb18 35px, #8ccb18 70px)',
                        boxShadow: 'inset 0 0 40px rgba(255,255,255,.25), inset 0 0 100px rgba(0,0,0,.4), 0 30px 60px rgba(0,0,0,.9)'
                      }}
                    >
                      <div className="absolute w-[460px] h-[540px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-[7px] border-dashed border-white/90 rounded-full pointer-events-none" />
                      
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[82px] h-[235px] bg-gradient-to-r from-[#d29a38] via-[#f0c86f] to-[#d29a38] border-[2px] border-[#f6dfa2] z-10 pointer-events-none shadow-lg">
                        <div className="absolute top-[22px] left-[5px] w-[72px] h-[3px] bg-white pointer-events-none" />
                        <div className="absolute bottom-[22px] left-[5px] w-[72px] h-[3px] bg-white pointer-events-none" />
                      </div>

                      <div className="absolute inset-0 z-[100] pointer-events-none">
                        {displayedShots.map((shot, i) => {
                          const cx = shot.to_x !== undefined ? shot.to_x : shot.wagonX;
                          const cy = shot.to_y !== undefined ? shot.to_y : shot.wagonY;
                          if (cx === undefined || cy === undefined) return null;

                          const dx = (cx - 180) * SCALE;
                          const dy = (cy - 170) * SCALE;
                          const distance = Math.sqrt(dx * dx + dy * dy);
                          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
                          const color = getShotColor(shot.runs);

                          return (
                            <motion.div
                              key={`spike-${i}`}
                              className="absolute h-[10px] rounded-full z-[101]"
                              style={{
                                left: START_X, top: START_Y, transformOrigin: '0% 50%',
                                backgroundColor: color, boxShadow: `0 0 12px ${color}, 0 0 4px #fff`
                              }}
                              initial={{ width: 0, rotate: angle }}
                              animate={{ width: distance, rotate: angle }}
                              transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.03 }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="w-[672px] h-full bg-[#0d1e57] border-l-[4px] border-cyan-500 flex flex-col p-10 z-30 overflow-y-auto custom-scrollbar shadow-2xl">
            
            <button onClick={onClose} className="absolute top-6 right-6 w-[55px] h-[55px] bg-red-600 border-[3px] border-white flex items-center justify-center hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.8)] rounded-xl transition-colors z-50 cursor-pointer">
              <IoCloseSharp size={40} color="white" />
            </button>

            <div className="flex items-center gap-6 pb-6 border-b-[2px] border-white/20 mt-4 bg-[#112563] p-6 rounded-3xl border border-white/10 shadow-lg">
              <div className="w-[130px] h-[130px] bg-white rounded-full border-[4px] border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.6)] overflow-hidden shrink-0">
                <img src={activeBatter.image || "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/316500/316584.png"} alt="Player" className="w-full h-full object-cover object-top"/>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-cyan-400 text-[14px] font-black uppercase tracking-widest mb-1">Select Striker</span>
                <select 
                  value={selectedBatterId} 
                  onChange={(e) => { setSelectedBatterId(e.target.value); setSelectedBowlerId('ALL'); setRunFilter('ALL'); }}
                  className="bg-transparent border-none text-white text-[38px] font-black uppercase outline-none cursor-pointer p-0 appearance-none truncate text-shadow-heavy"
                >
                  {battersList.map(b => (
                    <option key={b.player_id} value={String(b.player_id)} className="bg-[#0c1a3b] text-[18px]">{b.name}</option>
                  ))}
                </select>
                <div className="flex items-baseline gap-4 mt-2 border-t border-white/20 pt-3">
                  <span className="text-[30px] font-black text-yellow-400 leading-none">{activeBatter.runs} runs</span>
                  <span className="text-[20px] font-bold text-gray-300">({activeBatter.balls})</span>
                </div>
                <div className="flex gap-4 mt-1">
                  <span className="text-[16px] text-white font-bold">{activeBatter.fours} Fours</span>
                  <span className="text-[16px] text-white font-bold">• {activeBatter.sixes} Sixes</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col mt-6 mb-6 bg-[#112563] p-5 rounded-2xl border border-white/10 shadow-lg">
              <span className="text-gray-400 text-[16px] font-black uppercase tracking-wider mb-2">Versus Bowler</span>
              <div className="relative">
                <select 
                  value={selectedBowlerId} 
                  onChange={(e) => { setSelectedBowlerId(e.target.value); setRunFilter('ALL'); }}
                  className="w-full bg-[#0a1638] border-[2px] border-cyan-500/50 text-white text-[22px] font-black uppercase px-6 py-3 rounded-xl outline-none cursor-pointer focus:border-cyan-400 appearance-none"
                >
                  <option value="ALL" className="bg-[#0c1a3b]">ALL BOWLERS</option>
                  {availableBowlers.filter(b => b.bowler_id !== 'all').map(b => (
                    <option key={b.bowler_id} value={String(b.bowler_id)} className="bg-[#0c1a3b]">{b.bowler_name}</option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400 text-[20px]">▼</div>
              </div>
            </div>

            <div className="flex justify-between items-center bg-[#112563]/60 p-6 rounded-2xl border border-white/10 shadow-inner mb-6">
              <div className="flex flex-col w-[60%]">
                <span className="text-cyan-400 text-[14px] font-black uppercase tracking-widest mb-1">Productive Shot</span>
                <span className="text-white text-[28px] font-black uppercase leading-tight text-shadow-heavy mb-1">
                  {activeBatter.productive_shot?.shot || "N/A"}
                </span>
                <span className="text-gray-300 text-[16px] font-bold">
                  {activeBatter.productive_shot?.runs || 0} runs • {activeBatter.productive_shot?.fours || 0} fours
                </span>
              </div>
              
              <div className="flex flex-col items-end w-[40%]">
                <span className="text-cyan-400 text-[14px] font-black uppercase tracking-widest mb-1">Control</span>
                <span className="text-white text-[42px] font-black leading-none drop-shadow-md">
                  {Math.round(activeBatter.control_percentage || 0)}%
                </span>
                <div className="w-[100px] h-[6px] bg-white/20 rounded-full mt-2 overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"
                    initial={{ width: 0 }} animate={{ width: `${activeBatter.control_percentage || 0}%` }} transition={{ duration: 1 }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col flex-1">
              <span className="text-gray-300 text-[18px] font-black uppercase tracking-wider mb-3 border-b border-white/20 pb-2">Filter Shots by Runs</span>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'ALL', label: 'All Shots', color: 'bg-white', border: 'border-white/50', total: '' },
                  { id: 1, label: '1s', color: 'bg-white', border: 'border-white', total: counts.ones },
                  { id: 2, label: '2s', color: 'bg-yellow-400', border: 'border-yellow-400', total: counts.twos },
                  { id: 3, label: '3s', color: 'bg-orange-500', border: 'border-orange-500', total: counts.threes },
                  { id: 4, label: '4s', color: 'bg-cyan-400', border: 'border-cyan-400', total: counts.fours },
                  { id: 6, label: '6s', color: 'bg-purple-500', border: 'border-purple-500', total: counts.sixes },
                  { id: 0, label: 'Dots', color: 'bg-red-500', border: 'border-red-500', total: counts.dots }
                ].map(btn => {
                  const isActive = String(runFilter) === String(btn.id);
                  return (
                    <button
                      key={btn.id}
                      onClick={() => setRunFilter(btn.id)}
                      className={`flex items-center justify-between px-5 py-3 rounded-xl border-[2px] transition-all cursor-pointer ${
                        isActive 
                        ? `${btn.border} bg-[#0a1638] shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-[1.02]` 
                        : 'border-white/10 bg-[#112563] hover:bg-[#0a1638] hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {btn.id !== 'ALL' && (
                          <div className={`w-[14px] h-[14px] rounded-full ${btn.color} shadow-[0_0_8px_currentColor]`}></div>
                        )}
                        <span className={`text-[20px] font-black uppercase ${isActive ? 'text-white' : 'text-gray-300'}`}>
                          {btn.label}
                        </span>
                      </div>
                      {btn.total !== '' && (
                        <span className="text-[20px] font-black text-white/50">{btn.total}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </>
      ) : null}
    </div>
  );
}