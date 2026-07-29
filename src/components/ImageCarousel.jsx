import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaUndo, FaPlus, FaTrash } from "react-icons/fa";

const ImageCarousel = ({ onClose }) => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputs, setInputs] = useState([""]);

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
    }
  };

  const handleReset = () => {
    setImages([]);
    setInputs([""]);
    setCurrentIndex(0);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
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
    <div className="w-[1920px] flex-1 min-h-[600px] flex bg-gray-900 border-x-[4px] border-black overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative justify-center items-center">
      
      {/* Top Right Close Button */}
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 z-50 text-white bg-red-600 p-3 rounded-full shadow-lg hover:bg-red-500 transition-all"
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
                  className="p-3 text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all"
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
              className="px-6 py-3 bg-gray-700 text-white text-xl font-bold rounded-xl hover:bg-gray-600 transition-all flex items-center gap-2 border border-gray-500"
            >
              <FaPlus /> Add URL
            </button>
            <button 
              onClick={handleStart} 
              className="px-10 py-3 bg-blue-600 text-white text-xl font-bold uppercase tracking-wider rounded-xl hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all"
            >
              Start Slideshow
            </button>
          </div>
        </motion.div>
      ) : (
        // --- SLIDESHOW SCREEN ---
        <div className="relative w-full h-full flex items-center justify-center group bg-black overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`Slide ${currentIndex + 1}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="absolute w-full h-full object-contain"
            />
          </AnimatePresence>

          {/* Reset Links Icon Button (Only Icon, Appears on Hover) */}
          <button 
            onClick={handleReset} 
            className="absolute bottom-8 right-8 text-white bg-orange-600 p-4 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-orange-500 z-30"
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