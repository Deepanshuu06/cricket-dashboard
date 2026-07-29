import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaUndo, FaPlus, FaTrash, FaSearchPlus, FaSearchMinus, FaExpand } from "react-icons/fa";

const ImageCarousel = ({ onClose }) => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputs, setInputs] = useState([""]);

  // --- Zoom & Scale States for Resizing ---
  const [scale, setScale] = useState(1);

  const handleInputChange = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const handleAddInput = () => {
    setInputs([...inputs, ""]);
  };

  const handleRemoveInput = (index) => {
    const newInputs = inputs.filter((_, i) => i !== index);
    if (newInputs.length === 0) newInputs.push("");
    setInputs(newInputs);
  };

  const handleStart = () => {
    const validLinks = inputs
      .map((link) => link.trim())
      .filter((link) => link.length > 0);
    
    if (validLinks.length > 0) {
      setImages(validLinks);
      setCurrentIndex(0);
      setScale(1); // Reset zoom on start
    }
  };

  const handleReset = () => {
    setImages([]);
    setInputs([""]);
    setCurrentIndex(0);
    setScale(1);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setScale(1); // Reset zoom when switching slides
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setScale(1); // Reset zoom when switching slides
  };

  // --- Keyboard navigation listener ---
  useEffect(() => {
    if (images.length === 0) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length]);

  return (
    <div className="w-[1920px] flex-1 min-h-[600px] flex bg-gray-900 border-x-[4px] border-black overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative justify-center items-center select-none">
      
      {/* Top Right Close Button */}
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 z-50 text-white bg-red-600 p-3 rounded-full shadow-lg hover:bg-red-500 transition-all cursor-pointer"
      >
        <FaTimes size={24} />
      </button>

      {images.length === 0 ? (
        // --- SETUP SCREEN ---
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center p-8 bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-600 w-[800px] max-h-[85%]"
        >
          <h2 className="text-white text-3xl mb-2 font-black uppercase tracking-wider">Present Slideshow</h2>
          <p className="text-gray-400 mb-6">Add individual image URLs below</p>
          
          <div className="w-full overflow-y-auto pr-4 mb-6 space-y-4" style={{ maxHeight: "400px" }}>
            {inputs.map((link, index) => (
              <div key={index} className="flex items-center gap-3 w-full">
                <span className="text-gray-400 font-bold w-6 text-right">{index + 1}.</span>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  className="flex-1 p-3 text-black text-lg rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 shadow-inner bg-gray-100"
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  onClick={() => handleRemoveInput(index)}
                  className="p-3 text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all cursor-pointer"
                  title="Remove Link"
                >
                  <FaTrash size={20} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex gap-4 w-full justify-center">
            <button 
              onClick={handleAddInput} 
              className="px-6 py-3 bg-gray-700 text-white text-xl font-bold rounded-xl hover:bg-gray-600 transition-all flex items-center gap-2 border border-gray-500 cursor-pointer"
            >
              <FaPlus /> Add URL
            </button>
            <button 
              onClick={handleStart} 
              className="px-10 py-3 bg-blue-600 text-white text-xl font-bold uppercase tracking-wider rounded-xl hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all cursor-pointer"
            >
              Start Slideshow
            </button>
          </div>
        </motion.div>
      ) : (
        // --- SLIDESHOW SCREEN ---
        <div className="relative w-full h-full flex items-center justify-center group bg-black overflow-hidden">
          
          {/* Draggable and Resizable Image Container */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
            >
              <motion.img
                src={images[currentIndex]}
                alt={`Slide ${currentIndex + 1}`}
                drag
                dragConstraints={{ left: -500, right: 500, top: -300, bottom: 300 }}
                style={{ scale }}
                className="max-w-full max-h-full object-contain cursor-grab active:cursor-grabbing"
              />
            </motion.div>
          </AnimatePresence>

          {/* --- Resize & Adjustment Control Toolbar (Appears on Hover) --- */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/80 px-5 py-3 rounded-full border border-gray-700 shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 z-30">
            <button
              onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.4))}
              className="text-white hover:text-blue-400 p-2 transition-colors cursor-pointer"
              title="Zoom Out (Resize Smaller)"
            >
              <FaSearchMinus size={20} />
            </button>
            <span className="text-gray-300 font-mono text-sm w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((prev) => Math.min(prev + 0.1, 3.0))}
              className="text-white hover:text-blue-400 p-2 transition-colors cursor-pointer"
              title="Zoom In (Resize Larger)"
            >
              <FaSearchPlus size={20} />
            </button>
            <div className="w-[1px] h-5 bg-gray-600 mx-1" />
            <button
              onClick={() => setScale(1)}
              className="text-white hover:text-blue-400 p-2 transition-colors cursor-pointer flex items-center gap-1 text-sm font-semibold"
              title="Reset Size Fit"
            >
              <FaExpand size={16} /> Fit
            </button>
          </div>

          {/* Reset Links Icon Button (Appears on Hover) */}
          <button 
            onClick={handleReset} 
            className="absolute bottom-8 right-8 text-white bg-orange-600 p-4 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-orange-500 z-30 cursor-pointer"
            title="Reset Links"
          >
            <FaUndo size={22} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;