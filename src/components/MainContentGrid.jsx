import React from 'react';

const MainContentGrid = ({ children }) => {
  const [leftPanel, rightPanel] = React.Children.toArray(children);

  return (
    // Strictly locked to 1920px wide for 1080p broadcast screens
    <div className="w-[1920px] flex bg-blue-950 border-x-[4px] border-black overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      
      {/* Left Panel: Statistics Board (~860px wide) */}
      <div className="w-[1300px] flex flex-col bg-blue-900">
        {leftPanel}
      </div>

      {/* Divider Line */}
      <div className="w-[4px] bg-black shadow-[0_0_15px_rgba(0,0,0,0.9)] z-10" />

      {/* Right Panel: Live Broadcast Graphic (~1056px wide) */}
      <div className="w-[620px] flex flex-col relative bg-green-600">
        {rightPanel}
      </div>

    </div>
  );
};

export default MainContentGrid;