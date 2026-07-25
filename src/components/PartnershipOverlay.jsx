import React from 'react';
import { motion } from 'framer-motion';
// import useScoreStore from '../hooks/useScoreStore';

const PartnershipOverlay = () => {
  // const data = useScoreStore((state) => state.liveData);
  
  // Mock data structure matching your screenshot
  const matchData = {
    player1: {
      name: "S RAZA",
      runs: 0,
      balls: 1,
      image: "https://i.pravatar.cc/150?img=11" // Replace with actual transparent player cutouts
    },
    player2: {
      name: "R BURL",
      runs: 1,
      balls: 3,
      image: "https://i.pravatar.cc/150?img=12"
    },
    partnership: {
      runs: 1,
      balls: 4
    }
  };

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-[1500px] h-[220px] bg-[#df1818] border-[6px] border-yellow-400 shadow-2xl flex items-center justify-between font-sans overflow-hidden"
    >
      {/* ---------------- CENTER SECTION ---------------- */}
      
      {/* "PARTNERSHIP" Top Banner */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#aa1212] px-16 py-1 border-x-4 border-b-4 border-white z-10">
        <h2 className="text-white text-3xl font-black tracking-wider">PARTNERSHIP</h2>
      </div>

      {/* Center Connecting Lines & Nodes */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        {/* Left Line & Node */}
        <div className="w-[35%] flex items-center">
            <div className="flex-1 h-[3px] bg-red-300 relative"></div>
            <div className="w-5 h-5 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,1)] mx-2 z-20"></div>
            <div className="w-16 h-[3px] bg-red-300"></div>
        </div>

        {/* Center Gap for Circle */}
        <div className="w-[180px]"></div>

        {/* Right Line & Node */}
        <div className="w-[35%] flex items-center">
            <div className="w-16 h-[3px] bg-red-300"></div>
            <div className="w-5 h-5 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,1)] mx-2 z-20"></div>
            <div className="flex-1 h-[3px] bg-red-300 relative"></div>
        </div>
      </div>

      {/* Main Yellow Circle */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[170px] h-[170px] rounded-full border-[14px] border-[#fff000] bg-[#df1818] flex flex-col justify-center items-center z-30 shadow-[0_0_15px_rgba(0,0,0,0.5)] mt-4">
        <span className="text-[#fff000] text-7xl font-black leading-none drop-shadow-md">{matchData.partnership.runs}</span>
        <span className="text-[#fff000] text-4xl font-bold leading-none mt-1">({matchData.partnership.balls})</span>
      </div>


      {/* ---------------- LEFT PLAYER SECTION ---------------- */}
      
      {/* Name Tag */}
      <div className="absolute top-4 left-10 z-30 w-64 text-center">
        <div className="border-[3px] border-[#fff000] bg-[#df1818] py-1 shadow-md">
          <span className="text-[#fff000] text-3xl font-black tracking-wider uppercase">{matchData.player1.name}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-end h-full relative z-20 pl-[250px] pb-6">
        {/* Player Image */}
        <img 
          src={matchData.player1.image} 
          alt="Player 1" 
          className="absolute bottom-0 left-8 w-[200px] h-[200px] object-cover object-top drop-shadow-[5px_5px_10px_rgba(0,0,0,0.5)]" 
        />
        {/* Contribution Stats */}
        <div className="text-center w-full z-20 -ml-10">
          <p className="text-[#fff000] text-3xl font-black tracking-widest uppercase mb-1 drop-shadow-md">Contribution</p>
          <div className="inline-block px-12 py-1 bg-[#df1818] rounded-xl shadow-[0_4px_4px_rgba(0,0,0,0.2)]">
            <p className="text-[#fff000] text-5xl font-black drop-shadow-md">
              {matchData.player1.runs} <span className="text-4xl text-[#fff000]">({matchData.player1.balls})</span>
            </p>
          </div>
        </div>
      </div>


      {/* ---------------- RIGHT PLAYER SECTION ---------------- */}
      
      {/* Name Tag */}
      <div className="absolute top-4 right-10 z-30 w-64 text-center">
        <div className="border-[3px] border-[#fff000] bg-[#df1818] py-1 shadow-md">
          <span className="text-[#fff000] text-3xl font-black tracking-wider uppercase">{matchData.player2.name}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-end h-full relative z-20 pr-[250px] pb-6">
        {/* Player Image */}
        <img 
          src={matchData.player2.image} 
          alt="Player 2" 
          className="absolute bottom-0 right-8 w-[200px] h-[200px] object-cover object-top drop-shadow-[-5px_5px_10px_rgba(0,0,0,0.5)] transform scale-x-[-1]" 
        />
        {/* Contribution Stats */}
        <div className="text-center w-full z-20 ml-10">
          <p className="text-[#fff000] text-3xl font-black tracking-widest uppercase mb-1 drop-shadow-md">Contribution</p>
          <div className="inline-block px-12 py-1 bg-[#df1818] rounded-xl shadow-[0_4px_4px_rgba(0,0,0,0.2)]">
            <p className="text-[#fff000] text-5xl font-black drop-shadow-md">
              {matchData.player2.runs} <span className="text-4xl text-[#fff000]">({matchData.player2.balls})</span>
            </p>
          </div>
        </div>
      </div>

    </motion.div>
  );
};

export default PartnershipOverlay;