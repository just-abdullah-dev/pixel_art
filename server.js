const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Store active rooms and users
const rooms = new Map();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join a project room
    socket.on('join-project', ({ projectId, user }) => {
      socket.join(projectId);

      // Initialize room if it doesn't exist
      if (!rooms.has(projectId)) {
        rooms.set(projectId, new Map());
      }

      // Add user to room
      const room = rooms.get(projectId);
      room.set(socket.id, {
        id: socket.id,
        username: user.username,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        cursorX: 0,
        cursorY: 0,
      });

      // Notify others in the room
      const users = Array.from(room.values());
      io.to(projectId).emit('users-update', users);

      console.log(`User ${user.username} joined project ${projectId}`);
    });

    // Handle pixel changes
    socket.on('pixel-change', (data) => {
      const { projectId, layerIndex, x, y, color } = data;
      socket.to(projectId).emit('pixel-changed', { layerIndex, x, y, color, userId: socket.id });
    });

    // Handle cursor movement
    socket.on('cursor-move', (data) => {
      const { projectId, x, y } = data;
      const room = rooms.get(projectId);
      if (room && room.has(socket.id)) {
        const user = room.get(socket.id);
        user.cursorX = x;
        user.cursorY = y;
        socket.to(projectId).emit('cursor-moved', {
          userId: socket.id,
          x,
          y,
          color: user.color,
          username: user.username,
        });
      }
    });

    // Handle layer changes
    socket.on('layer-update', (data) => {
      const { projectId, ...layerData } = data;
      socket.to(projectId).emit('layer-updated', layerData);
    });

    // Handle frame changes
    socket.on('frame-update', (data) => {
      const { projectId, ...frameData } = data;
      socket.to(projectId).emit('frame-updated', frameData);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);

      // Remove user from all rooms
      rooms.forEach((room, projectId) => {
        if (room.has(socket.id)) {
          room.delete(socket.id);
          const users = Array.from(room.values());
          io.to(projectId).emit('users-update', users);
        }
      });
    });
  });

  server
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> WebSocket server running`);
    });
});
