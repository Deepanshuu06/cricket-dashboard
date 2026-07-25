import React, { useState, useEffect } from 'react';
import CricketWagonWheel from './CricketWagonWheel';
import useScoreStore from '../hooks/useScoreStore';
import BatsmanVideo from './BatsmanVideo';
import UmpireWide from './UmpireWide';
import UmpireSix from './UmpireSix';
import UmpireFour from './UmpireFour';
import UmpireNoBall from './UmpireNoBall';
import UmpireWicket from './UmpireWicket';

const LiveGraphicArea = () => {
  const data = useScoreStore((state) => state.liveData);
  const [overlay, setOverlay] = useState(null); // 'wide' | 'six' | 'four' | 'no-ball' | 'wicket' | null

  // Safely convert both values to lower-case strings to check for text matches
  const resultText = data?.result_text?.toString().toLowerCase() || '';
  
  // Note: Make sure to use your real data here instead of the hardcoded testing value in production
  const rawResultNumber = data?.result_number?.toString().toLowerCase() || '';
  
  // FIX 1: Safely parse numbers. Prevent '' or null from evaluating to 0
  const isValidNumber = data?.result_number !== null && data?.result_number !== undefined && data?.result_number !== '';
  const numericResult = isValidNumber ? Number(data?.result_number) : NaN;

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
  const isWicket = resultText.includes('wicket') || rawResultNumber.includes('wicket');
  const isRunOutCheck = resultText.includes('run out check') || rawResultNumber.includes('run out check');
  useEffect(() => {
    let timer;

    if (isWide) {
      setOverlay('wide');
      timer = setTimeout(() => setOverlay(null), 3000);
    } else if (isSix) {
      setOverlay('six');
      timer = setTimeout(() => setOverlay(null), 3000);
    } else if (isFour) {
      setOverlay('four');
      timer = setTimeout(() => setOverlay(null), 3000);
    } else if (isNoBall) {
      setOverlay('no-ball');
      // Switches back to main display after 4 seconds
      timer = setTimeout(() => setOverlay(null), 4000); 
    } else if (isWicket) {
      setOverlay('wicket');
      timer = setTimeout(() => setOverlay(null), 3000);
    } else {
      setOverlay(null);
    }

    return () => clearTimeout(timer);
  // FIX 2: Added missing dependencies so the timer reacts correctly to all score changes
  }, [data?.result_text, data?.result_number, isWide, isSix, isFour, isNoBall, isWicket]);

  // 1. Show temporary umpire animation
  if (overlay === 'wide') return <UmpireWide />;
  if (overlay === 'six') return <UmpireSix />;
  if (overlay === 'four') return <UmpireFour />;
  if (overlay === 'no-ball') return <UmpireNoBall />;
  if (overlay === 'wicket') return <UmpireWicket />;

  // 2. Main display logic
  // FIX 3: Ensure that if it is a No Ball or Wicket, it ALWAYS fails this check 
  // so that it safely falls back to rendering the BatsmanVideo.
  const isWagonWheel = (!isNoBall && !isWicket) && ([0, 1, 2, 3, 4, 5, 6].includes(numericResult) || isWide);

  return isWagonWheel ? <CricketWagonWheel /> : <BatsmanVideo />;
};

export default LiveGraphicArea;