import React from 'react';
import { Provider } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import { store } from './src/store';
import { GameScreen } from './src/screens';

// For demonstration - in production, these would come from authentication and game session
const DEMO_USER_ID = 'demo-player-1';
const DEMO_USERNAME = 'Demo Player';
const DEMO_SESSION_ID = 'demo-game-123';

export default function App() {
  return (
    <Provider store={store}>
      <GameScreen
        sessionId={DEMO_SESSION_ID}
        userId={DEMO_USER_ID}
        username={DEMO_USERNAME}
      />
    </Provider>
  );
}
