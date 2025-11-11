import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

interface Player {
  id: string;
  username: string;
  score: number;
}

interface ScoreBoardProps {
  players: Player[];
  currentPlayerId?: string;
  myUserId?: string;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  players,
  currentPlayerId,
  myUserId,
}) => {
  // Sort players by score (descending)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scoreboard</Text>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {sortedPlayers.map((player, index) => (
          <Animated.View
            key={player.id}
            entering={SlideInRight.delay(index * 50)}
            style={[
              styles.playerRow,
              player.id === myUserId && styles.playerRowHighlight,
              player.id === currentPlayerId && styles.playerRowCurrent,
            ]}
          >
            {/* Rank */}
            <View style={styles.rankContainer}>
              <Text style={[
                styles.rankText,
                index === 0 && styles.rankFirst,
              ]}>
                #{index + 1}
              </Text>
            </View>

            {/* Player info */}
            <View style={styles.playerInfo}>
              <Text style={[
                styles.playerName,
                player.id === myUserId && styles.playerNameHighlight,
              ]} numberOfLines={1}>
                {player.username}
                {player.id === myUserId && ' (You)'}
              </Text>
              {player.id === currentPlayerId && (
                <View style={styles.turnBadge}>
                  <Text style={styles.turnBadgeText}>Playing</Text>
                </View>
              )}
            </View>

            {/* Score */}
            <View style={styles.scoreContainer}>
              <Text style={[
                styles.scoreText,
                index === 0 && styles.scoreFirst,
              ]}>
                {player.score}
              </Text>
              <Text style={styles.scoreLabel}>pts</Text>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: 300,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  playerRowHighlight: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
  },
  playerRowCurrent: {
    borderColor: colors.info,
    borderWidth: 2,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textLight,
  },
  rankFirst: {
    color: colors.chipGold,
    fontSize: typography.fontSize.lg,
  },
  playerInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  playerName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  playerNameHighlight: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  turnBadge: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.info,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  turnBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.textInverse,
    fontWeight: typography.fontWeight.medium,
  },
  scoreContainer: {
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
  },
  scoreText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  scoreFirst: {
    color: colors.chipGold,
  },
  scoreLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
  },
});
