import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { AnimatedCard, CARD_WIDTH } from './AnimatedCard';
import { colors, spacing, typography } from '../../theme';

interface Card {
  id: string;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
  value: number;
}

interface PlayerHandProps {
  cards: Card[];
  onCardPress?: (cardId: string) => void;
  selectedCardId?: string;
  disabled?: boolean;
  showDealAnimation?: boolean;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  onCardPress,
  selectedCardId,
  disabled = false,
  showDealAnimation = false,
}) => {
  const [animatingCards, setAnimatingCards] = useState<Set<string>>(new Set());

  const handleCardPress = (cardId: string) => {
    if (!disabled && onCardPress) {
      // Add to animating set briefly for feedback
      setAnimatingCards(prev => new Set(prev).add(cardId));
      setTimeout(() => {
        setAnimatingCards(prev => {
          const newSet = new Set(prev);
          newSet.delete(cardId);
          return newSet;
        });
      }, 300);
      
      onCardPress(cardId);
    }
  };

  if (cards.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No cards in hand</Text>
      </View>
    );
  }

  const cardOverlap = Math.max(CARD_WIDTH * 0.6, 30);
  const totalWidth = cards.length > 1 
    ? CARD_WIDTH + (cards.length - 1) * cardOverlap 
    : CARD_WIDTH;

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.handContainer, { width: totalWidth }]}>
          {cards.map((card, index) => (
            <View
              key={card.id}
              style={[
                styles.cardWrapper,
                {
                  left: index * cardOverlap,
                  zIndex: index,
                },
              ]}
            >
              <AnimatedCard
                card={card}
                onPress={() => handleCardPress(card.id)}
                selected={card.id === selectedCardId}
                disabled={disabled}
                faceDown={false}
                index={index}
                dealAnimation={showDealAnimation}
                playAnimation={animatingCards.has(card.id)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  handContainer: {
    height: 120,
    position: 'relative',
  },
  cardWrapper: {
    position: 'absolute',
    top: 0,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textLight,
    fontStyle: 'italic',
  },
});
