import { create } from 'zustand';
import { defaultFlags, FeatureFlag } from '../constants/featureFlags';

type FlagMap = typeof defaultFlags;

interface FeatureFlagState {
  flags:   FlagMap;
  setFlags:(overrides: Partial<FlagMap>) => void;
  isEnabled:(flag: FeatureFlag) => boolean;
}

export const useFeatureFlagStore = create<FeatureFlagState>()((set, get) => ({
  flags: { ...defaultFlags },

  setFlags: (overrides) =>
    set((s) => ({ flags: { ...s.flags, ...overrides } })),

  isEnabled: (flag) => get().flags[flag],
}));
