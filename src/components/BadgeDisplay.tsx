import React from 'react';
import { Badge } from '../types/badge';
import styles from './BadgeDisplay.module.css';

interface BadgeDisplayProps {
  badges: Badge[];
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  badges,
  size = 'medium',
  showLabel = true,
}) => {
  if (!badges || badges.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.badgeContainer} ${styles[`size-${size}`]}`}>
      {badges.map((badge) => (
        <div
          key={badge.id}
          className={styles.badge}
          title={badge.description}
        >
          <div className={styles.badgeIcon}>{badge.icon}</div>
          {showLabel && (
            <div className={styles.badgeLabel}>{badge.name}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BadgeDisplay;
