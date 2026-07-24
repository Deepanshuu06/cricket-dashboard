import React from 'react'
import useScoreStore from '../hooks/useScoreStore';

const CurrentBowlerCard = () => {
      const data = useScoreStore((state) => state.liveData);

    

  return (
    <div>CurrentBowlerCard</div>
  )
}

export default CurrentBowlerCard