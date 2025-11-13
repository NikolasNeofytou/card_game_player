import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../services/websocket/socketService';
import { RootState } from '../store';

interface UseGameOptions {
  userId: string;
  username: string;
  sessionId?: string;
  autoConnect?: boolean;
}

export const useGame = ({ userId, username, sessionId, autoConnect = true }: UseGameOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const gameState = useSelector((state: RootState) => state.game);

  useEffect(() => {
    if (autoConnect && userId && username) {
      socketService.connect(userId, username);
      setIsConnected(socketService.isConnected());
    }

    return () => {
      if (autoConnect) {
        socketService.disconnect();
        setIsConnected(false);
      }
    };
  }, [userId, username, autoConnect]);

  useEffect(() => {
    if (sessionId && isConnected) {
      socketService.joinSession(sessionId, userId, username);
    }
  }, [sessionId, isConnected, userId, username]);

  const joinSession = (newSessionId: string) => {
    socketService.joinSession(newSessionId, userId, username);
  };

  const leaveSession = () => {
    if (sessionId) {
      socketService.leaveSession(sessionId, userId);
    }
  };

  const startGame = () => {
    if (sessionId) {
      socketService.startGame(sessionId, userId);
    }
  };

  const playCard = (cardId: string) => {
    if (sessionId) {
      socketService.playCard(sessionId, userId, cardId);
    }
  };

  return {
    isConnected,
    gameState,
    joinSession,
    leaveSession,
    startGame,
    playCard,
  };
};

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(socketService.isConnected());
    };

    const interval = setInterval(checkConnection, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    socketService,
  };
};
