// store/useScoreStore.js
import { create } from 'zustand';
import { io } from 'socket.io-client';

const socket = io("http://127.0.0.1:5009", {
  transports: ["websocket"],
  upgrade: false
});

const useScoreStore = create((set) => {
  socket.on("score_update", (data) => {
    // console.log(`📥 Received from backend at: ${new Date().toISOString()}`);
    if (data && !data.error) {
      set((state) => {
        // THE MAGIC TRICK: 
        // Only trigger a React re-render if the actual data has changed!
        if (JSON.stringify(state.liveData) !== JSON.stringify(data)) {
          return { liveData: data };
        }
        
        // If the score is the exact same, do absolutely nothing.
        return state; 
      });
    } else if (data && data.error) {
      console.error("Socket error from backend:", data.error);
    }
  });

  return {
    liveData: null,
  };
});

export default useScoreStore;