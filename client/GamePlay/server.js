const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Store connected players
const players = {};
let updateCounter = 0;

// Debug helper function
function logPlayerPositions() {
  console.log("\n===== CURRENT PLAYER POSITIONS =====");
  Object.keys(players).forEach(id => {
    const pos = players[id].position;
    console.log(`Player ${id.substring(0, 6)}: x:${pos.x.toFixed(2)}, y:${pos.y.toFixed(2)}, z:${pos.z.toFixed(2)}`);
  });
  console.log("====================================\n");
}

// Set up a timer to log player positions every 5 seconds
setInterval(() => {
  if (Object.keys(players).length > 0) {
    logPlayerPositions();
  }
}, 5000);

// Add a test command to move players automatically for testing
const movePlayersRandomly = () => {
  Object.keys(players).forEach(id => {
    // Generate small random movements
    const randomX = (Math.random() - 0.5) * 0.2;
    const randomZ = (Math.random() - 0.5) * 0.2;
    
    players[id].position.x += randomX;
    players[id].position.z += randomZ;
    
    console.log(`TEST: Moving player ${id.substring(0, 6)} to:`, players[id].position);
    
    // Broadcast the updated position to all clients
    io.emit('playerMoved', players[id]);
  });
};

// Uncomment this line to enable automatic movement every 5 seconds for testing
// setInterval(movePlayersRandomly, 5000);

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);
  
  // Add new player
  players[socket.id] = {
    id: socket.id,
    position: { x: -1, y: 0, z: -0.2 }, // Default position
    rotation: { x: 0, y: 0, z: 0 },
    controls: {},
    lastUpdate: Date.now()
  };
  
  // Log player count
  console.log(`Total players connected: ${Object.keys(players).length}`);
  
  // Send existing players to the new player
  socket.emit('currentPlayers', players);
  console.log(`Sent current players to ${socket.id}: `, Object.keys(players));
  
  // Broadcast new player to all other players
  socket.broadcast.emit('newPlayer', players[socket.id]);
  console.log(`Broadcast new player ${socket.id} to others`);

  // Handle player movement updates
  socket.on('playerMovement', (data) => {
    // Direct debug output of received position data
    console.log(`RECEIVED FROM ${socket.id.substring(0, 6)}:`, data.position);
    
    // Update the player's data
    if (players[socket.id]) {
      // Validate the data to prevent errors
      if (data && data.position && 
          typeof data.position.x === 'number' && 
          typeof data.position.y === 'number' && 
          typeof data.position.z === 'number') {
        
        // Save previous position for debugging
        const prevPos = { ...players[socket.id].position };
        
        // Update position
        players[socket.id].position = data.position;
        
        // Log ALL position changes
        console.log(`POSITION UPDATED for ${socket.id.substring(0, 6)}: (${prevPos.x.toFixed(2)}, ${prevPos.z.toFixed(2)}) -> (${data.position.x.toFixed(2)}, ${data.position.z.toFixed(2)})`);
        
        // Update rotation if valid
        if (data.rotation && 
            typeof data.rotation.x === 'number' && 
            typeof data.rotation.y === 'number' && 
            typeof data.rotation.z === 'number') {
          players[socket.id].rotation = data.rotation;
        }
        
        // Update controls if provided
        if (data.controls) {
          players[socket.id].controls = data.controls;
        }
        
        players[socket.id].lastUpdate = Date.now();
        
        // Broadcast player movement to all other players
        socket.broadcast.emit('playerMoved', players[socket.id]);
        
        // Also echo back to sender for confirmation
        socket.emit('positionConfirmed', {
          id: socket.id,
          position: players[socket.id].position
        });
      } else {
        console.error(`Received invalid movement data from ${socket.id}:`, data);
      }
    }
  });

  // Handle player disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
    
    // Log player count after disconnect
    console.log(`Total players connected: ${Object.keys(players).length}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 