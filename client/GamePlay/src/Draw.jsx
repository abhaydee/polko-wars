import React, { useEffect, useRef, useState } from 'react';
import { useCarPosition } from './CarPositionContext';
import './Draw.css';

const Draw = ({ carArray, onFinishLinePickup }) => {
  const canvasRef = useRef(null);
  const { carPosition } = useCarPosition();
  const [carPositionArray, setCarPositionArray] = useState(carArray || [{ x: 0, y: 0, z: 0 }]);
  const [resetRequested, setResetRequested] = useState(false);

  useEffect(() => {
    if (
      carPositionArray.length === 0 ||
      Math.abs(carPosition.x - carPositionArray[carPositionArray.length - 1].x) > 0.01 ||
      Math.abs(carPosition.z - carPositionArray[carPositionArray.length - 1].z) > 0.01
    ) {
      if (!resetRequested) {
        setCarPositionArray(prevArray => [...prevArray, carPosition]);
      }
    }
  }, [carPosition, carPositionArray, resetRequested]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const canvasWidth = 400;
    const canvasHeight = 400;
    const lineWidth = 2;
    const centerOffsetX = canvasWidth / 2;
    const centerOffsetZ = canvasHeight / 2;
    let animationFrameId = null;

    const drawPath = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Fill the canvas with white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      ctx.strokeStyle = 'black';
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(carPositionArray[0]?.x + centerOffsetX, carPositionArray[0]?.z + centerOffsetZ);

      for (let i = 1; i < carPositionArray.length; i++) {
        ctx.lineTo((carPositionArray[i]?.x * 20) + centerOffsetX, (carPositionArray[i]?.z * 20) + centerOffsetZ);
      }

      ctx.stroke();
      animationFrameId = requestAnimationFrame(drawPath);
    };

    animationFrameId = requestAnimationFrame(drawPath);

    const handleKeyPress = (event) => {
      if (event.key === 'r' && !resetRequested) {
        setResetRequested(true);
        setTimeout(() => {
          setCarPositionArray([{ x: 0, y: 0, z: 0 }]);
          setResetRequested(false);
        }, 1000);
      }
    };

    const handleCameraSwap = (event) => {
      if (event.key === 'k') {
        console.log('Camera swapped');
      }
    };

    const handleExport = () => {
      // Download canvas image as PNG with white background
      const canvasUrl = canvas.toDataURL('image/png');
      const imgLink = document.createElement('a');
      imgLink.href = canvasUrl;
      imgLink.download = 'carPath.png';
      imgLink.style.display = 'none';
      document.body.appendChild(imgLink);
      imgLink.click();
      document.body.removeChild(imgLink);
    };

    if (onFinishLinePickup) {
      onFinishLinePickup(handleExport);
    }

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keydown', handleCameraSwap);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keydown', handleCameraSwap);
    };
  }, [carPositionArray, resetRequested, onFinishLinePickup]);

  return (
    <div className="whiteSpace">
      <canvas ref={canvasRef} width={400} height={400} />
    </div>
  );
};

export default Draw;
