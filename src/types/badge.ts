/**
 * Badge Types and Interfaces for Type Racer
 */

export enum BadgeType {
  SPEED_DEMON = 'SPEED_DEMON',
  PERFECT_SCORE = 'PERFECT_SCORE',
}

export interface Badge {
  id: string;
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface PlayerBadges {
  playerId: string;
  badges: Badge[];
  lastUpdated: Date;
}

export const BADGE_CONFIG = {
  [BadgeType.SPEED_DEMON]: {
    name: 'Speed Demon',
    description: 'Achieved a WPM greater than 100',
    icon: '🔥',
    requirement: {
      wpm: 100,
      accuracy: null,
    },
  },
  [BadgeType.PERFECT_SCORE]: {
    name: 'Perfect Score',
    description: 'Achieved an accuracy greater than 90%',
    icon: '⭐',
    requirement: {
      wpm: null,
      accuracy: 90,
    },
  },
};
