import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import ScoreBanner from "./components/ScoreBanner";
import MainContentGrid from "./components/MainContentGrid";
import BattingStatsBoard from "./components/BattingStatsBoard";
import LiveGraphicArea from "./components/LiveGraphicArea";
import OversTimeline from "./components/OversTimeline";
import Playing11 from "./components/Playing11"; // Make sure this is created and imported!
import MatchSummary from "./components/MatchSummary";
import VenueInfoMatchDetails from "./components/VenueInfoMatchDetails";
import WinPrediction from "./components/WinPrediction";

const App = () => {
  // State to manage the Playing 11 modal
  const [showPlaying11, setShowPlaying11] = useState(false); // Default to true for testing
  const [targetTeamIndex, setTargetTeamIndex] = useState(0);

  // State to manage the Match Summary modal
  const [showSummary, setShowSummary] = useState(false);
  const [showVenueInfo, setShowVenueInfo] = useState(false);

  // State to manage the Win Prediction modal
  const [showWinPred, setShowWinPred] = useState(false);

  // Triggered when clicking a team name in the ScoreBanner
 const handleOpenPlaying11 = (index) => {
  setTargetTeamIndex(index);
  setShowPlaying11(true);
};

  // Triggered by the Close button or ESC key inside Playing11
  const handleClosePlaying11 = () => {
    setShowPlaying11(false);
  };

  const handleOpenVenueInfo = () => {
    setShowVenueInfo(true);
  };

  const handleOpenMatchSummary = () => {
    setShowSummary(true);
  }

  const handleWinPredictionClick = () => {
    setShowWinPred(true);
  }


const sampleWinPrediction = {
    projected_score: {
      rates: ['9.85*', '9.00', '10.00', '11.00'],
      scores: ['196', '193', '197', '202']
    },
    team_left: { name: 'KR', percent: 57 },
    team_right: { name: 'CK', percent: 43 }
  };

  return (
    <div className="relative w-[1920px] h-[1080px] bg-transparent overflow-hidden">
      
      {/* Notice: Passing the click handler to ScoreBanner */}
      <ScoreBanner onTeamClick={handleOpenPlaying11} onScoreClick={handleOpenVenueInfo} />
      
      <MainContentGrid>
        <BattingStatsBoard onBatsmanClick={handleOpenMatchSummary} onRunClick={handleWinPredictionClick}  />
        <LiveGraphicArea />
      </MainContentGrid>
      
      <OversTimeline />

      {/* --- PLAYING 11 MODAL OVERLAY --- */}
      <AnimatePresence>
        {showPlaying11 && (
          <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center">
            <Playing11 
              initialTeam={targetTeamIndex} 
              onClose={handleClosePlaying11} 
            />
          </div>
        )}
      </AnimatePresence>


      {/* MATCH SUMMARY OVERLAY */}
      <AnimatePresence>
        {showSummary && (
          <MatchSummary onClose={() => setShowSummary(false)} />
        )}
      </AnimatePresence>


      {/* VENUE INFO MODAL */}
      <AnimatePresence>
        {showVenueInfo && (
          <VenueInfoMatchDetails onClose={() => setShowVenueInfo(false)} />
        )}
      </AnimatePresence>


      {/* WIN PREDICTION MODAL */}
      <AnimatePresence>
        {showWinPred && (
          <WinPrediction 
            winPredictionData={sampleWinPrediction} 
            onClose={() => setShowWinPred(false)} 
          />
        )}
      </AnimatePresence>
      
    </div>
  );
};

export default App;