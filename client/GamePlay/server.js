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
// Track coin collection globally
const collectedCoins = {};
let updateCounter = 0;

// Waiting room functionality
const waitingRoom = {
  players: [],     // Race participants
  spectators: [],  // Betting-only users
  startTime: null,
  timeLeft: 5 * 60, // 5 minutes in seconds
  timerActive: false,
  gameStarting: false,
  bets: [], // Array of bet objects
  totalPool: 0 // Total betting pool
};

// Start the waiting room timer
function startWaitingRoomTimer() {
  if (waitingRoom.timerActive) return;
  
  waitingRoom.startTime = Date.now();
  waitingRoom.timeLeft = 5 * 60; // 5 minutes
  waitingRoom.timerActive = true;
  waitingRoom.gameStarting = false;
  
  console.log('Waiting room timer started. 5 minutes until race begins!');
  
  // Create an interval that updates the timer every second
  const timerInterval = setInterval(() => {
    const elapsedSeconds = Math.floor((Date.now() - waitingRoom.startTime) / 1000);
    waitingRoom.timeLeft = Math.max(0, 5 * 60 - elapsedSeconds);
    
    // Broadcast time updates every 5 seconds
    if (elapsedSeconds % 5 === 0 || waitingRoom.timeLeft <= 10) {
      io.emit('waitingRoomUpdate', {
        players: waitingRoom.players,
        timeLeft: waitingRoom.timeLeft,
        gameStarting: waitingRoom.gameStarting
      });
    }
    
    // When 10 seconds remain, notify players the game is about to start
    if (waitingRoom.timeLeft === 10) {
      console.log('Game starting in 10 seconds!');
      waitingRoom.gameStarting = true;
      io.emit('waitingRoomUpdate', {
        players: waitingRoom.players,
        timeLeft: waitingRoom.timeLeft,
        gameStarting: true
      });
    }
    
    // When time runs out, start the game
    if (waitingRoom.timeLeft <= 0) {
      clearInterval(timerInterval);
      startGame();
    }
  }, 1000);
}

