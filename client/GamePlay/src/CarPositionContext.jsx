import React, { createContext, useContext, useState } from 'react';

const CarPositionContext = createContext();

export const useCarPosition = () => useContext(CarPositionContext);

export const CarPositionProvider = ({ children }) => {
  const [carPosition, setCarPosition] = useState({ x: -1, y:0, z: -0.2 }); // Initialize with the initial position of the car

  const updateCarPosition = (newPosition) => {
    setCarPosition(newPosition);
  };

  return (
    <CarPositionContext.Provider value={{ carPosition, updateCarPosition }}>
      {children}
    </CarPositionContext.Provider>
  );
};



