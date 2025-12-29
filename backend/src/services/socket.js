let io;
const Chat = require('../models/Chat');

const initSocket = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, { cors: { origin: '*' } });
  io.on('connection', socket => {
    console.log('Socket connected', socket.id);
    socket.on('join', ({ userId }) => {
      socket.join(userId);
    });
    socket.on('chat-message', async (payload) => {
      // payload: { senderId, receiverId, message }
      const chat = await Chat.create({ senderId: payload.senderId, receiverId: payload.receiverId, message: payload.message });
      io.to(payload.receiverId).emit('chat-message', chat);
      io.to(payload.senderId).emit('chat-message', chat);
    });
  });
};

module.exports = { initSocket };
