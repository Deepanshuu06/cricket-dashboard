import React, { useState, useRef, useEffect } from 'react';

export default function CricketWagonWheel() {
  const groundRef = useRef(null);
  const [shot, setShot] = useState(null);
  const [fieldName, setFieldName] = useState('');
  
  // Ground configuration constants
  const CENTER_X = 350;
  const CENTER_Y = 350;
  const START_X = 350;
  const START_Y = 245;

  useEffect(() => {
    let removeTimer = null;

    const ground = groundRef.current;
    if (!ground) return;

    const handlePointerDown = (e) => {
      clearTimeout(removeTimer);

      const rect = ground.getBoundingClientRect();
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;

      const dx = endX - START_X;
      const dy = endY - START_Y;

      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      // Calculate Field Name
      const name = getFieldName(endX, endY);
      setFieldName(name);

      // Set initial state for line animation
      setShot({
        endX,
        endY,
        distance,
        angle,
        showBall: false,
      });

      // Show ball after line transition finishes (~350ms)
      removeTimer = setTimeout(() => {
        setShot((prev) => (prev ? { ...prev, showBall: true } : null));
      }, 350);

      // Auto clear after 5 seconds
      removeTimer = setTimeout(() => {
        setShot(null);
        setFieldName('');
      }, 10000);
    };

    ground.addEventListener('pointerdown', handlePointerDown);
    return () => {
      ground.removeEventListener('pointerdown', handlePointerDown);
      clearTimeout(removeTimer);
    };
  }, []);

  // Professional Field Zones calculation
  const getFieldName = (x, y) => {
    const dx = x - CENTER_X;
    const dy = y - CENTER_Y;

    const angle = (Math.atan2(dy, dx) * (180 / Math.PI) + 360) % 360;
    const distance = Math.sqrt(dx * dx + dy * dy);

    let prefix = '';
    if (distance < 120) prefix = 'SHORT ';
    else if (distance > 250) prefix = 'DEEP ';

    if (angle >= 260 && angle < 285) return prefix + 'WICKET KEEPER';
    if (angle >= 285 && angle < 305) return prefix + 'SHORT FINE LEG';
    if (angle >= 305 && angle < 325) return prefix + 'BACKWARD SQUARE LEG';
    if (angle >= 325 && angle < 340) return prefix + 'SQUARE LEG';
    if (angle >= 340 && angle < 355) return prefix + 'FORWARD';
    if (angle >= 355 || angle < 15) return prefix + 'SWEEPER';
    if (angle >= 15 && angle < 35) return prefix + 'MID WICKET';
    if (angle >= 35 && angle < 60) return prefix + 'MID ON';
    if (angle >= 60 && angle < 120) return prefix + 'STRAIGHT';
    if (angle >= 120 && angle < 145) return prefix + 'LONG ON';
    if (angle >= 145 && angle < 165) return prefix + 'MID ON';
    if (angle >= 165 && angle < 195) return prefix + 'COVER';
    if (angle >= 195 && angle < 220) return prefix + 'POINT';
    if (angle >= 220 && angle < 245) return prefix + 'GULLY';
    if (angle >= 245 && angle < 260) return prefix + 'THIRD MAN';

    return 'STRAIGHT';
  };

  return (
    <div className="flex items-center justify-center h-[600px] bg-[#1b1b1b] overflow-hidden font-sans select-none">
      <div className="w-[850px] flex items-center justify-center">
        
        {/* Ground Wrapper */}
        <div
          ref={groundRef}
          className="relative w-[700px] h-[700px] rounded-full overflow-hidden cursor-crosshair border-[14px] border-[#d7d7d7]"
          style={{
            transform: 'perspective(1000px) rotateX(12deg)',
            background: 'repeating-linear-gradient(90deg, #79b800 0px, #79b800 35px, #8ccb18 35px, #8ccb18 70px)',
            boxShadow: 'inset 0 0 25px rgba(255,255,255,.25), inset 0 0 80px rgba(0,0,0,.25), 0 18px 35px rgba(0,0,0,.6)',
          }}
        >
          {/* 30 Yard Circle */}
          <div className="absolute w-[430px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-[7px] border-dashed border-white/95 rounded-full pointer-events-none" />

          {/* Cricket Pitch */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[82px] h-[235px] bg-gradient-to-r from-[#d29a38] via-[#f0c86f] to-[#d29a38] border-[2px] border-[#f6dfa2] z-5 pointer-events-none">
            {/* Striker End Stumps (Top) */}
            <div className="absolute top-[3px] left-1/2 -translate-x-1/2 w-[16px] h-[20px] flex justify-between z-10 pointer-events-none">
              <span className="w-[3px] bg-[#f8f2d3] rounded-[2px]" />
              <span className="w-[3px] bg-[#f8f2d3] rounded-[2px]" />
              <span className="w-[3px] bg-[#f8f2d3] rounded-[2px]" />
            </div>

            <div className="absolute top-[22px] left-[5px] w-[72px] h-[3px] bg-white pointer-events-none" />
            <div className="absolute bottom-[22px] left-[5px] w-[72px] h-[3px] bg-white pointer-events-none" />

            {/* Non-Striker End Stumps (Bottom) */}
            <div className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-[16px] h-[20px] flex justify-between z-10 pointer-events-none">
              <span className="w-[3px] bg-[#f8f2d3] rounded-[2px]" />
              <span className="w-[3px] bg-[#f8f2d3] rounded-[2px]" />
              <span className="w-[3px] bg-[#f8f2d3] rounded-[2px]" />
            </div>
          </div>

          {/* Dynamic Shot Layer */}
          <div className="absolute inset-0 z-[100] pointer-events-none">
            {shot && (
              <>
                {/* Shot Line */}
                <div
                  className="absolute h-[8px] bg-white rounded-[20px] shadow-[0_0_8px_rgba(255,255,255,0.6)] z-[101] transition-all duration-300 linear"
                  style={{
                    left: `${START_X}px`,
                    top: `${START_Y}px`,
                    width: `${shot.distance}px`,
                    transformOrigin: 'left center',
                    transform: `rotate(${shot.angle}deg)`,
                  }}
                />

                {/* Ball */}
                {shot.showBall && (
                  <div
                    className="absolute w-[22px] h-[22px] rounded-full -translate-x-1/2 -translate-y-1/2 border-[2px] border-white shadow-[0_0_10px_rgba(0,0,0,0.3)] z-[102]"
                    style={{
                      left: `${shot.endX}px`,
                      top: `${shot.endY}px`,
                      background: 'linear-gradient(90deg, transparent 46%, white 46%, white 54%, transparent 54%), radial-gradient(circle at 35% 35%, #ff9090, #d00000)',
                    }}
                  />
                )}
              </>
            )}
          </div>

          {/* Field Name Display */}
          <div className="absolute bottom-[55px] left-1/2 -translate-x-1/2 w-[90%] text-center text-white text-[38px] font-black uppercase tracking-[2px] leading-[42px] [text-shadow:_0_3px_6px_rgba(0,0,0,0.7)] z-[200] pointer-events-none">
            {fieldName}
          </div>
        </div>

      </div>
    </div>
  );
}