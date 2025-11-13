import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutUp,
} from 'react-native-reanimated';
import { AnimatedCard } from './AnimatedCard';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

interface Card {
  id: string;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
  value: number;
  playerId?: string;
}

interface Player {
  id: string;
  username: string;
  score: number;
}

interface GameBoardProps {
  currentTrick: Card[];
  players: Player[];
  currentPlayerId?: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  currentTrick,
  players,
  currentPlayerId,
}) => {
  const getPlayerName = (playerId?: string) => {
    if (!playerId) return 'Unknown';
    const player = players.find(p => p.id === playerId);
    return player?.username || 'Unknown';
  };

  return (
    <View style={styles.container}>
      <View style={styles.board}>
        {/* Turn indicator */}
        {currentPlayerId && (
          <Animated.View 
            entering={FadeIn} 
            exiting={FadeOut}
            style={styles.turnIndicator}
          >
            <Text style={styles.turnText}>
              {getPlayerName(currentPlayerId)}'s Turn
            </Text>
          </Animated.View>
        )}

        {/* Cards in current trick */}
        <View style={styles.trickContainer}>
          {currentTrick.length === 0 ? (
            <View style={styles.emptyTrick}>
              <Text style={styles.emptyText}>Waiting for cards...</Text>
            </View>
          ) : (
            currentTrick.map((card, index) => (
              <Animated.View
                key={card.id}
                entering={SlideInDown.delay(index * 100)}
                exiting={SlideOutUp}
                style={[
                  styles.trickCard,
                  {
                    transform: [
                      { rotate: `${(index - currentTrick.length / 2) * 5}deg` },
                    ],
                  },
                ]}
              >
                <AnimatedCard
                  card={card}
                  faceDown={false}
                  disabled={true}
                />
                <Text style={styles.cardPlayerName}>
                  {getPlayerName(card.playerId)}
                </Text>
              </Animated.View>
            ))
          )}
        </View>

        {/* Player count */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            {currentTrick.length} / {players.length} cards played
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  board: {
    width: '100%',
    maxWidth: 400,
    aspectRatio: 1,
    backgroundColor: colors.tableGreen,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.primaryDark,
  },
  turnIndicator: {
    position: 'absolute',
    top: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    ...shadows.md,
  },
  turnText: {
    color: colors.textInverse,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  trickContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 150,
  },
  trickCard: {
    margin: spacing.xs,
    alignItems: 'center',
  },
  cardPlayerName: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.xs,
    color: colors.textInverse,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  emptyTrick: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textInverse,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  infoContainer: {
    position: 'absolute',
    bottom: spacing.md,
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  infoText: {
    color: colors.textInverse,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});
