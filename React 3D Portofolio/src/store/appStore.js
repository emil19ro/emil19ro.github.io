// useModelStore.js
import { create } from 'zustand';

const useModelStore = create((set) => ({
  modelLoaded: false,
  setModelLoaded: () => set({ modelLoaded: true }),
}));

export default useModelStore;