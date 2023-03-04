const config = {
    "api": {
      "url": process.env.VUE_APP_API_URL || "http://localhost:3001"
    },
    "gameApi": {
      "url": process.env.VUE_APP_GAME_API_URL || "http://localhost:3000",
      "websocket":  process.env.VUE_APP_GAME_SOCKET_URL || "http://localhost:3000"
    },
  }

module.exports = config;  