import React, { useState } from "react";
import { motion } from "framer-motion";

const FlagEditorModal = ({ 
  currentTeam1, 
  currentTeam2, 
  currentColors,
  onSave, 
  onClose 
}) => {
  // Flag URL States
  const [team1Url, setTeam1Url] = useState(currentTeam1);
  const [team2Url, setTeam2Url] = useState(currentTeam2);

  // Color States (initialized with current props)
  const [t1Bg, setT1Bg] = useState(currentColors.t1Bg);
  const [t1Header, setT1Header] = useState(currentColors.t1Header);
  const [t2Bg, setT2Bg] = useState(currentColors.t2Bg);
  const [t2Header, setT2Header] = useState(currentColors.t2Header);

  const handleSave = () => {
    onSave({
      team1Flag: team1Url,
      team2Flag: team2Url,
      t1Bg,
      t1Header,
      t2Bg,
      t2Header
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center font-sans"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        // INCREASED: w-[700px] -> w-[1000px], p-8 -> p-12, gap-6 -> gap-10
        className="bg-gray-900 border-[6px] border-gray-600 p-12 w-[1600px] shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col gap-10"
      >
        {/* INCREASED: text-3xl -> text-5xl, pb-4 -> pb-6 */}
        <h2 className="text-white text-5xl font-black tracking-widest uppercase text-center border-b-4 border-gray-600 pb-6">
          Update Flags & Theme
        </h2>

        {/* INCREASED gap-6 -> gap-10 */}
        <div className="flex gap-10">
          {/* TEAM 1 SETTINGS */}
          <div className="flex-1 flex flex-col gap-8 border-r-4 border-gray-700 pr-8">
            {/* INCREASED: text-xl -> text-3xl */}
            <h3 className="text-orange-400 font-bold uppercase tracking-wider text-3xl">Team 1 (Left)</h3>
            
            <div className="flex flex-col gap-3">
              {/* INCREASED: text-sm -> text-xl */}
              <label className="text-gray-400 text-xl font-bold uppercase">Flag URL</label>
              <input
                type="text"
                value={team1Url}
                onChange={(e) => setTeam1Url(e.target.value)}
                // INCREASED: p-2 -> p-4, text size -> text-2xl
                className="w-full bg-gray-800 text-white p-4 text-2xl border-2 border-gray-600 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center mt-2">
              <label className="text-gray-300 font-bold uppercase text-xl">Header Color</label>
              {/* INCREASED: w-10 h-10 -> w-20 h-20 */}
              <input type="color" value={t1Header} onChange={(e) => setT1Header(e.target.value)} className="w-20 h-20 cursor-pointer bg-transparent border-0" />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-gray-300 font-bold uppercase text-xl">Main Background</label>
              <input type="color" value={t1Bg} onChange={(e) => setT1Bg(e.target.value)} className="w-20 h-20 cursor-pointer bg-transparent border-0" />
            </div>
          </div>

          {/* TEAM 2 SETTINGS */}
          <div className="flex-1 flex flex-col gap-8 pl-4">
            <h3 className="text-blue-400 font-bold uppercase tracking-wider text-3xl">Team 2 (Right)</h3>
            
            <div className="flex flex-col gap-3">
              <label className="text-gray-400 text-xl font-bold uppercase">Flag URL</label>
              <input
                type="text"
                value={team2Url}
                onChange={(e) => setTeam2Url(e.target.value)}
                className="w-full bg-gray-800 text-white p-4 text-2xl border-2 border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center mt-2">
              <label className="text-gray-300 font-bold uppercase text-xl">Header Color</label>
              <input type="color" value={t2Header} onChange={(e) => setT2Header(e.target.value)} className="w-20 h-20 cursor-pointer bg-transparent border-0" />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-gray-300 font-bold uppercase text-xl">Main Background</label>
              <input type="color" value={t2Bg} onChange={(e) => setT2Bg(e.target.value)} className="w-20 h-20 cursor-pointer bg-transparent border-0" />
            </div>
          </div>
        </div>

        {/* INCREASED: mt-4 -> mt-8, pt-4 -> pt-8 */}
        <div className="flex justify-end gap-6 mt-8 pt-8 border-t-4 border-gray-700">
          <button
            onClick={onClose}
            // INCREASED: px-6 py-2 -> px-8 py-4, text size -> text-2xl
            className="px-8 py-4 text-2xl bg-gray-700 text-white font-bold uppercase tracking-wider hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            // INCREASED: px-6 py-2 -> px-8 py-4, text size -> text-2xl
            className="px-8 py-4 text-2xl bg-green-600 text-white font-bold uppercase tracking-wider hover:bg-green-500 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FlagEditorModal;