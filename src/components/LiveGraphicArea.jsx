import React, { useState, useEffect } from 'react';
import CricketWagonWheel from './CricketWagonWheel';
import useScoreStore from '../hooks/useScoreStore';
import BatsmanVideo from './BatsmanVideo';
import UmpireWide from './UmpireWide';
import UmpireSix from './UmpireSix';
import UmpireFour from './UmpireFour';
import UmpireNoBall from './UmpireNoBall';

const LiveGraphicArea = () => {
  const data = useScoreStore((state) => state.liveData);
  const [overlay, setOverlay] = useState(null); // 'wide' | 'six' | null

  // Safely convert both values to lower-case strings to check for text matches
  const resultText = data?.result_text?.toString().toLowerCase() || '';
  const rawResultNumber = data?.result_number?.toString().toLowerCase() || '';
  const numericResult = Number(data?.result_number);

  // Check if wide or six is present in either result_text or result_number
  const isWide = resultText.includes('wide') || rawResultNumber.includes('wide');
  const isSix = 
    numericResult === 6 || 
    resultText.includes('six') || 
    resultText === '6' || 
    rawResultNumber.includes('six') || 
    rawResultNumber === '6';
  const isFour = 
    numericResult === 4 || 
    resultText.includes('four') || 
    resultText === '4' || 
    rawResultNumber.includes('four') || 
    rawResultNumber === '4';
    const isNoBall = resultText.includes('no ball') || rawResultNumber.includes('no ball');

  useEffect(() => {
    let timer;

    if (isWide) {
      setOverlay('wide');
      timer = setTimeout(() => {
        setOverlay(null); // Switches to WagonWheel after 2 seconds
      }, 2000);
    } else if (isSix) {
      setOverlay('six');
      timer = setTimeout(() => {
        setOverlay(null); // Switches to WagonWheel after 2 seconds
      }, 2000);
    } else if (isFour) {
      setOverlay('four');
      timer = setTimeout(() => {
        setOverlay(null); // Switches to WagonWheel after 2 seconds
      }, 2000);
    } else if (isNoBall) {
      setOverlay('no-ball');
      timer = setTimeout(() => {
        setOverlay(null); // Switches to WagonWheel after 4 seconds
      }, 4000);
    } else {
      setOverlay(null);
    }

    return () => clearTimeout(timer);
  }, [data?.result_text, data?.result_number, isWide, isSix, isFour]);

  // 1. Show temporary umpire animation for 2 seconds
  if (overlay === 'wide') {
    return <UmpireWide />;
  }

  if (overlay === 'six') {
    return <UmpireSix />;
  }

  if (overlay === 'four') {
    return <UmpireFour />;
  }
  if (overlay === 'no-ball') {
    return <UmpireNoBall />;
  }

  // 2. Main display: Show WagonWheel if it's a number (0-6) or a Wide delivery, otherwise BatsmanVideo
  const isWagonWheel = [0, 1, 2, 3, 4, 5, 6].includes(numericResult) || isWide;

  return isWagonWheel ? <CricketWagonWheel /> : <BatsmanVideo />;
};

export default LiveGraphicArea;