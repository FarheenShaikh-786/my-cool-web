const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const app = express();
const server = http.createServer(app);

// Example: "https://my-cool-web.vercel.app"

const VERCEL_FRONTEND_URL = "https://my-cool-web-dsyg.vercel.app/";

const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "https://my-cool-web-dsyg.vercel.app/"],
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// JDoodle API Configuration
const JDOODLE_CLIENT_ID = '9f8e948469a69a8a0131a609b035c810';
const JDOODLE_CLIENT_SECRET = '81dbf7d707ef56da425acdd9e1e0c09ecb10fee78b2803c01c8cea757e3a570c';

// In-memory storage (use Redis in production)
const rooms = new Map();
const users = new Map();
const scheduledSessions = new Map();

// Room management
class Room {
  constructor(id, hostUser) {
    this.id = id;
    this.hostId = hostUser.id;
    this.users = new Map();
    this.code = '';
    this.language = 'javascript';
    this.chatMessages = [];
    this.createdAt = new Date();
    
    // Add host user
    this.users.set(hostUser.id, hostUser);
  }

  addUser(user) {
    this.users.set(user.id, user);
  }

  removeUser(userId) {
    this.users.delete(userId);
  }

  getUsers() {
    return Array.from(this.users.values());
  }

  getUserById(userId) {
    return this.users.get(userId);
  }

  addChatMessage(message) {
    this.chatMessages.push(message);
  }

  updateCode(newCode) {
    this.code = newCode;
  }

  updateLanguage(newLanguage) {
    this.language = newLanguage;
  }
}

// User management
class User {
  constructor(id, name, role, socketId) {
    this.id = id;
    this.name = name;
    this.role = role; // 'host' or 'guest'
    this.permission = role === 'host' ? 'editor' : 'viewer'; // 'viewer' or 'editor'
    this.socketId = socketId;
    this.isOnline = true;
    this.joinedAt = new Date();
  }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', async (data) => {
    const { roomId, userName, userRole } = data;
    
