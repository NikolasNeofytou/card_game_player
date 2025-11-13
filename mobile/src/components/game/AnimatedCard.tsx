import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { colors, borderRadius, shadows } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.18, 80);
export const CARD_HEIGHT = CARD_WIDTH * 1.4;

interface CardData {
  id: string;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
  value: number;
}

interface AnimatedCardProps {
  card: CardData;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  faceDown?: boolean;
  index?: number;
  dealAnimation?: boolean;
  playAnimation?: boolean;
}

const getSuitSymbol = (suit: string): string => {
  const symbols: Record<string, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };
  return symbols[suit] || '';
};

const getSuitColor = (suit: string): string => {
  return suit === 'hearts' || suit === 'diamonds' ? colors.red : colors.black;
};

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  card,
  onPress,
  selected = false,
  disabled = false,
  faceDown = false,
  index = 0,
  dealAnimation = false,
  playAnimation = false,
}) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(selected ? -20 : 0);
  const opacity = useSharedValue(dealAnimation ? 0 : 1);
  const rotateY = useSharedValue(faceDown ? 180 : 0);
  const translateX = useSharedValue(0);

  // Deal animation
  useEffect(() => {
    if (dealAnimation) {
      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
      translateY.value = withSequence(
        withTiming(-50, { duration: 200 }),
        withSpring(selected ? -20 : 0, {
          damping: 15,
          stiffness: 100,
        })
      );
    }
  }, [dealAnimation]);

  // Play animation
  useEffect(() => {
    if (playAnimation) {
      translateY.value = withSequence(
        withSpring(-100, { damping: 10 }),
        withTiming(0, { duration: 300 })
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 300 })
      );
    }
  }, [playAnimation]);

  // Selection animation
  useEffect(() => {
    translateY.value = withSpring(selected ? -20 : 0, {
      damping: 12,
      stiffness: 100,
    });
    scale.value = withSpring(selected ? 1.05 : 1, {
      damping: 12,
      stiffness: 100,
    });
  }, [selected]);

  // Flip animation
  useEffect(() => {
    rotateY.value = withTiming(faceDown ? 180 : 0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
  }, [faceDown]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { scale: scale.value },
        { rotateY: `${rotateY.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  const handlePress = () => {
    if (!disabled && onPress) {
      // Press feedback animation
      scale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(selected ? 1.05 : 1)
      );
      onPress();
    }
  };

  const suitColor = getSuitColor(card.suit);
  const suitSymbol = getSuitSymbol(card.suit);

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
        style={styles.touchable}
      >
        <View style={[
          styles.card,
          selected && styles.cardSelected,
          disabled && styles.cardDisabled,
        ]}>
          {faceDown ? (
            // Card back
            <View style={styles.cardBack}>
              <View style={styles.cardBackPattern} />
              <Text style={styles.cardBackText}>🎴</Text>
            </View>
          ) : (
            // Card front
            <View style={styles.cardFront}>
              {/* Top left corner */}
              <View style={styles.corner}>
                <Text style={[styles.rank, { color: suitColor }]}>{card.rank}</Text>
                <Text style={[styles.suit, { color: suitColor }]}>{suitSymbol}</Text>
              </View>
              
              {/* Center suit */}
              <View style={styles.center}>
                <Text style={[styles.centerSuit, { color: suitColor }]}>{suitSymbol}</Text>
              </View>
              
              {/* Bottom right corner */}
              <View style={[styles.corner, styles.cornerBottom]}>
                <Text style={[styles.rank, { color: suitColor }]}>{card.rank}</Text>
                <Text style={[styles.suit, { color: suitColor }]}>{suitSymbol}</Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  touchable: {
    width: '100%',
    height: '100%',
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
    ...shadows.md,
    backfaceVisibility: 'hidden',
  },
  cardSelected: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardFront: {
    backgroundColor: colors.cardFront,
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    padding: 4,
  },
  cardBack: {
    backgroundColor: colors.cardBack,
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBackPattern: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.surface,
    borderStyle: 'dashed',
  },
  cardBackText: {
    fontSize: 32,
  },
  corner: {
    alignItems: 'center',
  },
  cornerBottom: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    transform: [{ rotate: '180deg' }],
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  suit: {
    fontSize: 14,
    lineHeight: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerSuit: {
    fontSize: 40,
  },
});
