import { io } from "socket.io-client";
import config from './config.js'

const URL = config.gameApi.url;
const socket = io(URL, { autoConnect: false });

socket.onAny((event, ...args) => {
  console.debug(event, args);
});

export default socket;