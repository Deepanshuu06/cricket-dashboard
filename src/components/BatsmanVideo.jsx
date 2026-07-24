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
      
      {/* Inline styles for the specific oval animations */}
      <style>{`
        @keyframes spin-border {
          100% { transform: rotate(360deg); }
        }
        @keyframes shine-sweep {
          0% { left: -150%; }
          50%, 100% { left: 150%; } /* Pauses for half the animation cycle to feel natural */
        }
      `}</style>

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
          
          {/* ========================================================
              ANIMATED OVAL BACKGROUND 
          ======================================================== */}
          {/* Outer wrapper: 180x240 */}
          <div className="absolute w-[180px] h-[240px] rounded-[50%] -z-10 top-7 shadow-[0_0_15px_rgba(220,38,38,0.8)] overflow-hidden flex items-center justify-center">
            
            {/* 1. Running Border: A spinning conic gradient layer behind the red background */}
            <div 
              className="absolute w-[300px] h-[300px]"
              style={{ 
                background: 'conic-gradient(transparent 50%, #ff8888 90%, #ffffff 100%)',
                animation: 'spin-border 2.5s linear infinite'
              }}
            />

            {/* 2. Inner solid red oval: Shrunk to 160x220 to create a thick 10px border */}
            <div className="absolute w-[160px] h-[220px] bg-red-600 rounded-[50%] z-10 overflow-hidden">
              
              {/* 3. Shining Background Sweep: A glassy reflection moving left to right */}
              <div 
                className="absolute top-0 w-[100px] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                style={{ animation: 'shine-sweep 3.5s infinite ease-in-out' }}
              />

            </div>
          </div>
          {/* ======================================================== */}

          <img 
            className="w-35 h-35 object-contain relative top-10 z-20" 
            src={data?.players?.bowler?.img} 
            alt="bowler head" 
          />
          <img 
            className="w-35 h-35 object-contain -mt-8 z-20 rounded-bl-2xl" 
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