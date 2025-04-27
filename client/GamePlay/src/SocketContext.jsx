import React, { createContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

// Create the context
export const SocketContext = createContext(null);

// Create the provider component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [remotePlayers, setRemotePlayers] = useState({});
  const [collectedCoins, setCollectedCoins] = useState({});

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

    // Add event listeners
    newSocket.on('connect', handleConnect);
    newSocket.on('disconnect', handleDisconnect);
    newSocket.on('currentPlayers', handleCurrentPlayers);
    newSocket.on('newPlayer', handleNewPlayer);
    newSocket.on('playerMoved', handlePlayerMoved);
    newSocket.on('playerDisconnected', handlePlayerDisconnected);
    newSocket.on('currentCollectedCoins', handleCurrentCollectedCoins);
    newSocket.on('coinCollectionUpdated', handleCoinCollectionUpdated);

    // Clean up on unmount
    return () => {
      newSocket.off('connect', handleConnect);
      newSocket.off('disconnect', handleDisconnect);
      newSocket.off('currentPlayers', handleCurrentPlayers);
      newSocket.off('newPlayer', handleNewPlayer);
      newSocket.off('playerMoved', handlePlayerMoved);
      newSocket.off('playerDisconnected', handlePlayerDisconnected);
      newSocket.off('currentCollectedCoins', handleCurrentCollectedCoins);
      newSocket.off('coinCollectionUpdated', handleCoinCollectionUpdated);
      newSocket.disconnect();
    };
  }, [updatePlayerData]);

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

  return (
    <SocketContext.Provider value={{ socket, remotePlayers, collectedCoins, collectCoin }}>
      {children}
    </SocketContext.Provider>
  );
}; 