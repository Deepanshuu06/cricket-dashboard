import React from 'react';
import CricketWagonWheel from './CricketWagonWheel';
import CricketPitchSimulator from './CricketPitchSimulator';

const LiveGraphicArea = () => {
  // return (
  //   // Fixed height of 594px matches exactly a 16:9 aspect ratio for the 1056px width panel
  //   <div className="relative w-full h-[594px] bg-green-500 border-[4px] border-blue-900 overflow-hidden flex items-end justify-center font-sans">
      
  //     {/* Simulated 3D Stadium/Pitch Background */}
  //     <div className="absolute inset-0 bg-[url('https://via.placeholder.com/1056x594/4ade80/000000?text=3D+Stadium+Pitch+View')] bg-cover bg-center opacity-90 z-0" />

  //     {/* Current Run Rate Badge (Scaled up) */}
  //     <div className="absolute top-0 right-0 bg-gradient-to-b from-blue-700 to-blue-900 text-white font-black text-4xl px-8 py-3 border-b-[4px] border-l-[4px] border-blue-500 shadow-xl z-10 tracking-wider">
  //       CRR: 6.00
  //     </div>

  //     {/* Batter Profile Inset (Left) */}
  //     <div className="absolute left-8 bottom-[100px] z-10">
  //       <div className="w-[140px] h-[180px] bg-gradient-to-b from-blue-400 to-blue-600 rounded-2xl border-[4px] border-white overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.8)] flex items-end justify-center">
  //         <img src="https://via.placeholder.com/140x180/1e3a8a/ffffff?text=Batter" alt="Batter profile" className="w-full h-full object-cover" />
  //       </div>
  //     </div>

  //     {/* Bowler Profile Inset (Right) */}
  //     <div className="absolute right-8 bottom-[100px] z-10">
  //       <div className="w-[140px] h-[140px] bg-gradient-to-b from-red-500 to-red-700 rounded-full border-[4px] border-white overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.8)] flex items-center justify-center">
  //         <img src="https://via.placeholder.com/140x140/7f1d1d/ffffff?text=Bowler" alt="Bowler profile" className="w-full h-full object-cover" />
  //       </div>
  //     </div>

  //     {/* Bowling Style Banner (Bottom) */}
  //     <div className="absolute bottom-0 w-full h-[70px] bg-black border-t-[6px] border-gray-400 z-20 flex justify-center items-center shadow-[inset_0_6px_10px_-2px_rgba(255,255,255,0.3)]">
  //       <h3 className="text-white text-3xl font-black tracking-[0.15em] text-center uppercase text-shadow-heavy">
  //         Right Arm Fast Over The Wicket
  //       </h3>
  //     </div>
  //   </div>
  // );
  return (
    // <CricketWagonWheel />
    <CricketPitchSimulator />
  );
};

export default LiveGraphicArea;