    try {
      // Create user
      const user = new User(socket.id, userName, userRole, socket.id);
      users.set(socket.id, user);

      // Join socket room
      socket.join(roomId);

      // Get or create room
      let room = rooms.get(roomId);
      if (!room) {
        if (userRole === 'host') {
          room = new Room(roomId, user);
          rooms.set(roomId, room);
          console.log(`New room created: ${roomId} by ${userName}`);
        } else {
          socket.emit('roomNotFound');
          console.log(`Guest ${userName} tried to join non-existent room ${roomId}`);
          return;
        }
      } else {
        // Check if room exists and user can join
        room.addUser(user);
      }

      // Send current user data
      socket.emit('currentUser', user);

      // Send current room state
      socket.emit('codeChange', room.code);
      socket.emit('languageChange', room.language);
      
      // Send chat history
      room.chatMessages.forEach(message => {
        socket.emit('chatMessage', message);
      });

      // Notify all users in room about new user
      io.to(roomId).emit('userJoined', {
        user: user,
        users: room.getUsers()
      });

      console.log(`User ${userName} (${userRole}) joined room ${roomId}. Total users: ${room.getUsers().length}`);

    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  socket.on('codeChange', (data) => {
    const { roomId, code } = data;
    const user = users.get(socket.id);
    const room = rooms.get(roomId);

    if (room && user && (user.permission === 'editor' || user.role === 'host')) {
      room.updateCode(code);
      socket.to(roomId).emit('codeChange', code);
    }
  });

  socket.on('languageChange', (data) => {
    const { roomId, language } = data;
    const user = users.get(socket.id);
    const room = rooms.get(roomId);

    if (room && user && user.role === 'host') {
      room.updateLanguage(language);
      io.to(roomId).emit('languageChange', language);
    }
  });

  socket.on('chatMessage', (data) => {
    const { roomId, message } = data;
    const user = users.get(socket.id);
    const room = rooms.get(roomId);

    if (room && user) {
      const chatMessage = {
        id: uuidv4(),
        userId: user.id,
        userName: user.name,
        message: message,
        timestamp: Date.now()
      };

      room.addChatMessage(chatMessage);
      io.to(roomId).emit('chatMessage', chatMessage);
    }
  });

  socket.on('changePermission', (data) => {
    const { roomId, userId, permission } = data;
    const user = users.get(socket.id);
    const room = rooms.get(roomId);

    if (room && user && user.role === 'host') {
      const targetUser = room.getUserById(userId);
      if (targetUser) {
        targetUser.permission = permission;
        io.to(roomId).emit('permissionChanged', { userId, permission });
        
        // Notify the specific user
        const targetSocket = Array.from(io.sockets.sockets.values())
          .find(s => s.id === targetUser.socketId);
        if (targetSocket) {
          targetSocket.emit('permissionChanged', { userId, permission });
        }
      }
    }
  });

  socket.on('executeCode', async (data) => {
    const { roomId, code, language } = data;
    const user = users.get(socket.id);
    const room = rooms.get(roomId);

    if (!room || !user) {
      socket.emit('error', { message: 'Room or user not found' });
      return;
    }

    try {
      console.log(`Executing ${language} code for user ${user.name}`);
      
      const response = await axios.post('https://api.jdoodle.com/v1/execute', {
        clientId: JDOODLE_CLIENT_ID,
        clientSecret: JDOODLE_CLIENT_SECRET,
        script: code,
        language: language,
        versionIndex: '3'
      });

      const result = {
        output: response.data.output || '',
        error: response.data.error || '',
        time: response.data.cpuTime || '0',
        memory: response.data.memory || '0'
      };

      // Send result to all users in the room
      io.to(roomId).emit('executionResult', result);
      
      console.log('Code execution completed successfully');

    } catch (error) {
      console.error('Code execution error:', error);
      
      const errorResult = {
        output: '',
        error: error.response?.data?.error || error.message || 'Execution failed',
        time: '0',
        memory: '0'
      };

      io.to(roomId).emit('executionResult', errorResult);
    }
  });

  socket.on('scheduleSession', (data) => {
    const { roomId, title, description, scheduledTime } = data;
    const user = users.get(socket.id);
    
    if (user && user.role === 'host') {
      const sessionId = uuidv4();
      const session = {
        id: sessionId,
        roomId,
        title,
        description,
        scheduledTime,
        createdBy: user.name,
        createdAt: new Date(),
        participants: []
      };
      
      scheduledSessions.set(sessionId, session);
      io.to(roomId).emit('sessionScheduled', session);
    }
  });

  socket.on('getScheduledSessions', (data) => {
    const { roomId } = data;
    const sessions = Array.from(scheduledSessions.values())
      .filter(session => session.roomId === roomId);
    socket.emit('scheduledSessions', sessions);
  });

  socket.on('startVideoCall', (data) => {
    const { roomId } = data;
    const user = users.get(socket.id);
    const room = rooms.get(roomId);

    if (room && user) {
      socket.to(roomId).emit('videoCallStarted', {
        initiator: user.name,
        userId: user.id
      });
      console.log(`Video call started in room ${roomId} by ${user.name}`);
    }
  });

  socket.on('endVideoCall', (data) => {
    const { roomId } = data;
    const user = users.get(socket.id);
    const room = rooms.get(roomId);

    if (room && user) {
      socket.to(roomId).emit('videoCallEnded', {
        userId: user.id
      });
      console.log(`Video call ended in room ${roomId} by ${user.name}`);
    }
  });

  socket.on('offer', (data) => {
    socket.to(data.target).emit('offer', {
      offer: data.offer,
      from: socket.id
    });
  });

  socket.on('answer', (data) => {
    socket.to(data.target).emit('answer', {
      answer: data.answer,
      from: socket.id
    });
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.target).emit('ice-candidate', {
      candidate: data.candidate,
      from: socket.id
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const user = users.get(socket.id);
    if (user) {
      // Find and update room
      for (const [roomId, room] of rooms.entries()) {
        if (room.users.has(socket.id)) {
          room.removeUser(socket.id);
          
          // If room is empty, delete it
          if (room.users.size === 0) {
            rooms.delete(roomId);
            console.log(`Room ${roomId} deleted (empty)`);
          } else {
            // Notify remaining users with user name
            io.to(roomId).emit('userLeft', {
              userId: socket.id,
              userName: user.name,
              users: room.getUsers()
            });
          }
          break;
        }
      }
      
      users.delete(socket.id);
    }
  });

  // Auto-join room if connection includes room info
  const { roomId, userName, userRole } = socket.handshake.query;
  if (roomId && userName && userRole) {
    socket.emit('autoJoin', { roomId, userName, userRole });
    socket.emit('joinRoom', { roomId, userName, userRole });
  }
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    activeRooms: rooms.size,
    activeUsers: users.size
  });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  res.json({
    id: room.id,
    userCount: room.users.size,
    language: room.language,
    createdAt: room.createdAt
  });
});

app.post('/api/create-session', (req, res) => {
  const { userName } = req.body;
  
  if (!userName) {
    return res.status(400).json({ error: 'User name is required' });
  }

  const roomId = uuidv4().substring(0, 8).toUpperCase();
  
  res.json({ 
    roomId,
    message: 'Session created successfully',
    joinUrl: `${req.protocol}://${req.get('host')}/room/${roomId}?name=${encodeURIComponent(userName)}&role=host`
  });
});

app.post('/api/join-session/:code', (req, res) => {
  const { code } = req.params;
  const { userName } = req.body;
  
  if (!userName) {
    return res.status(400).json({ error: 'User name is required' });
  }

  const room = rooms.get(code);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  res.json({
    roomId: code,
    message: 'Ready to join session',
    joinUrl: `${req.protocol}://${req.get('host')}/room/${code}?name=${encodeURIComponent(userName)}&role=guest`
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Code Sync server running on port ${PORT}`);
  console.log(`📡 Socket.IO enabled for real-time collaboration`);
  console.log(`🔗 Frontend should connect to: http://localhost:${PORT}`);
  console.log(`💾 JDoodle API configured for code execution`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
