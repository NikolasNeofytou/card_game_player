import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { useGame } from '../hooks/useGame';
import { GameBoard } from '../components/game/GameBoard';
import { PlayerHand } from '../components/game/PlayerHand';
import { ScoreBoard } from '../components/game/ScoreBoard';
import { VictoryAnimation } from '../components/game/VictoryAnimation';
import { colors, spacing } from '../theme';

interface GameScreenProps {
  sessionId: string;
  userId: string;
  username: string;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  sessionId,
  userId,
  username,
}) => {
  const { isConnected, gameState, playCard } = useGame({
    userId,
    username,
    sessionId,
    autoConnect: true,
  });

  const [selectedCardId, setSelectedCardId] = useState<string | undefined>();
  const [showVictory, setShowVictory] = useState(false);

  // Show victory animation when game ends
  useEffect(() => {
    if (gameState.status === 'finished') {
      setShowVictory(true);
    }
  }, [gameState.status]);

  const handleCardPress = (cardId: string) => {
    // Toggle selection
    if (selectedCardId === cardId) {
      setSelectedCardId(undefined);
    } else {
      setSelectedCardId(cardId);
      
      // Auto-play if it's the player's turn
      if (gameState.currentPlayerId === userId) {
        playCard(cardId);
        setSelectedCardId(undefined);
      }
    }
  };

  const isMyTurn = gameState.currentPlayerId === userId;
  const winner = gameState.status === 'finished' && gameState.players.length > 0
    ? gameState.players.reduce((prev, current) =>
        prev.score > current.score ? prev : current
      )
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundDark} />
      
      <View style={styles.content}>
        {/* Scoreboard */}
        <View style={styles.scoreboardContainer}>
          <ScoreBoard
            players={gameState.players}
            currentPlayerId={gameState.currentPlayerId}
            myUserId={userId}
          />
        </View>

        {/* Game Board */}
        <View style={styles.boardContainer}>
          <GameBoard
            currentTrick={gameState.currentTrick}
            players={gameState.players}
            currentPlayerId={gameState.currentPlayerId}
          />
        </View>

        {/* Player Hand */}
        <View style={styles.handContainer}>
          <PlayerHand
            cards={gameState.myHand}
            onCardPress={handleCardPress}
            selectedCardId={selectedCardId}
            disabled={!isMyTurn || gameState.status !== 'active'}
            showDealAnimation={gameState.phase === 'playing'}
          />
        </View>
      </View>

      {/* Victory Animation Overlay */}
      {showVictory && winner && (
        <VictoryAnimation
          winner={winner}
          onComplete={() => setShowVictory(false)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  scoreboardContainer: {
    marginBottom: spacing.md,
  },
  boardContainer: {
    flex: 1,
    minHeight: 200,
  },
  handContainer: {
    marginTop: spacing.md,
  },
});
