export const defaultFlags = {
  enable_ai:            false,
  enable_discussions:   true,
  enable_gamification:  false,
  enable_notifications: true,
  enable_past_papers:   true,
  enable_leaderboard:   false,
  enable_achievements:  false,
} as const;

export type FeatureFlag = keyof typeof defaultFlags;
