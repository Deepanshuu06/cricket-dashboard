import React, { useState, useEffect } from "react";
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
import SeriesStatsModal from "./components/SeriesStatsModal";
import ImageCarousel from "./components/ImageCarousel";

const App = () => {
  // Existing states
  const [showPlaying11, setShowPlaying11] = useState(false);
  const [targetTeamIndex, setTargetTeamIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showVenueInfo, setShowVenueInfo] = useState(false);
  const [showWinPred, setShowWinPred] = useState(false);
  const [showPartnershipOverlay, setShowPartnershipOverlay] = useState(false);
  const [showBatsmanStats, setShowBatsmanStats] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [showSeriesStats, setShowSeriesStats] = useState(false); 
  const [showSlideshow, setShowSlideshow] = useState(false); 

  // --- FLAGS & THEME STATES ---
  const [showFlagEditor, setShowFlagEditor] = useState(false);
  const [team1Flag, setTeam1Flag] = useState("");
  const [team2Flag, setTeam2Flag] = useState("");
  
  const [bannerTheme, setBannerTheme] = useState({
    t1Bg: "#3b5bdb",
    t1Header: "#ea580c",
    t2Bg: "#e63946",
    t2Header: "#1e40af"
  });

  // ==========================================
  // 🧹 HELPER TO CLOSE EVERYTHING
  // ==========================================
  const closeAllOverlays = () => {
    setShowPlaying11(false);
    setShowSummary(false);
    setShowVenueInfo(false);
    setShowWinPred(false);
    setShowPartnershipOverlay(false);
    setShowPlayerStats(false);
    setShowFlagEditor(false);
    setShowSeriesStats(false);
    setShowSlideshow(false);
  };

  // ==========================================
  // ⌨️ KEYBOARD SHORTCUTS HOOK
  // ==========================================
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent triggering shortcuts when typing in input fields (like the overs input)
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      // Smart toggle: If it's open, close it. If it's closed, close EVERYTHING else and open it.
      const toggle = (currentState, setter) => {
        if (currentState) {
          setter(false);
        } else {
          closeAllOverlays();
          setter(true);
        }
      };

      switch (e.key.toLowerCase()) {
        case 'p': toggle(showPlaying11, setShowPlaying11); break;
        case 'm': toggle(showSummary, setShowSummary); break;
        case 'v': toggle(showVenueInfo, setShowVenueInfo); break;
        case 'w': toggle(showWinPred, setShowWinPred); break;
        case 'o': toggle(showPartnershipOverlay, setShowPartnershipOverlay); break;
        case 'c': toggle(showSlideshow, setShowSlideshow); break;
        case 'f': toggle(showFlagEditor, setShowFlagEditor); break;
        case 's': toggle(showSeriesStats, setShowSeriesStats); break;
        case 'escape': closeAllOverlays(); break; // Escape clears the screen
        default: break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    showPlaying11, showSummary, showVenueInfo, showWinPred, 
    showPartnershipOverlay, showPlayerStats, showFlagEditor, 
    showSeriesStats, showSlideshow
  ]); // Dependencies added so the shortcut toggle always knows what is currently open

  // ==========================================
  // 🖱️ UI CLICK HANDLERS (Now mutually exclusive)
  // ==========================================
  const handleFlagClick = () => { closeAllOverlays(); setShowFlagEditor(true); };
  
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

  const handlePlayerClick = (playerData) => { 
    closeAllOverlays(); 
    setSelectedPlayer(playerData); 
    setShowPlayerStats(true); 
  };
  
  const handleOpenPlaying11 = (index) => { 
    closeAllOverlays(); 
    setTargetTeamIndex(index); 
    setShowPlaying11(true); 
  };
  
  const handleClosePlaying11 = () => setShowPlaying11(false);
  
  const handleOpenVenueInfo = () => { closeAllOverlays(); setShowVenueInfo(true); };
  const handleOpenMatchSummary = () => { closeAllOverlays(); setShowSummary(true); };
  const handleWinPredictionClick = () => { closeAllOverlays(); setShowWinPred(true); };
  
  const handleShowPartnershipOverlay = () => {
    if (showPartnershipOverlay) {
      setShowPartnershipOverlay(false);
    } else {
      closeAllOverlays();
      setShowPartnershipOverlay(true);
    }
  };

  const handleShowSeriesStats = () => {
    if (showSeriesStats) {
      setShowSeriesStats(false);
    } else {
      closeAllOverlays();
      setShowSeriesStats(true);
    }
  };

  const sampleWinPrediction = {
    projected_score: { rates: ['9.85*', '9.00', '10.00', '11.00'], scores: ['196', '193', '197', '202'] },
    team_left: { name: 'KR', percent: 57 },
    team_right: { name: 'CK', percent: 43 }
  };

  return (
    <div className="relative w-[1920px] h-[1080px] bg-transparent overflow-hidden flex flex-col">
      
      {/* 🔴 HIDDEN TRIGGER FOR SLIDESHOW */}
      <div 
        className="absolute top-0 right-0 w-[50px] h-[50px] z-50 cursor-pointer"
        onClick={() => {
          if (showSlideshow) {
            setShowSlideshow(false);
          } else {
            closeAllOverlays();
            setShowSlideshow(true);
          }
        }} 
        title="Hidden Trigger: Click to open Slideshow"
      />

      <ScoreBanner 
        onTeamClick={handleOpenPlaying11} 
        onScoreClick={handleOpenVenueInfo} 
        team1Logo={team1Flag}
        team2Logo={team2Flag}
        themeColors={bannerTheme}
        onFlagClick={handleFlagClick}
      />
      
      {showSlideshow ? (
        <ImageCarousel onClose={() => setShowSlideshow(false)} />
      ) : (
        <MainContentGrid>
          <BattingStatsBoard 
            onBatsmanClick={handleOpenMatchSummary} 
            onRunClick={handleWinPredictionClick} 
            onSrClick={handleShowPartnershipOverlay} 
            onPlayerClick={handlePlayerClick} 
          />
          <LiveGraphicArea />
        </MainContentGrid>
      )}
      
      <OversTimeline onSubscribeClick={handleShowSeriesStats} />

      {/* Overlays */}
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

      <AnimatePresence>
        {showSeriesStats && (
          <SeriesStatsModal onClose={() => setShowSeriesStats(false)} />
        )}
      </AnimatePresence>
      
    </div>
  );
};

export default App;