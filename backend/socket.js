// socketManager.js
const {Server} = require('socket.io');

let ioInstance; // Armazenará a instância do Socket.IO

function initializeSocket(server) {
  ioInstance = new Server(server, {
    cors: {
      origin: "*",
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log('Um cliente se conectou');

    socket.on('disconnect', () => {
      console.log('Um cliente se desconectou');
    });
  });

  return ioInstance;
}

function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.IO não inicializado. Chame initializeSocket antes de getIO.');
  }

  return ioInstance;
}

function emitMessage(eventName, data) {
  if (!ioInstance) {
    throw new Error('Socket.IO não inicializado. Chame initializeSocket antes de emitir mensagens.');
  }

  ioInstance.emit(eventName, data);
}

module.exports = {
  initializeSocket,
  getIO,
  emitMessage
};