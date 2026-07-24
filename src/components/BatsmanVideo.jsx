import React from 'react';
import useScoreStore from '../hooks/useScoreStore';

const BatsmanVideo = () => {
  const data = useScoreStore((state) => state.liveData);
  console.log("Batsman Video Data:", data);

  // Check both batsmen to see who is on strike. 
  // (Checking common variations like onStrike, on_strike, or onstrike based on your API)
  const b1 = data?.players?.batsman1;
  const b2 = data?.players?.batsman2;
  
  const activeBatsman = (b2?.onStrike === true || b2?.on_strike === true || b2?.onstrike === true) 
    ? b2 
    : b1;

  return (
    <div className="flex relative items-center justify-center h-[600px] w-full bg-[#1b1b1b] overflow-hidden">
      
      {/* Overlay Container */}
      <div className="absolute top-0 left-0 w-full h-full z-20 pointer-events-none">
        
        {/* Batsman Container (Blue Box - Top Left) */}
        <div className="absolute top-[1%] left-[3%] flex flex-col items-center justify-center">
          <img 
            className="w-35 h-35 top-10 object-contain relative" 
            src={activeBatsman?.img} 
            alt="batsman head" 
          />
          <img 
            className="w-35 h-35 object-contain -mt-8 z-10" 
            src={activeBatsman?.jersey} 
            alt="batsman jersey" 
          />
        </div>

        {/* Bowler Container (Red Box/Circle - Bottom Right) */}
        <div className="absolute bottom-[0%] right-[18%] flex flex-col items-center justify-center">
          <img 
            className="w-35 h-35 object-contain relative top-10" 
            src={data?.players?.bowler?.img} 
            alt="bowler head" 
          />
          <img 
            className="w-35 h-35 object-contain -mt-8 z-10 rounded-bl-2xl" 
            src={data?.players?.bowler?.jersey} 
            alt="bowler jersey" 
          />
        </div>

      </div>

      <video
        src="batsman.mp4" 
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-fill"
      />
    </div>
  );
};

export default BatsmanVideo;