import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import ScoreBanner from "./components/ScoreBanner";
import MainContentGrid from "./components/MainContentGrid";
import BattingStatsBoard from "./components/BattingStatsBoard";
import LiveGraphicArea from "./components/LiveGraphicArea";
import OversTimeline from "./components/OversTimeline";
import Playing11 from "./components/Playing11";
import MatchSummary from "./components/MatchSummary";
import VenueInfoMatchDetails from "./components/VenueInfoMatchDetails";
import WinPrediction from "./components/WinPrediction";
import PartnershipOverlay from "./components/PartnershipOverlay";
import BatsmanStatsOverlay from "./components/BatsmanStatsOverlay";
import FlagEditorModal from "./components/FlagEditorModal";

const App = () => {
  const [showPlaying11, setShowPlaying11] = useState(false);
  const [targetTeamIndex, setTargetTeamIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showVenueInfo, setShowVenueInfo] = useState(false);
  const [showWinPred, setShowWinPred] = useState(false);
  const [showPartnershipOverlay, setShowPartnershipOverlay] = useState(false);
  const [showBatsmanStats, setShowBatsmanStats] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerStats, setShowPlayerStats] = useState(false);

  // --- FLAGS & THEME STATES ---
  const [showFlagEditor, setShowFlagEditor] = useState(false);
  const [team1Flag, setTeam1Flag] = useState("https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/330px-Flag_of_India.svg.png");
  const [team2Flag, setTeam2Flag] = useState("https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/330px-Flag_of_India.svg.png");
  
  // Default hex codes approximating your previous Tailwind classes
  const [bannerTheme, setBannerTheme] = useState({
    t1Bg: "#3b5bdb",
    t1Header: "#ea580c",
    t2Bg: "#e63946",
    t2Header: "#1e40af"
  });

  const handleFlagClick = () => setShowFlagEditor(true);

  // Updated save handler to accept the object from the modal
  const handleSaveTheme = (newData) => {
    setTeam1Flag(newData.team1Flag);
    setTeam2Flag(newData.team2Flag);
    setBannerTheme({
      t1Bg: newData.t1Bg,
      t1Header: newData.t1Header,
      t2Bg: newData.t2Bg,
      t2Header: newData.t2Header,
    });
    setShowFlagEditor(false);
  };

  const handlePlayerClick = (playerData) => { setSelectedPlayer(playerData); setShowPlayerStats(true); };
  const handleOpenPlaying11 = (index) => { setTargetTeamIndex(index); setShowPlaying11(true); };
  const handleClosePlaying11 = () => setShowPlaying11(false);
  const handleOpenVenueInfo = () => setShowVenueInfo(true);
  const handleOpenMatchSummary = () => setShowSummary(true);
  const handleWinPredictionClick = () => setShowWinPred(true);
  const handleShowPartnershipOverlay = () => setShowPartnershipOverlay((prev) => !prev);

  const sampleWinPrediction = {
    projected_score: { rates: ['9.85*', '9.00', '10.00', '11.00'], scores: ['196', '193', '197', '202'] },
    team_left: { name: 'KR', percent: 57 },
    team_right: { name: 'CK', percent: 43 }
  };

  return (
    <div className="relative w-[1920px] h-[1080px] bg-transparent overflow-hidden">
      
      {/* Passing down the theme object and flag URLs */}
      <ScoreBanner 
        onTeamClick={handleOpenPlaying11} 
        onScoreClick={handleOpenVenueInfo} 
        team1Logo={team1Flag}
        team2Logo={team2Flag}
        themeColors={bannerTheme}
        onFlagClick={handleFlagClick}
      />
      
      <MainContentGrid>
        <BattingStatsBoard onBatsmanClick={handleOpenMatchSummary} onRunClick={handleWinPredictionClick} onSrClick={handleShowPartnershipOverlay} onPlayerClick={handlePlayerClick} />
        <LiveGraphicArea />
      </MainContentGrid>
      
      <OversTimeline />

      <AnimatePresence>
        {showPlaying11 && (
          <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center">
            <Playing11 initialTeam={targetTeamIndex} onClose={handleClosePlaying11} />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>{showSummary && <MatchSummary onClose={() => setShowSummary(false)} />}</AnimatePresence>
      <AnimatePresence>{showVenueInfo && <VenueInfoMatchDetails onClose={() => setShowVenueInfo(false)} />}</AnimatePresence>
      <AnimatePresence>{showWinPred && <WinPrediction winPredictionData={sampleWinPrediction} onClose={() => setShowWinPred(false)} />}</AnimatePresence>
      <AnimatePresence>{showPartnershipOverlay && <PartnershipOverlay />}</AnimatePresence>
      <AnimatePresence>{showPlayerStats && selectedPlayer && <BatsmanStatsOverlay player={selectedPlayer} onClose={() => setShowPlayerStats(false)} />}</AnimatePresence>

      {/* --- THEME EDITOR MODAL --- */}
      <AnimatePresence>
        {showFlagEditor && (
          <FlagEditorModal 
            currentTeam1={team1Flag} 
            currentTeam2={team2Flag} 
            currentColors={bannerTheme}
            onSave={handleSaveTheme} 
            onClose={() => setShowFlagEditor(false)} 
          />
        )}
      </AnimatePresence>
      
    </div>
  );
};

export default App;