let io;
const Chat = require('../models/Chat');

const initSocket = (server) => {
  const { Server } = require('socket.io');
  
  // CORS configuration - allow frontend domain
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'https://hirefloww.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  
  io = new Server(server, { 
    cors: { 
      origin: allowedOrigins,
      credentials: true
    } 
  });
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
