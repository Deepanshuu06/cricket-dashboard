import React from 'react';
import CricketWagonWheel from './CricketWagonWheel';

import useScoreStore from '../hooks/useScoreStore';
import BatsmanVideo from './BatsmanVideo';

const LiveGraphicArea = () => {
  const data = useScoreStore((state) => state.liveData);
  

  const resultNumber = Number(data?.result_number);


  return [0,1, 2, 3, 4, 5, 6].includes(resultNumber)
    ? <CricketWagonWheel />
    : <BatsmanVideo />;
};

export default LiveGraphicArea;
