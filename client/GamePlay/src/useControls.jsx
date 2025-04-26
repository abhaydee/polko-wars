import { useEffect, useState } from "react";
import { toast } from 'react-toastify';

export const useControls = (vehicleApi, chassisApi, setNitroActive, setCurrentControls) => {
  let [controls, setControls] = useState({});

  useEffect(() => {
    const keyDownPressHandler = (e) => {
      setControls((controls) => ({ ...controls, [e.key.toLowerCase()]: true }));
      console.log("KEY DOWN:", e.key.toLowerCase());
    };

    const keyUpPressHandler = (e) => {
      setControls((controls) => ({ ...controls, [e.key.toLowerCase()]: false }));
      console.log("KEY UP:", e.key.toLowerCase());
    };

    window.addEventListener("keydown", keyDownPressHandler);
    window.addEventListener("keyup", keyUpPressHandler);
    return () => {
      window.removeEventListener("keydown", keyDownPressHandler);
      window.removeEventListener("keyup", keyUpPressHandler);
    };
  }, []);

  useEffect(() => {
    if (!vehicleApi || !chassisApi) return;

    // Update parent component with current controls
    if (setCurrentControls) {
      setCurrentControls(controls);
    }

    // Log the current state of the car for debugging
    console.log("APPLYING CONTROLS:", controls);
    chassisApi.position.subscribe(pos => {
      console.log("CAR POSITION:", pos);
    });

    // Increased force values for more responsiveness
    if (controls.w) {
      vehicleApi.applyEngineForce(250, 2); // Increased from 150
      vehicleApi.applyEngineForce(250, 3); // Increased from 150
      console.log("FORWARD FORCE APPLIED");
    } else if (controls.s) {
      vehicleApi.applyEngineForce(-250, 2); // Increased from -150
      vehicleApi.applyEngineForce(-250, 3); // Increased from -150
      console.log("REVERSE FORCE APPLIED");
    } else {
      vehicleApi.applyEngineForce(0, 2);
      vehicleApi.applyEngineForce(0, 3);
    }

    if (controls.a) {
      vehicleApi.setSteeringValue(0.45, 2); // Increased from 0.35
      vehicleApi.setSteeringValue(0.45, 3); // Increased from 0.35
      vehicleApi.setSteeringValue(-0.15, 0); // Increased from -0.1
      vehicleApi.setSteeringValue(-0.15, 1); // Increased from -0.1
      console.log("LEFT STEERING APPLIED");
    } else if (controls.d) {
      vehicleApi.setSteeringValue(-0.45, 2); // Increased from -0.35
      vehicleApi.setSteeringValue(-0.45, 3); // Increased from -0.35
      vehicleApi.setSteeringValue(0.15, 0); // Increased from 0.1
      vehicleApi.setSteeringValue(0.15, 1); // Increased from 0.1
      console.log("RIGHT STEERING APPLIED");
    } else {
      for (let i = 0; i < 4; i++) {
        vehicleApi.setSteeringValue(0, i);
      }
    }

    // Increased impulse values for more responsiveness
    if (controls.arrowdown) {
      chassisApi.applyLocalImpulse([0, -10, 0], [0, 0, +1]); // Increased from -5
      console.log("DOWN IMPULSE APPLIED");
    }
    if (controls.arrowup) {
      chassisApi.applyLocalImpulse([0, -10, 0], [0, 0, -1]); // Increased from -5
      console.log("UP IMPULSE APPLIED");
    }
    if (controls.arrowleft) {
      chassisApi.applyLocalImpulse([0, -10, 0], [-1, 0, 0]); // Increased from -0.5
      console.log("LEFT IMPULSE APPLIED");
    }
    if (controls.arrowright) {
      chassisApi.applyLocalImpulse([0, -10, 0], [+1, 0, 0]); // Increased from +0.5
      console.log("RIGHT IMPULSE APPLIED");
    }

    if (controls.r) {
      chassisApi.position.set(-1.5, 0.5, 3);
      chassisApi.velocity.set(0, 0, 0);
      chassisApi.angularVelocity.set(0, 0, 0);
      chassisApi.rotation.set(0, 0, 0);
      console.log("CAR RESET");
    }

    // Stop the car when the "m" key is pressed
    if (controls.m) {
      chassisApi.velocity.set(0, 0, 0);
      console.log("CAR STOPPED");
    }

    // Nitro boost when "q" is pressed
    if (controls.q) {
      if (setNitroActive) {
        setNitroActive(true);
      }
      const boostForce = 100; // Increased from 50
      vehicleApi.applyEngineForce(boostForce, 2);
      vehicleApi.applyEngineForce(boostForce, 3);
      console.log("NITRO BOOST ACTIVATED");
      setTimeout(() => {
        vehicleApi.applyEngineForce(250, 2); // Increased from 150
        vehicleApi.applyEngineForce(250, 3); // Increased from 150
      }, 5000); // Nitro boost lasts for 5 seconds
    }
  }, [controls, vehicleApi, chassisApi, setNitroActive, setCurrentControls]);

  return controls;
}
