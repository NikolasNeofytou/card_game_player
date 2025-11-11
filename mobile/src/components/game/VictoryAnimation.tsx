import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VictoryAnimationProps {
  winner: {
    id: string;
    username: string;
    score: number;
  };
  onComplete?: () => void;
}

const Confetti: React.FC<{ delay: number; xPosition: number }> = ({ delay, xPosition }) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(SCREEN_HEIGHT + 50, {
        duration: 2000 + Math.random() * 1000,
        easing: Easing.linear,
      })
    );
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(xPosition - 20, { duration: 500 }),
          withTiming(xPosition + 20, { duration: 500 })
        ),
        -1,
        true
      )
    );
    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(360, {
          duration: 1000,
          easing: Easing.linear,
        }),
        -1
      )
    );
    opacity.value = withDelay(
      delay + 1500,
      withTiming(0, { duration: 500 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const colors_array = [colors.chipGold, colors.secondary, colors.info, colors.success];
  const randomColor = colors_array[Math.floor(Math.random() * colors_array.length)];

  return (
    <Animated.View
      style={[
        styles.confetti,
        animatedStyle,
        {
          backgroundColor: randomColor,
          left: xPosition,
        },
      ]}
    />
  );
};

export const VictoryAnimation: React.FC<VictoryAnimationProps> = ({ winner, onComplete }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const crownScale = useSharedValue(0);

  useEffect(() => {
    // Entrance animation
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSpring(1, {
      damping: 8,
      stiffness: 100,
    });
    
    // Crown animation
    crownScale.value = withDelay(
      300,
      withSequence(
        withSpring(1.3, { damping: 5 }),
        withSpring(1, { damping: 10 })
      )
    );

    // Auto-complete after 3 seconds
    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const crownAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: crownScale.value }],
  }));

  // Generate confetti pieces
  const confettiPieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    delay: i * 50,
    xPosition: Math.random() * SCREEN_WIDTH,
  }));

  return (
    <View style={styles.container}>
      {/* Confetti */}
      {confettiPieces.map((piece) => (
        <Confetti key={piece.id} delay={piece.delay} xPosition={piece.xPosition} />
      ))}

      {/* Victory card */}
      <Animated.View style={[styles.victoryCard, containerAnimatedStyle]}>
        <Animated.Text style={[styles.crown, crownAnimatedStyle]}>
          👑
        </Animated.Text>
        <Text style={styles.title}>Victory!</Text>
        <Text style={styles.winnerName}>{winner.username}</Text>
        <Text style={styles.winnerScore}>{winner.score} points</Text>
        <Text style={styles.subtitle}>wins the game!</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  victoryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    minWidth: 300,
    ...shadows.xl,
  },
  crown: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.chipGold,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  winnerName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  winnerScore: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.textLight,
  },
});
