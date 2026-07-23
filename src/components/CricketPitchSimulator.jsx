import React, { useState } from "react";

const CricketPitchTracker = () => {
  const [bouncePoint, setBouncePoint] = useState({ x: 260, y: 380 }); // Default bounce point

  // Pitch Canvas Dimensions
  const PITCH_WIDTH = 400;
  const PITCH_HEIGHT = 500;

  // Key Coordinate Anchors (In Perspective)
  // Bowler Release Point (Top Right outside frame)
  const BOWLER_X = 380;
  const BOWLER_Y = -80;

  // Impact Point at Batsman (Near bat/stumps)
  const BATSMAN_X = 220;
  const BATSMAN_Y = 80;

  // Handle click on pitch to set bounce position
  const handlePitchClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setBouncePoint({ x, y });
  };

  // Calculate Deflection Angle using Vector Dot Product
  const calculateAngle = () => {
    if (!bouncePoint) return 0;

    // Vector 1: Bounce Point -> Bowler Release Point
    const v1 = { x: BOWLER_X - bouncePoint.x, y: BOWLER_Y - bouncePoint.y };
    // Vector 2: Bounce Point -> Batsman Impact Point
    const v2 = { x: BATSMAN_X - bouncePoint.x, y: BATSMAN_Y - bouncePoint.y };

    const dotProduct = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

    if (mag1 === 0 || mag2 === 0) return 0;

    const rad = Math.acos(dotProduct / (mag1 * mag2));
    return (rad * (180 / Math.PI)).toFixed(1);
  };

  // Determine delivery length zone based on Y coordinate
  const getDeliveryZone = (y) => {
    if (y < 120) return "FULL / YORKER";
    if (y >= 120 && y < 220) return "YORKER";
    if (y >= 220 && y < 310) return "FULL";
    if (y >= 310 && y < 410) return "GOOD";
    return "SHORT";
  };

  return (
    <div style={{ display: "flex", gap: "24px", fontFamily: "Arial, sans-serif", backgroundColor: "#0f172a", padding: "24px", borderRadius: "12px", color: "#fff", width: "fit-content" }}>
      
      {/* --- PITCH DISPLAY CONTAINER --- */}
      <div
        style={{
          position: "relative",
          width: `${PITCH_WIDTH}px`,
          height: `${PITCH_HEIGHT}px`,
          backgroundColor: "#2e7d32", // Grass green
          backgroundImage: "radial-gradient(#388e3c 15%, transparent 16%)",
          backgroundSize: "16px 16px",
          borderRadius: "8px",
          overflow: "hidden",
          border: "4px solid #1e293b",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Title Header */}
        <div style={{ position: "absolute", top: "10px", left: "0", right: "0", textAlign: "center", fontWeight: "900", fontSize: "20px", textTransform: "uppercase", letterSpacing: "2px", zIndex: 30, textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
          CRICKET CLUB
        </div>

        {/* 3D Perspective Pitch Container */}
        <div
          onClick={handlePitchClick}
          style={{
            position: "absolute",
            top: "60px",
            left: "50px",
            width: "300px",
            height: "420px",
            cursor: "crosshair",
            transform: "perspective(500px) rotateX(40deg)",
            transformOrigin: "bottom center",
          }}
        >
          {/* Pitch Soil Surface */}
          <div style={{ position: "absolute", width: "100%", height: "100%", backgroundColor: "#d7ccc8", border: "2px solid #a1887f" }} />

          {/* Center Red Crease Line */}
          <div style={{ position: "absolute", left: "50%", top: "0", bottom: "0", width: "24px", backgroundColor: "#c62828", transform: "translateX(-50%)", opacity: 0.8 }} />

          {/* Top Crease Box (White Lines) */}
          <div style={{ position: "absolute", top: "20px", left: "20%", right: "20%", height: "50px", border: "2px solid #ffffff", borderTop: "none" }} />

          {/* Left Length Zones */}
          <div style={{ position: "absolute", left: "0", top: "70px", width: "35%", height: "60px", backgroundColor: "#fbc02d", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontStyle: "italic", color: "#000" }}>YORKER</div>
          <div style={{ position: "absolute", left: "0", top: "130px", width: "35%", height: "70px", backgroundColor: "#4caf50", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontStyle: "italic", color: "#fff" }}>FULL</div>
          <div style={{ position: "absolute", left: "0", top: "200px", width: "35%", height: "90px", backgroundColor: "#e53935", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontStyle: "italic", color: "#fff" }}>GOOD</div>
          <div style={{ position: "absolute", left: "0", top: "290px", width: "35%", height: "130px", backgroundColor: "#8e24aa", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontStyle: "italic", color: "#fff" }}>SHORT</div>

          {/* Wickets / Stumps Graphics */}
          <svg style={{ position: "absolute", top: "10px", left: "46%", width: "24px", height: "40px", zIndex: 10, pointerEvents: "none" }} viewBox="0 0 24 40">
            <rect x="2" y="5" width="4" height="35" fill="#fff" />
            <rect x="10" y="5" width="4" height="35" fill="#fff" />
            <rect x="18" y="5" width="4" height="35" fill="#fff" />
            <rect x="0" y="2" width="24" height="3" fill="#fff" />
          </svg>

          {/* Batsman Silhouette (Red Kit) */}
          <div style={{ position: "absolute", top: "-15px", left: "25%", zIndex: 12, pointerEvents: "none" }}>
            <svg width="60" height="90" viewBox="0 0 100 100">
              {/* Helmet */}
              <circle cx="45" cy="15" r="10" fill="#1e3a8a" />
              {/* Body */}
              <path d="M 35,25 L 55,25 L 60,60 L 40,60 Z" fill="#dc2626" />
              {/* Bat */}
              <rect x="20" y="30" width="8" height="45" rx="2" fill="#d97706" transform="rotate(-30 20 30)" />
            </svg>
          </div>

          {/* SVG Overlay for Vector Lines & Ball Marker */}
          <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 20 }}>
            {bouncePoint && (
              <>
                {/* Incoming Trajectory Line */}
                <line x1={BOWLER_X} y1={BOWLER_Y} x2={bouncePoint.x} y2={bouncePoint.y} stroke="#2563eb" strokeWidth="7" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px #3b82f6)" }} />

                {/* Bounce Trajectory Line */}
                <line x1={bouncePoint.x} y1={bouncePoint.y} x2={BATSMAN_X} y2={BATSMAN_Y} stroke="#2563eb" strokeWidth="7" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px #3b82f6)" }} />

                {/* Pitch Bounce Spot */}
                <circle cx={bouncePoint.x} cy={bouncePoint.y} r="10" fill="#ffffff" stroke="#000000" strokeWidth="2.5" />

                {/* Ball at Batsman End */}
                <circle cx={BATSMAN_X} cy={BATSMAN_Y} r="12" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
                <path d={`M ${BATSMAN_X - 6} ${BATSMAN_Y - 8} Q ${BATSMAN_X} ${BATSMAN_Y} ${BATSMAN_X + 6} ${BATSMAN_Y + 8}`} stroke="#ffffff" strokeWidth="1.5" fill="none" />
              </>
            )}
          </svg>
        </div>
      </div>

      {/* --- BROADCAST TELEMETRY PANEL --- */}
      <div style={{ backgroundColor: "#1e293b", padding: "20px", borderRadius: "8px", minWidth: "220px", display: "flex", flexDirection: "column", gap: "16px", border: "1px solid #334155" }}>
        <h3 style={{ margin: 0, borderBottom: "2px solid #3b82f6", paddingBottom: "8px", fontSize: "18px", letterSpacing: "1px" }}>
          DELIVERY STATS
        </h3>

        <div>
          <span style={{ color: "#94a3b8", fontSize: "12px", textTransform: "uppercase" }}>Length</span>
          <div style={{ fontSize: "20px", fontWeight: "bold", color: "#facc15" }}>
            {getDeliveryZone(bouncePoint.y)}
          </div>
        </div>

        <div>
          <span style={{ color: "#94a3b8", fontSize: "12px", textTransform: "uppercase" }}>Angle Created</span>
          <div style={{ fontSize: "20px", fontWeight: "bold", color: "#38bdf8" }}>
            {calculateAngle()}°
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          <div>
            <span style={{ color: "#94a3b8", fontSize: "12px", textTransform: "uppercase" }}>Pitch X</span>
            <div style={{ fontSize: "16px", fontWeight: "600" }}>{Math.round(bouncePoint.x)}</div>
          </div>
          <div>
            <span style={{ color: "#94a3b8", fontSize: "12px", textTransform: "uppercase" }}>Pitch Y</span>
            <div style={{ fontSize: "16px", fontWeight: "600" }}>{Math.round(bouncePoint.y)}</div>
          </div>
        </div>

        <div style={{ marginTop: "auto", fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>
          💡 Click anywhere on the pitch to re-position the bounce point.
        </div>
      </div>
    </div>
  );
};

export default CricketPitchTracker;