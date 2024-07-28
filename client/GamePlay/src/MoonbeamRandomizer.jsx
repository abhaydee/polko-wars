import React, { useState, useEffect } from 'react';

// Function to randomize array
const randomizeArray = (array) => {
  let currentIndex = array.length, temporaryValue, randomIndex;
  
  // While there remain elements to shuffle
  while (0 !== currentIndex) {

    // Pick a remaining element
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

const MoonbeamRandomizer = () => {
  const [coins, setCoins] = useState([
    [0.5, 0.09, -0.1],
    [0.5, 0.09, -0.1],
    [-4.5, 0.09, 0],
    [-4.5, 0.09, 0],
    [-5.3, 0.09, 1],
    [-5.3, 0.09, 1],
    [-4.5, 0.09, 1.5],
    [-4.5, 0.09, 1.5],
    [-1.5, 0.09, 1.9],
    [-1.5, 0.09, 1.9],
    [-1, 0.6, 0],
    [-1, 0.6, 0],
    [-5.5, 0.09, 3],
    [-5.5, 0.09, 3],
    [-2.5, 0.09, -4],
    [-2.5, 0.09, -4],
    [2.5, 0.09, -4],
    [2.5, 0.09, -4],
    [-6.5, 0.09, -4],
    [-6.5, 0.09, -4],
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCoins((prevCoins) => randomizeArray([...prevCoins]));
    }, 1000); // Randomize every second

    return () => clearInterval(interval); // Clean up on component unmount
  }, []);

  return (
    <div>
      {coins.map((coin, index) => (
        <div key={index}>
          {`Coin ${index + 1}: [${coin[0]}, ${coin[1]}, ${coin[2]}]`}
        </div>
      ))}
    </div>
  );
};

export default MoonbeamRandomizer;