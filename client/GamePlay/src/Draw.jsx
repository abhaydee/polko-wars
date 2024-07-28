
import React, { useEffect, useRef, useState } from 'react';
import { useCarPosition } from './CarPositionContext';
import './Draw.css';

const Draw = ({carArray}) => {
  const canvasRef = useRef(null);
  const { carPosition } = useCarPosition();
  // console.log("carArray", carArray)
//[{ x: 0, y:0, z: 0 }]
  // Initialize carPositionArray as a state variable
  const [carPositionArray, setCarPositionArray] = useState(carArray || [{ x: 0, y:0, z: 0 }] );
  const [resetRequested, setResetRequested] = useState(false);
  // console.log("Car Position", carPositionArray)
  

  useEffect(() => {
    // console.log("1st useEfeect")
    // Push the new carPosition into carPositionArray when the position changes by more than 0.001
    if (
      carPositionArray.length === 0 ||
      Math.abs(carPosition.x - carPositionArray[carPositionArray.length - 1].x) > 0.01 ||
      Math.abs(carPosition.z - carPositionArray[carPositionArray.length - 1].z) > 0.01
    ) {
      // Check if the camera swap is not requested (i.e., resetRequested is false)
      if (!resetRequested) {
        setCarPositionArray(prevArray => [...prevArray, carPosition]);
      }
    }
  }, [carPosition, carPositionArray, resetRequested]);

  useEffect(() => {
    // console.log("2nd useEfeect")
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const canvasWidth = 400; // Adjust width as needed
    const canvasHeight = 400; // Adjust height as needed
    const lineWidth = 2; // Line width

    const centerOffsetX = canvasWidth / 2;
    const centerOffsetZ = canvasHeight / 2;

    let animationFrameId = null;

    const drawPath = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = lineWidth;

      ctx.beginPath();
      ctx.moveTo(carPositionArray[0]?.x + centerOffsetX, carPositionArray[0]?.z + centerOffsetZ);

      for (let i = 1; i < carPositionArray.length; i++) {
       ctx.lineTo((carPositionArray[i]?.x* 20) + centerOffsetX, (carPositionArray[i]?.z *20) + centerOffsetZ); // To scale the lines
}

      ctx.stroke();

      // Request the next animation frame
      animationFrameId = requestAnimationFrame(drawPath);
    };
    // console.log(carPositionArray)
    

    // Start the animation
    animationFrameId = requestAnimationFrame(drawPath);

    // Keyboard event listener for resetting on "r" key press
   const handleKeyPress = (event) => {
      if (event.key === 'r' && !resetRequested) {
        setResetRequested(true);
        setTimeout(() => {
          setCarPositionArray([{ x: 0,y:0, z: 0 }]); // Reset carPositionArray after 1 second
          setResetRequested(false);
        }, 1000);
      }
    };
  
    // Keyboard event listener for camera swap on "k" key press
    const handleCameraSwap = (event) => {
        if (event.key === 'k') {
          // Handle camera swap logic here
          // For now, we'll simply log a message
          console.log('Camera swapped');
        }
      };

      // Keyboard event listener for exporting on "p" key press
      const handleExport = (event) => {
        if (event.key === 'p') {
          const exportData = JSON.stringify(carPositionArray, null, 2); // Format JSON with indentation
          const blob = new Blob([exportData], { type: 'application/json' });
          const url = URL.createObjectURL(blob);

          // Create a download link element
          const a = document.createElement('a');
          a.href = url;
          a.download = 'carPositionArray.json';
          a.textContent = 'Download carPositionArray.json';
          a.style.display = 'none'; // Hide the link

          // Append the link to the document and trigger a click event
          document.body.appendChild(a);
          a.click();

          // Clean up by removing the link and revoking the object URL
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      };


  
      // Add event listeners
      window.addEventListener('keydown', handleKeyPress);
      window.addEventListener('keydown', handleCameraSwap);
      window.addEventListener('keydown', handleExport);
  
      return () => {
        cancelAnimationFrame(animationFrameId);
        // Remove the event listener when the component unmounts
        window.removeEventListener('keydown', handleKeyPress);
        window.removeEventListener('keydown', handleCameraSwap);
        window.removeEventListener('keydown', handleExport);
      };
  }, [carPositionArray,resetRequested]);

  return (
    <div className="whiteSpace">
      <canvas ref={canvasRef} width={400} height={400} />
    </div>
  );
};

export default Draw;

