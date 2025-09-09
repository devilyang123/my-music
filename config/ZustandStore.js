import {create} from "zustand";

export const useUserGrantDirStore = create((set) => ({
  useUserGrantDir: null,
  setUserGrantDir: (dir) => set({useUserGrantDir: dir}),
  removeUserGrantDir: () => set({useUserGrantDir: []})
}))


export const useMusicLibStore = create((set) => ({
  musicLib: null,
  setMusicLib: (lib) => set({musicLib: lib}),
  removeMusicLib: () => set({musicLib: null})
}))


export const usePlayListStore = create((set) => ({
  playList: null,
  setPlayList: (list) => set({playList: list}),
  removePlayList: () => set({playList: null})
}))