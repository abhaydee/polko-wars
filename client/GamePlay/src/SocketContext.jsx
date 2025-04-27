import React, { createContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

// Create the context
export const SocketContext = createContext(null);

// Create the provider component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [remotePlayers, setRemotePlayers] = useState({});
  const [collectedCoins, setCollectedCoins] = useState({});
  const [carColor, setCarColor] = useState(localStorage.getItem('carColor') || '#ff0000');
  
  // Waiting room state
  const [waitingRoomPlayers, setWaitingRoomPlayers] = useState([]);
  const [waitingRoomTimeLeft, setWaitingRoomTimeLeft] = useState(5 * 60);
  const [waitingRoomGameStarting, setWaitingRoomGameStarting] = useState(false);

  // Helper to update a specific player's data
  const updatePlayerData = useCallback((playerId, newData) => {
    setRemotePlayers(prev => {
      // If player exists, update their data
      if (prev[playerId]) {
        return {
          ...prev,
          [playerId]: {
            ...prev[playerId],
            ...newData,
            lastUpdated: Date.now()
          }
        };
      }
      // If player doesn't exist, add them
      else {
        return {
          ...prev,
          [playerId]: {
            id: playerId,
            ...newData,
            lastUpdated: Date.now()
          }
        };
      }
    });
  }, []);

  useEffect(() => {
    // Connect to the server
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // Event handlers
    const handleConnect = () => {
      console.log('Connected to server with ID:', newSocket.id);
      
      // Send the player's car color to the server
      const playerCarColor = localStorage.getItem('carColor') || '#ff0000';
      
      // Check if we have an item ID stored in localStorage
      const playerItemId = localStorage.getItem('playerItemId');
      
      // Send initial player data including item ID if available
      newSocket.emit('playerInit', { 
        carColor: playerCarColor,
        itemId: playerItemId || null
      });
      
      setCarColor(playerCarColor);
    };

    const handleDisconnect = () => {
      console.log('Disconnected from server');
    };

    const handleCurrentPlayers = (players) => {
      console.log('Received current players:', players);
      
      // Filter out the current player and any inactive players
      const filtered = { ...players };
      
      // Remove self
      if (newSocket.id && filtered[newSocket.id]) {
        delete filtered[newSocket.id];
      }
      
      // Remove any inactive players (those without recent updates)
      const now = Date.now();
      Object.keys(filtered).forEach(id => {
        // Add lastUpdated timestamp to each player
        filtered[id] = {
          ...filtered[id],
          lastUpdated: now
        };
      });
      
      console.log('Remote players after filtering:', filtered);
      setRemotePlayers(filtered);
    };

    const handleNewPlayer = (player) => {
      console.log('New player joined:', player);
      
      // Make sure to log if player has an itemId
      if (player.itemId) {
        console.log(`Player ${player.id} has item ID: ${player.itemId}`);
      }
      
      updatePlayerData(player.id, player);
    };

    const handlePlayerMoved = (player) => {
      // Only log occasionally to avoid flooding the console
      if (Math.random() < 0.01) {
        console.log('Player moved:', player.id, player.position);
      }
      
      if (player && player.id) {
        updatePlayerData(player.id, player);
      }
    };
    
    const handlePlayerUpdated = (player) => {
      console.log('Player updated:', player);
      
      // Make sure to log if player has an itemId
      if (player.itemId) {
        console.log(`Updated player ${player.id} has item ID: ${player.itemId}`);
      }
      
      if (player && player.id) {
        updatePlayerData(player.id, player);
      }
    };

    const handlePlayerDisconnected = (playerId) => {
      console.log('Player disconnected:', playerId);
      setRemotePlayers(prevPlayers => {
        const newPlayers = { ...prevPlayers };
        delete newPlayers[playerId];
        return newPlayers;
      });
    };

    // Handle receiving the current state of collected coins
    const handleCurrentCollectedCoins = (coins) => {
      console.log('Received current collected coins:', coins);
      setCollectedCoins(coins);
    };

    // Handle real-time coin collection updates
    const handleCoinCollectionUpdated = (data) => {
      console.log('Coin collection updated:', data);
      setCollectedCoins(data.allCollectedCoins);
      
      // We could also display a toast or some UI notification here
      if (data.collector.id !== newSocket.id) {
        console.log(`Player ${data.collector.id} collected coin ${data.coinIndex}`);
      }
    };
    
    // Handle waiting room updates
    const handleWaitingRoomUpdate = (data) => {
      console.log('Waiting room update:', data);
      
      if (data.players) {
        // Log any players with itemIds for debugging
        data.players.forEach(player => {
          if (player.itemId) {
            console.log(`Waiting room player ${player.id} has item ID: ${player.itemId}`);
            
            // Also update the remotePlayers with this information
            updatePlayerData(player.id, player);
          }
        });
        
        setWaitingRoomPlayers(data.players);
      }
      
      if (data.timeLeft !== undefined) {
        setWaitingRoomTimeLeft(data.timeLeft);
      }
      
      if (data.gameStarting !== undefined) {
        setWaitingRoomGameStarting(data.gameStarting);
      }
    };

    // Add event listeners
    newSocket.on('connect', handleConnect);
    newSocket.on('disconnect', handleDisconnect);
    newSocket.on('currentPlayers', handleCurrentPlayers);
    newSocket.on('newPlayer', handleNewPlayer);
    newSocket.on('playerMoved', handlePlayerMoved);
    newSocket.on('playerUpdated', handlePlayerUpdated);
    newSocket.on('playerDisconnected', handlePlayerDisconnected);
    newSocket.on('currentCollectedCoins', handleCurrentCollectedCoins);
    newSocket.on('coinCollectionUpdated', handleCoinCollectionUpdated);
    newSocket.on('waitingRoomUpdate', handleWaitingRoomUpdate);

    // Clean up on unmount
    return () => {
      newSocket.off('connect', handleConnect);
      newSocket.off('disconnect', handleDisconnect);
      newSocket.off('currentPlayers', handleCurrentPlayers);
      newSocket.off('newPlayer', handleNewPlayer);
      newSocket.off('playerMoved', handlePlayerMoved);
      newSocket.off('playerUpdated', handlePlayerUpdated);
      newSocket.off('playerDisconnected', handlePlayerDisconnected);
      newSocket.off('currentCollectedCoins', handleCurrentCollectedCoins);
      newSocket.off('coinCollectionUpdated', handleCoinCollectionUpdated);
      newSocket.off('waitingRoomUpdate', handleWaitingRoomUpdate);
      newSocket.disconnect();
    };
  }, [updatePlayerData]);

  // Update car color when changed in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const newColor = localStorage.getItem('carColor') || '#ff0000';
      setCarColor(newColor);
      
      // Send updated color to server if connected
      if (socket && socket.connected) {
        socket.emit('playerInit', { carColor: newColor });
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [socket]);

  // Set up a timer to remove stale players (if server didn't notify us properly)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setRemotePlayers(prev => {
        const newPlayers = { ...prev };
        let changed = false;
        
        // Remove players that haven't updated in 30 seconds
        Object.keys(newPlayers).forEach(id => {
          if (now - newPlayers[id].lastUpdated > 30000) {
            console.log(`Removing stale player ${id} (no updates for 30 seconds)`);
            delete newPlayers[id];
            changed = true;
          }
        });
        
        return changed ? newPlayers : prev;
      });
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(cleanupInterval);
  }, []);

  // Helper function to collect a coin
  const collectCoin = useCallback((coinIndex) => {
    if (socket) {
      console.log(`Sending coin collection: ${coinIndex}`);
      socket.emit('coinCollected', { coinIndex });
    }
  }, [socket]);
  
  // Helper function to register in waiting room
  const registerWaitingArena = useCallback((data) => {
    if (socket) {
      console.log('Registering in waiting arena:', data);
      socket.emit('registerWaitingArena', {
        carColor: data.carColor || carColor,
        address: data.address,
        name: data.name,
        itemId: data.itemId, // Include item ID
        isParticipant: data.isParticipant
      });
    }
  }, [socket, carColor]);
  
  // Helper function to leave waiting room
  const leaveWaitingArena = useCallback(() => {
    if (socket) {
      console.log('Leaving waiting arena');
      socket.emit('leaveWaitingArena');
    }
  }, [socket]);
  
  // Helper function to mark ready in waiting room
  const setReadyInWaitingArena = useCallback(() => {
    if (socket) {
      console.log('Setting ready in waiting arena');
      socket.emit('readyToStart');
    }
  }, [socket]);
  
  // Helper function to force start game (admin/dev only)
  const forceStartGame = useCallback(() => {
    if (socket && process.env.NODE_ENV === 'development') {
      console.log('Force starting game');
      socket.emit('forceStartGame');
    }
  }, [socket]);

  return (
    <SocketContext.Provider value={{ 
      socket, 
      remotePlayers, 
      collectedCoins, 
      collectCoin, 
      carColor,
      // Waiting room related
      waitingRoomPlayers,
      waitingRoomTimeLeft,
      waitingRoomGameStarting,
      registerWaitingArena,
      leaveWaitingArena,
      setReadyInWaitingArena,
      forceStartGame
    }}>
      {children}
    </SocketContext.Provider>
  );
}; 