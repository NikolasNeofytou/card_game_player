const ENV = {
  development: {
    API_URL: 'http://localhost:3000',
    WEBSOCKET_URL: 'http://localhost:3000',
  },
  production: {
    API_URL: 'https://api.yourdomain.com',
    WEBSOCKET_URL: 'wss://ws.yourdomain.com',
  }
};

const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';

export default ENV[environment];
