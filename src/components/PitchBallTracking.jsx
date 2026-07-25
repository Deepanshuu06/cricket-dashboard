import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const PitchBallTracking = () => {
  const svgRef = useRef(null);
  const [bouncePoint, setBouncePoint] = useState(null);

  const handlePitchClick = (e) => {
    if (!svgRef.current) return;

    // Get precise SVG coordinates for the click
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

    setBouncePoint({ x: svgP.x, y: svgP.y });
  };

  // 1. INCOMING ANGLE (Bowler): Starts way off-screen to the top right
  const getStartPoint = () => {
    return { x: 950, y: -200 };
  };

  // 2. OUTGOING ANGLE (Batsman/Stumps): Converges back to the center stumps in 3D space
  const getEndPoint = (bounce) => {
    return {
      // Adding a slight divergence based on the bounce width for realism
      x: 400 + (bounce.x - 400) * 0.12, 
      y: 90, // Above the stumps (where the ball hits the batsman/pad)
    };
  };

  return (
    <div className="w-full h-screen bg-green-500 flex items-center justify-center overflow-hidden font-sans">
      <div className="relative w-full max-w-4xl shadow-2xl bg-[#4ade80] rounded-lg overflow-hidden border-4 border-green-800">
        
        {/* Instruction overlay */}
        <div className="absolute top-4 left-4 bg-gray-900/80 text-white px-5 py-3 rounded-md z-10 pointer-events-none font-bold text-sm tracking-wide shadow-lg">
          Click anywhere on the pitch to track a delivery!
        </div>

        <svg
          ref={svgRef}
          viewBox="0 0 800 800"
          className="w-full h-auto cursor-crosshair drop-shadow-2xl"
          onClick={handlePitchClick}
        >
          {/* GRASS BACKGROUND */}
          <rect width="800" height="800" fill="#4ade80" />

          {/* MAIN PITCH (Tan color matched to reference) */}
          <polygon
            points="200,300 600,300 750,800 50,800"
            fill="#dbab7b"
            stroke="#ffffff"
            strokeWidth="3"
          />

          {/* RED CENTER LINE */}
          <polygon points="390,300 410,300 435,800 365,800" fill="#c5443c" />

          {/* CREASE LINES */}
          <line x1="200" y1="300" x2="600" y2="300" stroke="white" strokeWidth="4" />
          <line x1="168" y1="380" x2="632" y2="380" stroke="white" strokeWidth="6" /> {/* Popping Crease */}
          <line x1="180" y1="300" x2="160" y2="420" stroke="white" strokeWidth="4" />
          <line x1="620" y1="300" x2="640" y2="420" stroke="white" strokeWidth="4" />

          {/* PITCH LENGTH ZONES */}
          <g>
            {/* YORKER */}
            <polygon points="168,380 290,380 270,460 136,460" fill="#fbbf24" />
            <text x="180" y="430" fill="#92400e" fontStyle="italic" fontWeight="900" fontSize="24" transform="skewX(-15)">YORKER</text>

            {/* FULL */}
            <polygon points="136,460 270,460 235,580 88,580" fill="#4ade80" />
            <text x="140" y="535" fill="white" fontStyle="italic" fontWeight="900" fontSize="28" transform="skewX(-15)">FULL</text>

            {/* GOOD */}
            <polygon points="88,580 235,580 190,720 32,720" fill="#ef4444" />
            <text x="90" y="665" fill="white" fontStyle="italic" fontWeight="900" fontSize="36" transform="skewX(-15)">GOOD</text>

            {/* SHORT */}
            <polygon points="32,720 190,720 165,800 0,800" fill="#8b5cf6" />
            <text x="35" y="780" fill="white" fontStyle="italic" fontWeight="900" fontSize="40" transform="skewX(-15)">SHORT</text>
          </g>

          {/* STUMPS */}
          <g fill="white" stroke="#d1d5db" strokeWidth="1">
            <rect x="388" y="180" width="6" height="120" rx="3" />
            <rect x="400" y="180" width="6" height="120" rx="3" />
            <rect x="412" y="180" width="6" height="120" rx="3" />
            {/* Bails */}
            <rect x="388" y="176" width="14" height="4" rx="2" fill="#ef4444" stroke="none" />
            <rect x="404" y="176" width="14" height="4" rx="2" fill="#ef4444" stroke="none" />
          </g>

          {/* DYNAMIC BALL TRACKING TRAJECTORY */}
          {bouncePoint && (
            <g>
              {/* Blue V-Line Trajectory */}
              <motion.path
                d={`M ${getStartPoint().x},${getStartPoint().y} L ${bouncePoint.x},${bouncePoint.y} L ${getEndPoint(bouncePoint).x},${getEndPoint(bouncePoint).y}`}
                fill="none"
                stroke="#2563eb"
                strokeWidth="24"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.9 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ filter: 'drop-shadow(3px 5px 4px rgba(0,0,0,0.4))' }}
              />

              {/* White Circle at Bounce Impact */}
              <motion.circle
                cx={bouncePoint.x}
                cy={bouncePoint.y}
                r="16"
                fill="white"
                stroke="black"
                strokeWidth="3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' }}
              />

              {/* Red Ball at End Point (Impact with Batsman/Stumps) */}
              <motion.circle
                cx={getEndPoint(bouncePoint).x}
                cy={getEndPoint(bouncePoint).y}
                r="14"
                fill="#ef4444"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
                style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))' }}
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

export default PitchBallTracking;