// Process a new bet
function processNewBet(bet) {
  // Validate bet
  if (!bet.amount || !bet.targetPlayerId || !bet.betterAddress) {
    console.log('Invalid bet format:', bet);
    return false;
  }
  
  // Add to bets array
  waitingRoom.bets.push({
    ...bet,
    timestamp: Date.now(),
    id: `bet-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  });
  
  // Update total pool
  waitingRoom.totalPool += parseFloat(bet.amount);
  
  console.log(`New bet: ${bet.amount} WND from ${bet.betterAddress.substring(0, 6)} on player ${bet.targetPlayerId.substring(0, 6)}`);
  console.log(`Total pool now: ${waitingRoom.totalPool} WND`);
  
  // Broadcast updated bets
  io.emit('betUpdate', {
    bets: waitingRoom.bets,
    totalPool: waitingRoom.totalPool
  });
  
  return true;
}

// Start the game
function startGame() {
  console.log('Starting game!');
  waitingRoom.timerActive = false;
  waitingRoom.gameStarting = false;
  
  // Determine winner (to be implemented with actual race results later)
  // For now, just log the bets
  if (waitingRoom.bets.length > 0) {
    console.log(`Game started with ${waitingRoom.bets.length} bets totaling ${waitingRoom.totalPool} WND`);
    // We'll handle bet resolution after the race
  }
  
  // Mark all players as ready
  waitingRoom.players.forEach(player => {
    player.ready = true;
  });
  
  // Notify all clients the game is starting
  io.emit('startGame');
  
  // Reset waiting room after 5 seconds
  setTimeout(() => {
    waitingRoom.players = [];
    waitingRoom.startTime = null;
    waitingRoom.timeLeft = 5 * 60;
    // Don't reset bets here, they'll be processed after the race
    console.log('Waiting room reset');
  }, 5000);
}

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
  
  // Add new player with default values
  players[socket.id] = {
    id: socket.id,
    position: { x: -1, y: 0, z: -0.2 }, // Default position
    rotation: { x: 0, y: 0, z: 0 },
    controls: {},
    carColor: '#ff0000', // Default red color
    lastUpdate: Date.now(),
    collectedCoins: [] // Track coins collected by this player
  };
  
  // Handle player initialization with car color
  socket.on('playerInit', (data) => {
    if (data && data.carColor) {
      players[socket.id].carColor = data.carColor;
      console.log(`Player ${socket.id.substring(0, 6)} initialized with car color: ${data.carColor}`);
      
      // Broadcast the updated player data to all other clients
      socket.broadcast.emit('playerUpdated', players[socket.id]);
    }
  });
  
  // Handle player placing a bet
  socket.on('placeBet', (betData) => {
    if (!betData.amount || !betData.targetPlayerId || !betData.betterAddress) {
      console.error(`Received invalid bet data from ${socket.id}:`, betData);
      return;
    }
    
    console.log(`Player ${socket.id.substring(0, 6)} placed bet of ${betData.amount} WND on player ${betData.targetPlayerId.substring(0, 6)}`);
    
    // Process the bet
    const success = processNewBet({
      amount: parseFloat(betData.amount),
      targetPlayerId: betData.targetPlayerId,
      betterAddress: betData.betterAddress,
      betterSocketId: socket.id
    });
    
    if (success) {
      // Confirm bet to sender
      socket.emit('betConfirmed', {
        betData,
        timestamp: Date.now()
      });
      
      // Send updated bets to everyone
      io.emit('betUpdate', {
        bets: waitingRoom.bets,
        totalPool: waitingRoom.totalPool
      });
    }
  });
  
  // Handle spectators joining the waiting room (bet-only mode)
  socket.on('joinAsSpectator', (data) => {
    console.log(`Spectator ${socket.id.substring(0, 6)} joined waiting arena`);
    
    // Add to spectators if not already there
    const existingSpectatorIndex = waitingRoom.spectators.findIndex(s => s.id === socket.id);
    
    if (existingSpectatorIndex === -1) {
      waitingRoom.spectators.push({
        id: socket.id,
        address: data.address || 'anonymous',
        joinedAt: Date.now()
      });
      
      console.log(`Waiting room now has ${waitingRoom.spectators.length} spectators`);
    }
    
    // Send current waiting room status to the spectator
    socket.emit('waitingRoomUpdate', {
      players: waitingRoom.players,
      timeLeft: waitingRoom.timeLeft,
      gameStarting: waitingRoom.gameStarting
    });
    
    // Send current bets to the spectator
    socket.emit('betUpdate', {
      bets: waitingRoom.bets,
      totalPool: waitingRoom.totalPool
    });
  });
  
  // Register a player in the waiting arena
  socket.on('registerWaitingArena', (data) => {
    console.log(`Player ${socket.id.substring(0, 6)} registered in waiting arena`);
    
    // Check if they were a spectator before, remove from spectators if so
    const spectatorIndex = waitingRoom.spectators.findIndex(s => s.id === socket.id);
    if (spectatorIndex !== -1) {
      waitingRoom.spectators.splice(spectatorIndex, 1);
    }
    
    // Add player to waiting room if not already there
    const existingPlayerIndex = waitingRoom.players.findIndex(p => p.id === socket.id);
    
    if (existingPlayerIndex === -1) {
      // Create standardized player object
      const playerInfo = {
        id: socket.id,
        carColor: data.carColor || '#ff0000',
        name: `Player ${socket.id.substring(0, 6)}`, // Use consistent naming format
        address: data.address || 'anonymous',
        joinedAt: Date.now(),
        ready: false,
        isParticipant: data.isParticipant || false
      };
      
      // Add to waiting room
      waitingRoom.players.push(playerInfo);
      
      // Update regular players info too for consistency
      if (players[socket.id]) {
        players[socket.id].carColor = playerInfo.carColor;
        players[socket.id].name = playerInfo.name;
      }
      
      console.log(`Waiting room now has ${waitingRoom.players.length} players`);
      
      // Start the timer if this is the first player
      if (waitingRoom.players.length === 1 && !waitingRoom.timerActive) {
        startWaitingRoomTimer();
      }
    } else {
      // Update existing player data
      waitingRoom.players[existingPlayerIndex].carColor = data.carColor || waitingRoom.players[existingPlayerIndex].carColor;
      if (data.address) {
        waitingRoom.players[existingPlayerIndex].address = data.address;
      }
      if (data.isParticipant !== undefined) {
        waitingRoom.players[existingPlayerIndex].isParticipant = data.isParticipant;
      }
    }
    
    // Send current waiting room status to the client
    socket.emit('waitingRoomUpdate', {
      players: waitingRoom.players,
      timeLeft: waitingRoom.timeLeft,
      gameStarting: waitingRoom.gameStarting
    });
    
    // Notify all other clients
    socket.broadcast.emit('waitingRoomUpdate', {
      players: waitingRoom.players,
      timeLeft: waitingRoom.timeLeft,
      gameStarting: waitingRoom.gameStarting
    });
    
    // Also send current bets to the newly registered player
    socket.emit('betUpdate', {
      bets: waitingRoom.bets,
      totalPool: waitingRoom.totalPool
    });
  });
  
  // Handle player leaving the waiting arena
  socket.on('leaveWaitingArena', () => {
    const playerIndex = waitingRoom.players.findIndex(p => p.id === socket.id);
    
    if (playerIndex !== -1) {
      waitingRoom.players.splice(playerIndex, 1);
      console.log(`Player ${socket.id.substring(0, 6)} left waiting arena`);
      
      // Notify all clients
      io.emit('waitingRoomUpdate', {
        players: waitingRoom.players,
        timeLeft: waitingRoom.timeLeft,
        gameStarting: waitingRoom.gameStarting
      });
    }
  });
  
  // Handle a player indicating ready to start
  socket.on('readyToStart', () => {
    const playerIndex = waitingRoom.players.findIndex(p => p.id === socket.id);
    
    if (playerIndex !== -1) {
      waitingRoom.players[playerIndex].ready = true;
      console.log(`Player ${socket.id.substring(0, 6)} is ready to start`);
      
      // Check if all players are ready
      const allReady = waitingRoom.players.every(p => p.ready);
      
      if (allReady && waitingRoom.players.length > 0) {
        console.log('All players ready, starting game soon!');
        waitingRoom.gameStarting = true;
        
        // Start game after a short delay
        setTimeout(startGame, 3000);
      }
      
      // Notify all clients
      io.emit('waitingRoomUpdate', {
        players: waitingRoom.players,
        timeLeft: waitingRoom.timeLeft,
        gameStarting: waitingRoom.gameStarting
      });
    }
  });
  
  // Force start game (admin/dev function)
  socket.on('forceStartGame', () => {
    console.log(`Game forced to start by ${socket.id.substring(0, 6)}`);
    startGame();
  });
  
  // Log player count
  console.log(`Total players connected: ${Object.keys(players).length}`);
  
  // Send existing players to the new player
  socket.emit('currentPlayers', players);
  console.log(`Sent current players to ${socket.id}: `, Object.keys(players));
  
  // Send already collected coins to the new player
  socket.emit('currentCollectedCoins', collectedCoins);
  console.log(`Sent collected coins to ${socket.id}`);
  
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
        
        // Update car color if provided
        if (data.carColor) {
          players[socket.id].carColor = data.carColor;
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

  // Handle coin collection
  socket.on('coinCollected', (data) => {
    if (!data || typeof data.coinIndex !== 'number') {
      console.error(`Received invalid coin data from ${socket.id}:`, data);
      return;
    }
    
    const coinIndex = data.coinIndex;
    const playerId = socket.id;
    const playerName = players[playerId]?.name || playerId.substring(0, 6);
    
    console.log(`Player ${playerName} collected coin ${coinIndex}`);
    
    // Store which player collected this coin
    collectedCoins[coinIndex] = {
      playerId: playerId,
      playerName: playerName,
      collectedAt: Date.now()
    };
    
    // Update player's collected coins
    if (players[playerId]) {
      if (!players[playerId].collectedCoins) {
        players[playerId].collectedCoins = [];
      }
      players[playerId].collectedCoins.push(coinIndex);
      
      // Broadcast to all players that this coin was collected
      io.emit('coinCollectionUpdated', {
        coinIndex,
        collector: {
          id: playerId,
          name: playerName
        },
        allCollectedCoins: collectedCoins
      });
    }
  });

  // Handle player disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    
    // Remove from waiting room if present
    const playerIndex = waitingRoom.players.findIndex(p => p.id === socket.id);
    if (playerIndex !== -1) {
      waitingRoom.players.splice(playerIndex, 1);
      
      // Notify waiting room participants
      io.emit('waitingRoomUpdate', {
        players: waitingRoom.players,
        timeLeft: waitingRoom.timeLeft,
        gameStarting: waitingRoom.gameStarting
      });
    }
    
    // Also check and remove from spectators
    const spectatorIndex = waitingRoom.spectators.findIndex(s => s.id === socket.id);
    if (spectatorIndex !== -1) {
      waitingRoom.spectators.splice(spectatorIndex, 1);
      console.log(`Spectator removed. ${waitingRoom.spectators.length} spectators remaining.`);
    }
    
    // Remove from active players
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