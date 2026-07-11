import { create } from 'zustand';
import type { TokenStatusResponse } from '../types/api.types';

interface TokenState {
  tokenStatus:  TokenStatusResponse | null;
  previewOnly:  boolean;
  setTokenStatus: (s: TokenStatusResponse | null) => void;
  clear:        () => void;
}

export const useTokenStore = create<TokenState>()((set) => ({
  tokenStatus: null,
  previewOnly: true,

  setTokenStatus: (s) =>
    set({
      tokenStatus: s,
      previewOnly: !s || s.status !== 'active',
    }),

  clear: () => set({ tokenStatus: null, previewOnly: true }),
}));
