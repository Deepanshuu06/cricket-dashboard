import React from "react";

const UmpireWide = () => {
  return (
    <div className="flex relative items-center justify-center h-[600px] w-full bg-[#1b1b1b] overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full z-20 pointer-events-none">
        <video
          src="wide.mp4"
          autoPlay

          muted
          playsInline
          className="w-full h-full object-fill"
        />
      </div>

    </div>
  );
};

export default UmpireWide;
