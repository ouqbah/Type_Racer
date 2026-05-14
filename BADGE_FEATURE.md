# Badge Feature Implementation Guide

## Overview

The badge system rewards players based on their performance metrics:

- **🔥 Speed Demon Badge**: Awarded when WPM > 100
- **⭐ Perfect Score Badge**: Awarded when Accuracy > 90%

## Architecture

### Components

1. **`src/types/badge.ts`** - Type definitions and configuration
2. **`src/services/badgeService.ts`** - Badge evaluation logic
3. **`src/components/BadgeDisplay.tsx`** - React UI component
4. **`src/components/BadgeDisplay.module.css`** - Styling

## Integration Steps

### 1. Import the Badge Service

```typescript
import { BadgeService } from '@/services/badgeService';
```

### 2. After Race Completion

In your race completion handler:

```typescript
import { BadgeService } from '@/services/badgeService';

// Calculate race results
const wpm = calculateWPM(typedText, timeElapsed);
const accuracy = calculateAccuracy(typedText, referenceText);

// Check for earned badges
const earnedBadges = BadgeService.checkEarnedBadges(wpm, accuracy);

// Filter out duplicates if player already has badges
const newBadges = BadgeService.filterNewBadges(playerExistingBadges, earnedBadges);

// Save new badges to database
if (newBadges.length > 0) {
  await savePlayerBadges(playerId, newBadges);
}
```

### 3. Display Badges

```typescript
import { BadgeDisplay } from '@/components/BadgeDisplay';

// In your player profile or race results component
<BadgeDisplay 
  badges={playerBadges} 
  size="medium" 
  showLabel={true}
/>
```

## Badge Display Component Props

```typescript
interface BadgeDisplayProps {
  badges: Badge[];           // Array of badge objects
  size?: 'small' | 'medium' | 'large';  // Size variant (default: 'medium')
  showLabel?: boolean;       // Show badge name (default: true)
}
```

## Database Schema Recommendation

### Players Table Addition

```sql
ALTER TABLE players ADD COLUMN badges JSON;
-- Example: {"badges": [{"id": "...", "type": "SPEED_DEMON", "earnedAt": "..."}]}
```

### Badges History Table (Optional)

```sql
CREATE TABLE badge_history (
  id UUID PRIMARY KEY,
  player_id UUID NOT NULL,
  badge_type VARCHAR(50) NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  wpm DECIMAL(5, 2),
  accuracy DECIMAL(5, 2),
  FOREIGN KEY (player_id) REFERENCES players(id)
);
```

## Usage Example

```typescript
// Race completion handler
const handleRaceComplete = async (raceData: RaceData) => {
  const { wpm, accuracy, playerId } = raceData;
  
  // Check badges
  const newBadges = BadgeService.checkEarnedBadges(wpm, accuracy);
  
  if (newBadges.length > 0) {
    // Update player record
    await updatePlayerBadges(playerId, newBadges);
    
    // Show achievement notification
    showNotification({
      title: 'New Badge Earned!',
      badges: newBadges
    });
  }
  
  // Save race results
  await saveRaceResult({
    playerId,
    wpm,
    accuracy,
    newBadges
  });
};
```

## Testing

### Test Cases

```typescript
describe('BadgeService', () => {
  it('should award Speed Demon badge when WPM > 100', () => {
    const badges = BadgeService.checkEarnedBadges(105, 85);
    expect(badges).toContainEqual(expect.objectContaining({
      type: 'SPEED_DEMON'
    }));
  });

  it('should award Perfect Score badge when accuracy > 90%', () => {
    const badges = BadgeService.checkEarnedBadges(80, 95);
    expect(badges).toContainEqual(expect.objectContaining({
      type: 'PERFECT_SCORE'
    }));
  });

  it('should award both badges when both conditions met', () => {
    const badges = BadgeService.checkEarnedBadges(110, 95);
    expect(badges).toHaveLength(2);
  });
});
```

## Styling Customization

The `BadgeDisplay.module.css` includes:
- Three size variants: `small`, `medium`, `large`
- Gradient background with hover effects
- Responsive design for mobile devices
- Emoji icons for quick recognition

## Future Enhancements

1. **Achievement Levels**: Add badge progression (Bronze → Silver → Gold)
2. **Combo Badges**: Special badges for earning multiple badges in single race
3. **Streak Tracking**: Track consecutive races with perfect accuracy
4. **Leaderboard**: Global leaderboard filtered by badge holders
5. **Animations**: Celebratory animations when badges are earned
6. **Social Sharing**: Allow players to share badge achievements

## API Endpoints (Optional)

```typescript
// GET /api/players/:id/badges - Get player's badges
// POST /api/players/:id/badges - Award badge to player
// GET /api/badges/leaderboard?badge=SPEED_DEMON - Leaderboard by badge type
```

---

For questions or issues, open an issue on the repository.
