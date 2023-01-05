import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

export const socket = io("http://127.0.0.1:3000", { transports : ['websocket'] });