export const colors = {
  // Primary colors
  primary: '#2d5a2d',
  primaryDark: '#1e3f1e',
  primaryLight: '#4a7c4a',
  
  // Secondary colors
  secondary: '#d32f2f',
  secondaryDark: '#9a0007',
  secondaryLight: '#ff6659',
  
  // Card suits
  red: '#d32f2f',
  black: '#000000',
  
  // Background
  background: '#0f5132',
  backgroundLight: '#e8f5e9',
  backgroundDark: '#004d29',
  
  // Surface
  surface: '#ffffff',
  surfaceDark: '#f5f5f5',
  
  // Text
  text: '#212121',
  textLight: '#757575',
  textInverse: '#ffffff',
  
  // Status
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  
  // Game elements
  cardFront: '#ffffff',
  cardBack: '#1565c0',
  cardBorder: '#2d5a2d',
  tableGreen: '#0f5132',
  chipGold: '#ffd700',
  
  // UI elements
  border: '#e0e0e0',
  shadow: 'rgba(0, 0, 0, 0.15)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Transparency
  transparent: 'transparent',
};

export type Color = keyof typeof colors;
