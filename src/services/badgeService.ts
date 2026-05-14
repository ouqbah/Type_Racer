/**
 * Badge Service - Handles badge logic and evaluation
 */

import { Badge, BadgeType, BADGE_CONFIG, PlayerBadges } from '../types/badge';

export class BadgeService {
  /**
   * Check and return earned badges based on WPM and accuracy
   * @param wpm - Words Per Minute
   * @param accuracy - Accuracy percentage (0-100)
   * @returns Array of earned badges
   */
  static checkEarnedBadges(wpm: number, accuracy: number): Badge[] {
    const earnedBadges: Badge[] = [];

    // Check Speed Demon badge (WPM > 100)
    if (wpm > 100) {
      earnedBadges.push(
        this.createBadge(BadgeType.SPEED_DEMON)
      );
    }

    // Check Perfect Score badge (Accuracy > 90%)
    if (accuracy > 90) {
      earnedBadges.push(
        this.createBadge(BadgeType.PERFECT_SCORE)
      );
    }

    return earnedBadges;
  }

  /**
   * Create a badge object from badge type
   */
  static createBadge(type: BadgeType): Badge {
    const config = BADGE_CONFIG[type];
    return {
      id: `${type}_${Date.now()}`,
      type,
      name: config.name,
      description: config.description,
      icon: config.icon,
      earnedAt: new Date(),
    };
  }

  /**
   * Filter out duplicate badges
   */
  static filterNewBadges(existingBadges: Badge[], newBadges: Badge[]): Badge[] {
    const existingTypes = new Set(existingBadges.map(b => b.type));
    return newBadges.filter(b => !existingTypes.has(b.type));
  }

  /**
   * Get badge display info
   */
  static getBadgeInfo(type: BadgeType) {
    return BADGE_CONFIG[type];
  }
}
