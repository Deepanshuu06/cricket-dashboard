import React from 'react';
import useScoreStore from '../hooks/useScoreStore';
// 1. Import your video file from your assets folder. 
// Adjust the relative path and file extension (.mp4, .webm, etc.) according to your folder structure.


const BatsmanVideo = () => {

      const data = useScoreStore((state) => state.liveData);

  return (
    <div className="flex relative items-center justify-center h-[600px] w-full bg-[#1b1b1b] overflow-hidden">
        <div className="absolute flex-col  top-0 left-0 w-full h-full flex items-center justify-center z-20 pointer-events-none">
            <img className='w-32 h-32 top-0 left-0' src={data?.players?.bowler?.img} alt="bowler" />
            <img className='w-32 h-32' src={data?.players?.bowler?.jersey} alt="bowler jersey" />
        </div>
      <video
        src="batsman.mp4"  // Ensure this path is correct relative to your public folder
        autoPlay
        loop
        muted
        playsInline
        className=" h-full  object-fill"
      />
    </div>
  );
};

export default BatsmanVideo;